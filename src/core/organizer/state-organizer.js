// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import Component from "../component/component.js";
import Organizer from "./organizer.js";
import Store from "../store/store.js";
import Util from "../util/util.js";

// =============================================================================
//	State organizer class
// =============================================================================

export default class StateOrganizer extends Organizer
{

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
	 * Global init.
	 */
	static globalInit()
	{

		// Add properties
		Object.defineProperty(Component.prototype, "state", {
			get() { return this._state; },
			set(value) { this._state = value; }
		});

		// Add methods
		Component.prototype.changeState= function(newState) { return StateOrganizer._changeState(this, newState); }
		Component.prototype.waitFor = function(waitlist, timeout) { return StateOrganizer._waitFor(this, waitlist, timeout); }
		Component.prototype.suspend = function(state) { return StateOrganizer._suspend(this, state); }
		Component.prototype.resume = function(state) { return StateOrganizer._resume(this, state); }
		Component.prototype.pause = function(state) { return StateOrganizer._pause(this, state); }

		// Init vars
		StateOrganizer.__suspends = {};
		StateOrganizer.__components = new Store();
		StateOrganizer.__waitingList = new Store();
		StateOrganizer.__waitingListIndexName = new Map();
		StateOrganizer.__waitingListIndexId = new Map();
		StateOrganizer.__waitingListIndexNone = new Map();
		StateOrganizer.waitFor = function(waitlist, timeout) { return StateOrganizer._waitFor(null, waitlist, timeout); }

	}

	// -------------------------------------------------------------------------

	/**
	 * Init.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object}		settings			Settings.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static init(component, settings)
	{

		// Init vars
		component._state = "";
		component._suspends = {};

		// Load settings from attributes
		StateOrganizer.__loadAttrSettings(component);

	}

	// -------------------------------------------------------------------------

	/**
	 * Organize.
	 *
	 * @param	{Object}		conditions			Conditions.
	 * @param	{Component}		component			Component.
	 * @param	{Object}		settings			Settings.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static organize(conditions, component, settings)
	{

		let promise = Promise.resolve();

		let waitFor = settings["waitFor"];
		if (waitFor)
		{
			if (waitFor[conditions])
			{
				promise = StateOrganizer._waitFor(component, waitFor[conditions], component.settings.get("system.waitforTimeout"));
			}
		}

		return promise;

	}

	// -------------------------------------------------------------------------

	/**
	 * Clear.
	 */
	static clear()
	{

		this.__waitingList.clear();

	}

	// -------------------------------------------------------------------------

	/**
	 * Suspend all components at a specified state.
	 *
	 * @param	{String}		state				Component state.
	 */
	static globalSuspend(state)
	{

		StateOrganizer.__suspends[state] = StateOrganizer._createSuspendInfo(state);
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
		let timeout = ( options && options["timeout"] ? options["timeout"] : 10000 );
		let waiter = ( options && options["waiter"] ? options["waiter"] : component );
		let waitInfo = {"waiter":waiter, "waitlist":waitlist.slice()};

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
				setTimeout(() => {
					let name = ( component && component.name ) || ( waitInfo["waiter"] && waitInfo["waiter"].tagName ) || "";
					reject(`StateOrganizer._waitFor(): Timed out after ${timeout} milliseconds waiting for ${StateOrganizer.__dumpWaitlist(waitlist)}, name=${name}.`);
				}, timeout);
			});
			waitInfo["promise"] = promise;

			// Add to info to a waiting list.
			StateOrganizer.__addToWaitingList(waitInfo, component);
		}

		return promise;

	}

	// -------------------------------------------------------------------------

	/**
	 * Wait for a component to become specific state.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{String}		state				state.
	 * @param	{integer}		timeout				Timeout in milliseconds.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _waitForSingle(component, state, timeout)
	{

		let componentInfo = StateOrganizer.__components.get(component.uniqueId);
		let waitlistItem = {"id":component.uniqueId, "state":state};

		if (StateOrganizer.__isReady(waitlistItem, componentInfo))
		{
			return Promise.resolve();
		}
		else
		{
			return StateOrganizer.waitFor(component, [waitlistItem], timeout);
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Wait for a component to become transitionable state.
	 *
	 * @param	{Object}		component			Component to register.
	 * @param	{String}		newState			New state.
	 *
	 * @return  {Promise}		Promise.
	 */
	/*
	static _waitForTransitionableState(component, newState)
	{

		if (newState === "starting")
		{
			return StateOrganizer._waitForSingle(component, "instantiated");
		}

		if (newState === "stopping")
		{
			return StateOrganizer._waitForSingle(component, "instantiated");
		}

		if (newState === "opening")
		{
			return StateOrganizer._waitForSingle(component, "started");
		}

		if (newState === "closing")
		{
			return StateOrganizer._waitForSingle(component, "opened");
		}

	}
	*/

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
		StateOrganizer.__components.set(component.uniqueId, {"object":component, "state":state});

		StateOrganizer.__processWaitingList(component, state);

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

		component._suspends[state] = StateOrganizer._createSuspendInfo();
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

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
	 * Check whether changing curren state to new state is allowed.
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
	 * Check wait list and resolve() if components are ready.
	 */
	static __processWaitingList(component, state)
	{

		// Process name index
		let names = StateOrganizer.__waitingListIndexName.get(component.name + "." + state);
		if (names && names.length > 0)
		{
			StateOrganizer.__processIndex(names);
		}

		// Process ID index
		let ids = StateOrganizer.__waitingListIndexId.get(component.uniqueId + "." + state);
		if (ids && ids.length > 0)
		{
			StateOrganizer.__processIndex(ids);
		}

		// Process non indexables
		let list = StateOrganizer.__waitingListIndexNone.get("none");
		if (list && list.length > 0)
		{
			StateOrganizer.__processIndex(list);
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Process waiting list index.
	 *
	 * @param	{Array}			list				List of indexed waiting list id.
	 */
	static __processIndex(list)
	{

		let removeList = [];

		for (let i = 0; i < list.length; i++)
		{
			let id = list[i];
			let waitInfo = StateOrganizer.__waitingList.get(id);

			if (StateOrganizer.__isAllReady(StateOrganizer.__waitingList.get(id)))
			{
				// Remove from waiting list
				StateOrganizer.__waitingList.get(id).resolve();
				StateOrganizer.__waitingList.remove(id);

				// Add to remove list
				removeList.push(id);
			}
		}

		// Remove from index;
		for (let i = removeList.length - 1; i >= 0; i--)
		{
			StateOrganizer.__removeFromIndex(list, removeList[i]);
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

		// Add wait info to the waiting list.
		let id = new Date().getTime().toString(16) + Math.floor(100*Math.random()).toString(16);
		StateOrganizer.__waitingList.set(id, waitInfo);

		// Create index for faster processing
		let waitlist = waitInfo["waitlist"];
		for (let i = 0; i < waitlist.length; i++)
		{
			// Set default state when not specified
			waitlist[i]["state"] = waitlist[i]["state"] || "ready";

			// Index for component id + state
			if (waitlist[i].id)
			{
				StateOrganizer.__addToIndex(StateOrganizer.__waitingListIndexId, waitlist[i].id+ "." + waitlist[i].state, id);
			}
			// Index for component name + state
			else if (waitlist[i].name)
			{
				StateOrganizer.__addToIndex(StateOrganizer.__waitingListIndexName, waitlist[i].name + "." + waitlist[i].state, id);
			}
			// Not indexable
			else
			{
				StateOrganizer.__addToIndex(StateOrganizer.__waitingListIndexNone, "none", id);
			}
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Add id to a waiting list index.
	 *
	 * @param	{Map}			index				Waiting list index.
	 * @param	{String}		key					Index key.
	 * @param	{String}		id					Waiting list id.
	 */
	static __addToIndex(index, key, id)
	{

		let list = index.get(key);
		if (!list)
		{
			list = [];
			index.set(key, list)
		}

		if (list.indexOf(id) === -1)
		{
			list.push(id);
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Remove id from a waiting list index.
	 *
	 * @param	{Array}			list				List of ids.
	 * @param	{String}		id					Waiting list id.
	 */
	static __removeFromIndex(list, id)
	{

		let index = list.indexOf(id);
		if (index > -1)
		{
			list.splice(index, 1);
		}

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
			componentInfo = StateOrganizer.__components.get(waitlistItem["id"]);
		}
		else if (waitlistItem["name"])
		{
			Object.keys(StateOrganizer.__components.items).forEach((key) => {
				if (waitlistItem["name"] === StateOrganizer.__components.get(key).object.name)
				{
					componentInfo = StateOrganizer.__components.get(key);
				}
			});
		}
		else if (waitlistItem["rootNode"])
		{
			let element = document.querySelector(waitlistItem["rootNode"]);
			if (element && element.uniqueId)
			{
				componentInfo = StateOrganizer.__components.get(element.uniqueId);
			}
		}
		else if (waitlistItem["object"])
		{
			let element = waitlistItem["object"];
			if (element.uniqueId)
			{
				componentInfo = StateOrganizer.__components.get(element.uniqueId);
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
		if (waitlistItem["component"] && componentInfo["object"] !== waitlistItem["component"])
		{
			isMatch = false;
		}

		// check name
		if (waitlistItem["name"] && componentInfo["object"].name !== waitlistItem["name"])
		{
			isMatch = false;
		}

		// check id
		if (waitlistItem["id"] && componentInfo["object"].uniqueId !== waitlistItem["id"])
		{
			isMatch = false;
		}

		// check node
		if (waitlistItem["rootNode"]  && !document.querySelector(waitlistItem["rootNode"]))
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
	 * Get settings from element's attribute.
	 *
	 * @param	{Component}		component			Component.
	 */
	static __loadAttrSettings(component)
	{

		// Get waitFor from attribute

		if (component.hasAttribute("bm-waitfor"))
		{
			let waitInfo = {"name":component.getAttribute("bm-waitfor"), "state":"started"};
			component.settings.merge({"waitFor": [waitInfo]});
		}

		if (component.hasAttribute("bm-waitfornode"))
		{
			let waitInfo = {"rootNode":component.getAttribute("bm-waitfornode"), "state":"started"};
			component.settings.merge({"waitFor": [waitInfo]});
		}

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
			let id = ( waitlist[i].id ? "id:" + waitlist[i].id + "," : "" );
			let name = ( waitlist[i].name ? "name:" + waitlist[i].name + "," : "" );
			let object = ( waitlist[i].object ? "element:" + waitlist[i].object.tagName + "," : "" );
			let node = (waitlist[i].rootNode ? "node:" + waitlist[i].rootNode + "," : "" );
			let state = (waitlist[i].state ? "state:" + waitlist[i].state: "" );
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
	static _createSuspendInfo()
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
