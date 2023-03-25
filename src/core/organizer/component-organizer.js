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
	//  Setter/Getter
	// -------------------------------------------------------------------------

	static get name()
	{

		return "ComponentOrganizer";

	}

	// -------------------------------------------------------------------------
	//  Event Handlers
	// -------------------------------------------------------------------------

	static ComponentOrganizer_onDoOrganize(sender, e, ex)
	{

		let chain = Promise.resolve();

		// Load molds
		this._enumSettings(e.detail.settings["molds"], (sectionName, sectionValue) => {
			chain = chain.then(() => {
				if (!this.components[sectionName])
				{
					return ComponentOrganizer._loadComponent(this, sectionName, sectionValue, {"syncOnAdd":true});
				}
			});
		});

		// Load components
		this._enumSettings(e.detail.settings["components"], (sectionName, sectionValue) => {
			chain = chain.then(() => {
				if (!this.components[sectionName])
				{
					return ComponentOrganizer._loadComponent(this, sectionName, sectionValue);
				}
			});
		});

		return chain;

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static getInfo()
	{

		return {
			"sections":		["molds", "components"],
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
		BITSMIST.v1.Component.prototype.loadComponent = function(...args) { return ComponentOrganizer._loadComponent(this, ...args); }

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

	static init(component, options)
	{

		// Init component vars
		component._components = {};

		// Add event handlers to the component
		this._addOrganizerHandler(component, "doOrganize", ComponentOrganizer.ComponentOrganizer_onDoOrganize);

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

		console.debug(`ComponentOrganizer.loadFile(): ComponentOrganizer.loadFile(): Loading component file. fileName=${fileName}, path=${path}`);

		let query = Util.safeGet(loadOptions, "query");
		let url1 = Util.concatPath([path, `${fileName}.js`]) + (query ? `?${query}` : "");
		let url2 = Util.concatPath([path, `${fileName}.settings.js`]) + (query ? `?${query}` : "");

		return Promise.resolve().then(() => {
			return AjaxUtil.loadScript(url1);
		}).then(() => {
			if (loadOptions["splitComponent"])
			{
				return AjaxUtil.loadScript(url2);
			}
		}).then(() => {
			console.debug(`ComponentOrganizer.loadFile(): Loaded script. fileName=${fileName}`);
		});

	}

	// -------------------------------------------------------------------------
	//  Protected
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

		console.debug(`ComponentOrganizer._loadTags(): Loading tags. rootNode=${rootNode.tagName}`);

		let promises = [];

		// Load tags that has bm-autoload/bm-automorph attribute
		let targets = Util.scopedSelectorAll(rootNode, "[bm-autoload]:not([bm-autoloading]):not([bm-powered]),[bm-automorph]:not([bm-autoloading]):not([bm-powered]),[bm-classref]:not([bm-autoloading]):not([bm-powered]),[bm-htmlref]:not([bm-autoloading]):not([bm-powered])");
		targets.forEach((element) => {
			let tagName = element.tagName.toLowerCase();
			let settings = this._loadAttrSettings(element);
			if (ComponentOrganizer._hasExternalClass(tagName, settings))
			{
				// Load the tag
				element.setAttribute("bm-autoloading", "");

				element._injectSettings = function(curSettings){
					return Util.deepMerge(curSettings, settings);
				};
				promises.push(ComponentOrganizer._loadExternalClass(tagName, settings).then(() => {
					element.removeAttribute("bm-autoloading");
				}));
			}
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
	 * Load the class.
	 *
	 * @param	{String}		tagName				Tag name.
	 * @param	{Object}		settings			Component settings.
	 * @param	{Object}		loadOptions			Load options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _loadClass(tagName, settings, loadOptions)
	{

		console.debug(`ComponentOrganizer._loadClass(): Loading the class. tagName=${tagName}`);

		loadOptions = loadOptions || {};

		// Class name
		let className = Util.safeGet(settings, "settings.className", Util.getClassNameFromTagName(tagName));

		// Base class name (Used when morphing)
		let baseClassName = Util.safeGet(settings, "settings.autoMorph", className );
		baseClassName = ( baseClassName === true ? "BITSMIST.v1.Component" : baseClassName );

		// Path
		let path = Util.safeGet(loadOptions, "path",
			Util.concatPath([
				Util.safeGet(settings, "system.appBaseUrl", BITSMIST.v1.settings.get("system.appBaseUrl", "")),
				Util.safeGet(settings, "system.componentPath", BITSMIST.v1.settings.get("system.componentPath", "")),
				Util.safeGet(settings, "settings.path", ""),
			])
		);

		// Load the class
		let fileName = Util.safeGet(settings, "settings.fileName", tagName.toLowerCase());
		loadOptions["splitComponent"] = Util.safeGet(loadOptions, "splitComponent", Util.safeGet(settings, "settings.splitComponent", BITSMIST.v1.settings.get("system.splitComponent", false)));
		loadOptions["query"] = Util.safeGet(loadOptions, "query",  Util.safeGet(settings, "settings.query"), "");

		return ComponentOrganizer.__autoloadClass(baseClassName, fileName, path, loadOptions).then(() => {
			// Morphing
			if (baseClassName !== className)
			{
				let superClass = ClassUtil.getClass(baseClassName);
				ClassUtil.newComponent(className, settings, superClass, tagName);
			}

			// Define the tag
			if (!customElements.get(tagName))
			{
				let classDef = ClassUtil.getClass(className);
				Util.assert(classDef, `ComponentOrganizer_loadClass(): Class does not exists. tagName=${tagName}, className=${className}`);

				customElements.define(tagName, classDef);
			}
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Load the component and add to parent component.
	 *
	 * @param	{Component}		component			Parent component.
	 * @param	{String}		componentName		Component name.
	 * @param	{Object}		settings			Settings for the component.
	 * @param	{Object}		loadOptions			Load Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _loadComponent(component, componentName, settings, loadOptions)
	{

		console.debug(`ComponentOrganizer._loadComponent(): Adding the component. name=${component.name}, componentName=${componentName}`);

		// Get the tag name
		let tagName;
		let tag = Util.safeGet(settings, "settings.tag");
		if (tag)
		{
			let pattern = /([\w-]+)\s+\w+.*?>/;
			tagName = tag.match(pattern)[1];
		}
		else
		{
			tagName = Util.safeGet(settings, "settings.tagName", Util.getTagNameFromClassName(componentName)).toLowerCase();
		}

		let addedComponent;

		return Promise.resolve().then(() => {
			// Load the class
			if (ComponentOrganizer._hasExternalClass(tagName, settings))
			{
				return ComponentOrganizer._loadExternalClass(tagName, settings);
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
			let sync = Util.safeGet(loadOptions, "syncOnAdd", Util.safeGet(settings, "settings.syncOnAdd"));
			if (sync)
			{
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
			"settings": {}
		};

		// Class name
		if (element.hasAttribute("bm-classname"))
		{
			settings["settings"]["className"] = element.getAttribute("bm-classname");
		}

		// Split component
		if (element.hasAttribute("bm-split"))
		{
			settings["system"]["splitComponent"] = true;
		}

		// Path
		if (element.hasAttribute("bm-path"))
		{
			settings["settings"]["path"] = element.getAttribute("bm-path");
		}

		// File name
		if (element.hasAttribute("bm-filename"))
		{
			settings["settings"]["fileName"] = element.getAttribute("bm-filename");
		}

		// Morphing
		if (element.hasAttribute("bm-automorph"))
		{
			settings["settings"]["autoMorph"] = ( element.getAttribute("bm-automorph") ? element.getAttribute("bm-automorph") : true );
		}
		if (element.hasAttribute("bm-htmlref"))
		{
			settings["settings"]["autoMorph"] = ( element.getAttribute("bm-htmlref") ? element.getAttribute("bm-htmlref") : true );
		}

		// Auto loading
		if (element.hasAttribute("bm-autoload"))
		{
			settings["settings"]["autoLoad"] = ( element.getAttribute("bm-autoload") ? element.getAttribute("bm-autoload") : true );
		}
		if (element.hasAttribute("bm-classref"))
		{
			settings["settings"]["autoLoad"] = ( element.getAttribute("bm-classref") ? element.getAttribute("bm-classref") : true );
		}

		return settings;

	}

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
	 * Check if the component has the external class file.
	 *
	 * @param	{String}		tagName				Tag name.
	 * @param	{Object}		settings			Component settings.
	 *
	 * @return  {Boolean}		True if the component has the external class file.
	 */
	static _hasExternalClass(tagName, settings)
	{

		let ret = false;

		// Check if the tag is already defined
		if (!customElements.get(tagName))
		{
			if ((Util.safeGet(settings, "settings.classRef"))
				|| (Util.safeGet(settings, "settings.htmlRef"))
				|| (Util.safeGet(settings, "settings.autoLoad"))
				|| (Util.safeGet(settings, "settings.autoMorph")))
			{
				ret = true;
			}
		}

		return ret;

	}

	// -------------------------------------------------------------------------

	/**
	 * Load the external class file.
	 *
	 * @param	{String}		tagName				Tag name.
	 * @param	{Object}		settings			Component settings.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _loadExternalClass(tagName, settings)
	{

		let loadOptions;
		let classRef = Util.safeGet(settings, "settings.autoLoad");

		if (classRef && classRef !== true)
		{
			let url = Util.parseURL(classRef);
			loadOptions = {
				"path":			url.path,
				"query":		url.query,
			};

			// Override settings
			settings["system"] = settings["system"] || {};
			settings["system"]["appBaseUrl"] = "";
			settings["system"]["componentPath"] = "";
			settings["system"]["templatePath"] = "";
			settings["settings"] = settings["settings"] || {};
			settings["settings"]["path"] = url.path;
			settings["settings"]["fileName"] = url.filenameWithoutExtension;
			if (url.extension === "html")
			{
				settings["settings"]["autoMorph"] = ( settings["settings"]["autoMorph"] ? settings["settings"]["autoMorph"] : true );
			}
		}

		return ComponentOrganizer._loadClass(tagName, settings, loadOptions);

	}

	// -------------------------------------------------------------------------

	/**
	 * Load the class if not loaded yet.
	 *
	 * @param	{String}		className			Component class name.
	 * @param	{String}		fileName			Component file name.
	 * @param	{String}		path				Path to component.
	 * @param	{Object}		loadOptions			Load Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static __autoloadClass(className, fileName, path, loadOptions)
	{

		console.debug(`ComponentOrganizer.__autoLoadClass(): Auto loading component. className=${className}, fileName=${fileName}, path=${path}`);

		let promise;

		if (ComponentOrganizer.__isLoadedClass(className))
		{
			// Already loaded
			console.debug(`ComponentOrganizer.__autoLoadClass(): Component Already exists. className=${className}`);
			ComponentOrganizer.__classes.set(`${className}.state`, "loaded");
			promise = Promise.resolve();
		}
		else if (ComponentOrganizer.__classes.get(className, {})["state"] === "loading")
		{
			// Already loading
			console.debug(`ComponentOrganizer.__autoLoadClass(): Component Already loading. className=${className}`);
			promise = ComponentOrganizer.__classes.get(className)["promise"];
		}
		else
		{
			// Not loaded
			ComponentOrganizer.__classes.set(`${className}.state`, "loading");
			promise = ComponentOrganizer.loadFile(fileName, path, loadOptions).then(() => {
				ComponentOrganizer.__classes.set(className, {"state":"loaded", "promise":null});
			});
			ComponentOrganizer.__classes.set(`${className}.promise`, promise);
		}

		return promise;

	}

	// -------------------------------------------------------------------------

	/**
	 * Insert the tag and return the inserted component.
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
		if (Util.safeGet(settings, "settings.parentNode"))
		{
			root = Util.scopedSelectorAll(component.rootElement, Util.safeGet(settings, "settings.parentNode"), {"penetrate":true})[0];
		}
		else
		{
			root = component;
		}

		Util.assert(root, `ComponentOrganizer.__insertTag(): Root node does not exist. name=${component.name}, tagName=${tagName}, Ntrentode=${Util.safeGet(settings, "settings.parentNode")}`, ReferenceError);

		// Build tag
		let tag = ( Util.safeGet(settings, "settings.tag") ? Util.safeGet(settings, "settings.tag") : `<${tagName}></${tagName}>` );

		// Insert tag
		if (Util.safeGet(settings, "settings.replaceParent"))
		{
			root.outerHTML = tag;
			addedComponent = root;
		}
		else
		{
			let position = Util.safeGet(settings, "settings.adjacentPosition", "afterbegin");
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
