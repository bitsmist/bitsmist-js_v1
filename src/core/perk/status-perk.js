// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/main/LICENSE
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

	static globalInit()
	{

		// Init vars
		StatusPerk._unitInfo = Perk.getPerk("BasicPerk")._unitInfo; // Shortcut
		StatusPerk._waitingList = new Store();
		StatusPerk.__suspends = {};
		StatusPerk.waitFor = function(waitlist, timeout) { return StatusPerk._waitFor(BITSMIST.v1.Unit, waitlist, timeout); }

		// Upgrade Unit
		this.upgrade(BITSMIST.v1.Unit, "skill", "status.change", function(...args) { return StatusPerk._changeStatus(...args); });
		this.upgrade(BITSMIST.v1.Unit, "spell", "status.wait", function(...args) { return StatusPerk._waitFor(...args); });
		this.upgrade(BITSMIST.v1.Unit, "spell", "status.suspend", function(...args) { return StatusPerk._suspend(...args); });
		this.upgrade(BITSMIST.v1.Unit, "spell", "status.resume", function(...args) { return StatusPerk._resume(...args); });
		this.upgrade(BITSMIST.v1.Unit, "spell", "status.pause", function(...args) { return StatusPerk._pause(...args); });

	}

	// -------------------------------------------------------------------------

	static init(unit, options)
	{

		// Upgrade unit;
		this.upgrade(unit, "state", "status.status", "connected");
		this.upgrade(unit, "inventory", "status.suspends", {});
		this.upgrade(unit, "event", "doApplySettings", StatusPerk.StatusPerk_onDoApplySettings);

	}

	// -------------------------------------------------------------------------

	/**
	 * Suspend all units at the specified status.
	 *
	 * @param	{String}		status				Unit status.
	 */
	static globalSuspend(status)
	{

		StatusPerk.__suspends[status] = StatusPerk.__createSuspendInfo(status);
		StatusPerk.__suspends[status].status = "pending";

	}

	// -------------------------------------------------------------------------

	/**
	 * Resume all units at the specified status.
	 *
	 * @param	{String}		status				Unit status.
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
	 * Change unit status and check waiting list.
	 *
	 * @param	{Unit}			unit				Unit to register.
	 * @param	{String}		status				Unit status.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _changeStatus(unit, status)
	{

		Util.assert(StatusPerk.__isTransitionable(unit.get("state", "status.status"), status), `StatusPerk._changeStatus(): Illegal transition. name=${unit.tagName}, fromStatus=${unit.get("state", "status.status")}, toStatus=${status}, id=${unit.id}`, Error);

		unit.set("state", "status.status", status);
		StatusPerk._unitInfo[unit.uniqueId]["status"] = status;

		StatusPerk.__processWaitingList();

	}

	// -------------------------------------------------------------------------

	/**
	 * Wait for units to become specific statuses.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{Array}			waitlist			Units to wait.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _waitFor(unit, waitlist, options)
	{

		let promise;
		let timeout =
				(options && options["timeout"]) ||
				unit.get("setting", "status.options.waitForTimeout", unit.get("setting", "system.status.options.waitForTimeout", 10000));
		let waiter = ( options && options["waiter"] ? options["waiter"] : unit );
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
					let name = ( unit && unit.tagName ) || ( waitInfo["waiter"] && waitInfo["waiter"].tagName ) || "";
					let uniqueId = (unit && unit.uniqueId) || "";
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
	 * Suspend the unit at the specified status.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{String}		status				Unit status.
	 */
	static _suspend(unit, status)
	{

		/*
		unit._suspends[status] = StatusPerk.__createSuspendInfo();
	 	unit._suspends[status].status = "pending";
		*/

	}

	// -------------------------------------------------------------------------

	/**
	 * Resume the unit at the specified status.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{String}		status				Unit status.
	 */
	static _resume(unit, status)
	{

		/*
	 	unit._suspends[status].resolve();
	 	unit._suspends[status].status = "resolved";
		*/

	}

	// -------------------------------------------------------------------------

	/**
	 * Pause the unit if it is suspended.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{String}		status				Unit status.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _pause(unit, status)
	{

		/*
		let ret = [];

		// Globally suspended?
		if (StatusPerk.__suspends[status] && StatusPerk.__suspends[status].status === "pending" && !unit.get("setting", "setting.ignoreGlobalSuspend"))
		{
			ret.push(StatusPerk.__suspends[status].promise);
		}

		// Unit suspended?
		if (unit._suspends[status] && unit._suspends[status].status === "pending")
		{
			ret.push(unit._suspends[status].promise);
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
	 * Get unit info from wait list item.
	 *
	 * @param	{Object}		waitlistItem		Wait list item.
	 *
	 * @return  {Boolean}		True if ready.
	 */
	static __getUnitInfo(unit, waitlistItem)
	{

		let unitInfo;
		let target = unit.use("skill", "basic.locate", waitlistItem);
		if (target)
		{
			unitInfo = StatusPerk._unitInfo[target.uniqueId];
		}

		return unitInfo;

	}

	// -------------------------------------------------------------------------

	/**
	 * Check if all units are ready.
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
			let unitInfo = this.__getUnitInfo(waitInfo["waiter"], waitlist[i]);
			if (unitInfo)
			{
				if (StatusPerk.__isStatusMatch(unitInfo["status"], waitlist[i]["status"]))
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
			if (typeof(waitlist[i]) === "string")
			{
				result += `\n\t{"${waitlist[i]}", status:ready},`;
			}
			else
			{
				let uniqueId = (waitlist[i].id ? `uniqueId:${waitlist[i].uniqueId}, ` : "");
				let id = (waitlist[i].id ? `id:${waitlist[i].id}, ` : "");
				let tagName = (waitlist[i].tagName ? `tagName:${waitlist[i].tagName}, ` : "");
				let object = (waitlist[i].object ? `object:${waitlist[i].object.tagName}, ` : "");
				let selector = (waitlist[i].selector ? `selector:${waitlist[i].selector}, ` : "");
				let status = (waitlist[i].status ? `status:${waitlist[i].status}` : "status:ready");
				result += `\n\t{${uniqueId}${id}${tagName}${object}${selector}${status}},`;
			}
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
