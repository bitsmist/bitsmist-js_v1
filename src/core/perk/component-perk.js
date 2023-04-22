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
import Perk from "./perk.js";
import StatePerk from "./state-perk.js";
import Store from "../store/store.js";
import Util from "../util/util.js";

// =============================================================================
//	Component Perk Class
// =============================================================================

export default class ComponentPerk extends Perk
{

	// -------------------------------------------------------------------------
	//  Skills
	// -------------------------------------------------------------------------

	/**
	 * Load scripts for tags that has bm-autoload/bm-automorph attribute.
	 *
	 * @param	{Component}		component			Component. Nullable.
	 * @param	{HTMLElement}	rootNode			Target node.
	 * @param	{Object}		options				Load Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _loadTags(component, rootNode, options)
	{

		console.debug(`ComponentPerk._loadTags(): Loading tags. rootNode=${rootNode.tagName}`);

		let promises = [];

		// Load tags that has bm-autoload/bm-automorph attribute
		let targets = Util.scopedSelectorAll(rootNode, "[bm-autoload]:not([bm-autoloading]):not([bm-powered]),[bm-automorph]:not([bm-autoloading]):not([bm-powered]),[bm-classref]:not([bm-autoloading]):not([bm-powered]),[bm-htmlref]:not([bm-autoloading]):not([bm-powered])");
		targets.forEach((element) => {
			let settings = this.__loadAttrSettings(element);
			if (ComponentPerk.__hasExternalClass(element.tagName, settings))
			{
				// Load the tag
				element.setAttribute("bm-autoloading", "");

				element._injectSettings = function(curSettings){
					return Util.deepMerge(curSettings, settings);
				};

				promises.push(ComponentPerk.__loadExternalClass(element.tagName, settings).then(() => {
					element.removeAttribute("bm-autoloading");
				}));
			}
		});

		return Promise.all(promises).then(() => {
			let waitFor = Util.safeGet(options, "waitForTags");
			if (waitFor)
			{
				return ComponentPerk.__waitForChildren(rootNode);
			}
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Load the component and add to parent component.
	 *
	 * @param	{Component}		component			Parent component.
	 * @param	{String}		tagName				Component tag name.
	 * @param	{Object}		settings			Settings for the component.
	 * @param	{Object}		loadOptions			Load Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _loadComponent(component, tagName, settings, loadOptions)
	{

		console.debug(`ComponentPerk._loadComponent(): Adding the component. name=${component.tagName}, tagName=${tagName}`);

		// Already loaded
		if (component.inventory.get(`component.components.${tagName}`))
		{
			console.debug(`ComponentPerk._loadComponent(): Already loaded. name=${component.tagName}, tagName=${tagName}`);
			return component.inventory.get(`component.components.${tagName}`);
		}

		// Get the tag name from settings if specified
		let tag = Util.safeGet(settings, "setting.tag");
		if (tag)
		{
			let pattern = /([\w-]+)\s+\w+.*?>/;
			tagName = tag.match(pattern)[1];
		}

		let addedComponent;
		return Promise.resolve().then(() => {
			// Load the class
			if (ComponentPerk.__hasExternalClass(tagName, settings))
			{
				return ComponentPerk.__loadExternalClass(tagName, settings);
			}
		}).then(() => {
			addedComponent = ComponentPerk.__insertTag(component, tagName, settings);
			component.inventory.set(`component.components.${tagName}`, addedComponent);
		}).then(() => {
			// Wait for the added component to be ready
			let sync = Util.safeGet(loadOptions, "syncOnAdd", Util.safeGet(settings, "setting.syncOnAdd"));
			if (sync)
			{
				let state = (sync === true ? "ready" : sync);

				return component.skills.use("state.wait", [{
					"id":		component.inventory.get(`component.components.${tagName}`).uniqueId,
					"state":	state
				}]);
			}
		}).then(() => {
			return addedComponent;
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

		console.debug(`ComponentPerk._loadClass(): Loading the class. tagName=${tagName}`);

		loadOptions = loadOptions || {};
		tagName = tagName.toLowerCase();

		// Class name
		let className = Util.safeGet(settings, "setting.className", Util.getClassNameFromTagName(tagName));

		// Base class name (Used when morphing)
		let baseClassName = Util.safeGet(settings, "setting.autoMorph", className );
		baseClassName = ( baseClassName === true ? "BITSMIST.v1.Component" : baseClassName );

		// Path
		let path = Util.safeGet(loadOptions, "path",
			Util.concatPath([
				Util.safeGet(settings, "system.appBaseUrl", BITSMIST.v1.settings.get("system.appBaseUrl", "")),
				Util.safeGet(settings, "system.componentPath", BITSMIST.v1.settings.get("system.componentPath", "")),
				Util.safeGet(settings, "setting.path", ""),
			])
		);

		// Load the class
		let fileName = Util.safeGet(settings, "setting.fileName", tagName);
		loadOptions["splitClass"] = Util.safeGet(loadOptions, "splitClass", Util.safeGet(settings, "setting.splitClass", BITSMIST.v1.settings.get("system.splitClass", false)));
		loadOptions["query"] = Util.safeGet(loadOptions, "query",  Util.safeGet(settings, "setting.query"), "");

		return ComponentPerk.__autoloadClass(baseClassName, fileName, path, loadOptions).then(() => {
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
				Util.assert(classDef, `ComponentPerk_loadClass(): Class does not exists. tagName=${tagName}, className=${className}`);

				customElements.define(tagName, classDef);
			}
		});

	}

	// -------------------------------------------------------------------------
	//  Event Handlers
	// -------------------------------------------------------------------------

	static ComponentPerk_onDoOrganize(sender, e, ex)
	{

		let chain = Promise.resolve();

		Object.entries(Util.safeGet(e.detail, "settings.component.components", {})).forEach(([sectionName, sectionValue]) => {
			chain = chain.then(() => {
				if (!this.inventory.get(`component.components.${sectionName}`))
				{
					return ComponentPerk._loadComponent(this, sectionName, sectionValue);
				}
			});
		});

		return chain;

	}

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	static get info()
	{

		return {
			"section":		"component",
			"order":		400,
		};

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static globalInit()
	{

		// Add skills to Component
		BITSMIST.v1.Component.skills.set("component.materializeAll", function(...args) { return ComponentPerk._loadTags(...args); });
		BITSMIST.v1.Component.skills.set("component.materialize", function(...args) { return ComponentPerk._loadComponent(...args); });
		BITSMIST.v1.Component.skills.set("component.summon", function(...args) { return ComponentPerk._loadClass(...args); });

	}

	// -------------------------------------------------------------------------

	static init(component, options)
	{

		// Add inventory items to component;
		component.inventory.set("component.components", {});

		// Add event handlers to component
		this._addPerkHandler(component, "doOrganize", ComponentPerk.ComponentPerk_onDoOrganize);

	}

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
	 * Get settings from element's attribute.
	 *
	 * @param	{Component}		component			Component.
	 */
	static __loadAttrSettings(element)
	{

		let settings = {
			"setting": {}
		};

		// Class name
		if (element.hasAttribute("bm-classname"))
		{
			settings["setting"]["className"] = element.getAttribute("bm-classname");
		}

		// Split component
		if (element.hasAttribute("bm-split"))
		{
			settings["system"]["splitClass"] = true;
		}

		// Path
		if (element.hasAttribute("bm-path"))
		{
			settings["setting"]["path"] = element.getAttribute("bm-path");
		}

		// File name
		if (element.hasAttribute("bm-filename"))
		{
			settings["setting"]["fileName"] = element.getAttribute("bm-filename");
		}

		// Morphing
		if (element.hasAttribute("bm-automorph"))
		{
			settings["setting"]["autoMorph"] = ( element.getAttribute("bm-automorph") ? element.getAttribute("bm-automorph") : true );
		}
		if (element.hasAttribute("bm-htmlref"))
		{
			settings["setting"]["autoMorph"] = ( element.getAttribute("bm-htmlref") ? element.getAttribute("bm-htmlref") : true );
		}

		// Auto loading
		if (element.hasAttribute("bm-autoload"))
		{
			settings["setting"]["autoLoad"] = ( element.getAttribute("bm-autoload") ? element.getAttribute("bm-autoload") : true );
		}
		if (element.hasAttribute("bm-classref"))
		{
			settings["setting"]["autoLoad"] = ( element.getAttribute("bm-classref") ? element.getAttribute("bm-classref") : true );
		}

		return settings;

	}

	// -------------------------------------------------------------------------

	/**
	 * Check if the component has the external class file.
	 *
	 * @param	{String}		tagName				Tag name.
	 * @param	{Object}		settings			Component settings.
	 *
	 * @return  {Boolean}		True if the component has the external class file.
	 */
	static __hasExternalClass(tagName, settings)
	{

		let ret = false;

		// Check if the tag is already defined
		if (!customElements.get(tagName))
		{
			if ((Util.safeGet(settings, "setting.classRef"))
				|| (Util.safeGet(settings, "setting.htmlRef"))
				|| (Util.safeGet(settings, "setting.autoLoad"))
				|| (Util.safeGet(settings, "setting.autoMorph")))
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
	static __loadExternalClass(tagName, settings)
	{

		let loadOptions;
		let classRef = Util.safeGet(settings, "setting.autoLoad");

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
			settings["setting"] = settings["setting"] || {};
			settings["setting"]["path"] = url.path;
			settings["setting"]["fileName"] = url.filenameWithoutExtension;
			if (url.extension === "html")
			{
				settings["setting"]["autoMorph"] = ( settings["setting"]["autoMorph"] ? settings["setting"]["autoMorph"] : true );
			}
		}

		return ComponentPerk._loadClass(tagName, settings, loadOptions);

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

		console.debug(`ComponentPerk.__autoLoadClass(): Auto loading component. className=${className}, fileName=${fileName}, path=${path}`);

		let promise;

		if (ComponentPerk.__isLoadedClass(className))
		{
			// Already loaded
			console.debug(`ComponentPerk.__autoLoadClass(): Component Already exists. className=${className}`);
			BITSMIST.v1.Origin.report.set(`classes.${className}.state`, "loaded");
			promise = Promise.resolve();
		}
		else if (BITSMIST.v1.Origin.report.get(`classes.${className}`, {})["state"] === "loading")
		{
			// Already loading
			console.debug(`ComponentPerk.__autoLoadClass(): Component Already loading. className=${className}`);
			promise = BITSMIST.v1.Origin.report.get(`classes.${className}.promise`);
		}
		else
		{
			// Not loaded
			BITSMIST.v1.Origin.report.set(`classes.${className}.state`, "loading");
			promise = AjaxUtil.loadClass(Util.concatPath([path, fileName]), loadOptions).then(() => {
				BITSMIST.v1.Origin.report.set(`classes.${className}`, {"state":"loaded", "promise":null});
			});
			BITSMIST.v1.Origin.report.set(`classes.${className}.promise`, promise);
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
		if (Util.safeGet(settings, "setting.parentNode"))
		{
			root = document.querySelector(Util.safeGet(settings, "setting.parentNode"));
		}
		else
		{
			root = component;
		}

		Util.assert(root, `ComponentPerk.__insertTag(): Root node does not exist. name=${component.tagName}, tagName=${tagName}, Ntrentode=${Util.safeGet(settings, "setting.parentNode")}`, ReferenceError);

		// Build tag
		let tag = ( Util.safeGet(settings, "setting.tag") ? Util.safeGet(settings, "setting.tag") : `<${tagName}></${tagName}>` );

		// Insert tag
		if (Util.safeGet(settings, "setting.replaceParent"))
		{
			root.outerHTML = tag;
			addedComponent = root;
		}
		else
		{
			let position = Util.safeGet(settings, "setting.adjacentPosition", "afterbegin");
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

		return StatePerk.waitFor(waitList, {"waiter":rootNode});

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

		if (BITSMIST.v1.Origin.report.get(`classes.${className}`, {})["state"] === "loaded")
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
