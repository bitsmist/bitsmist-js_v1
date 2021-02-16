// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import AjaxUtil from '../util/ajax-util';
import Component from '../component';
import Store from '../store';
import Util from '../util/util';

// =============================================================================
//	Setting organizer class
// =============================================================================

export default class SettingOrganizer
{

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
	 * Global init.
	 */
	static globalInit()
	{

		// Add properties

		Object.defineProperty(Component.prototype, 'settings', {
			get() {
				return this._settings;
			},
			configurable: true
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Init.
	 *
	 * @param	{Object}		conditions			Conditions.
	 * @param	{Component}		component			Component.
	 * @param	{Object}		settings			Settings.
	 */
	static init(conditions, component, settings)
	{

		// Init settings
		let defaults = {
			"autoSetup": true,
			"autoStop": true
		};
		component._settings = new Store({"items":defaults});
		component._settings.merge(settings);
		component._settings.merge(component._getSettings());
		component._settings.chain(BITSMIST.v1.Globals["settings"]);

		// Overwrite name if specified
		if (component._settings.get("name"))
		{
			component._name = component._settings.get("name");
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Organize.
	 *
	 * @param	{Object}		conditions			Conditions.
	 * @param	{Component}		component			Component.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static organize(conditions, component)
	{

		return Promise.resolve().then(() => {
			// Load extra settings
			return SettingOrganizer.__loadExtraSettings(component, "setting");
		}).then((extraSettings) => {
			if (extraSettings)
			{
				component._settings.merge(extraSettings);
			}
		}).then(() => {
			// Load settings from attributes
			SettingOrganizer.__loadAttrSettings(component);
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Clear.
	 *
	 * @param	{Component}		component			Component.
	 */
	static clear(component)
	{
	}

	// -------------------------------------------------------------------------

	/**
	 * Check if event is target.
	 *
	 * @param	{String}		eventName			Event name.
	 *
	 * @return 	{Boolean}		True if it is target.
	 */
	static isTarget(eventName, observerInfo, ...args)
	{

		let ret = false;

		if (eventName == "*" || eventName == "beforeStart")
		{
			ret = true;
		}

		return ret;

	}

	// -------------------------------------------------------------------------

	/**
	 * Load setting file.
	 *
	 * @param	{String}		settingName			Setting name.
	 * @param	{String}		path				Path to setting file.
	 *
	 * @return  {Promise}		Promise.
	 */
	static loadSetting(settingName, path)
	{

		let url = Util.concatPath([path, settingName + ".js"]);
		let settings;

		return AjaxUtil.ajaxRequest({url:url, method:"GET"}).then((xhr) => {
			console.debug(`SettingOrganizer.loadSettings(): Loaded settings. url=${url}`);
			try
			{
				settings = JSON.parse(xhr.responseText);
			}
			catch(e)
			{
				throw new SyntaxError(`Illegal json string. url=${url}`);
			}

			return settings;
		});

	}

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
	 * Load an extra setting file.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{String}		settingName			Setting name.
	 *
	 * @return  {Promise}		Promise.
	 */
	static __loadExtraSettings(component, settingName)
	{

		let name, path;

		if (component.hasAttribute("data-" + settingName + "href"))
		{
			let arr = Util.getFilenameAndPathFromUrl(component.getAttribute("data-" + settingName + "href"));
			path = arr[0];
			name = arr[1].slice(0, -3);
		}
		else
		{
			path = ( component.hasAttribute("data-" + settingName + "path") ? component.getAttribute("data-" + settingName + "path") : "" );
			name = ( component.hasAttribute("data-" + settingName + "name") ? component.getAttribute("data-" + settingName + "name") : "" );
			if (path && !name)
			{
				name = "settings";
			}
		}

		if (name || path)
		{
			return SettingOrganizer.loadSetting(name, path);
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

		// Get settings from the attribute

		let dataSettings = ( component._settings.get("rootNode") ?
			document.querySelector(component._settings.get("rootNode")).getAttribute("data-settings") :
			component.getAttribute("data-settings")
		);

		if (dataSettings) {
			let settings = JSON.parse(dataSettings);
			Object.keys(settings).forEach((key) => {
				component._settings.set(key, settings[key]);
			});
		}

	}

}
