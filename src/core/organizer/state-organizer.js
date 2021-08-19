// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import Component from "../component.js";
import Organizer from "./organizer.js";
import Store from "../store/store.js";
import Util from "../util/util.js";

// =============================================================================
//	Waitfor organizer class
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
		Component.prototype.isInitialized = function() { return StateOrganizer._isInitialized(this); }
		Component.prototype.waitFor = function(waitlist, timeout) { return StateOrganizer._waitFor(this, waitlist, timeout); }
		Component.prototype.suspend = function(state) { return StateOrganizer._suspend(this, state); }

		// Init vars
		StateOrganizer.__components = new Store();
		StateOrganizer.__waitingList = new Store();
		StateOrganizer.__waitingListIndexName = new Map();
		StateOrganizer.__waitingListIndexId = new Map();
		StateOrganizer.__waitingListIndexNone = [];	Component.prototype.resume = function(state) { return StateOrganizer._resume(this, state); }
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
		//component._suspend = {};

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

		return promise.then(() => {
			return settings;
		});

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
	//  Protected
	// -------------------------------------------------------------------------

	/**
	 * Wait for components to become specific states.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Array}			waitlist			Components to wait.
	 * @param	{integer}		timeout				Timeout in milliseconds.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _waitFor(component, waitlist, timeout)
	{

		let promise;
		timeout = ( timeout ? timeout : 10000 );

		let waitInfo = {"waiter":component, "waitlist":waitlist.slice()};

		if (StateOrganizer.__isAllReady(waitInfo))
		{
			promise = Promise.resolve();
		}
		else
		{
			promise = new Promise((resolve, reject) => {
				waitInfo["resolve"] = resolve;
				waitInfo["reject"] = reject;
				setTimeout(() => {
					reject(`StateOrganizer._waitFor(): Timed out after ${timeout} milliseconds waiting for ${JSON.stringify(waitlist)}, name=${component && component.name}.`);
				}, timeout);
			});
			waitInfo["promise"] = promise;

			//StateOrganizer.__addToWaitingList(waitInfo, component, state);
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

		if (newState == "starting")
		{
			return StateOrganizer._waitForSingle(component, "instantiated");
		}

		if (newState == "stopping")
		{
			return StateOrganizer._waitForSingle(component, "instantiated");
		}

		if (newState == "opening")
		{
			return StateOrganizer._waitForSingle(component, "started");
		}

		if (newState == "closing")
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

		Util.assert(StateOrganizer.__isTransitionable(component.state, state), `StateOrganizer._changeState(): Illegal transition. name=${component.name}, fromState=${component.state}, toState=${state}, id=${component.id}`, Error);

		component.state = state;
		StateOrganizer.__components.set(component.uniqueId, {"object":component, "state":state});

		StateOrganizer.__processWaitingList(component, state);

	}

	// -------------------------------------------------------------------------

	/**
	 * Change component state and check waiting list.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{String}		state				Component state.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _suspend(component, state)
	{

		let suspendInfo = {};

		let promise = new Promise((resolve, reject) => {
			suspendInfo["resolve"] = resolve;
			suspendInfo["reject"] = reject;
		});
		suspendInfo["promise"] = promise;

		component._suspend[state] = suspendInfo;

		return promise;

	}

	// -------------------------------------------------------------------------

	/**
	 * Change component state and check waiting list.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{String}		state				Component state.
	 */
	static _resume(component, state)
	{

		component._suspend[state].resolve();

	}

	// -------------------------------------------------------------------------

	/**
	 * Check if the componenet is initialized.
	 *
	 * @param	{Component}		component			Parent component.
	 *
	 * @return  {Boolean}		True when initialized.
	 */
	static _isInitialized(component)
	{

		let ret = false;

		if (component.state &&
			component.state != "starting" &&
			component.state != "stopping" &&
			component.state != "stopped"
		)
		{
			ret = true;
		}

		return ret;

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

		if (currentState && currentState.slice(-3) == "ing")
		{
			if(
				( currentState == "stopping" && newState != "stopped") ||
				( currentState == "starting" && newState != "started") ||
				( currentState == "opening" && (newState != "opened" && newState != "opening") ) ||
				( currentState == "closing" && newState != "closed") ||
				( currentState == "stopping" && (newState != "stopped" && newState != "closing") )
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
		StateOrganizer.__processIndex(names);

		// Process ID index
		let ids = StateOrganizer.__waitingListIndexId.get(component.uniqueId + "." + state);
		StateOrganizer.__processIndex(ids);

		// Process non indexables
		StateOrganizer.__processIndex(StateOrganizer.__waitingListIndexNone);

	}

	// -------------------------------------------------------------------------

	/**
	 * Process waiting list index.
	 *
	 * @param	{Array}			list				List of indexed waiting list id.
	 */
	static __processIndex(list)
	{

		if (list)
		{
			for (let i = 0; i < list.length; i++)
			{
				let id = list[i];

				if (id)
				{
					let waitInfo = StateOrganizer.__waitingList.get(id);

					if (StateOrganizer.__isAllReady(StateOrganizer.__waitingList.get(id)))
					{
						StateOrganizer.__waitingList.get(id).resolve();
						StateOrganizer.__waitingList.remove(id);

						// delete from index
						list[i] = null;
					}
				}
			}
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Add wait info to the waiting list.
	 *
	 * @param	{Object}		waitInfo			Wait info.
	 * @param	{Component}		component			Component.
	 *
	 * @return  {Promise}		Promise.
	 */
	static __addToWaitingList(waitInfo, component)
	{

		// Add wait info to the waiting list.
		let id = new Date().getTime().toString(16) + Math.floor(100*Math.random()).toString(16);
		StateOrganizer.__waitingList.set(id, waitInfo);

		// Create index for faster processing
		let waitlist = waitInfo["waitlist"];
		for (let i = 0; i < waitlist.length; i++)
		{
			// Set default state when not specified
			waitlist[i]["state"] = waitlist[i]["state"] || "opened";

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
				StateOrganizer.__waitingListIndexNone.push(id);
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

		if (!index.get(key))
		{
			index.set(key, [])
		}

		index.get(key).push(id);

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
				if (waitlistItem["name"] == StateOrganizer.__components.get(key).object.name)
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
		if (waitlistItem["name"] && componentInfo["object"].name != waitlistItem["name"])
		{
			isMatch = false;
		}

		// check id
		if (waitlistItem["id"] && componentInfo["object"].uniqueId != waitlistItem["id"])
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

		let isMatch = true;

		switch (expectedState)
		{
			case "started":
				if (
					currentState != "opening" &&
					currentState != "opened" &&
					currentState != "closing" &&
					currentState != "closed" &&
					currentState != "started"
				)
				{
					isMatch = false;
				}
				break;
			default:
				if (currentState != expectedState)
				{
					isMatch = false;
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

}
