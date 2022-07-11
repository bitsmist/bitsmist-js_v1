// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import AjaxUtil from "../util/ajax-util.js";
import ChainableStore from "../store/chainable-store.js";
import Organizer from "./organizer.js";
import Util from "../util/util.js";

// =============================================================================
//	Setting organizer class
// =============================================================================

export default class SettingOrganizer extends Organizer
{

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
	 * Global init.
	 */
	static globalInit(targetClass)
	{

		// Add properties
		Object.defineProperty(targetClass.prototype, "settings", {
			get() { return this._settings; },
		});

		// Init vars
		SettingOrganizer.__globalSettings = new ChainableStore();
		Object.defineProperty(SettingOrganizer, "globalSettings", {
			get() { return SettingOrganizer.__globalSettings; },
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Init.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object}		settings			Settings.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static init(component, settings)
	{

		// Init vars
		component._settings = new ChainableStore({"items":settings});
		component._settings.merge(component._getSettings());

		// Chain global settings
		if (component._settings.get("settings.useGlobalSettings"))
		{
			component._settings.chain(SettingOrganizer.globalSettings);
		}

		return Promise.resolve().then(() => {
			// Load settings from an external file.
			return SettingOrganizer._loadExternalSetting(component, "setting");
		}).then(() => {
			// Load settings from attributes
			SettingOrganizer._loadAttrSettings(component);
		});

	}

	// -------------------------------------------------------------------------
	//  Protected
	// -------------------------------------------------------------------------

	/**
	 * Load a setting file.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{String}		settingName			Setting name.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _loadExternalSetting(component, settingName)
	{

		let fileName;
		let loadOptions = {};

		if (component.hasAttribute("bm-" + settingName + "ref"))
		{
			let url = Util.parseURL(component.getAttribute("bm-" + settingName + "ref"));
			fileName = url.filenameWithoutExtension;
			loadOptions["path"] = url.path;
			loadOptions["query"] = url.query;
		}
		else
		{
			let path = ( component.hasAttribute("bm-" + settingName + "path") ? component.getAttribute("bm-" + settingName + "path") : "" );
			fileName = ( component.hasAttribute("bm-" + settingName + "name") ? component.getAttribute("bm-" + settingName + "name") : "" );
			if (path && !fileName)
			{
				fileName = "settings";
			}
			loadOptions["path"] = path;
		}

		if (fileName || loadOptions["path"])
		{
			return component.loadSetting(fileName, loadOptions);
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Get settings from element's attribute.
	 *
	 * @param	{Component}		component			Component.
	 */
	static _loadAttrSettings(component)
	{

		// Get settings from the attribute

		let dataSettings = ( document.querySelector(component._settings.get("settings.rootNode")) ?
			document.querySelector(component._settings.get("settings.rootNode")).getAttribute("bm-settings") :
			component.getAttribute("bm-settings")
		);

		if (dataSettings)
		{
			let settings = {"settings": JSON.parse(dataSettings)};
			component._settings.merge(settings);
		}

	}

}
