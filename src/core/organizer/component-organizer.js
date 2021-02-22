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
import ClassUtil from '../util/class-util';
import Component from '../component';
import Pad from '../pad';
import StateOrganizer from '../organizer/state-organizer';
import Util from '../util/util';

// =============================================================================
//	Component organizer class
// =============================================================================

export default class ComponentOrganizer
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

		Component.prototype.addComponent = function(componentName, options) {
			return ComponentOrganizer.addComponent(this, componentName, options);
		}

		Component.prototype.loadTags = function(rootNode, basePath, settings) {
			return ComponentOrganizer.loadTags(rootNode, basePath, settings);
		}

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

		component._components = {};

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
	static organize(conditions, component, settings)
	{

		let chain = Promise.resolve();
		settings = ( settings ? settings : component.settings.items );

		// Load molds
		let molds = settings["molds"];
		if (molds)
		{
			Object.keys(molds).forEach((moldName) => {
				chain = chain.then(() => {
					return ComponentOrganizer.addComponent(component, moldName, molds[moldName], "opened");
				});
			});
		}

		// Load components
		let components = settings["components"];
		if (components)
		{
			Object.keys(components).forEach((componentName) => {
				chain = chain.then(() => {
					return ComponentOrganizer.addComponent(component, componentName, components[componentName]);
				});
			});
		}

		return chain;

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
		let component = args[0];

		if (eventName == "*" || eventName == "afterAppend" || eventName == "afterSpecLoad")
		{
			ret = true;
		}
		else if (eventName == "beforeStart")
		{
			if (!(component instanceof BITSMIST.v1.Pad))
			{
				ret = true;
			}
		}

		return ret;

	}

	// -------------------------------------------------------------------------

	/**
	 * Add a component to parent component.
	 *
	 * @param	{Component}		component			Parent component.
	 * @param	{String}		componentName		Component name.
	 * @param	{Object}		options				Options for the component.
	 * @param	{Boolean}		sync				Wait for the component to become the state.
	 *
	 * @return  {Promise}		Promise.
	 */
	static addComponent(component, componentName, options, sync)
	{

		let url = Util.concatPath([component._settings.get("system.appBaseUrl", ""), component._settings.get("system.componentPath", ""), ( "path" in options ? options["path"] : "")]);
		let splitComponent = ( "splitComponent" in options ? options["splitComponent"] : component._settings.get("system.splitComponent", false) );
		let className = ( "className" in options ? options["className"] : componentName );
		let tagName = options["tagName"] || ( className && ClassUtil.getClass(className) && ClassUtil.getClass(className).tagName ) || Util.getTagNameFromClassName(className || componentName);

		return Promise.resolve().then(() => {
			if (className)
			{
				// Load component
				return ComponentOrganizer.loadComponent(className, url, {"splitComponent":splitComponent});
			}
			else
			{
				// Define empty class
				className = componentName;
				ClassUtil.newComponent(BITSMIST.v1.Pad, options, tagName, className);
			}
		}).then(() => {
			// Insert tag
			if (options["rootNode"] && !component._components[componentName])
			{
				// Check root node
				let root = document.querySelector(options["rootNode"]);
				if (!root)
				{
					throw new ReferenceError(`Root node does not exist when adding component ${componentName} to ${options["rootNode"]}. name=${component.name}`);
				}

				// Build tag
				let tag = ( options["tag"] ? options["tag"] : "<" + tagName +  "></" + tagName + ">" );

				// Insert tag
				if (options["overwrite"])
				{
					root.outerHTML = tag;
					component._components[componentName] = root;
				}
				else
				{
					root.insertAdjacentHTML("afterbegin", tag);
					component._components[componentName] = root.children[0];
				}

				// Inject settings to added component
				component._components[componentName]._injectSettings = function(settings){
					// super()
					settings = component._super.prototype._injectSettings.call(this, settings);

					return Object.assign({}, settings, options);
				};
			}
		}).then(() => {
			// Expose component
			if (options["expose"])
			{
				let exposeName = ( options["expose"] === true ? componentName : options["expose"] );
				Object.defineProperty(component.__proto__, exposeName, {
					get()
					{
						return component._components[componentName];
					}
				});
			}
		}).then(() => {
			if (sync || options["sync"])
			{
				let state = sync || (options["sync"] === true ? "started" : options["sync"]);
				let c = className.split(".");
				return StateOrganizer.waitFor(component, [{"name":c[c.length - 1], "state":state}]);
			}
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Create component.
	 *
	 * @param	{String}		componentName		Component name.
	 * @param	{Object}		options				Component options.
	 * @param	{String}		path				Path to component.
	 * @param	{Object}		settings			System settings.
	 *
	 * @return  {Promise}		Promise.
	 */
	/*
	static createComponent(componentName, options, path, settings)
	{

		options = Object.assign({}, options);
		let className = ( "className" in options ? options["className"] : componentName );
		let component = null;

		return ComponentOrganizer.__autoloadComponent(className, path, settings).then(() => {
			component = ClassUtil.createObject(className, options);

			return component;
		});

	}
	*/

	// -------------------------------------------------------------------------

	/**
	 * Load the template html.
	 *
	 * @param	{String}		componentName		Component name.
	 * @param	{String}		path				Path to component.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static loadComponent(componentName, path, options)
	{

		return ComponentOrganizer.__autoloadComponent(componentName, path, options);

	}

	// -----------------------------------------------------------------------------

	/**
	 * Load scripts for tags which has data-autoload attribute.
	 *
	 * @param	{HTMLElement}	rootNode			Target node.
	 * @param	{String}		path				Base path prepend to each element's path.
	 *
	 * @return  {Promise}		Promise.
	 */
	static loadTags(rootNode, basePath, settings)
	{

		let promises = [];

		rootNode.querySelectorAll("[data-autoload]").forEach((element) => {

			// Rename data-autoload attribute
			element.removeAttribute("data-autoload");
			element.setAttribute("data-autoload-done", "");

			if (element.getAttribute("href"))
			{
				let url = element.getAttribute("href");
				promises.push(AjaxUtil.loadScript(url));
			}
			else
			{
				let classPath = ( element.hasAttribute("data-path") ? element.getAttribute("data-path") : "" );
				let className = ( element.hasAttribute("data-classname") ? element.getAttribute("data-classname") : Util.getClassNameFromTagName(element.tagName) );

				if (className)
				{
					// Load component script
					settings["splitComponent"] = ( element.hasAttribute("data-split") ? element.getAttribute("data-split") : settings["splitComponent"] );
					promises.push(ComponentOrganizer.loadComponent(className, Util.concatPath([basePath, classPath]), settings));
				}
				else
				{
					// Define empty class
					ClassUtil.newComponent(BITSMIST.v1.Pad, {}, element.tagName);
				}
			}
		});

		return Promise.all(promises);

	}

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
	 * Check if the class exists.
	 *
	 * @param	{String}		className			Class name.
	 *
	 * @return  {Bool}			True if exists.
	 */
	static __isLoadedClass(className)
	{

		let ret = false;

		if (BITSMIST.v1.Globals.classes.get(className, {})["state"] == "loaded")
		{
			ret = true;
		}
		else if (ClassUtil.getClass(className))
		{
			ret = true;
		}

		return ret;

	}

	// -------------------------------------------------------------------------

	/**
	 * Load the component if not loaded yet.
	 *
	 * @param	{String}		className			Component class name.
	 * @param	{String}		path				Path to component.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static __autoloadComponent(className, path, options)
	{

		console.debug(`LoaderMixin.__autoLoadComponent(): Auto loading component. className=${className}, path=${path}`);

		let promise;
		let tagName = options["tagName"] || Util.getTagNameFromClassName(className);

		if (ComponentOrganizer.__isLoadedClass(className) || customElements.get(tagName))
		{
			// Already loaded
			console.debug(`LoaderMixin.__autoLoadComponent(): Component Already exists. className=${className}`);
			BITSMIST.v1.Globals.classes.mergeSet(className, {"state":"loaded"});
			promise = Promise.resolve();
		}
		else if (BITSMIST.v1.Globals.classes.get(className, {})["state"] == "loading")
		{
			// Already loading
			console.debug(`LoaderMixin.__autoLoadComponent(): Component Already loading. className=${className}`);
			promise = BITSMIST.v1.Globals.classes.get(className)["promise"];
		}
		else
		{
			// Not loaded
			BITSMIST.v1.Globals.classes.mergeSet(className, {"state":"loading"});
			promise = ComponentOrganizer.__loadComponentScript(tagName, path, options).then(() => {
				BITSMIST.v1.Globals.classes.mergeSet(className, {"state":"loaded", "promise":null});
			});
			BITSMIST.v1.Globals.classes.mergeSet(className, {"promise":promise});
		}

		return promise;

	}

	// -------------------------------------------------------------------------

	/**
	 * Load the component js files.
	 *
	 * @param	{String}		componentName		Component name.
	 * @param	{String}		path				Path to component.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static __loadComponentScript(componentName, path, options)
	{

		console.debug(`LoaderMixin.__loadComponentScript(): Loading script. componentName=${componentName}, path=${path}`);

		options = ( options ? options : {} );

		let url1 = Util.concatPath([path, componentName + ".js"]);
		let url2 = Util.concatPath([path, componentName + ".settings.js"]);

		return Promise.resolve().then(() => {
			return AjaxUtil.loadScript(url1);
		}).then(() => {
			if (options["splitComponent"])
			{
				return AjaxUtil.loadScript(url2);
			}
		}).then(() => {
			console.debug(`LoaderMixin.__loadComponentScript(): Loaded script. componentName=${componentName}`);
		});

	}

}
