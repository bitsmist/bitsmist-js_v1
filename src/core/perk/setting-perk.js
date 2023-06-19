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
	//  Properties
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

		// Upgrade Component
		this.upgrade(BITSMIST.v1.Component, "asset", "setting", new ChainableStore());
		BITSMIST.v1.Component.settings = BITSMIST.v1.Component._assets["setting"];

		// Upgrade Component
		this.upgrade(BITSMIST.v1.Component, "skill", "setting.summon", function(...args) { return SettingPerk._loadSettings(...args); });
		this.upgrade(BITSMIST.v1.Component, "skill", "setting.apply", function(...args) { return SettingPerk._applySettings(...args); });
		this.upgrade(BITSMIST.v1.Component, "skill", "setting.get", function(...args) { return SettingPerk._getSettings(...args); });
		this.upgrade(BITSMIST.v1.Component, "skill", "setting.set", function(...args) { return SettingPerk._setSettings(...args); });
		this.upgrade(BITSMIST.v1.Component, "skill", "setting.merge", function(...args) { return SettingPerk._mergeSettings(...args); });

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

		// Get settings
		let settings = (options && options["settings"]) || {};
		settings = Util.deepMerge(defaults, settings);
		settings = SettingPerk.__injectSettings(component, settings);
		settings = SettingPerk.__mergeSettings(component, settings);

		// Upgrade component
		this.upgrade(component, "asset", "setting", new ChainableStore({"items":settings, "chain":BITSMIST.v1.Component._assets["setting"]}));

		return Promise.resolve().then(() => {
			if (SettingPerk.__hasExternalSettings(component))
			{
				return SettingPerk._loadSettings(component);
			}
		}).then(() => {
			SettingPerk.__loadAttrSettings(component);
		}).then(() => {
			return SettingPerk._applySettings(component, {"settings":component._assets["setting"].items});
		});

	}

	// -------------------------------------------------------------------------
	//  Skills
	// -------------------------------------------------------------------------

	/**
	 * Apply settings.
	 *
     * @param	{Component}		component			Component.
	 * @param	{Object}		options				Options.
	 */
	static _applySettings(component, options)
	{

		return Promise.resolve().then(() => {
			return component.use("skill", "event.trigger", "beforeApplySettings", options);
		}).then(() => {
			return component.use("skill", "perk.attachPerks", options);
		}).then(() => {
			return component.use("skill", "event.trigger", "doApplySettings", options);
		}).then(() => {
			return component.use("skill", "event.trigger", "afterApplySettings", options);
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Load the settings file and merge to component's settings.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object}		options				Load options.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static _loadSettings(component, options)
	{

		return AjaxUtil.loadJSON(SettingPerk.__getSettingsURL(component), Object.assign({"bindTo":component}, options)).then((settings) => {
			if (settings)
			{
				component.use("skill", "setting.merge", settings);
			}
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Get settings.
	 *
     * @param	{Component}		component			Component.
	 * @param	{String}		key					Key.
	 * @param	{*}				defaultValue		Value returned when key is not found.
	 */
	static _getSettings(component, key, defaultValue)
	{

		return component.get("setting", key, defaultValue);

	}

	// -------------------------------------------------------------------------

	/**
	 * Set settings.
	 *
     * @param	{Component}		component			Component.
	 * @param	{String}		key					Key.
	 * @param	{*}				value				Value.
	 */
	static _setSettings(component, key, value)
	{

		return component.set("setting", key, value);

	}

	// -------------------------------------------------------------------------

	/**
	 * Set settings.
	 *
     * @param	{Component}		component			Component.
	 * @param	{String}		key					Key.
	 * @param	{*}				value				Value.
	 */
	static _mergeSettings(component, key, value)
	{

		return component._assets["setting"].merge(key, value);

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

		if (component.hasAttribute("bm-settingref"))
		{
			component.set("setting", "setting.options.settingRef", component.getAttribute("bm-settingref") || true);
		}

		if (component.hasAttribute("bm-setting"))
		{
			let settings = {"setting": JSON.parse(component.getAttribute("bm-setting"))};
			component.use("skill", "setting.merge", settings);
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Check if the component has the external settings file.
	 *
	 * @param	{Component}		component			Component.
	 *
	 * @return  {Boolean}		True if the component has the external settings file.
	 */
	static __hasExternalSettings(component)
	{

		let ret = false;

		if (component.get("setting", "setting.settingRef"))
		{
			ret = true;
		}

		return ret;

	}

	// -------------------------------------------------------------------------

	/**
	 * Return URL to setting file.
	 *
	 * @param	{Component}		component			Component.
	 *
	 * @return  {String}		URL.
	 */
	static __getSettingsURL(component)
	{

		let path;
		let fileName;
		let query;

		let settingRef = ( component.hasAttribute(`bm-settingref`) ?
			component.getAttribute(`bm-settingref`) || true :
			component.get("setting", "setting.settingRef")
		);
		if (settingRef && settingRef !== true)
		{
			// If URL is specified in ref, use it
			let url = Util.parseURL(settingRef);
			path = url.path;
			fileName = url.filename;
			query = url.query;
		}
		else
		{
			// Use default path and filename
			path = Util.concatPath([
					component.get("setting", "system.appBaseURL"),
					component.get("setting", "system.componentPath"),
					component.get("setting", "setting.path", ""),
				]);
			let ext = component.get("setting", "setting.settingFormat", component.get("setting", "system.settingFormat", "json"));
			fileName = component.get("setting", "setting.fileName", component.tagName.toLowerCase()) + ".settings." + ext;
			query = component.get("setting", "setting.query");
		}

		return Util.concatPath([path, fileName]) + (query ? `?${query}` : "");

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
			settings = component._injectSettings.call(component, settings);
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
			parentSettings = Object.getPrototypeOf(curComponent)._getSettings.call(component);
			if (Object.keys(parentSettings).length > 0)
			{
				Util.deepMerge(parentSettings, curSettings);
				curSettings = parentSettings;
			}

			curComponent= Object.getPrototypeOf(curComponent);
		}
		Util.deepMerge(settings, curSettings);

		// Merge component settings
		Util.deepMerge(settings, component._getSettings.call(component));

		return settings;

	}

}
