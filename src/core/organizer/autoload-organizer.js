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
			if (BITSMIST.v1.settings.get("system.autoLoadOnStartup", true))
			{
				let path = Util.concatPath([
					BITSMIST.v1.settings.get("system.appBaseUrl", ""),
					BITSMIST.v1.settings.get("system.componentPath", "")
				]);
				let splitComponent = BITSMIST.v1.settings.get("system.splitComponent", false);

				ComponentOrganizer.loadTags(document, path, {"splitComponent":splitComponent});
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

		let path = Util.concatPath([component.settings.get("system.appBaseUrl", ""), component.settings.get("system.componentPath", "")]);
		let splitComponent = component.settings.get("system.splitComponent", false);
		let target = component.getAttribute("bm-target");

		if (document.readyState !== "loading")
		{
			ComponentOrganizer.loadTags(document, path, {"splitComponent":splitComponent}, target);
		}
		else
		{
			document.addEventListener("DOMContentLoaded", () => {
				ComponentOrganizer.loadTags(document, path, {"splitComponent":splitComponent}, target);
			});
		}

		return settings;

	}

}
