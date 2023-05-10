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
	 * Load the class.
	 *
	 * @param	{String}		tagName				Tag name.
	 * @param	{Object}		settings			Component settings.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _loadClass(tagName, settings)
	{

		console.debug(`ComponentPerk._loadClass(): Loading class. tagName=${tagName}`);

		// Override settings if URL is specified
		let classRef = Util.safeGet(settings, "setting.autoLoad");
		if (classRef && classRef !== true)
		{
			settings["system"] = settings["system"] || {};
			settings["system"]["appBaseUrl"] = "";
			settings["system"]["componentPath"] = "";
			settings["system"]["templatePath"] = "";
			settings["setting"] = settings["setting"] || {};
			let url = Util.parseURL(classRef);
			settings["setting"]["path"] = url.path;
			settings["setting"]["fileName"] = url.filenameWithoutExtension;
			if (url.extension === "html")
			{
				settings["setting"]["autoMorph"] = ( settings["setting"]["autoMorph"] ? settings["setting"]["autoMorph"] : true );
			}
		}

		tagName = tagName.toLowerCase();
		let className = Util.safeGet(settings, "setting.className", Util.getClassNameFromTagName(tagName));
		let baseClassName = Util.safeGet(settings, "setting.autoMorph", className );
		baseClassName = ( baseClassName === true ? "BITSMIST.v1.Component" : baseClassName );

		// Load the class if needed
		let promise = Promise.resolve();
		if (ComponentPerk.__hasExternalClass(tagName, baseClassName, settings))
		{
			if (BITSMIST.v1.Origin.report.get(`classes.${baseClassName}`, {})["state"] === "loading")
			{
				// Already loading
				console.debug(`ComponentPerk._loadClass(): Class Already loading. className=${className}, baseClassName=${baseClassName}`);
				promise = BITSMIST.v1.Origin.report.get(`classes.${baseClassName}.promise`);
			}
			else
			{
				// Need loading
				console.debug(`ClassPerk._loadClass(): Loading class. className=${className}, baseClassName=${baseClassName}`);
				BITSMIST.v1.Origin.report.set(`classes.${baseClassName}.state`, "loading");

				let options = {
					"splitClass": Util.safeGet(settings, "setting.splitClass", BITSMIST.v1.settings.get("system.splitClass", false)),
				};
				promise = AjaxUtil.loadClass(ComponentPerk.__getClassURL(tagName, settings), options).then(() => {
					BITSMIST.v1.Origin.report.set(`classes.${baseClassName}`, {"state":"loaded", "promise":null});
				});
				BITSMIST.v1.Origin.report.set(`classes.${baseClassName}.promise`, promise);
			}
		}

		return promise.then(() => {
			// Morph
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

		return promise;

	}

	// -------------------------------------------------------------------------

	/**
	 * Load the component and add to parent component.
	 *
	 * @param	{Component}		component			Parent component.
	 * @param	{String}		tagName				Component tag name.
	 * @param	{Object}		settings			Settings for the component.
	 * @param	{Object}		options				Load Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _loadComponent(component, tagName, settings, options)
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
			return ComponentPerk._loadClass(tagName, settings);
		}).then(() => {
			// Insert tag
			addedComponent = ComponentPerk.__insertTag(component, tagName, settings);
			component.inventory.set(`component.components.${tagName}`, addedComponent);
		}).then(() => {
			// Wait for the added component to be ready
			let sync = Util.safeGet(options, "syncOnAdd", Util.safeGet(settings, "setting.syncOnAdd"));
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

		// Load tags that has bm-autoload/bm-classref/bm-automorph attribute
		let targets = Util.scopedSelectorAll(rootNode, "[bm-autoload]:not([bm-autoloading]):not([bm-powered]),[bm-automorph]:not([bm-autoloading]):not([bm-powered]),[bm-classref]:not([bm-autoloading]):not([bm-powered]),[bm-htmlref]:not([bm-autoloading]):not([bm-powered])");
		targets.forEach((element) => {
			// Get settings from attributes
			let settings = this.__loadAttrSettings(element);

			element.setAttribute("bm-autoloading", "");
			element._injectSettings = function(curSettings){
				return Util.deepMerge(curSettings, settings);
			};

			// Load the class
			promises.push(ComponentPerk._loadClass(element.tagName, settings).then(() => {
				element.removeAttribute("bm-autoloading");
			}));
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
	//  Event Handlers
	// -------------------------------------------------------------------------

	static ComponentPerk_onDoApplySettings(sender, e, ex)
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
		this._addPerkHandler(component, "doApplySettings", ComponentPerk.ComponentPerk_onDoApplySettings);

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
	 * @param	{String}		className			Class name.
	 * @param	{Object}		settings			Component settings.
	 *
	 * @return  {Boolean}		True if the component has the external class file.
	 */
	static __hasExternalClass(tagName, className, settings)
	{

		let ret = false;

		if ((Util.safeGet(settings, "setting.classRef"))
				|| (Util.safeGet(settings, "setting.htmlRef"))
				|| (Util.safeGet(settings, "setting.autoLoad"))
				|| (Util.safeGet(settings, "setting.autoMorph")))
		{
			ret = true;

			if (customElements.get(tagName))
			{
				ret = false;
			}
			else if (BITSMIST.v1.Origin.report.get(`classes.${className}`, {})["state"] === "loaded")
			{
				ret = false;
			}
			else if (ClassUtil.getClass(className))
			{
				ret = false;
			}
		}

		return ret;

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
	 * Wait for components under the specified root node to be ready.
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
	 * Return URL to Class file.
	 *
	 * @param	{String}		tagName				Tag name.
	 * @param	{Object}		settings			Component settings.
	 *
	 * @return  {String}		URL.
	 */
	static __getClassURL(tagName, settings)
	{

		let path = Util.concatPath([
			Util.safeGet(settings, "system.appBaseUrl", BITSMIST.v1.settings.get("system.appBaseUrl", "")),
			Util.safeGet(settings, "system.componentPath", BITSMIST.v1.settings.get("system.componentPath", "")),
			Util.safeGet(settings, "setting.path", ""),
		]);
		let fileName = Util.safeGet(settings, "setting.fileName", tagName);
		let query = Util.safeGet(settings, "setting.query");

		return Util.concatPath([path, fileName]) + (query ? `?${query}` : "");

	}

}
