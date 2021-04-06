// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import ComponentOrganizer from './component-organizer';
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

		return settings;

	}

	// -------------------------------------------------------------------------
	//  Event handlers
	// -------------------------------------------------------------------------

	/**
	* DOM content loaded event handler.
	*
	* @param	{Component}		component			Component.
	*/
	static onDOMContentLoaded(component)
	{

		let path = Util.concatPath([component.settings.get("system.appBaseUrl", ""), component.settings.get("system.componentPath", "")]);
		let splitComponent = component.settings.get("system.splitComponent", false);
		let target = component.getAttribute("data-target");

		ComponentOrganizer._loadTags(component, document, path, {"splitComponent":splitComponent}, target);

	}

}
