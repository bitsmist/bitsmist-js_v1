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
//	Status Perk Class
// =============================================================================

export default class StatusPerk extends Perk
{

	// -------------------------------------------------------------------------
	//  Properties
	// -------------------------------------------------------------------------

	static get info()
	{

		return {
			"section":		"status",
			"order":		100,
		};

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static
	{

		// Init vars
		this._statuses = {}

	}

	// -------------------------------------------------------------------------

	static globalInit()
	{

		// Init vars
		StatusPerk._waitingList = new Store();
		StatusPerk.__suspends = {};
		StatusPerk.waitFor = function(waitlist, timeout) { return StatusPerk._waitFor(null, waitlist, timeout); }

		// Upgrade Component
		this.upgrade(BITSMIST.v1.Component, "skill", "status.change", function(...args) { return StatusPerk._changeStatus(...args); });
		this.upgrade(BITSMIST.v1.Component, "spell", "status.wait", function(...args) { return StatusPerk._waitFor(...args); });
		this.upgrade(BITSMIST.v1.Component, "spell", "status.suspend", function(...args) { return StatusPerk._suspend(...args); });
		this.upgrade(BITSMIST.v1.Component, "spell", "status.resume", function(...args) { return StatusPerk._resume(...args); });
		this.upgrade(BITSMIST.v1.Component, "spell", "status.pause", function(...args) { return StatusPerk._pause(...args); });

	}

	// -------------------------------------------------------------------------

	static init(component, options)
	{

		// Upgrade component;
		this.upgrade(component, "state", "status.status", "connected");
		this.upgrade(component, "inventory", "status.suspends", {});
		this.upgrade(component, "event", "doApplySettings", StatusPerk.StatusPerk_onDoApplySettings);

	}

	// -------------------------------------------------------------------------

	/**
	 * Suspend all components at the specified status.
	 *
	 * @param	{String}		status				Component status.
	 */
	static globalSuspend(status)
	{

		StatusPerk.__suspends[status] = StatusPerk.__createSuspendInfo(status);
		StatusPerk.__suspends[status].status = "pending";

	}

	// -------------------------------------------------------------------------

	/**
	 * Resume all components at the specified status.
	 *
	 * @param	{String}		status				Component status.
	 */
	static globalResume(status)
	{

		StatusPerk.__suspends[status].resolve();
		StatusPerk.__suspends[status].status = "resolved";

	}

	// -------------------------------------------------------------------------
	//  Event Handlers
	// -------------------------------------------------------------------------

	static StatusPerk_onDoApplySettings(sender, e, ex)
	{

		Object.entries(Util.safeGet(e.detail, "settings.status.waitFor", {})).forEach(([sectionName, sectionValue]) => {
			this.addEventHandler(sectionName, {"handler":StatusPerk.StatusPerk_onDoProcess, "options":sectionValue});
		});

	}

	// -------------------------------------------------------------------------

	static StatusPerk_onDoProcess(sender, e, ex)
	{

		return StatusPerk._waitFor(this, ex.options);

	}

	// -------------------------------------------------------------------------
	//  Skills
	// -------------------------------------------------------------------------

	/**
	 * Change component status and check waiting list.
	 *
	 * @param	{Component}		component			Component to register.
	 * @param	{String}		status				Component status.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _changeStatus(component, status)
	{

		Util.assert(StatusPerk.__isTransitionable(component.get("state", "status.status"), status), `StatusPerk._changeStatus(): Illegal transition. name=${component.tagName}, fromStatus=${component.get("state", "status.status")}, toStatus=${status}, id=${component.id}`, Error);

		component.set("state", "status.status", status);
		this._statuses[component.uniqueId] = {"object":component, "status":status};

		StatusPerk.__processWaitingList();

	}

	// -------------------------------------------------------------------------

	/**
	 * Wait for components to become specific statuses.
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
				(component && component.get("settings", "system.waitForTimeout")) || // component could be null
				BITSMIST.v1.Component.get("settings", "system.waitForTimeout", 10000);
		let waiter = ( options && options["waiter"] ? options["waiter"] : component );
		let waitInfo = {"waiter":waiter, "waitlist":Util.deepClone(waitlist)};

		if (StatusPerk.__isAllReady(waitInfo))
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
					let name = ( component && component.tagName ) || ( waitInfo["waiter"] && waitInfo["waiter"].tagName ) || "";
					let uniqueId = (component && component.uniqueId) || "";
					reject(`StatusPerk._waitFor(): Timed out after ${timeout} milliseconds waiting for ${StatusPerk.__dumpWaitlist(waitlist)}, name=${name}, uniqueId=${uniqueId}.`);
				}, timeout);
			});
			waitInfo["promise"] = promise;

			// Add info to the waiting list.
			StatusPerk.__addToWaitingList(waitInfo);
		}

		return promise;

	}

	// -------------------------------------------------------------------------

	/**
	 * Suspend the component at the specified status.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{String}		status				Component status.
	 */
	static _suspend(component, status)
	{

		/*
		component._suspends[status] = StatusPerk.__createSuspendInfo();
	 	component._suspends[status].status = "pending";
		*/

	}

	// -------------------------------------------------------------------------

	/**
	 * Resume the component at the specified status.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{String}		status				Component status.
	 */
	static _resume(component, status)
	{

		/*
	 	component._suspends[status].resolve();
	 	component._suspends[status].status = "resolved";
		*/

	}

	// -------------------------------------------------------------------------

	/**
	 * Pause the component if it is suspended.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{String}		status				Component status.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _pause(component, status)
	{

		/*
		let ret = [];

		// Globally suspended?
		if (StatusPerk.__suspends[status] && StatusPerk.__suspends[status].status === "pending" && !component.get("settings", "setting.ignoreGlobalSuspend"))
		{
			ret.push(StatusPerk.__suspends[status].promise);
		}

		// Component suspended?
		if (component._suspends[status] && component._suspends[status].status === "pending")
		{
			ret.push(component._suspends[status].promise);
		}

		return Promise.all(ret);
		*/

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
		Object.keys(StatusPerk._waitingList.items).forEach((id) => {
			if (StatusPerk.__isAllReady(StatusPerk._waitingList.get(id)))
			{
				clearTimeout(StatusPerk._waitingList.get(id)["timer"]);
				StatusPerk._waitingList.get(id).resolve();
				removeList.push(id);
			}
		});

		// Remove from waiting list
		for (let i = 0; i < removeList.length; i++)
		{
			StatusPerk._waitingList.remove(removeList[i]);
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

				Util.assert(element && element.uniqueId, `StatusPerk.__addToWaitingList(): Root node does not exist. waiter=${waitInfo["waiter"]}, rootNode=${waitInfo["waitlist"][i].rootNode}`, ReferenceError);
			}
		}
		*/

		StatusPerk._waitingList.set(id, waitInfo);

	}

	// -------------------------------------------------------------------------

	/**
	 * Check whether changing current status to new status is allowed.
	 *
	 * @param	{String}		currentStatus		Current status.
	 * @param	{String}		newStatus			New status.
	 *
	 * @return  {Promise}		Promise.
	 */
	static __isTransitionable(currentStatus, newStatus)
	{

		let ret = true;

		if (currentStatus && currentStatus.slice(-3) === "ing")
		{
			if(
				( currentStatus === "stopping" && newStatus !== "stopped") ||
				( currentStatus === "starting" && newStatus !== "started")
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
			componentInfo = this._statuses[waitlistItem["id"]];
		}
		else if (waitlistItem["name"])
		{
			Object.keys(this._statuses).forEach((key) => {
				if (waitlistItem["name"] === this._statuses[key].object.name)
				{
					componentInfo = this._statuses[key];
				}
			});
		}
		else if (waitlistItem["rootNode"])
		{
			let element = document.querySelector(waitlistItem["rootNode"]);
			if (element && element.uniqueId)
			{
				componentInfo = this._statuses[element.uniqueId];
			}
		}
		else if (waitlistItem["object"])
		{
			let element = waitlistItem["object"];
			if (element.uniqueId)
			{
				componentInfo = this._statuses[element.uniqueId];
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
				if (StatusPerk.__isReady(waitlist[i], componentInfo))
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
		let isMatch = StatusPerk.__isComponentMatch(componentInfo, waitlistItem);

		// Check status
		if (isMatch)
		{
			isMatch = StatusPerk.__isStatusMatch(componentInfo["status"], waitlistItem["status"]);
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
	 * Check if status match.
	 *
	 * @param	{String}		currentStatus		Current status.
	 * @param	{String}		expectedStatus		Expected status.
	 *
	 * @return  {Boolean}		True if match.
	 */
	static __isStatusMatch(currentStatus, expectedStatus)
	{

		expectedStatus = expectedStatus || "ready";
		let isMatch = false;

		switch (currentStatus)
		{
			case "ready":
				if (
					expectedStatus === "ready" ||
					expectedStatus === "started" ||
					expectedStatus === "starting"
				)
				{
					isMatch = true;
				}
				break;
			case "started":
				if (
					expectedStatus === "started" ||
					expectedStatus === "starting"
				)
				{
					isMatch = true;
				}
				break;
			case "stopped":
				if (
					expectedStatus === "stopped" ||
					expectedStatus === "stopping"
				)
				{
					isMatch = true;
				}
				break;
			default:
				if ( currentStatus === expectedStatus )
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
			let status = (waitlist[i].status ? `status:${waitlist[i].status}` : "");
			result += `\n\t{${id}${name}${object}${node}${status}},`;
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
			suspendInfo["status"] = "pending";
		});
		suspendInfo["promise"] = promise;

		return suspendInfo;

	}

}
