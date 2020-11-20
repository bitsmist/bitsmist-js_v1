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

		if (eventName == "*" || eventName == "afterAppend")
		{
			ret = true;
		}

		return ret;

	}

	// -------------------------------------------------------------------------

	/**
	 * Wait for components to be loaded.
	 *
	 * @param	{Array}			waitlist			Components to wait.
	 * @param	{integer}		timeout				Timeout in milliseconds.
	 *
	 * @return  {Array}			Promises.
	 */
	static waitFor(component, waitlist, timeout)
	{

		let promise;
		timeout = ( timeout ? timeout : 10000 );

		let waitInfo = {"waiter":component, "waitlist":waitlist, "status":"pending"};

		if (!waitlist || WaitforOrganizer.__isAllReady(waitInfo, "waitFor", ""))
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

			let id = new Date().getTime().toString(16) + Math.floor(100*Math.random()).toString(16);
			WaitforOrganizer.__waitingList.set(id, waitInfo);
		}

		return promise;

	}

	// -------------------------------------------------------------------------

	/**
	 * Wait for component to become an transitionable status.
	 *
	 * @param	{Object}		component			Component to register.
	 * @param	{String}		currentStatus		Current status.
	 * @param	{String}		newStatus			New status.
	 *
	 * @return  {Promise}		Promise.
	 */
	static waitForTransitionableStatus(component, currentStatus, newStatus)
	{

		if (newStatus == "opening")
		{
			return component.waitFor([{"id":component.uniqueId, "status":"connected"}]);
		}

		if (newStatus == "connecting")
		{
			return component.waitFor([{"id":component.uniqueId, "status":"instantiated"}]);
		}

		if (newStatus == "destroying")
		{
			return component.waitFor([{"id":component.uniqueId, "status":"instantiated"}]);
		}

	}

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
			throw Error(`Already in transition. name=${component.name}, fromStatus=${component.status}, toStatus=${status}`);
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
				( currentStatus == "destroying" && newStatus != "instantiated") ||
				( currentStatus == "connecting" && newStatus != "connected") ||
				( currentStatus == "opening" && (newStatus != "opened" && newStatus != "opening") ) ||
				( currentStatus == "closeing" && newStatus != "closed") ||
				( currentStatus == "disconnecting" && (newStatus != "instantiated" && newStatus != "closing") )
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

		Object.keys(WaitforOrganizer.__waitingList.items).forEach((id) => {
			if (WaitforOrganizer.__isAllReady(WaitforOrganizer.__waitingList.get(id), component.name, status))
			{
				WaitforOrganizer.__waitingList.get(id).resolve();
				WaitforOrganizer.__waitingList.remove(id);
			}
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Check if all components are ready.
	 *
	 * @param	{Array}			waitlist			Components to wait.
	 *
	 * @return  {Boolean}		True if ready.
	 */
	static __isAllReady(waitInfo, name, status)
	{

		let result = true;

		if (waitInfo.status == "done")
		{
			return;
		}

		let waitlist = waitInfo["waitlist"];
		for (let i = 0; i < waitlist.length; i++)
		{
			let match = false;
			let component = this.__getComponentInfo(waitlist[i]);
			if (component)
			{
				if (WaitforOrganizer.__isReady(waitlist[i], component))
				{
					match = true;
				}
			}

			// If one fail all fail
			if (!match)
			{
				result = false;
				break;
			}
		}

		if (result)
		{
			waitInfo.status = "done";
		}

		return result;

	}

	// -------------------------------------------------------------------------

	/**
	 * Get component info from wait info.
	 *
	 * @param	{Object}		waitInfo			Wait info.
	 *
	 * @return  {Boolean}		True if ready.
	 */
	static __getComponentInfo(waitInfo)
	{

		let componentInfo;

		if (waitInfo["id"])
		{
			componentInfo = BITSMIST.v1.Globals.components.get(waitInfo["id"]);
		}
		else if (waitInfo["name"])
		{
			Object.keys(BITSMIST.v1.Globals.components.items).forEach((key) => {
				if (waitInfo["name"] == BITSMIST.v1.Globals.components.get(key).object.name)
				{
					componentInfo = BITSMIST.v1.Globals.components.get(key);
				}
			});
		}
		else if (waitInfo["rootNode"])
		{
			let element = document.querySelector(waitInfo["rootNode"]);
			componentInfo = BITSMIST.v1.Globals.components.get(element.uniqueId);
		}

		return componentInfo;

	}

	// -------------------------------------------------------------------------

	/**
	 * Check if a component is ready.
	 *
	 * @param	{Object}		waitInfo			Wait info.
	 * @param	{Object}		componentInfo		Registered component info.
	 *
	 * @return  {Boolean}		True if ready.
	 */
	static __isReady(waitInfo, componentInfo)
	{

		let isMatch = true;
		waitInfo["status"] = waitInfo["status"] || "opened"; // Status defaults to "opened" when not specified.

		// check instance
		if (waitInfo["component"] && componentInfo["object"] !== waitInfo["component"])
		{
			isMatch = false;
		}

		// check name
		if (waitInfo["name"] && componentInfo["object"].name != waitInfo["name"])
		{
			isMatch = false;
		}

		// check id
		if (waitInfo["id"] && componentInfo["object"].uniqueId != waitInfo["id"])
		{
			isMatch = false;
		}

		// check status
		if (waitInfo["status"])
		{
			switch (waitInfo["status"])
			{
				case "instantiated":
					if (
						componentInfo["status"] != "instantiated" &&
						componentInfo["status"] != "connected" &&
						componentInfo["status"] != "opened" &&
						componentInfo["status"] != "closed"
					)
						isMatch = false;
					break;
				case "connected":
					if (
						componentInfo["status"] != "connected" &&
						componentInfo["status"] != "opening" &&
						componentInfo["status"] != "opened" &&
						componentInfo["status"] != "closed"
					)
						isMatch = false;
					break;
				default:
					if (componentInfo["status"] != waitInfo["status"])
					{
						isMatch = false;
					}
					break;
			}
		}

		// check status
		if (waitInfo["rootNode"])
		{
			let element = document.querySelector(waitInfo["rootNode"]);
			if (element)
			{
				if (waitInfo["status"] && element.status != waitInfo["status"])
				{
					isMatch = false;
				}
			}
			else
			{
				isMatch = false;
			}
		}

		return isMatch;

	}

}

// static properties
WaitforOrganizer.__waitingList = new Store();
