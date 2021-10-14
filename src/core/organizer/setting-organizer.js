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
			// Load external settings
			return SettingOrganizer.__loadExternalSettings(component, "setting");
		}).then((extraSettings) => {
			if (extraSettings)
			{
				component._settings.merge(extraSettings);
			}

			// Load settings from attributes
			SettingOrganizer.__loadAttrSettings(component);
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Load setting file.
	 *
	 * @param	{String}		settingName			Setting name.
	 * @param	{String}		path				Path to setting file.
	 * @param	{String}		path				Type of setting file.
	 *
	 * @return  {Promise}		Promise.
	 */
	static loadSetting(component, settingName, path, type)
	{

		type = type || "js";
		let url = Util.concatPath([path, settingName + "." + type]);
		let settings;

		console.debug(`SettingOrganizer.loadSetting(): Loading settings. name=${component.name}, url=${url}`);

		return AjaxUtil.ajaxRequest({url:url, method:"GET"}).then((xhr) => {
			console.debug(`SettingOrganizer.loadSetting(): Loaded settings. name=${component.name}, url=${url}`);

			switch (type)
			{
			case "json":
				try
				{
					settings = JSON.parse(xhr.responseText);
				}
				catch(e)
				{
					if (e instanceof SyntaxError)
					{
						throw new SyntaxError(`Illegal json string. url=${url}, message=${e.message}`);
					}
					else
					{
						throw e;
					}
				}
				break;
			case "js":
			default:
				settings = Function('"use strict";return (' + xhr.responseText + ')').call(component);
				break;
			}

			return settings;
		});

	}

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
	 * Load an external setting file.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{String}		settingName			Setting name.
	 *
	 * @return  {Promise}		Promise.
	 */
	static __loadExternalSettings(component, settingName)
	{

		let name, path;

		if (component.hasAttribute("bm-" + settingName + "ref"))
		{
			let arr = Util.getFilenameAndPathFromUrl(component.getAttribute("bm-" + settingName + "ref"));
			path = arr[0];
			name = arr[1].slice(0, -3);
		}
		else
		{
			path = ( component.hasAttribute("bm-" + settingName + "path") ? component.getAttribute("bm-" + settingName + "path") : "" );
			name = ( component.hasAttribute("bm-" + settingName + "name") ? component.getAttribute("bm-" + settingName + "name") : "" );
			if (path && !name)
			{
				name = "settings";
			}
		}

		if (name || path)
		{
			return SettingOrganizer.loadSetting(component, name, path);
		}

	}

	// -----------------------------------------------------------------------------

	/**
	 * Get settings from element's attribute.
	 *
	 * @param	{Component}		component			Component.
	 */
	static __loadAttrSettings(component)
	{

		// Get path from  bm-autoload
		if (component.getAttribute("bm-autoload"))
		{
			let arr = Util.getFilenameAndPathFromUrl(component.getAttribute("bm-autoload"));
			component._settings.set("system.appBaseUrl", "");
			component._settings.set("system.templatePath", arr[0]);
			component._settings.set("system.componentPath", arr[0]);
			component._settings.set("settings.path", "");
			if (arr[1].slice(-3).toLowerCase() === ".js")
			{
				component._settings.set("settings.fileName", arr[1].substring(0, arr[1].length - 3));
			}
			else if (arr[1].slice(-5).toLowerCase() === ".html")
			{
				component._settings.set("settings.fileName", arr[1].substring(0, arr[1].length - 5));
			}
		}

		// Get path from attribute
		if (component.hasAttribute("bm-path"))
		{
			component._settings.set("settings.path", component.getAttribute("bm-path"));
		}

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
