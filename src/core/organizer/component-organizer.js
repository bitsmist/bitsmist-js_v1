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
import Pad from "../pad.js";
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
	 * Global init.
	 */
	static globalInit(targetClass)
	{

		// Init vars
		ComponentOrganizer.__classes = new Store();

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
		component.loadTags = ComponentOrganizer.loadTags;
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
					return ComponentOrganizer._addComponent(component, moldName, molds[moldName], "opened");
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

		let path = Util.concatPath([
			component.settings.get("system.appBaseUrl", ""),
			component.settings.get("system.componentPath", ""),
			Util.safeGet(settings, "settings.path", "")
		]);
		let className = Util.safeGet(settings, "settings.className") || componentName;
		let tagName = Util.safeGet(settings, "settings.tagName") || Util.getTagNameFromClassName(className);

		return Promise.resolve().then(() => {
			// Load component
			let autoLoad = Util.safeGet(settings, "settings.autoLoad", component.settings.get("system.autoLoad", true));
			let splitComponent = Util.safeGet(settings, "settings.splitComponent", component.settings.get("system.splitComponent", false));
			let options = { "autoLoad":autoLoad, "splitComponent":splitComponent };
			return ComponentOrganizer._loadComponent(className, path, settings, options, tagName);
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

	// -----------------------------------------------------------------------------

	/**
	 * Load scripts for tags which has bm-autoload attribute.
	 *
	 * @param	{HTMLElement}	rootNode			Target node.
	 * @param	{String}		basePath			Base path prepend to each element's path.
	 * @param	{Object}		options				Load Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static loadTags(rootNode, basePath, options)
	{

		console.debug(`ComponentOrganizer._loadTags(): Loading tags. rootNode=${rootNode.tagName}, basePath=${basePath}`);

		let promises = [];
		let waitList = [];

		// Load tags that has bm-autoload/bm-automorph attribute
		let targets = Util.scopedSelectorAll(rootNode, "[bm-autoload]:not([bm-autoloading]):not([bm-powered]),[bm-automorph]:not([bm-autoloading]):not([bm-powered])");
		targets.forEach((element) => {
			element.setAttribute("bm-autoloading", "");

			let promise = Promise.resolve().then(() => {
				return ComponentOrganizer.__loadTag(element, basePath, options);
			}).then(() => {
				element.removeAttribute("bm-autoloading");
			});

			promises.push(promise);
		});

		// Create waiting list to wait Bitsmist components
		targets = Util.scopedSelectorAll(rootNode, "[bm-powered],[bm-autoloading]");
		targets.forEach((element) => {
			if (rootNode != element.rootElement)
			{
				let waitItem = {"object":element, "state":"started"};
				waitList.push(waitItem);
			}
		});

		// Wait for the elements to be loaded
		return Promise.all(promises).then(() => {
			let waitFor = Util.safeGet(options, "waitForTags") && waitList.length > 0;
			if (waitFor)
			{
				// Wait for the elements to become "started"
				return BITSMIST.v1.StateOrganizer.waitFor(waitList, {"waiter":rootNode});
			}
		});

	}

	// -----------------------------------------------------------------------------

	/**
	 * Load a tag.
	 *
	 * @param	{HTMLElement}	element				Target element.
	 * @param	{String}		basePath			Base path prepend to each element's path.
	 * @param	{Object}		options				Load Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static __loadTag(element, basePath, options)
	{

		let href = element.getAttribute("bm-autoload");
		let className = element.getAttribute("bm-classname") || Util.getClassNameFromTagName(element.tagName);
		let path = element.getAttribute("bm-path") || "";
		let split = ( element.hasAttribute("bm-split") ? true : options["splitComponent"] );
		let morph = ( element.hasAttribute("bm-automorph") ?
			( element.getAttribute("bm-automorph") ? element.getAttribute("bm-automorph") : true ) :
			false
		);
		let settings = {"settings":{"autoMorph":morph}};
		let loadOptions = {"splitComponent":split, "autoLoad": true};

		if (href)
		{
			let arr = Util.getFilenameAndPathFromUrl(href);
			path = arr[0];
			if (href.slice(-3).toLowerCase() === ".js")
			{
				settings["settings"]["fileName"] = arr[1].substring(0, arr[1].length - 3);
			}
			else if (href.slice(-5).toLowerCase() === ".html")
			{
				settings["settings"]["autoMorph"] = true;
			}
		}
		else
		{
			path = Util.concatPath([basePath, path]);
		}

		return ComponentOrganizer._loadComponent(className, path, settings, loadOptions, element.tagName);

	}

	// -------------------------------------------------------------------------

	/**
	 * Load a component.
	 *
	 * @param	{String}		className			Class name.
	 * @param	{String}		path				Path to component.
	 * @param	{Object}		settings			Component settings.
	 * @param	{Object}		options				Load options.
	 * @param	{String}		tagName				Component's tag name
	 *
	 * @return  {Promise}		Promise.
	 */
	static _loadComponent(className, path, settings, options, tagName)
	{

		let morph = Util.safeGet(settings, "settings.autoMorph");
		if (morph)
		{
			// Define empty class
			console.debug(`ComponentOrganizer._loadComponent(): Creating empty component. className=${className}, path=${path}, tagName=${tagName}`);

			let classDef = ( morph === true ?  BITSMIST.v1.Pad : ClassUtil.getClass(morph) );
			if (!customElements.get(tagName.toLowerCase()))
			{
				ClassUtil.newComponent(classDef, settings, tagName, className);
			}
		}
		else
		{
			if (options["autoLoad"])
			{
				// Load component script
				return ComponentOrganizer.__autoloadComponent(className, path, settings, options);
			}
		}

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

		if (ComponentOrganizer.__classes.get(className, {})["state"] === "loaded")
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
	 * @param	{Object}		settings			Component settings.
	 * @param	{Object}		options				Load Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static __autoloadComponent(className, path, settings, options)
	{

		console.debug(`ComponentOrganizer.__autoLoadComponent(): Auto loading component. className=${className}, path=${path}`);

		let promise;
		let tagName = Util.safeGet(settings, "settings.tagName") || Util.getTagNameFromClassName(className);
		let fileName = Util.safeGet(settings, "settings.fileName", tagName);

		if (ComponentOrganizer.__isLoadedClass(className) || customElements.get(tagName))
		{
			// Already loaded
			console.debug(`ComponentOrganizer.__autoLoadComponent(): Component Already exists. className=${className}`);
			ComponentOrganizer.__classes.set(className, {"state":"loaded"});
			promise = Promise.resolve();
		}
		else if (ComponentOrganizer.__classes.get(className, {})["state"] === "loading")
		{
			// Already loading
			console.debug(`ComponentOrganizer.__autoLoadComponent(): Component Already loading. className=${className}`);
			promise = ComponentOrganizer.__classes.get(className)["promise"];
		}
		else
		{
			// Not loaded
			ComponentOrganizer.__classes.set(className, {"state":"loading"});
			promise = ComponentOrganizer.__loadComponentScript(fileName, path, options).then(() => {
				ComponentOrganizer.__classes.set(className, {"state":"loaded", "promise":null});
			});
			ComponentOrganizer.__classes.set(className, {"promise":promise});
		}

		return promise;

	}

	// -------------------------------------------------------------------------

	/**
	 * Load the component js files.
	 *
	 * @param	{String}		className			Class name.
	 * @param	{String}		path				Path to component.
	 * @param	{Object}		options				Load Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static __loadComponentScript(fileName, path, options)
	{

		console.debug(`ComponentOrganizer.__loadComponentScript(): Loading script. fileName=${fileName}, path=${path}`);

		let url1 = Util.concatPath([path, fileName + ".js"]);
		let url2 = Util.concatPath([path, fileName + ".settings.js"]);

		return Promise.resolve().then(() => {
			return AjaxUtil.loadScript(url1);
		}).then(() => {
			if (options["splitComponent"])
			{
				return AjaxUtil.loadScript(url2);
			}
		}).then(() => {
			console.debug(`ComponentOrganizer.__loadComponentScript(): Loaded script. fileName=${fileName}`);
		});

	}

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
		addedComponent._injectSettings = function(oldSettings){
			// super()
			let newSettings = Object.assign({}, addedComponent._super.prototype._injectSettings.call(addedComponent, oldSettings));

			return Util.deepMerge(newSettings, settings);
		};

		return addedComponent;

	}

}
