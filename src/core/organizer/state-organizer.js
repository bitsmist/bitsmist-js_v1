// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import Organizer from "./organizer.js";
import Store from "../store/store.js";
import Util from "../util/util.js";

// =============================================================================
//	State organizer class
// =============================================================================

export default class StateOrganizer extends Organizer
{

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	static get name()
	{

		return "StateOrganizer";

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static getInfo()
	{

		return {
			"sections":		"waitFor",
			"order":		100,
		};

	}

	// -------------------------------------------------------------------------

	static globalInit()
	{

		// Add properties to Component
		Object.defineProperty(BITSMIST.v1.Component.prototype, "state", {
			get() { return this._state; },
			set(value) { this._state = value; }
		});

		// Add methods to Component
		BITSMIST.v1.Component.prototype.changeState= function(...args) { return StateOrganizer._changeState(this, ...args); }
		BITSMIST.v1.Component.prototype.waitFor = function(...args) { return StateOrganizer._waitFor(this, ...args); }
		BITSMIST.v1.Component.prototype.suspend = function(...args) { return StateOrganizer._suspend(this, ...args); }
		BITSMIST.v1.Component.prototype.resume = function(...args) { return StateOrganizer._resume(this, ...args); }
		BITSMIST.v1.Component.prototype.pause = function(...args) { return StateOrganizer._pause(this, ...args); }

		// Init vars
		StateOrganizer._components = new Store();
		StateOrganizer._waitingList = new Store();
		StateOrganizer.__suspends = {};
		StateOrganizer.waitFor = function(waitlist, timeout) { return StateOrganizer._waitFor(null, waitlist, timeout); }

	}

	// -------------------------------------------------------------------------

	static init(component, options)
	{

		// Init component vars
		component._state = "";
		component._suspends = {};

		// Load settings from attributes
		StateOrganizer._loadAttrSettings(component);

		// Add event handlers to component
		this._addOrganizerHandler(component, "doOrganize", StateOrganizer.onDoOrganize);

	}

	// -------------------------------------------------------------------------

	/**
	 * Suspend all components at a specified state.
	 *
	 * @param	{String}		state				Component state.
	 */
	static globalSuspend(state)
	{

		StateOrganizer.__suspends[state] = StateOrganizer.__createSuspendInfo(state);
		StateOrganizer.__suspends[state].state = "pending";

	}

	// -------------------------------------------------------------------------

	/**
	 * Resume all components at a specified state.
	 *
	 * @param	{String}		state				Component state.
	 */
	static globalResume(state)
	{

		StateOrganizer.__suspends[state].resolve();
		StateOrganizer.__suspends[state].state = "resolved";

	}

	// -------------------------------------------------------------------------
	//  Event Handlers
	// -------------------------------------------------------------------------

	static onDoOrganize(sender, e, ex)
	{

		this._enumSettings(e.detail.settings["waitFor"], (sectionName, sectionValue) => {
			this.addEventHandler(sectionName, {"handler":StateOrganizer.onDoProcess, "options":sectionValue});
		});

	}

	// -------------------------------------------------------------------------

	static onDoProcess(sender, e, ex)
	{

		return StateOrganizer._waitFor(this, ex.options);

	}

	// -------------------------------------------------------------------------
	//  Protected
	// -------------------------------------------------------------------------

	/**
	 * Wait for components to become specific states.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Array}			waitlist			Components to wait.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _waitFor(component, waitlist, options)
	{

		let promise;
		let timeout =
				(options && options["timeout"]) ||
				(component && component.settings.get("system.waitForTimeout")) || // component could be null
				BITSMIST.v1.settings.get("system.waitForTimeout", 10000);
		let waiter = ( options && options["waiter"] ? options["waiter"] : component );
		let waitInfo = {"waiter":waiter, "waitlist":Util.deepClone(waitlist)};

		if (StateOrganizer.__isAllReady(waitInfo))
		{
			promise = Promise.resolve();
		}
		else
		{
			// Create a promise that is resolved when waiting is completed.
			promise = new Promise((resolve, reject) => {
				waitInfo["resolve"] = resolve;
				waitInfo["reject"] = reject;
				waitInfo["timer"] = setTimeout(() => {
					let name = ( component && component.name ) || ( waitInfo["waiter"] && waitInfo["waiter"].tagName ) || "";
					reject(`StateOrganizer._waitFor(): Timed out after ${timeout} milliseconds waiting for ${StateOrganizer.__dumpWaitlist(waitlist)}, name=${name}, uniqueId=${component.uniqueId}.`);
				}, timeout);
			});
			waitInfo["promise"] = promise;

			// Add to info to a waiting list.
			StateOrganizer.__addToWaitingList(waitInfo);
		}

		return promise;

	}

	// -------------------------------------------------------------------------

	/**
	 * Change component state and check waiting list.
	 *
	 * @param	{Component}		component			Component to register.
	 * @param	{String}		state				Component state.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _changeState(component, state)
	{

		Util.assert(StateOrganizer.__isTransitionable(component._state, state), `StateOrganizer._changeState(): Illegal transition. name=${component.name}, fromState=${component._state}, toState=${state}, id=${component.id}`, Error);

		component._state = state;
		StateOrganizer._components.set(component.uniqueId, {"object":component, "state":state});

		StateOrganizer.__processWaitingList();

	}

	// -------------------------------------------------------------------------

	/**
	 * Suspend a component at a specified state.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{String}		state				Component state.
	 */
	static _suspend(component, state)
	{

		component._suspends[state] = StateOrganizer.__createSuspendInfo();
	 	component._suspends[state].state = "pending";

	}

	// -------------------------------------------------------------------------

	/**
	 * Resume a component at a specified state.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{String}		state				Component state.
	 */
	static _resume(component, state)
	{

	 	component._suspends[state].resolve();
	 	component._suspends[state].state = "resolved";

	}

	// -------------------------------------------------------------------------

	/**
	 * Pause a component if it is suspended.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{String}		state				Component state.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _pause(component, state)
	{

		let ret = [];

		// Globally suspended?
		if (StateOrganizer.__suspends[state] && StateOrganizer.__suspends[state].state === "pending" && !component.settings.get("settings.ignoreGlobalSuspend"))
		{
			ret.push(StateOrganizer.__suspends[state].promise);
		}

		// Component suspended?
		if (component._suspends[state] && component._suspends[state].state === "pending")
		{
			ret.push(component._suspends[state].promise);
		}

		return Promise.all(ret);

	}

	// -----------------------------------------------------------------------------

	/**
	 * Get settings from element's attribute.
	 *
	 * @param	{Component}		component			Component.
	 */
	static _loadAttrSettings(component)
	{

		// Get waitFor from attribute

		if (component.hasAttribute("bm-waitfor"))
		{
			let waitInfo = {"name":component.getAttribute("bm-waitfor"), "state":"ready"};
			component.settings.merge({"waitFor": [waitInfo]});
		}

		if (component.hasAttribute("bm-waitfornode"))
		{
			let waitInfo = {"rootNode":component.getAttribute("bm-waitfornode"), "state":"ready"};
			component.settings.merge({"waitFor": [waitInfo]});
		}

	}

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
	 * Process waiting list.
	 */
	static __processWaitingList()
	{

		let removeList = [];
		Object.keys(StateOrganizer._waitingList.items).forEach((id) => {
			if (StateOrganizer.__isAllReady(StateOrganizer._waitingList.get(id)))
			{
				clearTimeout(StateOrganizer._waitingList.get(id)["timer"]);
				StateOrganizer._waitingList.get(id).resolve();
				removeList.push(id);
			}
		});

		// Remove from waiting list
		for (let i = 0; i < removeList.length; i++)
		{
			StateOrganizer._waitingList.remove(removeList[i]);
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Add wait info to the waiting list.
	 *
	 * @param	{Object}		waitInfo			Wait info.
	 */
	static __addToWaitingList(waitInfo)
	{

		let id = Util.getUUID();

		/*
		for (let i = 0; i < waitInfo["waitlist"].length; i++)
		{
			// Check if the node exists
			if (waitInfo["waitlist"][i].rootNode)
			{
				let element = document.querySelector(waitInfo["waitlist"][i].rootNode);

				Util.assert(element && element.uniqueId, `StateOrganizer.__addToWaitingList(): Root node does not exist. waiter=${waitInfo["waiter"]}, rootNode=${waitInfo["waitlist"][i].rootNode}`, ReferenceError);
			}
		}
		*/

		StateOrganizer._waitingList.set(id, waitInfo);

	}

	// -------------------------------------------------------------------------

	/**
	 * Check whether changing current state to new state is allowed.
	 *
	 * @param	{String}		currentState		Current state.
	 * @param	{String}		newState			New state.
	 *
	 * @return  {Promise}		Promise.
	 */
	static __isTransitionable(currentState, newState)
	{

		let ret = true;

		if (currentState && currentState.slice(-3) === "ing")
		{
			if(
				( currentState === "stopping" && newState !== "stopped") ||
				( currentState === "starting" && newState !== "started")
			)
			{
				ret = false;
			}
		}

		return ret;

	}

	// -------------------------------------------------------------------------

	/**
	 * Get component info from wait list item.
	 *
	 * @param	{Object}		waitlistItem		Wait list item.
	 *
	 * @return  {Boolean}		True if ready.
	 */
	static __getComponentInfo(waitlistItem)
	{

		let componentInfo;

		if (waitlistItem["id"])
		{
			componentInfo = StateOrganizer._components.get(waitlistItem["id"]);
		}
		else if (waitlistItem["name"])
		{
			Object.keys(StateOrganizer._components.items).forEach((key) => {
				if (waitlistItem["name"] === StateOrganizer._components.get(key).object.name)
				{
					componentInfo = StateOrganizer._components.get(key);
				}
			});
		}
		else if (waitlistItem["rootNode"])
		{
			let element = document.querySelector(waitlistItem["rootNode"]);
			if (element && element.uniqueId)
			{
				componentInfo = StateOrganizer._components.get(element.uniqueId);
			}
		}
		else if (waitlistItem["object"])
		{
			let element = waitlistItem["object"];
			if (element.uniqueId)
			{
				componentInfo = StateOrganizer._components.get(element.uniqueId);
			}
		}

		return componentInfo;

	}

	// -------------------------------------------------------------------------

	/**
	 * Check if all components are ready.
	 *
	 * @param	{Object}		waitInfo			Wait info.
	 *
	 * @return  {Boolean}		True if ready.
	 */
	static __isAllReady(waitInfo)
	{

		let result = true;
		let waitlist = waitInfo["waitlist"];

		for (let i = 0; i < waitlist.length; i++)
		{
			let match = false;
			let componentInfo = this.__getComponentInfo(waitlist[i]);
			if (componentInfo)
			{
				if (StateOrganizer.__isReady(waitlist[i], componentInfo))
				{
					match = true;
				}
			}

			// If one fails all fail
			if (!match)
			{
				result = false;
				break;
			}
		}

		return result;

	}

	// -------------------------------------------------------------------------

	/**
	 * Check if a component is ready.
	 *
	 * @param	{Object}		waitlistItem		Wait list item.
	 * @param	{Object}		componentInfo		Registered component info.
	 *
	 * @return  {Boolean}		True if ready.
	 */
	static __isReady(waitlistItem, componentInfo)
	{

		// Check component
		let isMatch = StateOrganizer.__isComponentMatch(componentInfo, waitlistItem);

		// Check state
		if (isMatch)
		{
			isMatch = StateOrganizer.__isStateMatch(componentInfo["state"], waitlistItem["state"]);
		}

		return isMatch;

	}

	// -------------------------------------------------------------------------

	/**
	 * Check if component match.
	 *
	 * @param	{Object}		componentInfo		Registered component info.
	 * @param	{Object}		waitlistItem		Wait list item.
	 *
	 * @return  {Boolean}		True if match.
	 */
	static __isComponentMatch(componentInfo, waitlistItem)
	{

		let isMatch = true;

		// check instance
		if (waitlistItem["object"] && componentInfo["object"] !== waitlistItem["object"])
		{
			isMatch = false;
		}
		// check name
		else if (waitlistItem["name"] && componentInfo["object"].name !== waitlistItem["name"])
		{
			isMatch = false;
		}
		// check id
		else if (waitlistItem["id"] && componentInfo["object"].uniqueId !== waitlistItem["id"])
		{
			isMatch = false;
		}
		// check node
		else if (waitlistItem["rootNode"]  && !document.querySelector(waitlistItem["rootNode"]))
		{
			isMatch = false;
		}

		return isMatch;

	}

	// -------------------------------------------------------------------------

	/**
	 * Check if state match.
	 *
	 * @param	{String}		currentState		Current state.
	 * @param	{String}		expectedState		Expected state.
	 *
	 * @return  {Boolean}		True if match.
	 */
	static __isStateMatch(currentState, expectedState)
	{

		expectedState = expectedState || "ready";
		let isMatch = false;

		switch (currentState)
		{
			case "ready":
				if (
					expectedState === "ready" ||
					expectedState === "started" ||
					expectedState === "starting"
				)
				{
					isMatch = true;
				}
				break;
			case "started":
				if (
					expectedState === "started" ||
					expectedState === "starting"
				)
				{
					isMatch = true;
				}
				break;
			case "stopped":
				if (
					expectedState === "stopped" ||
					expectedState === "stopping"
				)
				{
					isMatch = true;
				}
				break;
			default:
				if ( currentState === expectedState )
				{
					isMatch = true;
				}
				break;
		}

		return isMatch;

	}

	// -----------------------------------------------------------------------------

	/**
	 * Dump wait list as string.
	 *
	 * @param	{Array}			Wait list.
	 *
	 * @return  {String}		Wait list string.
	 */
	static __dumpWaitlist(waitlist)
	{

		let result = "";

		for (let i = 0; i < waitlist.length; i++)
		{
			let id = (waitlist[i].id ? "id:" + waitlist[i].id + "," : "");
			let name = (waitlist[i].name ? "name:" + waitlist[i].name + "," : "");
			let object = (waitlist[i].object ? "element:" + waitlist[i].object.tagName + "," : "");
			let node = (waitlist[i].rootNode ? "node:" + waitlist[i].rootNode + "," : "");
			let state = (waitlist[i].state ? "state:" + waitlist[i].state: "");
			result += "\n\t{" + id + name + object + node + state + "},";
		}

		return "[" + result + "\n]";

	}

	// -------------------------------------------------------------------------

	/**
	 * Create a suspend info object.
	 *
	 * @return  {Object}		Suspend info.
	 */
	static __createSuspendInfo()
	{

		let suspendInfo = {};

		let promise = new Promise((resolve, reject) => {
			suspendInfo["resolve"] = resolve;
			suspendInfo["reject"] = reject;
			suspendInfo["state"] = "pending";
		});
		suspendInfo["promise"] = promise;

		return suspendInfo;

	}

}
