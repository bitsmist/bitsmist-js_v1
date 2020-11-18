// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

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
	 *
	 * @param	{Component}		component			Component.
	 */
	static clear(component)
	{

		this.__waitingList.splice(0);

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

		if (!waitlist || WaitforOrganizer.__isAllReady(waitlist))
		{
			promise = Promise.resolve();
		}
		else
		{
			let waitInfo = {"waitlist":waitlist};

			promise = new Promise((resolve, reject) => {
				waitInfo["resolve"] = resolve;
				waitInfo["reject"] = reject;
				setTimeout(() => {
					reject(`waitFor() timed out after ${timeout} milliseconds waiting for ${JSON.stringify(waitlist)}, name=${component.name}.`);
				}, timeout);
			});
			waitInfo["promise"] = promise;

			WaitforOrganizer.__waitingList.push(waitInfo);
		}

		return promise;

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

		return new Promise((resolve, reject) => {
			Promise.resolve().then(() => {
				return WaitforOrganizer.__waitStatus(component, component.status, status);
			}).then(() => {
				WaitforOrganizer.changeStatusSync(component, status);
				resolve();
			});
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Change component status and check waiting list synchronously.
	 *
	 * @param	{Component}		component			Component to register.
	 * @param	{String}		status				Component status.
	 *
	 * @return  {Promise}		Promise.
	 */
	static changeStatusSync(component, status)
	{

		component.status = status;
		BITSMIST.v1.Globals.components.mergeSet(component.uniqueId, {"object":component, "status":status});

		WaitforOrganizer.__processWaitingList();

	}

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
	 * Wait for component to become an status.
	 *
	 * @param	{Object}		component			Component to register.
	 * @param	{String}		currentStatus		Current status.
	 * @param	{String}		newStatus			New status.
	 *
	 * @return  {Promise}		Promise.
	 */
	static __waitStatus(component, currentStatus, newStatus)
	{

		if (newStatus == "opening")
		{
			return component.waitFor([{"id":component.uniqueId, "status":"connected"}]);
		}

		if (newStatus == "connecting")
		{
			return component.waitFor([{"id":component.uniqueId, "status":"instantiated"}]);
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Check wait list and resolve() if components are ready.
	 */
		static __processWaitingList()
	{

		for (let i = 0; i < WaitforOrganizer.__waitingList.length; i++)
		{
			if (WaitforOrganizer.__isAllReady(WaitforOrganizer.__waitingList[i]["waitlist"]))
			{
				WaitforOrganizer.__waitingList[i].resolve();
			}
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Check if all components are ready.
	 *
	 * @param	{Array}			waitlist			Components to wait.
	 *
	 * @return  {Boolean}		True if ready.
	 */
	static __isAllReady(waitlist)
	{

		let result = true;

		for (let i = 0; i < waitlist.length; i++)
		{
			let match = false;

			// Check through all registered components
			Object.keys(BITSMIST.v1.Globals.components.items).forEach((key) => {
				if (WaitforOrganizer.__isReady(waitlist[i], BITSMIST.v1.Globals.components.items[key]))
				{
					match = true;
				}
			});

			// If one fail all fail
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
		if (waitInfo["status"] && componentInfo["status"] != waitInfo["status"])
		{
			isMatch = false;
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
WaitforOrganizer.__waitingList = [];

