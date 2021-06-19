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
import ChainableStore from '../store/chainable-store';
import Component from '../component';
import Organizer from './organizer';
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
		Object.defineProperty(Component.prototype, 'settings', {
			get() { return this._settings; },
		});

		// Init vars
		SettingOrganizer.__globalSettings = new ChainableStore();
		Object.defineProperty(SettingOrganizer, 'globalSettings', {
			get() { return SettingOrganizer.__globalSettings; },
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
		component._settings = new ChainableStore({"items":settings});
		component.settings.merge(component._getSettings());

		// Overwrite name if specified
		let name = component.settings.get("settings.name");
		if (name)
		{
			component._name = name;
		}

		// Chain global settings
		if (component.settings.get("settings.useGlobalSettings"))
		{
			component.settings.chain(SettingOrganizer.globalSettings);
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

			// Load settings from attributes
			SettingOrganizer.__loadAttrSettings(component);
		}).then(() => {
			// Load global settings
			let load = component.settings.get("settings.loadGlobalSettings");
			if (load)
			{
				// Load global settings
				SettingOrganizer.__globalSettings.merge(component.settings.items["globals"]);

				return SettingOrganizer._load(component).then((settings) => {
					SettingOrganizer.__globalSettings.merge(settings);
				});
			}
		}).then(() => {
			return component.settings.items;
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Check if event is target.
	 *
	 * @param	{String}		conditions			Event name.
	 * @param	{Object}		organizerInfo		Organizer info.
	 * @param	{Component}		component			Component.
	 *
	 * @return 	{Boolean}		True if it is target.
	 */
	static isTarget(conditions, organizerInfo, component)
	{

		if (conditions == "beforeStart")
		{
			return true;
		}
		else
		{
			return false;
		}

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

	/**
	* Load items.
	*
	* @param	{Object}		options				Options.
	*
	* @return  {Promise}		Promise.
	*/
	static _load(component, options)
	{

		let sender = ( options && options["sender"] ? options["sender"] : component );

		return component.trigger("doLoadStore", sender);

	}

	// -------------------------------------------------------------------------

	/**
	* Save items.
	*
	* @param	{Object}		options				Options.
	*
	* @return  {Promise}		Promise.
	*/
	static _save(component, options)
	{

		let sender = ( options && options["sender"] ? options["sender"] : component );

		return component.trigger("doSaveStore", sender, {"data":PreferenceOrganizer.__preferences.items});

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

		// Get path from  bm-autoload
		if (component.getAttribute("bm-autoload"))
		{
			let arr = Util.getFilenameAndPathFromUrl(component.getAttribute("bm-autoload"));
			component.settings.set("system.appBaseUrl", "");
			component.settings.set("system.templatePath", arr[0]);
			component.settings.set("system.componentPath", arr[0]);
			component.settings.set("settings.path", "");
		}

		// Get path from attribute
		if (component.hasAttribute("bm-path"))
		{
			component.settings.set("settings.path", component.getAttribute("bm-path"));
		}

		// Get settings from the attribute

		let dataSettings = ( document.querySelector(component.settings.get("settings.rootNode")) ?
			document.querySelector(component.settings.get("settings.rootNode")).getAttribute("bm-settings") :
			component.getAttribute("bm-settings")
		);

		if (dataSettings)
		{
			let settings = {"settings": JSON.parse(dataSettings)};
			component.settings.merge(settings);
		}

	}

}
