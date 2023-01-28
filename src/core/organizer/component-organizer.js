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
import StateOrganizer from "./state-organizer.js";
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

	static getInfo()
	{

		return {
			"name":			"ComponentOrganizer",
			"targetWords":	["molds", "components"],
			"order":		400,
		};

	}

	// -------------------------------------------------------------------------

	static globalInit()
	{

		// Add properties to Component
		Object.defineProperty(BITSMIST.v1.Component.prototype, "components", {
			get() { return this._components; },
		});

		// Add methods to Component
		BITSMIST.v1.Component.prototype.loadTags = function(...args) { return ComponentOrganizer._loadTags(...args); }
		BITSMIST.v1.Component.prototype.loadComponent = function(...args) { return ComponentOrganizer._loadComponent(...args); }
		BITSMIST.v1.Component.prototype.addComponent = function(...args) { return ComponentOrganizer._addComponent(this, ...args); }

		// Init vars
		ComponentOrganizer.__classes = new Store();

		// Load tags on DOMContentLoaded event
		document.addEventListener("DOMContentLoaded", () => {
			if (BITSMIST.v1.settings.get("organizers.ComponentOrgaznier.settings.autoLoadOnStartup", true))
			{
				ComponentOrganizer._loadTags(document.body, {"waitForTags":false});
			}
		});

	}

	// -------------------------------------------------------------------------

	static attach(component, options)
	{

		// Init component vars
		component._components = {};

		// Add event handlers to the component
		this._addOrganizerHandler(component, "afterStart", ComponentOrganizer.onAfterStart);
		this._addOrganizerHandler(component, "afterSpecLoad", ComponentOrganizer.onAfterSpecLoad);

	}

	// -------------------------------------------------------------------------

	/**
	 * Load the component js files.
	 *
	 * @param	{String}		fileName			File name.
	 * @param	{String}		path				Path to the file.
	 * @param	{Object}		loadOptions			Load Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static loadFile(fileName, path, loadOptions)
	{

		console.debug(`Loading component file. fileName=${fileName}, path=${path}`);

		let query = Util.safeGet(loadOptions, "query");
		let url1 = Util.concatPath([path, fileName + ".js"]) + (query ? "?" + query : "");
		let url2 = Util.concatPath([path, fileName + ".settings.js"]) + (query ? "?" + query : "");

		return Promise.resolve().then(() => {
			return AjaxUtil.loadScript(url1);
		}).then(() => {
			if (loadOptions["splitComponent"])
			{
				return AjaxUtil.loadScript(url2);
			}
		}).then(() => {
			console.debug(`Loaded script. fileName=${fileName}`);
		});

	}

	// -------------------------------------------------------------------------
	//  Event Handlers
	// -------------------------------------------------------------------------

	static onAfterStart(sender, e, ex)
	{

		return ComponentOrganizer._organize(this, this.settings.items);

	}

	// -------------------------------------------------------------------------

	static onAfterSpecLoad(sender, e, ex)
	{

		return ComponentOrganizer._organize(this, e.detail.spec);

	}

	// -------------------------------------------------------------------------
	//  Protected
	// -------------------------------------------------------------------------

	/**
	 * Organize.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object}		settings			Settings.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static _organize(component, settings)
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
						return ComponentOrganizer._addComponent(component, moldName, molds[moldName], true);
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
						return ComponentOrganizer._addComponent(component, componentName, components[componentName]);
					}
				});
			});
		}

		return chain;

	}

	// -------------------------------------------------------------------------

	/**
	 * Load scripts for tags that has bm-autoload/bm-automorph attribute.
	 *
	 * @param	{HTMLElement}	rootNode			Target node.
	 * @param	{Object}		options				Load Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _loadTags(rootNode, options)
	{

		console.debug(`Loading tags. rootNode=${rootNode.tagName}`);

		let promises = [];

		// Load tags that has bm-autoload/bm-automorph attribute
		let targets = Util.scopedSelectorAll(rootNode, "[bm-autoload]:not([bm-autoloading]):not([bm-powered]),[bm-automorph]:not([bm-autoloading]):not([bm-powered])");
		targets.forEach((element) => {
			element.setAttribute("bm-autoloading", "");

			// Load a tag
			let settings = this._loadAttrSettings(element);
			let className = Util.getClassNameFromTagName(element.tagName);
			element._injectSettings = function(curSettings){
				return Util.deepMerge(curSettings, settings);
			};
			promises.push(ComponentOrganizer._loadComponent(element.tagName.toLowerCase(), className, settings).then(() => {
				element.removeAttribute("bm-autoloading");
			}));
		});

		return Promise.all(promises).then(() => {
			let waitFor = Util.safeGet(options, "waitForTags");
			if (waitFor)
			{
				return ComponentOrganizer.__waitForChildren(rootNode);
			}
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Load a component.
	 *
	 * @param	{String}		tagName				Tag name.
	 * @param	{String}		className			Class name.
	 * @param	{Object}		settings			Component settings.
	 * @param	{Object}		loadOptions			Load options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _loadComponent(tagName, className, settings, loadOptions)
	{

		console.debug(`Loading a component. tagName=${tagName}, className=${className}`);

		// Check if the tag is already defined
		if (customElements.get(tagName))
		{
			console.debug(`Tag already defined. className=${className}, tagName=${tagName}`);
			return Promise.resolve();
		}

		loadOptions = Util.deepMerge({}, loadOptions);

		// Override path and filename when url is specified in autoLoad option
		let href = Util.safeGet(settings, "loadings.autoLoad");
		href = ( href === true ? "" : href );
		if (href)
		{
			let url = Util.parseURL(href);

			settings["loadings"]["appBaseUrl"] = "";
			settings["loadings"]["componentPath"] = "";
			settings["loadings"]["templatePath"] = "";
			settings["loadings"]["path"] = url.path;
			settings["loadings"]["fileName"] = url.filenameWithoutExtension;

			if (url.extension === "html")
			{
				settings["loadings"]["autoMorph"] = ( settings["loadings"]["autoMorph"] ? settings["loadings"]["autoMorph"] : true );
			}

			loadOptions["query"] = url.query;
		}

		// Get a base class name
		let baseClassName = Util.safeGet(settings, "loadings.autoMorph", className );
		baseClassName = ( baseClassName === true ? "BITSMIST.v1.Component" : baseClassName );

		// Get a path
		let path = Util.safeGet(loadOptions, "path",
			Util.concatPath([
				Util.safeGet(settings, "loadings.appBaseUrl", BITSMIST.v1.settings.get("system.appBaseUrl", "")),
				Util.safeGet(settings, "loadings.componentPath", BITSMIST.v1.settings.get("system.componentPath", "")),
				Util.safeGet(settings, "loadings.path", ""),
			])
		);

		// Load a class
		let fileName = Util.safeGet(settings, "loadings.fileName", tagName.toLowerCase());
		loadOptions["splitComponent"] = Util.safeGet(loadOptions, "splitComponent", Util.safeGet(settings, "loadings.splitComponent", BITSMIST.v1.settings.get("system.splitComponent", false)));
		loadOptions["query"] = Util.safeGet(loadOptions, "query",  Util.safeGet(settings, "loadings.query"), "");

		return ComponentOrganizer.__autoloadComponent(baseClassName, fileName, path, loadOptions).then(() => {
			// Morphing
			if (baseClassName !== className)
			{
				let superClass = ClassUtil.getClass(baseClassName);
				ClassUtil.newComponent(className, settings, superClass, tagName);
			}

			if (!customElements.get(tagName))
			{
				let classDef = ClassUtil.getClass(className);
				customElements.define(tagName, classDef);
			}
		});

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
			if (Util.safeGet(settings, "loadings.autoLoad") || Util.safeGet(settings, "loadings.autoMorph"))
			{
				return ComponentOrganizer._loadComponent(tagName, componentName, settings);
			}
		}).then(() => {
			// Insert tag
			if (!component._components[componentName])
			{
				addedComponent = ComponentOrganizer.__insertTag(component, tagName, settings);
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

	/**
	 * Get settings from element's attribute.
	 *
	 * @param	{Component}		component			Component.
	 */
	static _loadAttrSettings(element)
	{

		let settings = {
			"loadings": {}
		};

		// Split component
		if (element.hasAttribute("bm-split"))
		{
			settings["loadings"]["splitComponent"] = true;
		}

		// Path
		if (element.hasAttribute("bm-path"))
		{
			settings["loadings"]["path"] = element.getAttribute("bm-path");
		}

		// File name
		if (element.hasAttribute("bm-filename"))
		{
			settings["loadings"]["fileName"] = element.getAttribute("bm-filename");
		}

		// Morphing
		if (element.hasAttribute("bm-automorph"))
		{
			settings["loadings"]["autoMorph"] = ( element.getAttribute("bm-automorph") ? element.getAttribute("bm-automorph") : true );
		}

		// Auto loading
		if (element.hasAttribute("bm-autoload"))
		{
			settings["loadings"]["autoLoad"] = ( element.getAttribute("bm-autoload") ? element.getAttribute("bm-autoload") : true );
		}

		return settings;

	}

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
	 * Load the component if not loaded yet.
	 *
	 * @param	{String}		className			Component class name.
	 * @param	{String}		fileName			Component file name.
	 * @param	{String}		path				Path to component.
	 * @param	{Object}		loadOptions			Load Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static __autoloadComponent(className, fileName, path, loadOptions)
	{

		console.debug(`Auto loading component. className=${className}, fileName=${fileName}, path=${path}`);

		let promise;

		if (ComponentOrganizer.__isLoadedClass(className))
		{
			// Already loaded
			console.debug(`Component Already exists. className=${className}`);
			ComponentOrganizer.__classes.set(className + ".state", "loaded");
			promise = Promise.resolve();
		}
		else if (ComponentOrganizer.__classes.get(className, {})["state"] === "loading")
		{
			// Already loading
			console.debug(`Component Already loading. className=${className}`);
			promise = ComponentOrganizer.__classes.get(className)["promise"];
		}
		else
		{
			// Not loaded
			ComponentOrganizer.__classes.set(className + ".state", "loading");
			promise = ComponentOrganizer.loadFile(fileName, path, loadOptions).then(() => {
				ComponentOrganizer.__classes.set(className, {"state":"loaded", "promise":null});
			});
			ComponentOrganizer.__classes.set(className + ".promise", promise);
		}

		return promise;

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

		Util.assert(root, `ComponentOrganizer.__insertTag(): Root node does not exist. name=${component.name}, tagName=${tagName}, rootNode=${Util.safeGet(settings, "loadings.rootNode")}`, ReferenceError);

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

	// -------------------------------------------------------------------------

	/**
	 * Wait for components under the specified root node.
	 *
	 * @param	{HTMLElement}	rootNode			Target node.
	 *
	 * @return  {Promise}		Promise.
	 */
	static __waitForChildren(rootNode)
	{

		let waitList = [];
		let targets = Util.scopedSelectorAll(rootNode, "[bm-powered],[bm-autoloading]");
		targets.forEach((element) => {
			if (rootNode != element.rootElement && !element.hasAttribute("bm-nowait"))
			{
				let waitItem = {"object":element, "state":"ready"};
				waitList.push(waitItem);
			}
		});

		return StateOrganizer.waitFor(waitList, {"waiter":rootNode});

	}

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

}
