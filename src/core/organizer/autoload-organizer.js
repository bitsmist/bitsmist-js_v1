// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import ClassUtil from '../util/class-util';
import Component from '../component';
import Util from '../util/util';

// =============================================================================
//	Autoload organizer class
// =============================================================================

export default class AutoloadOrganizer
{

	// -------------------------------------------------------------------------
	//  Event handlers
	// -------------------------------------------------------------------------

	/**
	* DOM content loaded event handler.
	*
	* @param	{Object}		sender				Sender.
	* @param	{Object}		e					Event info.
	*
	* @return  {Promise}		Promise.
	*/
	static onDOMContentLoaded(component)
	{

		console.debug(`AutoloadOrganizer.onDOMContentLoaded(): Auto loading started. name=${component.name}`);

		let path = Util.concatPath([component._settings.get("system.appBaseUrl", ""), component._settings.get("system.componentPath", "")]);
		let splitComponent = component._settings.get("system.splitComponent", false);

		component.loadTags(document, path, {"splitComponent":splitComponent});

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
	 * Init.
	 *
	 * @param	{Object}		conditions			Conditions.
	 * @param	{Component}		component			Component.
	 * @param	{Object}		settings			Settings.
	 */
	static init(conditions, component, settings)
	{

		if (document.readyState !== 'loading')
		{
			AutoloadOrganizer.onDOMContentLoaded.call(component, component);
		}
		else
		{
			window.addEventListener('DOMContentLoaded', AutoloadOrganizer.onDOMContentLoaded.call(component, component));
		}

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
	}

	// -------------------------------------------------------------------------

	/**
	 * Check if event is target.
	 *
	 * @param	{String}		eventName			Event name.
	 *
	 * @return 	{Boolean}		True if it is target.
	 */
	static isTarget(eventName, observerInfo, ...args)
	{

		let ret = false;

		if (eventName == "*" || eventName == "beforeStart" || eventName == "afterSpecLoad")
		{
			ret = true;
		}

		return ret;

	}

}
