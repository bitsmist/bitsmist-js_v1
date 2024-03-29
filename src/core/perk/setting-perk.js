// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/main/LICENSE
 */
// =============================================================================

import AjaxUtil from "../util/ajax-util.js";
import ChainableStore from "../store/chainable-store.js";
import Perk from "./perk.js";
import URLUtil from "../util/url-util.js";
import Unit from "../unit/unit.js";
import Util from "../util/util.js";

// =============================================================================
//	Setting Perk Class
// =============================================================================

export default class SettingPerk extends Perk
{

	// -------------------------------------------------------------------------
	//  Private Variables
	// -------------------------------------------------------------------------

	static #__ready;
	static #__ready_resolve;
	static #__info = {
		"sectionName":		"setting",
		"order":			10,
	};

	// -------------------------------------------------------------------------
	//  Properties
	// -------------------------------------------------------------------------

	static get info()
	{

		return SettingPerk.#__info;

	}

	// -------------------------------------------------------------------------

	static get ready()
	{

		return SettingPerk.#__ready;

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static globalInit()
	{

		// Init Vars
		SettingPerk.#__ready = new Promise((resolve, reject) => {
			SettingPerk.#__ready_resolve = resolve;
		});

		// Upgrade Unit
		Unit.upgrade("asset", "setting", new ChainableStore());
		Unit.upgrade("skill", "setting.get", SettingPerk.#_getSettings);
		Unit.upgrade("skill", "setting.set", SettingPerk.#_setSettings);
		Unit.upgrade("skill", "setting.merge", SettingPerk.#_mergeSettings);
		Unit.upgrade("spell", "setting.summon", SettingPerk.#_loadSettings);
		Unit.upgrade("spell", "setting.apply", SettingPerk.#_applySettings);

		return Perk.getPerk("BasicPerk").ready.then(() => {
			if (SettingPerk.#__ready_resolve)
			{
				SettingPerk.#__ready_resolve();
				SettingPerk.#__ready_resolve = null;
			}
		});

	}

	// -------------------------------------------------------------------------

	static async init(unit, options)
	{

		// Get settings
		let settings = (options && options["settings"]) || {};
		settings = SettingPerk.#__injectSettings(unit, settings);
		settings = SettingPerk.#__mergeSettings(unit, settings);

		await SettingPerk.ready;

		// Upgrade unit
		unit.upgrade("asset", "setting", new ChainableStore({"items":settings, "chain":Unit.assets["setting"]}));

		SettingPerk.#__loadAttrSettings(unit);
		if (SettingPerk.#__hasExternalSettings(unit))
		{
			await SettingPerk.#_loadSettings(unit);
		}
		SettingPerk.#__loadAttrSettings(unit); // Do it again to overwrite since attribute settings have higher priority

	}

	// -------------------------------------------------------------------------
	//  Skills (Unit)
	// -------------------------------------------------------------------------

	/**
	 * Get settings.
	 *
     * @param	{Unit}			unit				Unit.
	 * @param	{String}		key					Key.
	 * @param	{*}				defaultValue		Value returned when key is not found.
	 */
	static #_getSettings(unit, key, defaultValue)
	{

		return unit.get("setting", key, defaultValue);

	}

	// -------------------------------------------------------------------------

	/**
	 * Set settings.
	 *
     * @param	{Unit}			unit				Unit.
	 * @param	{String}		key					Key.
	 * @param	{*}				value				Value.
	 */
	static #_setSettings(unit, key, value)
	{

		return unit.set("setting", key, value);

	}

	// -------------------------------------------------------------------------

	/**
	 * Set settings.
	 *
     * @param	{Unit}			unit				Unit.
	 * @param	{String}		key					Key.
	 * @param	{*}				value				Value.
	 */
	static #_mergeSettings(unit, key, value)
	{

		unit.assets["setting"].merge(key, value);

	}

	// -------------------------------------------------------------------------
	//  Spells (Unit)
	// -------------------------------------------------------------------------

	/**
	 * Apply settings.
	 *
     * @param	{Unit}			unit				Unit.
	 * @param	{Object}		options				Options.
	 */
	static async #_applySettings(unit, options)
	{

		await unit.cast("event.trigger", "beforeApplySettings", options);
		await unit.cast("perk.attachPerks", options);
		await unit.cast("event.trigger", "doApplySettings", options);
		await unit.cast("event.trigger", "afterApplySettings", options);

	}

	// -------------------------------------------------------------------------

	/**
	 * Load the settings file and merge to unit's settings.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{Object}		options				Load options.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static async #_loadSettings(unit, options)
	{

		let settings = await AjaxUtil.loadJSON(SettingPerk.#__getSettingsURL(unit), Object.assign({"bindTo":unit}, options));
		if (settings)
		{
			unit.use("setting.merge", settings);
		}

	}

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
	 * Get settings from element's attribute.
	 *
	 * @param	{Unit}			unit				Unit.
	 */
	static #__loadAttrSettings(unit)
	{

		if (unit.hasAttribute("bm-settingsref"))
		{
			let settingsRef = unit.getAttribute("bm-settingsref") || true;
			if (settingsRef === "false")
			{
				settingsRef = false;
			}
			unit.set("setting", "setting.options.settingsRef", settingsRef);
		}

		if (unit.hasAttribute("bm-options"))
		{
			let options = {"options": JSON.parse(unit.getAttribute("bm-options"))};
			unit.use("setting.merge", options);
		}

		// Path
		if (unit.hasAttribute("bm-path"))
		{
			unit.set("setting", "setting.options.path", unit.getAttribute("bm-path"));
		}

		// File name
		if (unit.hasAttribute("bm-filename"))
		{
			unit.set("setting", "setting.options.fileName", unit.getAttribute("bm-filename"));
		}

		// Auto loading
		if (unit.hasAttribute("bm-autoload"))
		{
			let autoLoad = unit.getAttribute("bm-autoload");
			if (autoLoad)
			{
				let url = URLUtil.parseURL(autoLoad);
				unit.set("setting", "setting.options.path", url.path);
				unit.set("setting", "setting.options.fileName", url.filenameWithoutExtension);
			}
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Check if the unit has the external settings file.
	 *
	 * @param	{Unit}			unit				Unit.
	 *
	 * @return  {Boolean}		True if the unit has the external settings file.
	 */
	static #__hasExternalSettings(unit)
	{

		let ret = false;

		if (unit.get("setting", "setting.options.settingsRef", unit.get("setting", "system.setting.options.settingsRef")))
		{
			ret = true;
		}

		return ret;

	}

	// -------------------------------------------------------------------------

	/**
	 * Return URL to setting file.
	 *
	 * @param	{Unit}			unit				Unit.
	 *
	 * @return  {String}		URL.
	 */
	static #__getSettingsURL(unit)
	{

		let url;
		let settingsRef = unit.get("setting", "setting.options.settingsRef");

		if (settingsRef && settingsRef !== true)
		{
			// If URL is specified in ref, use it
			url = settingsRef;
		}
		else
		{
			// Use default path and filename
			let path = Util.concatPath([
					unit.get("setting", "system.setting.options.path", unit.get("setting", "system.unit.options.path", "")),
					unit.get("setting", "setting.options.path", unit.get("setting", "unit.options.path", "")),
				]);
			let ext = unit.get("setting", "setting.options.settingFormat",
						unit.get("setting", "system.setting.options.settingFormat", "json"));
			let fileName = unit.get("setting", "setting.options.fileName",
							unit.get("setting", "unit.options.fileName",
								unit.tagName.toLowerCase())) + ".settings." + ext;
			let query = unit.get("setting", "unit.options.query");

			url = Util.concatPath([path, fileName]) + (query ? `?${query}` : "");
		}

		return url;

	}

	// -------------------------------------------------------------------------

	/**
	 * Inject settings.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{Object}		settings			Settings.
	 *
	 * @return  {Object}		New settings.
	 */
	static #__injectSettings(unit, settings)
	{

		if (typeof(unit._injectSettings) === "function")
		{
			settings = unit._injectSettings.call(unit, settings);
		}

		return settings;

	}

	// -----------------------------------------------------------------------------

	/**
 	 * Inject settings.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{Object}		settings			Settings.
	 *
	 * @return  {Object}		New settings.
	 */
	static #__mergeSettings(unit, settings)
	{

		let curUnit = Object.getPrototypeOf(unit);
		let curSettings = {};
		let parentSettings;

		// Merge superclass settings
		while (typeof(Object.getPrototypeOf(curUnit)._getSettings) === "function")
		{
			parentSettings = Object.getPrototypeOf(curUnit)._getSettings.call(unit);
			if (Object.keys(parentSettings).length > 0)
			{
				Util.deepMerge(parentSettings, curSettings);
				curSettings = parentSettings;
			}

			curUnit= Object.getPrototypeOf(curUnit);
		}
		Util.deepMerge(settings, curSettings);

		// Merge unit settings
		if (typeof(unit._getSettings) === "function")
		{
			Util.deepMerge(settings, unit._getSettings.call(unit));
		}

		return settings;

	}

}
