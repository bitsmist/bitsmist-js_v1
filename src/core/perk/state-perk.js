// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import Perk from "./perk.js";
import Store from "../store/store.js";
import Util from "../util/util.js";

// =============================================================================
//	State Perk Class
// =============================================================================

export default class StatePerk extends Perk
{

	// -------------------------------------------------------------------------
	//  Skills
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

		Util.assert(StatePerk.__isTransitionable(component.stats.get("state.state"), state), `StatePerk._changeState(): Illegal transition. name=${component.tagName}, fromState=${component.stats.get("state.state")}, toState=${state}, id=${component.id}`, Error);

		component.stats.set("state.state", state);
		BITSMIST.v1.Origin.report.set(`components.${component.uniqueId}`, {"object":component, "state":state});

		StatePerk.__processWaitingList();

	}

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

		if (StatePerk.__isAllReady(waitInfo))
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
					let uniqueId = (component && component.uniqueId) || "";
					reject(`StatePerk._waitFor(): Timed out after ${timeout} milliseconds waiting for ${StatePerk.__dumpWaitlist(waitlist)}, name=${name}, uniqueId=${uniqueId}.`);
				}, timeout);
			});
			waitInfo["promise"] = promise;

			// Add info to the waiting list.
			StatePerk.__addToWaitingList(waitInfo);
		}

		return promise;

	}

	// -------------------------------------------------------------------------

	/**
	 * Suspend the component at the specified state.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{String}		state				Component state.
	 */
	static _suspend(component, state)
	{

		/*
		component._suspends[state] = StatePerk.__createSuspendInfo();
	 	component._suspends[state].state = "pending";
		*/

	}

	// -------------------------------------------------------------------------

	/**
	 * Resume the component at the specified state.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{String}		state				Component state.
	 */
	static _resume(component, state)
	{

		/*
	 	component._suspends[state].resolve();
	 	component._suspends[state].state = "resolved";
		*/

	}

	// -------------------------------------------------------------------------

	/**
	 * Pause the component if it is suspended.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{String}		state				Component state.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _pause(component, state)
	{

		/*
		let ret = [];

		// Globally suspended?
		if (StatePerk.__suspends[state] && StatePerk.__suspends[state].state === "pending" && !component.settings.get("setting.ignoreGlobalSuspend"))
		{
			ret.push(StatePerk.__suspends[state].promise);
		}

		// Component suspended?
		if (component._suspends[state] && component._suspends[state].state === "pending")
		{
			ret.push(component._suspends[state].promise);
		}

		return Promise.all(ret);
		*/

	}

	// -------------------------------------------------------------------------
	//  Event Handlers
	// -------------------------------------------------------------------------

	static StatePerk_onDoOrganize(sender, e, ex)
	{

		Object.entries(this.settings.get("state.waitFor", {})).forEach(([sectionName, sectionValue]) => {
			this.addEventHandler(sectionName, {"handler":StatePerk.StatePerk_onDoProcess, "options":sectionValue});
		});

	}

	// -------------------------------------------------------------------------

	static StatePerk_onDoProcess(sender, e, ex)
	{

		return StatePerk._waitFor(this, ex.options);

	}

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	static get info()
	{

		return {
			"section":		"state",
			"order":		100,
		};

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static globalInit()
	{

		// Init vars
		StatePerk._waitingList = new Store();
		StatePerk.__suspends = {};
		StatePerk.waitFor = function(waitlist, timeout) { return StatePerk._waitFor(null, waitlist, timeout); }

		// Add skills to Component
		BITSMIST.v1.Component.skills.set("state.change", function(...args) { return StatePerk._changeState(...args); });
		BITSMIST.v1.Component.skills.set("state.wait", function(...args) { return StatePerk._waitFor(...args); });
		BITSMIST.v1.Component.skills.set("state.suspend", function(...args) { return StatePerk._suspend(...args); });
		BITSMIST.v1.Component.skills.set("state.resume", function(...args) { return StatePerk._resume(...args); });
		BITSMIST.v1.Component.skills.set("state.pause", function(...args) { return StatePerk._pause(...args); });

	}

	// -------------------------------------------------------------------------

	static init(component, options)
	{

		// Add stats to component;
		component.stats.set("state.state", "connected");

		// Add inventory items to component;
		component.inventory.set("state.suspends", {});

		// Add event handlers to component
		this._addPerkHandler(component, "doOrganize", StatePerk.StatePerk_onDoOrganize);

		// Load settings from attributes
		StatePerk.__loadAttrSettings(component);

	}

	// -------------------------------------------------------------------------

	/**
	 * Suspend all components at the specified state.
	 *
	 * @param	{String}		state				Component state.
	 */
	static globalSuspend(state)
	{

		StatePerk.__suspends[state] = StatePerk.__createSuspendInfo(state);
		StatePerk.__suspends[state].state = "pending";

	}

	// -------------------------------------------------------------------------

	/**
	 * Resume all components at the specified state.
	 *
	 * @param	{String}		state				Component state.
	 */
	static globalResume(state)
	{

		StatePerk.__suspends[state].resolve();
		StatePerk.__suspends[state].state = "resolved";

	}

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

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

	/**
	 * Process waiting list.
	 */
	static __processWaitingList()
	{

		let removeList = [];
		Object.keys(StatePerk._waitingList.items).forEach((id) => {
			if (StatePerk.__isAllReady(StatePerk._waitingList.get(id)))
			{
				clearTimeout(StatePerk._waitingList.get(id)["timer"]);
				StatePerk._waitingList.get(id).resolve();
				removeList.push(id);
			}
		});

		// Remove from waiting list
		for (let i = 0; i < removeList.length; i++)
		{
			StatePerk._waitingList.remove(removeList[i]);
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

				Util.assert(element && element.uniqueId, `StatePerk.__addToWaitingList(): Root node does not exist. waiter=${waitInfo["waiter"]}, rootNode=${waitInfo["waitlist"][i].rootNode}`, ReferenceError);
			}
		}
		*/

		StatePerk._waitingList.set(id, waitInfo);

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
			componentInfo = BITSMIST.v1.Origin.report.get(`components.${waitlistItem["id"]}`);
		}
		else if (waitlistItem["name"])
		{
			Object.keys(BITSMIST.v1.Origin.report.get("component").items).forEach((key) => {
				if (waitlistItem["name"] === BITSMIST.v1.Origin.report.get(`components.${key}`).object.name)
				{
					componentInfo = BITSMIST.v1.Origin.report.get(`components.${key}`);
				}
			});
		}
		else if (waitlistItem["rootNode"])
		{
			let element = document.querySelector(waitlistItem["rootNode"]);
			if (element && element.uniqueId)
			{
				componentInfo = BITSMIST.v1.Origin.report.get(`components.${element.uniqueId}`);
			}
		}
		else if (waitlistItem["object"])
		{
			let element = waitlistItem["object"];
			if (element.uniqueId)
			{
				componentInfo = BITSMIST.v1.Origin.report.get(`components.${element.uniqueId}`);
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
				if (StatePerk.__isReady(waitlist[i], componentInfo))
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
	 * Check if the component is ready.
	 *
	 * @param	{Object}		waitlistItem		Wait list item.
	 * @param	{Object}		componentInfo		Registered component info.
	 *
	 * @return  {Boolean}		True if ready.
	 */
	static __isReady(waitlistItem, componentInfo)
	{

		// Check component
		let isMatch = StatePerk.__isComponentMatch(componentInfo, waitlistItem);

		// Check state
		if (isMatch)
		{
			isMatch = StatePerk.__isStateMatch(componentInfo["state"], waitlistItem["state"]);
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
			let id = (waitlist[i].id ? `id:${waitlist[i].id},` : "");
			let name = (waitlist[i].name ? `name:${waitlist[i].name},` : "");
			let object = (waitlist[i].object ? `element:${waitlist[i].object.tagName},` : "");
			let node = (waitlist[i].rootNode ? `node:${waitlist[i].rootNode},` : "");
			let state = (waitlist[i].state ? `state:${waitlist[i].state}` : "");
			result += `\n\t{${id}${name}${object}${node}${state}},`;
		}

		return `[${result}\n]`;

	}

	// -------------------------------------------------------------------------

	/**
	 * Create the suspend info object.
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
