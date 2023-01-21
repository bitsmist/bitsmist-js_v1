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
	static globalInit()
	{

		// Add properties to Component
		Object.defineProperty(BITSMIST.v1.Component.prototype, "settings", {
			get() { return this._settings; },
		});

		// Add methods to Component
		BITSMIST.v1.Component.prototype.loadSettings = function(...args) { return SettingOrganizer._loadSettings(this, ...args); }

		// Init vars
		SettingOrganizer.__globalSettings = new ChainableStore();
		Object.defineProperty(SettingOrganizer, "globalSettings", {
			get() { return SettingOrganizer.__globalSettings; },
		});

	}

	// -------------------------------------------------------------------------

	static attach(component, options)
	{

		let settings = options;

		// Merge parent settings
		let curComponent = Object.getPrototypeOf(component);
		let curSettings = {};
		let parentSettings;
		while (typeof(Object.getPrototypeOf(curComponent)._getSettings) === "function")
		{
			parentSettings = Object.getPrototypeOf(curComponent)._getSettings();
			if (Object.keys(parentSettings).length > 0)
			{
				BITSMIST.v1.Util.deepMerge(parentSettings, curSettings);
				curSettings = parentSettings;
			}

			curComponent= Object.getPrototypeOf(curComponent);
		}
		BITSMIST.v1.Util.deepMerge(settings, curSettings);

		// Init vars
		component._settings = new ChainableStore({"items":settings});
		component._settings.merge(component._getSettings());

		// Chain global settings
		if (component._settings.get("settings.useGlobalSettings"))
		{
			component._settings.chain(BITSMIST.v1.settings);
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

	/**
	 * Load a settings file.
	 *
	 * @param	{String}		fileName			File name.
	 * @param	{String}		path				Path to the file.
	 * @param	{Object}		loadOptions			Load Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static loadFile(fileName, path, loadOptions)
	{

		let type = Util.safeGet(loadOptions, "type", "js");
		let query = Util.safeGet(loadOptions, "query");
		let url = Util.concatPath([path, fileName + "." + type]) + (query ? "?" + query : "");
		let settings;

		console.debug(`Loading settings file. fileName=${fileName}, path=${path}`);

		return AjaxUtil.ajaxRequest({url:url, method:"GET"}).then((xhr) => {
			console.debug(`Loaded settings. url=${url}`);

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
				let bindTo = Util.safeGet(loadOptions, "bindTo");
				settings = Function('"use strict";return (' + xhr.responseText + ')').call(bindTo);
				break;
			}

			return settings;
		});

	}

	// -------------------------------------------------------------------------
	//  Protected
	// -------------------------------------------------------------------------

	/**
	 * Load a settings file and merge to component's settings.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{String}		settingName			Setting name.
	 * @param	{Object}		loadOptions			Load options.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static _loadSettings(component, settingName, loadOptions)
	{

		let path;
		return Promise.resolve().then(() => {
			path = Util.safeGet(loadOptions, "path",
				Util.concatPath([
					component.settings.get("loadings.appBaseUrl", BITSMIST.v1.settings.get("system.appBaseUrl", "")),
					component.settings.get("loadings.componentPath", BITSMIST.v1.settings.get("system.componentPath", "")),
					component.settings.get("loadings.path", ""),
				])
			);

			return SettingOrganizer.loadFile(settingName, path, Object.assign({"type":"js", "bindTo":component}, loadOptions));
		}).then((extraSettings) => {
			if (extraSettings)
			{
				component.settings.merge(extraSettings);
			}
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Load an external setting file.
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
			return SettingOrganizer._loadSettings(component, fileName, loadOptions);
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
