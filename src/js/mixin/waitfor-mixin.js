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

		if (!waitlist || this.__isLoadedComponents(waitlist))
		{
			promise = Promise.resolve();
		}
		else
		{
			let waitInfo = {};
			waitInfo["waitlist"] = waitlist;

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
	 * Register component to loaded list.
	 */
	static registerComponent(component)
	{

		Globals["components"].push(component);

		for (let i = 0; i < this.__waitingList.length; i++)
		{
			if (this.__isLoadedComponents(this.__waitingList[i]["waitlist"]))
			{
				this.__waitingList[i].resolve();
			}
		}

	}

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
	 * Check if components are loaded.
	 *
	 * @param	{Array}			waitlist			Components to wait.
	 *
	 * @return  {Array}			Promises.
	 */
	static __isLoadedComponents(waitlist)
	{

		let result = true;

		for (let i = 0; i < waitlist.length; i++)
		{
			let match = false;

			for (let j = 0; j < Globals["components"].length; j++)
			{
				if (Globals["components"][j].name == waitlist[i]["componentName"])
				{
					match = true;
					break;
				}
			}

			if (!match)
			{
				result = false;
				break;
			}
		}

		return result;

	}

}

// -----------------------------------------------------------------------------

// static properties
WaitforMixin.__waitingList = [];
