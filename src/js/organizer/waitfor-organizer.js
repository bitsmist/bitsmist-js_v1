// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import Store from '../store';

// =============================================================================
//	Waitfor organizer class
// =============================================================================

export default class WaitforOrganizer
{

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
	 * Organize.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object}		settings			Settings.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static organize(component, settings)
	{

		let promise = Promise.resolve();

		let waitFor = settings["waitFor"];
		if (waitFor)
		{
			promise = WaitforOrganizer.waitFor(component, waitFor);
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
	 * Check if event is target.
	 *
	 * @param	{String}		eventName			Event name.
	 *
	 * @return 	{Boolean}		True if it is target.
	 */
	static isTarget(eventName)
	{

		let ret = false;

		if (eventName == "*" || eventName == "afterAppend" || eventName == "afterSpecLoad")
		{
			ret = true;
		}

		return ret;

	}

	// -------------------------------------------------------------------------

	/**
	 * Wait for components to become specific statuses.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Array}			waitlist			Components to wait.
	 * @param	{integer}		timeout				Timeout in milliseconds.
	 *
	 * @return  {Promise}		Promise.
	 */
	static waitFor(component, waitlist, timeout)
	{

		let promise;
		timeout = ( timeout ? timeout : 10000 );

		let waitInfo = {"waiter":component, "waitlist":waitlist};

		if (WaitforOrganizer.__isAllReady(waitInfo))
		{
			promise = Promise.resolve();
		}
		else
		{
			promise = new Promise((resolve, reject) => {
				waitInfo["resolve"] = resolve;
				waitInfo["reject"] = reject;
				setTimeout(() => {
					reject(`waitFor() timed out after ${timeout} milliseconds waiting for ${JSON.stringify(waitlist)}, name=${component.name}.`);
				}, timeout);
			});
			waitInfo["promise"] = promise;

			WaitforOrganizer.__addToWaitingList(waitInfo, component, status);
		}

		return promise;

	}

	// -------------------------------------------------------------------------

	/**
	 * Wait for a component to become specific status.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{String}		status				Status.
	 * @param	{integer}		timeout				Timeout in milliseconds.
	 *
	 * @return  {Promise}		Promise.
	 */
	static waitForSingle(component, status, timeout)
	{

		let componentInfo = BITSMIST.v1.Globals.components.get(component.uniqueId);
		let waitlistItem = {"id":component.uniqueId, "status":status};

		if (WaitforOrganizer.__isReady(waitlistItem, componentInfo))
		{
			return Promise.resolve();
		}
		else
		{
			return WaitforOrganizer.waitFor(component, [waitlistItem], timeout);
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Wait for a component to become transitionable status.
	 *
	 * @param	{Object}		component			Component to register.
	 * @param	{String}		currentStatus		Current status.
	 * @param	{String}		newStatus			New status.
	 *
	 * @return  {Promise}		Promise.
	 */
	/*
	static waitForTransitionableStatus(component, currentStatus, newStatus)
	{

		if (newStatus == "starting")
		{
			return WaitforOrganizer.waitForSingle(component, "instantiated");
		}

		if (newStatus == "stopping")
		{
			return WaitforOrganizer.waitForSingle(component, "instantiated");
		}

		if (newStatus == "opening")
		{
			return WaitforOrganizer.waitForSingle(component, "started");
		}

		if (newStatus == "closing")
		{
			return WaitforOrganizer.waitForSingle(component, "opened");
		}

	}
	*/

	// -------------------------------------------------------------------------

	/**
	 * Change component status and check waiting list.
	 *
	 * @param	{Component}		component			Component to register.
	 * @param	{String}		status				Component status.
	 *
	 * @return  {Promise}		Promise.
	 */
	static changeStatus(component, status)
	{

		if (WaitforOrganizer.__isTransitionable(component.status, status))
		{
			component.status = status;
			BITSMIST.v1.Globals.components.mergeSet(component.uniqueId, {"object":component, "status":status});

			WaitforOrganizer.__processWaitingList(component, status);
		}
		else
		{
			throw Error(`Illegal transition. name=${component.name}, fromStatus=${component.status}, toStatus=${status}`);
		}

	}

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
	 * Check whether changing curren status to new status is allowed.
	 *
	 * @param	{String}		currentStatus		Current status.
	 * @param	{String}		newStatus			New status.
	 *
	 * @return  {Promise}		Promise.
	 */
	static __isTransitionable(currentStatus, newStatus)
	{

		let ret = true;

		if (currentStatus && currentStatus.slice(-3) == "ing")
		{
			if(
				( currentStatus == "" && newStatus != "instantiated") ||
				( currentStatus == "stopping" && newStatus != "stopped") ||
				( currentStatus == "starting" && newStatus != "started") ||
				( currentStatus == "opening" && (newStatus != "opened" && newStatus != "opening") ) ||
				( currentStatus == "closeing" && newStatus != "closed") ||
				( currentStatus == "stopping" && (newStatus != "stopped" && newStatus != "closing") ) ||
				( newStatus == "opening" && currentStatus != "connected" )
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
	static __processWaitingList(component, status)
	{

		// Process name index
		let names = WaitforOrganizer.__waitingListIndexName.get(component.name + "." + status);
		WaitforOrganizer.__processIndex(names);

		// Process ID index
		let ids = WaitforOrganizer.__waitingListIndexId.get(component.uniqueId + "." + status);
		WaitforOrganizer.__processIndex(ids);

		// Process non indexables
		WaitforOrganizer.__processIndex(WaitforOrganizer.__waitingListIndexNone);

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
					let waitInfo = WaitforOrganizer.__waitingList.get(id);

					if (WaitforOrganizer.__isAllReady(WaitforOrganizer.__waitingList.get(id)))
					{
						WaitforOrganizer.__waitingList.get(id).resolve();
						WaitforOrganizer.__waitingList.remove(id);

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
	 * @param	{String}		status				Status.
	 *
	 * @return  {Promise}		Promise.
	 */
	static __addToWaitingList(waitInfo, component, status)
	{

		// Add wait info to the waiting list.
		let id = new Date().getTime().toString(16) + Math.floor(100*Math.random()).toString(16);
		WaitforOrganizer.__waitingList.set(id, waitInfo);

		// Create index for faster processing
		let waitlist = waitInfo["waitlist"];
		for (let i = 0; i < waitlist.length; i++)
		{
			// Index for component id + status
			if (waitlist[i].id)
			{
				WaitforOrganizer.__addToIndex(WaitforOrganizer.__waitingListIndexId, waitlist[i].id+ "." + waitlist[i].status, id);
			}
			// Index for component name + status
			else if (waitlist[i].name)
			{
				WaitforOrganizer.__addToIndex(WaitforOrganizer.__waitingListIndexName, waitlist[i].name + "." + waitlist[i].status, id);
			}
			// Not indexable
			else
			{
				WaitforOrganizer.__waitingListIndexNone.push(id);
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
			componentInfo = BITSMIST.v1.Globals.components.get(waitlistItem["id"]);
		}
		else if (waitlistItem["name"])
		{
			Object.keys(BITSMIST.v1.Globals.components.items).forEach((key) => {
				if (waitlistItem["name"] == BITSMIST.v1.Globals.components.get(key).object.name)
				{
					componentInfo = BITSMIST.v1.Globals.components.get(key);
				}
			});
		}
		else if (waitlistItem["rootNode"])
		{
			let element = document.querySelector(waitlistItem["rootNode"]);
			if (element)
			{
				componentInfo = BITSMIST.v1.Globals.components.get(element.uniqueId);
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
				if (WaitforOrganizer.__isReady(waitlist[i], componentInfo))
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

		// Set defaults when not specified
		waitlistItem["status"] = waitlistItem["status"] || "opened";

		// Check component
		let isMatch = WaitforOrganizer.__isComponentMatch(componentInfo, waitlistItem);

		// Check status
		if (isMatch)
		{
			isMatch = WaitforOrganizer.__isStatusMatch(componentInfo["status"], waitlistItem["status"]);
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
	 * Check if status match.
	 *
	 * @param	{String}		currentStatus		Current status.
	 * @param	{String}		expectedStatus		Expected status.
	 *
	 * @return  {Boolean}		True if match.
	 */
	static __isStatusMatch(currentStatus, expectedStatus)
	{

		let isMatch = true;

		switch (expectedStatus)
		{
			case "instantiated":
				if (
					currentStatus != "instantiated" &&
					currentStatus != "connected" &&
					currentStatus != "opened" &&
					currentStatus != "closed"
				)
				{
					isMatch = false;
				}
				break;
			case "connected":
				if (
					currentStatus != "connected" &&
					currentStatus != "opening" &&
					currentStatus != "opened" &&
					currentStatus != "closed"
				)
				{
					isMatch = false;
				}
				break;
			default:
				if (currentStatus != expectedStatus)
				{
					isMatch = false;
				}
				break;
		}

		return isMatch;

	}

}

// static properties
WaitforOrganizer.__waitingList = new Store();
WaitforOrganizer.__waitingListIndexName = new Map();
WaitforOrganizer.__waitingListIndexId = new Map();
WaitforOrganizer.__waitingListIndexNone = [];
