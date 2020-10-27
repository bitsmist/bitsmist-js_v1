// =============================================================================
/**
 * Bitsmist WebView - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import Globals from "../globals";

// =============================================================================
//	Waitfor mixin class
// =============================================================================

export default class WaitforMixin
{

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
	 * Wait for components to be loaded.
	 *
	 * @param	{Array}			waitlist			Components to wait.
	 * @param	{integer}		timeout				Timeout in milliseconds.
	 *
	 * @return  {Array}			Promises.
	 */
	static waitFor(waitlist, timeout)
	{

		let promise;
		timeout = ( timeout ? timeout : 10000 );

		if (!waitlist || this.__isAllReady(waitlist))
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
					let debugInfo = "";
					for (let i = 0; i < waitlist.length; i++)
					{
						debugInfo += (waitlist[i]["rootNode"] ? waitlist[i]["rootNode"] : "");
						debugInfo += (waitlist[i]["name"] ? waitlist[i]["name"] : "");
						debugInfo += (waitlist[i]["id"] ? waitlist[i]["id"] : "");
						debugInfo += (waitlist[i]["component"] ? waitlist[i]["component"]["name"] : "");
						debugInfo += (waitlist[i]["status"] ? "(" + waitlist[i]["status"] + ")" : "");
						debugInfo += ",";
					}
					debugInfo = debugInfo.slice(0, -1);
					reject(`waitFor() timed out after ${timeout} milliseconds waiting for ${debugInfo}, name=${this.name}.`);
				}, timeout);
			});
			waitInfo["promise"] = promise;

			this.__waitingList.push(waitInfo);
		}

		return promise;

	}

	// -------------------------------------------------------------------------

	/**
	 * Clear waiting list.
	 *
	 */
	static clearWaitingList()
	{

		this.__waitingList.splice(0);

	}

	// -------------------------------------------------------------------------

	/**
	 * Register component to list.
	 *
	 * @param	{Object}		component			Component to register.
	 * @param	{String}		status				Component status.
	 */
	static registerComponent(component, status)
	{

		if (Globals["components"][component.uniqueId])
		{
			Globals["components"][component.uniqueId]["status"] = status;
		}
		else
		{
			Globals["components"][component.uniqueId] = {"component":component, "status": status};
		}

		for (let i = 0; i < this.__waitingList.length; i++)
		{
			if (this.__isAllReady(this.__waitingList[i]["waitlist"]))
			{
				this.__waitingList[i].resolve();
			}
		}

		component.status = status;

	}

	// -------------------------------------------------------------------------
	//  Privates
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
			Object.keys(Globals["components"]).forEach((key) => {
				if (this.__isReady(waitlist[i], Globals["components"][key]))
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
	/*
	static __isReady(waitInfo, componentInfo)
	{

		let isMatch = false;

		// check instance
		if (waitInfo["component"])
		{
			isMatch = ( componentInfo["component"] === waitInfo["component"] ? true : false );
		}

		// check name
		if (waitInfo["name"])
		{
			isMatch = ( componentInfo["component"].name === waitInfo["name"] ? true : false );
		}

		// check id
		if (waitInfo["id"])
		{
			console.log("@@@");
			isMatch = ( componentInfo["component"].uniqueId === waitInfo["id"] ? true : false );
			console.log(isMatch);
		}

		// check status
		if (waitInfo["status"])
		{
			isMatch = ( componentInfo["status"] === waitInfo["status"] ? true : false );
		}

		return isMatch;

	}
	*/

	static __isReady(waitInfo, componentInfo)
	{

		let isMatch = true;
		waitInfo["status"] = waitInfo["status"] || "opened"; // Status defaults to "opened" when not specified.

		// check instance
		if (waitInfo["component"] && componentInfo["component"] !== waitInfo["component"])
		{
			isMatch = false;
		}

		// check name
		if (waitInfo["name"] && componentInfo["component"].name != waitInfo["name"])
		{
			isMatch = false;
		}

		// check id
		if (waitInfo["id"] && componentInfo["component"].uniqueId != waitInfo["id"])
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

//		console.log("@@@", isMatch, waitInfo, componentInfo);

		return isMatch;

	}

}

// -----------------------------------------------------------------------------

// static properties
WaitforMixin.__waitingList = [];
