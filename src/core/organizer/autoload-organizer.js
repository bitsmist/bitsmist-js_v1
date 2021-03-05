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
import Organizer from './organizer';
import Util from '../util/util';

// =============================================================================
//	Autoload organizer class
// =============================================================================

export default class AutoloadOrganizer extends Organizer
{

	// -------------------------------------------------------------------------
	//  Methods
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

		if (document.readyState !== 'loading')
		{
			AutoloadOrganizer.onDOMContentLoaded.call(component, component);
		}
		else
		{
			document.addEventListener('DOMContentLoaded', () => {
				AutoloadOrganizer.onDOMContentLoaded.call(component, component)
			});
		}

	}

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

		let path = Util.concatPath([component.settings.get("system.appBaseUrl", ""), component.settings.get("system.componentPath", "")]);
		let splitComponent = component.settings.get("system.splitComponent", false);
		let target = component.getAttribute("data-target");

		component.loadTags(document, path, {"splitComponent":splitComponent}, target);

	}

}
