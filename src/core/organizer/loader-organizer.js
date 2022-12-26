// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import ClassUtil from "../util/class-util.js";
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
		BITSMIST.v1.Component.prototype.getLoader = function(...args) { return LoaderOrganizer._getLoader(this, ...args); }
		BITSMIST.v1.Component.prototype.loadTags = function(...args) { return this.getLoader().loadTags(...args); }
		BITSMIST.v1.Component.prototype.loadComponent = function(...args) { return this.getLoader().loadComponent(...args); }
		BITSMIST.v1.Component.prototype.loadTemplate = function(...args) { return this.getLoader().loadTemplate(this, ...args); }
		BITSMIST.v1.Component.prototype.loadSetting = function(...args) { return this.getLoader().loadSetting(this, ...args); }
		BITSMIST.v1.Component.prototype.loadSettingFile = function(...args) { return this.getLoader().loadSettingFile(...args); }

		// Init vars
		LoaderOrganizer._loaders = {};
		Object.defineProperty(LoaderOrganizer, "loaders", {
			get() { return LoaderOrganizer._loaders; },
		});
		LoaderOrganizer._loaders["DefaultLoader"] = BITSMIST.v1.DefaultLoader;

		// Load tags on DOMContentLoaded event
		document.addEventListener("DOMContentLoaded", () => {
			if (BITSMIST.v1.settings.get("organizers.LoaderOrgaznier.settings.autoLoadOnStartup", true))
			{
				let loaderName = BITSMIST.v1.settings.get("system.loaderName", "DefaultLoader");
				let loader = LoaderOrganizer._loaders[loaderName].object;
				Util.assert(LoaderOrganizer._loaders[loaderName], `Loader doesn't exist. loaderName=${loaderName}`);

				loader.loadTags(document.body, {"waitForTags":false});
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

		// Add properties
		Object.defineProperty(component, "components", {
			get() { return this._components; },
		});

		// Add methods
		component.addComponent = function(componentName, settings, sync) { return LoaderOrganizer._addComponent(this, componentName, settings, sync); }

		// Init vars
		component._components = {};
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

		let chain = Promise.resolve();

		// Load molds
		let molds = settings["molds"];
		if (molds)
		{
			Object.keys(molds).forEach((moldName) => {
				chain = chain.then(() => {
					if (!component.components[moldName])
					{
						return LoaderOrganizer._addComponent(component, moldName, molds[moldName], true);
					}
				});
			});
		}

		// Load components
		let components = settings["components"];
		if (components)
		{
			Object.keys(components).forEach((componentName) => {
				chain = chain.then(() => {
					if (!component.components[componentName])
					{
						return LoaderOrganizer._addComponent(component, componentName, components[componentName]);
					}
				});
			});
		}

		return chain;

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

		value = Util.deepMerge({}, value);
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
		Util.assert(LoaderOrganizer._loaders[loaderName], `Loader doesn't exist. loaderName=${loaderName}`);

		return LoaderOrganizer._loaders[loaderName].object;

	}

	// -------------------------------------------------------------------------

	/**
	 * Add a component to parent component.
	 *
	 * @param	{Component}		component			Parent component.
	 * @param	{String}		componentName		Component name.
	 * @param	{Object}		settings			Settings for the component.
	 * @param	{Boolean}		sync				Wait for the component to become the state.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _addComponent(component, componentName, settings, sync)
	{

		console.debug(`Adding a component. name=${component.name}, componentName=${componentName}`);

		// Get a tag name
		let tagName;
		let tag = Util.safeGet(settings, "loadings.tag");
		if (tag)
		{
			let pattern = /([\w-]+)\s+\w+.*?>/;
			tagName = tag.match(pattern)[1];
		}
		else
		{
			tagName = Util.safeGet(settings, "loadings.tagName", Util.getTagNameFromClassName(componentName)).toLowerCase();
		}

		let addedComponent;

		return Promise.resolve().then(() => {
			// Load component
			let loaderName = Util.safeGet(settings, "loadings.loaderName", "DefaultLoader");
			let loader = LoaderOrganizer._loaders[loaderName].object;
			if (Util.safeGet(settings, "loadings.autoLoad") || Util.safeGet(settings, "loadings.autoMorph"))
			{
				return loader.loadComponent(tagName, componentName, settings);
			}
		}).then(() => {
			// Insert tag
			if (!component._components[componentName])
			{
				addedComponent = LoaderOrganizer.__insertTag(component, tagName, settings);
				component._components[componentName] = addedComponent;
			}
		}).then(() => {
			// Wait for the added component to be ready
			if (sync || Util.safeGet(settings, "loadings.sync"))
			{
				sync = sync || Util.safeGet(settings, "loadings.sync"); // sync precedes settings["sync"]
				let state = (sync === true ? "ready" : sync);

				return component.waitFor([{"id":component._components[componentName].uniqueId, "state":state}]);
			}
		}).then(() => {
			return addedComponent;
		});

	}

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
	 * Insert a tag and return the inserted component.
	 *
	 * @param	{String}		tagName				Tagname.
	 * @param	{Object}		settings			Component settings.
	 *
	 * @return  {Component}		Component.
	 */
	static __insertTag(component, tagName, settings)
	{

		let addedComponent;
		let root;

		// Check root node
		if (Util.safeGet(settings, "loadings.rootNode"))
		{
			root = Util.scopedSelectorAll(component.rootElement, Util.safeGet(settings, "loadings.rootNode"), {"penetrate":true})[0];
		}
		else
		{
			root = component;
		}

		Util.assert(root, `LoaderOrganizer.__insertTag(): Root node does not exist. name=${component.name}, tagName=${tagName}, rootNode=${Util.safeGet(settings, "loadings.rootNode")}`, ReferenceError);

		// Build tag
		let tag = ( Util.safeGet(settings, "loadings.tag") ? Util.safeGet(settings, "loadings.tag") : "<" + tagName +  "></" + tagName + ">" );

		// Insert tag
		if (Util.safeGet(settings, "loadings.overwrite"))
		{
			root.outerHTML = tag;
			addedComponent = root;
		}
		else
		{
			let position = Util.safeGet(settings, "loadings.position", "afterbegin");
			root.insertAdjacentHTML(position, tag);

			// Get new instance
			switch (position)
			{
				case "beforebegin":
					addedComponent = root.previousSibling;
					break;
				case "afterbegin":
					addedComponent = root.children[0];
					break;
				case "beforeend":
					addedComponent = root.lastChild;
					break;
				case "afterend":
					addedComponent = root.nextSibling;
					break;
			}
		}

		// Inject settings to added component
		addedComponent._injectSettings = function(curSettings){
			return Util.deepMerge(curSettings, settings);
		};

		return addedComponent;

	}

}
