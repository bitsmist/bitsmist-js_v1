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
	 *
	 * @return  {Array}			Promises.
	 */
	static waitFor(waitlist)
	{

		let promise;

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
			});
			waitInfo["promise"] = promise;

			this.__waitingList.push(waitInfo);
		}

		return promise;

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
	static __isReady(waitInfo, componentInfo)
	{

		let isMatch = true;

		// check name
		if (waitInfo["componentName"] && componentInfo["component"].name != waitInfo["componentName"])
		{
			isMatch = false;
		}

		// check id
		if (waitInfo["componentId"] && componentInfo["component"].id != waitInfo["componentId"])
		{
			isMatch = false;
		}

		// check status
		if (waitInfo["componentStatus"] && componentInfo["status"] != waitInfo["componentStatus"])
		{
			isMatch = false;
		}

		return isMatch;

	}

}

// -----------------------------------------------------------------------------

// static properties
WaitforMixin.__waitingList = [];
