// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import ComponentOrganizer from "./component-organizer.js";
import Organizer from "./organizer.js";
import Util from "../util/util.js";

// =============================================================================
//	Autoload organizer class
// =============================================================================

export default class AutoloadOrganizer extends Organizer
{

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
	 * Global init.
	 */
	static globalInit()
	{

		document.addEventListener("DOMContentLoaded", () => {
			if (BITSMIST.v1.settings.get("organizers.AutoloadOrganizer.settings.autoLoadOnStartup", true))
			{
				this.load(document.body, BITSMIST.v1.settings)
			}
		});

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

		return AutoloadOrganizer.load(component.rootElement, component.settings);

	}

	// -------------------------------------------------------------------------

	/**
	* Load all tags.
	*/
	static load(rootNode, settings)
	{

		let path = Util.concatPath([settings.get("system.appBaseUrl", ""), settings.get("system.componentPath", "")]);
		let splitComponent = settings.get("system.splitComponent", false);

		return ComponentOrganizer.loadTags(rootNode, path, {"splitComponent":splitComponent});

	}

}
