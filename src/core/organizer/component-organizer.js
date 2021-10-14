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
import ClassUtil from "../util/class-util.js";
import Organizer from "./organizer.js";
import Store from "../store/store.js";
import Util from "../util/util.js";

// =============================================================================
//	Component organizer class
// =============================================================================

export default class ComponentOrganizer extends Organizer
{

	// -------------------------------------------------------------------------
	//  Methods
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
		component.addComponent = function(componentName, settings, sync) { return ComponentOrganizer._addComponent(this, componentName, settings, sync); }

		// Init vars
		component._components = {};

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
					return ComponentOrganizer._addComponent(component, moldName, molds[moldName], true);
				});
			});
		}

		// Load components
		let components = settings["components"];
		if (components)
		{
			Object.keys(components).forEach((componentName) => {
				chain = chain.then(() => {
					return ComponentOrganizer._addComponent(component, componentName, components[componentName]);
				});
			});
		}

		return chain;

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
	static unorganize(conditions, component, settings)
	{

		ComponentOrganizer.clear(component);

	}

	// -------------------------------------------------------------------------

	/**
	 * Clear.
	 *
	 * @param	{Component}		component			Component.
	 */
	static clear(component)
	{

		Object.keys(component._components).forEach((key) => {
			component._components[key].parentNode.removeChild(component._components[key]);
		});

		component._components = {};

	}

	// -------------------------------------------------------------------------
	//  Protected
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

		let className = Util.safeGet(settings, "settings.className") || componentName;
		let tagName = Util.safeGet(settings, "settings.tagName") || Util.getTagNameFromClassName(className);

		return Promise.resolve().then(() => {
			// Load component
			let splitComponent = Util.safeGet(settings, "settings.splitComponent", component.settings.get("system.splitComponent", false));
			let options = { "splitComponent":splitComponent };

			return component.loadComponent(className, settings, options, tagName);
		}).then(() => {
			// Insert tag
			if (Util.safeGet(settings, "settings.rootNode") && !component._components[componentName])
			{
				component._components[componentName] = ComponentOrganizer.__insertTag(component, tagName, settings);
			}
		}).then(() => {
			// Wait for the added component to be ready
			if (sync || Util.safeGet(settings, "settings.sync"))
			{
				sync = sync || Util.safeGet(settings, "settings.sync"); // sync precedes settings["sync"]
				let state = (sync === true ? "started" : sync);
				let c = className.split(".");

				return component.waitFor([{"name":c[c.length - 1], "state":state}]);
			}
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

		// Check root node
		let root = component.rootElement.querySelector(Util.safeGet(settings, "settings.rootNode"));
		Util.assert(root, `ComponentOrganizer.__insertTag(): Root node does not exist. name=${component.name}, tagName=${tagName}, rootNode=${Util.safeGet(settings, "settings.rootNode")}`, ReferenceError);

		// Build tag
		let tag = ( Util.safeGet(settings, "settings.tag") ? Util.safeGet(settings, "settings.tag") : "<" + tagName +  "></" + tagName + ">" );

		// Insert tag
		if (Util.safeGet(settings, "settings.overwrite"))
		{
			root.outerHTML = tag;
			addedComponent = root;
		}
		else
		{
			root.insertAdjacentHTML("afterbegin", tag);
			addedComponent = root.children[0];
		}

		// Inject settings to added component
		addedComponent._injectSettings = function(curSettings){
			// super()
			if (addedComponent._super && addedComponent._super.prototype._injectSettings)
			{
				curSettings = addedComponent._super.prototype._injectSettings.call(addedComponent, curSettings);
			};

			return Util.deepMerge(curSettings, settings);
		};

		return addedComponent;

	}

}
