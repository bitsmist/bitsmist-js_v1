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
import Organizer from './organizer';
import Store from '../store/store';
import Util from '../util/util';

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
		Object.defineProperty(targetClass.prototype, 'settings', {
			get() { return this._settings; },
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Init.
	 *
	 * @param	{Object}		conditions			Conditions.
	 * @param	{Component}		component			Component.
	 * @param	{Object}		settings			Settings.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static init(conditions, component, settings)
	{

		// Init vars
		component._settings = new Store({"items":settings});
		component.settings.chain(BITSMIST.v1.Globals["settings"]);
		component.settings.merge(component._getSettings());

		// Overwrite name if specified
		if (component.settings.get("name"))
		{
			component._name = component.settings.get("name");
		}

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

		return Promise.resolve().then(() => {
			// Load extra settings
			return SettingOrganizer.__loadExtraSettings(component, "setting");
		}).then((extraSettings) => {
			if (extraSettings)
			{
				component.settings.merge(extraSettings);
			}
		}).then(() => {
			// Load settings from attributes
			SettingOrganizer.__loadAttrSettings(component);
		});

	}

	// -------------------------------------------------------------------------
	//  Protected
	// -------------------------------------------------------------------------

	/**
	 * Load setting file.
	 *
	 * @param	{String}		settingName			Setting name.
	 * @param	{String}		path				Path to setting file.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _loadSetting(settingName, path)
	{

		let url = Util.concatPath([path, settingName + ".js"]);
		let settings;

		console.debug(`SettingOrganizer._loadSetting(): Loading settings. url=${url}`);
		return AjaxUtil.ajaxRequest({url:url, method:"GET"}).then((xhr) => {
			console.debug(`SettingOrganizer._loadSetting(): Loaded settings. url=${url}`);
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
			return SettingOrganizer._loadSetting(name, path);
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

		// Get path from href
		if (component.hasAttribute("href"))
		{
			let arr = Util.getFilenameAndPathFromUrl(component.getAttribute("href"));
			component.settings.set("system.appBaseUrl", "");
			component.settings.set("system.templatePath", arr[0]);
			component.settings.set("system.componentPath", arr[0]);
			component.settings.set("path", "");
		}

		// Get path from attribute
		if (component.hasAttribute("data-path"))
		{
			component.settings.set("path", component.getAttribute("data-path"));
		}

		// Get settings from the attribute

		let dataSettings = ( document.querySelector(component.settings.get("rootNode")) ?
			document.querySelector(component.settings.get("rootNode")).getAttribute("data-settings") :
			component.getAttribute("data-settings")
		);

		if (dataSettings) {
			let settings = JSON.parse(dataSettings);
			Object.keys(settings).forEach((key) => {
				component.settings.set(key, settings[key]);
			});
		}

	}

}
