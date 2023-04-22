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
import Perk from "./perk.js";
import Util from "../util/util.js";

// =============================================================================
//	Setting Perk Class
// =============================================================================

export default class SettingPerk extends Perk
{

	// -------------------------------------------------------------------------
	//  Skills
	// -------------------------------------------------------------------------

	/**
	 * Load the settings file and merge to component's settings.
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
			component.settings.get("setting.fileName",
				component.tagName.toLowerCase()) + ".settings";

		// Path
		let path = Util.safeGet(loadOptions, "path",
			Util.concatPath([
				component.settings.get("system.appBaseUrl"),
				component.settings.get("system.componentPath"),
				component.settings.get("setting.path", ""),
			])
		);

		return AjaxUtil.loadJSON(Util.concatPath([path,fileName]), Object.assign({"type":"js", "bindTo":component}, loadOptions)).then((extraSettings) => {
			if (extraSettings)
			{
				component.settings.merge(extraSettings);
			}
		});

	}

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	static get info()
	{

		return {
			"section":		"setting",
			"order":		10,
		};

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static globalInit()
	{

		// Add properties to Component
		Object.defineProperty(BITSMIST.v1.Component.prototype, "settings", {
			get() { return this._settings; },
		});

		// Add skills to Component
		BITSMIST.v1.Component.skills.set("setting.summon", function(...args) { return SettingPerk._loadSettings(...args); });

	}

	// -------------------------------------------------------------------------

	static init(component, options)
	{

		// Defaults
		let defaults = {
			"setting": {
				"autoClear":			true,
				"autoFetch":			true,
				"autoFill":				true,
				"autoRefresh":			true,
				"autoRestart":			false,
				"autoSetup":			true,
				"autoStop":				true,
				"autoTransform":		true,
				"useGlobalSettings":	true,
			},
			"perk": {
	//			"BasicPerk":		{"setting":{"attach":true}},	// Attach manually
	//			"SettingPerk":		{"setting":{"attach":true}},	// Attach manually
				"PerkPerk":			{"setting":{"attach":true}},
				"StatePerk":		{"setting":{"attach":true}},
				"EventPerk":		{"setting":{"attach":true}},
				"SkinPerk":			{"setting":{"attach":true}},
				"ComponentPerk":	{"setting":{"attach":true}},
			}
		};

		let settings = (options && options["settings"]) || {};
		settings = Util.deepMerge(defaults, settings);
		settings = SettingPerk.__injectSettings(component, settings);
		settings = SettingPerk.__mergeSettings(component, settings);

		// Init component vars
		component._settings = new ChainableStore({"items":settings});

		// Chain global settings
		if (component._settings.get("setting.useGlobalSettings"))
		{
			component._settings.chain(BITSMIST.v1.settings);
		}

		return Promise.resolve().then(() => {
			// Load settings from an external file.
			if (SettingPerk.__hasExternalSettings(component, "setting"))
			{
				return SettingPerk.__loadExternalSettings(component, "setting");
			}
		}).then(() => {
			// Load settings from attributes
			SettingPerk.__loadAttrSettings(component);
		}).then(() => {
			return component.skills.use("perk.attachPerks", {"settings":component._settings.items});
		}).then(() => {
			return component.skills.use("event.trigger", "doOrganize", {"settings":component._settings.items});
		}).then(() => {
			return component.skills.use("event.trigger", "afterLoadSettings", {"settings":component._settings.items});
		});

	}

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
	 * Get settings from element's attribute.
	 *
	 * @param	{Component}		component			Component.
	 */
	static __loadAttrSettings(component)
	{

		// Get settings from the attribute

		let dataSettings = ( document.querySelector(component._settings.get("setting.rootNode")) ?
			document.querySelector(component._settings.get("setting.rootNode")).getAttribute("bm-setting") :
			component.getAttribute("bm-setting")
		);

		if (dataSettings)
		{
			let settings = {"setting": JSON.parse(dataSettings)};
			component._settings.merge(settings);
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Check if the component has the external settings file.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{String}		settingName			Setting name.
	 *
	 * @return  {Boolean}		True if the component has the external settings file.
	 */
	static __hasExternalSettings(component, settingName)
	{

		let ret = false;

		if (component.hasAttribute(`bm-${settingName}ref`) || component.settings.get("setting.settingRef"))
		{
			ret = true;
		}

		return ret;

	}

	// -------------------------------------------------------------------------

	/**
	 * Load the external settings file.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{String}		settingName			Setting name.
	 *
	 * @return  {Promise}		Promise.
	 */
	static __loadExternalSettings(component, settingName)
	{

		let fileName;
		let loadOptions;
		let settingRef = ( component.hasAttribute(`bm-${settingName}ref`) ?
			component.getAttribute(`bm-${settingName}ref`) || true :
			component.settings.get("setting.settingRef")
		);

		if (settingRef && settingRef !== true)
		{
			let url = Util.parseURL(settingRef);
			fileName = url.filenameWithoutExtension;
			loadOptions = {
				"path":			url.path,
				"query":		url.query,
			};
		}

		return SettingPerk._loadSettings(component, fileName, loadOptions);

	}

	// -------------------------------------------------------------------------

	/**
	 * Inject settings.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object}		settings			Settings.
	 *
	 * @return  {Object}		New settings.
	 */
	static __injectSettings(component, settings)
	{

		if (typeof(component._injectSettings) === "function")
		{
			settings = component._injectSettings(settings);
		}

		return settings;

	}

	// -------------------------------------------------------------------------

	/**
	 * Get component settings. Need to override.
	 *
	 * @param	{Component}		component			Component.
	 *
	 * @return  {Object}		Options.
	 */
	static _getSettings(component)
	{

		return {};

	}

	// -----------------------------------------------------------------------------
	//  Privates
	// -----------------------------------------------------------------------------

	/**
 	 * Inject settings.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object}		settings			Settings.
	 *
	 * @return  {Object}		New settings.
	 */
	static __mergeSettings(component, settings)
	{

		let curComponent = Object.getPrototypeOf(component);
		let curSettings = {};
		let parentSettings;

		// Merge superclass settings
		while (typeof(Object.getPrototypeOf(curComponent)._getSettings) === "function")
		{
			parentSettings = Object.getPrototypeOf(curComponent)._getSettings();
			if (Object.keys(parentSettings).length > 0)
			{
				Util.deepMerge(parentSettings, curSettings);
				curSettings = parentSettings;
			}

			curComponent= Object.getPrototypeOf(curComponent);
		}
		Util.deepMerge(settings, curSettings);

		// Merge component settings
		Util.deepMerge(settings, component._getSettings());

		return settings;

	}

}
