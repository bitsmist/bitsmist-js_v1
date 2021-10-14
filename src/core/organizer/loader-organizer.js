// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import Organizer from "./organizer.js";
import ClassUtil from "../util/class-util.js";
import Store from "../store/store.js";
import Util from "../util/util.js";

// =============================================================================
//	Loader organizer class
// =============================================================================

export default class LoaderOrganizer extends Organizer
{

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
	 * Global init.
	 */
	static globalInit()
	{

		// Add methods
		BITSMIST.v1.Component.prototype.getLoader = function(...args) { return LoaderOrganizer._getLoader(this, ...args); }
		BITSMIST.v1.Component.prototype.loadTags = function(...args) { return this.getLoader().loadTags(this, ...args); }
		BITSMIST.v1.Component.prototype.loadTag = function(...args) { return this.getLoader().loadTag(this, ...args); }
		BITSMIST.v1.Component.prototype.loadComponent = function(...args) { return this.getLoader().loadComponent(this, ...args); }
		BITSMIST.v1.Component.prototype.loadTemplate = function(...args) { return this.getLoader().loadTemplate(this, ...args); }
		BITSMIST.v1.Component.prototype.loadSetting = function(...args) { return this.getLoader().loadSetting(this, ...args); }
		BITSMIST.v1.Component.prototype.loadSettingFile = function(...args) { return this.getLoader().loadSettingFile(this, ...args); }

		// Init vars
		LoaderOrganizer._loaders = {};
		Object.defineProperty(LoaderOrganizer, "loaders", {
			get() { return LoaderOrganizer._loaders; },
		});
		LoaderOrganizer._loaders["DefaultLoader"] = BITSMIST.v1.DefaultLoader;

		// Load tags
		document.addEventListener("DOMContentLoaded", () => {
			if (BITSMIST.v1.settings.get("organizers.LoaderOrgaznier.settings.autoLoadOnStartup", true))
			{
				// Create dummy component for loading tags.
				ClassUtil.newComponent(BITSMIST.v1.Component, {
					"settings": {
						"autoRefresh":				false,
						"autoSetup":				false,
						"hasTemplate":				false,
						"rootElement":				document.body,
					},
				}, "bm-app", "BmApp");
				let component = document.createElement("bm-app");

				// Load tags
				component.start().then(() => {
					let loader = component.getLoader(BITSMIST.v1.settings.get("system.loaderName"));
					loader.loadTags(component, component.rootElement, {"waitForTags":false});
				});
			}
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

		component.getLoader().init(component);

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

		switch (conditions)
		{
			case "afterAppend":
				return component.loadTags(component.rootElement);
				break;
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Register a loader.
	 *
	 * @param	{String}		key					Key to store.
	 * @param	{Object}		value				Value to store.
	 */
	static register(key, value)
	{

		value = Object.assign({}, value);
		value["name"] = ( value["name"] ? value["name"] : key );

		LoaderOrganizer._loaders[key] = value;

	}

	// -------------------------------------------------------------------------
	//  Protected
	// -------------------------------------------------------------------------

	/**
	 * Get a loader.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{String}		loaderName			Loader name.
	 *
	 * @return 	{Function}		Loader.
	 */
	static _getLoader(component, loaderName)
	{

		loaderName = ( loaderName ? loaderName : component.settings.get("settings.loaderName", "DefaultLoader") );
		Util.assert(LoaderOrganizer.loaders[loaderName], `Loader doesn't exist. loaderName=${loaderName}`);

		return LoaderOrganizer._loaders[loaderName].object;

	}

}
