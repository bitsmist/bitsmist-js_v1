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
		BITSMIST.v1.Component.prototype.getLoader = function() { return LoaderOrganizer.getLoader(this.settings.get("settings.loaderName")); }

		// Init vars
		LoaderOrganizer._classes = new Store();
		LoaderOrganizer._loaders = {};
		Object.defineProperty(LoaderOrganizer, "loaders", {
			get() { return LoaderOrganizer._loaders; },
		});
		LoaderOrganizer._loaders["DefaultLoader"] = BITSMIST.v1.DefaultLoader;

		// Load tags
		document.addEventListener("DOMContentLoaded", () => {
			if (BITSMIST.v1.settings.get("organizers.LoaderOrgaznier.settings.autoLoadOnStartup", true))
			{
				LoaderOrganizer._load(document.body, BITSMIST.v1.settings, {"waitForTags":false}, LoaderOrganizer.getLoader(BITSMIST.v1.settings.get("system.loaderName")));
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
				let loader = component.getLoader();
				return LoaderOrganizer._load(component.rootElement, component.settings, component.settings.get("settings"), loader);
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

	/**
	 * Get a loader.
	 *
	 * @param	{String}		loaderName			Loader name.
	 *
	 * @return 	{Function}		Loader.
	 */
	static getLoader(loaderName)
	{

		loaderName = ( loaderName ? loaderName : "DefaultLoader" );
		Util.assert(LoaderOrganizer.loaders[loaderName], `Loader doesn't exist. loaderName=${loaderName}`);

		return LoaderOrganizer._loaders[loaderName].object;

	}

	// -------------------------------------------------------------------------
	//  Protected
	// -------------------------------------------------------------------------

	/**
	 * Load all tags.
	 *
	 * @param	{String}		rootNode			Root node.
	 * @param	{Object}		settings			Settings.
	 * @param	{Object}		options				Load options.
	 * @param	{Function}		loader				Component loader.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static _load(rootNode, settings, options, loader)
	{

		let path = Util.concatPath([settings.get("system.appBaseUrl", ""), settings.get("system.componentPath", "")]);
		let splitComponent = Util.safeGet(options, "splitComponent", settings.get("system.splitComponent", false));
		let waitForTags = Util.safeGet(options, "waitForTags", settings.get("system.waitForTags", true));

		return loader.loadTags(rootNode, path, {"splitComponent":splitComponent, "waitForTags":waitForTags}, loader);

	}

}
