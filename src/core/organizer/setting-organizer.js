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
	//  Setter/Getter
	// -------------------------------------------------------------------------

	static get name()
	{

		return "SettingOrganizer";

	}

	// -------------------------------------------------------------------------
	//  Event Handlers
	// -------------------------------------------------------------------------

	static SettingOrganizer_onDoOrganize(sender, e, ex)
	{

		this._name = Util.safeGet(e.detail.settings, "settings.name", this._name);
		this._rootElement = Util.safeGet(e.detail.settings, "settings.rootElement", this._rootElement);

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static getInfo()
	{

		return {
			"sections":		"settings",
			"order":		10,
		};

	}

	// -------------------------------------------------------------------------

	static globalInit()
	{

		// Add properties to Component
		Object.defineProperty(BITSMIST.v1.Component.prototype, "settings", {
			get() { return this._settings; },
		});

		// Add methods to Component
		BITSMIST.v1.Component.prototype.loadSettings = function(...args) { return SettingOrganizer._loadSettings(this, ...args); }
		BITSMIST.v1.Component.prototype._enumSettings = function(...args) { return SettingOrganizer._enumSettings(...args); }

	}

	// -------------------------------------------------------------------------

	static init(component, options)
	{

		let settings = options["settings"] || {};

		// Init vars
		component._settings = new ChainableStore({"items":settings});

		// Add event handlers to component
		this._addOrganizerHandler(component, "doOrganize", SettingOrganizer.SettingOrganizer_onDoOrganize);

		// Chain global settings
		if (component._settings.get("settings.useGlobalSettings"))
		{
			component._settings.chain(BITSMIST.v1.settings);
		}

		return Promise.resolve().then(() => {
			// Load settings from an external file.
			if (SettingOrganizer._hasExternalSettings(component, "setting"))
			{
				return SettingOrganizer._loadExternalSettings(component, "setting");
			}
		}).then(() => {
			// Load settings from attributes
			SettingOrganizer._loadAttrSettings(component);
		}).then(() => {
			return component.attachOrganizers({"settings":component._settings.items});
		}).then(() => {
			return component.trigger("doOrganize", {"settings":component._settings.items});
		}).then(() => {
			return component.trigger("afterLoadSettings", {"settings":component._settings.items});
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

		console.debug(`SettingOrganizer.loadFile(): Loading settings file. fileName=${fileName}, path=${path}`);

		return AjaxUtil.ajaxRequest({url:url, method:"GET"}).then((xhr) => {
			console.debug(`SettingOrganizer.loadFile(): Loaded settings. url=${url}`);

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
	 * @param	{String}		fileName			File name. Use "" to use default name.
	 * @param	{Object}		loadOptions			Load options.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static _loadSettings(component, fileName, loadOptions)
	{

		// Filename
		fileName = fileName ||
			component.settings.get("settings.fileName",
				component.tagName.toLowerCase()) + ".settings";

		// Path
		let path = Util.safeGet(loadOptions, "path",
			Util.concatPath([
				component.settings.get("system.appBaseUrl"),
				component.settings.get("system.componentPath"),
				component.settings.get("settings.path", ""),
			])
		);

		return SettingOrganizer.loadFile(fileName, path, Object.assign({"type":"js", "bindTo":component}, loadOptions)).then((extraSettings) => {
			if (extraSettings)
			{
				component.settings.merge(extraSettings);
			}
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Check if the component has an external settings file.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{String}		settingName			Setting name.
	 *
	 * @return  {Boolean}		True if the component has an external settings file.
	 */
	static _hasExternalSettings(component, settingName)
	{

		let ret = false;

		if (component.hasAttribute(`bm-${settingName}ref`) || component.settings.get("settings.settingRef"))
		{
			ret = true;
		}

		return ret;

	}

	// -------------------------------------------------------------------------

	/**
	 * Load an external settings file.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{String}		settingName			Setting name.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _loadExternalSettings(component, settingName)
	{

		settingName = settingName || "setting";
		let settingRef = ( component.hasAttribute(`bm-${settingName}ref`) ?
			component.getAttribute(`bm-${settingName}ref`) || true :
			component.settings.get("settings.settingRef")
		);

		let fileName;
		let loadOptions;
		if (settingRef !== true)
		{
			let url = Util.parseURL(settingRef);
			fileName = url.filenameWithoutExtension;
			loadOptions = {
				"path":			url.path,
				"query":		url.query,
			};
		}

		return SettingOrganizer._loadSettings(component, fileName, loadOptions);

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

	// -------------------------------------------------------------------------

	/**
	 * Enumerate enumerable settings.
	 *
	 * @param	{Settings}		setting				Settings.
	 * @param	{Function}		callback			Callback function.
	 */
	static _enumSettings(settings, callback)
	{

		Util.assert(typeof(callback) === "function", "not function");

		if (settings)
		{
			Object.keys(settings).forEach((key) => {
				if (key !== "settings")
				{
					callback(key, settings[key]);
				}
			});
		}

	}

}
