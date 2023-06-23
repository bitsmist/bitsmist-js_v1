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
import URLUtil from "../util/url-util.js";
import Util from "../util/util.js";

// =============================================================================
//	Component Perk Class
// =============================================================================

export default class ComponentPerk extends Perk
{

	// -------------------------------------------------------------------------
	//  Properties
	// -------------------------------------------------------------------------

	static get info()
	{

		return {
			"section":		"unit",
			"order":		400,
		};

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static
	{

		// Init vars
		this._classes = {}

	}

	// -------------------------------------------------------------------------

	static globalInit()
	{

		// Upgrade Component
		this.upgrade(BITSMIST.v1.Component, "skill", "unit.materializeAll", function(...args) { return ComponentPerk._loadTags(...args); });
		this.upgrade(BITSMIST.v1.Component, "skill", "unit.materialize", function(...args) { return ComponentPerk._loadComponent(...args); });
		this.upgrade(BITSMIST.v1.Component, "skill", "unit.summon", function(...args) { return ComponentPerk._loadClass(...args); });

	}

	// -------------------------------------------------------------------------

	static init(component, options)
	{

		// Upgrade component
		this.upgrade(component, "inventory", "unit.units", {});
		this.upgrade(component, "event", "doApplySettings", ComponentPerk.ComponentPerk_onDoApplySettings);

	}

	// -------------------------------------------------------------------------
	//  Event Handlers
	// -------------------------------------------------------------------------

	static ComponentPerk_onDoApplySettings(sender, e, ex)
	{

		let chain = Promise.resolve();

		Object.entries(Util.safeGet(e.detail, "settings.unit.units", {})).forEach(([sectionName, sectionValue]) => {
			chain = chain.then(() => {
				if (!this.get("inventory", `unit.units.${sectionName}.object`))
				{
					return ComponentPerk._loadComponent(this, sectionName, sectionValue);
				}
			});
		});

		return chain;

	}

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
		let classRef = Util.safeGet(settings, "unit.options.autoLoad");
		if (classRef && classRef !== true)
		{
			settings["system"] = settings["system"] || {};
			settings["system"]["appBaseURL"] = "";
			settings["system"]["componentPath"] = "";
			settings["system"]["skinPath"] = "";
			settings["unit"] = settings["unit"] || {};
			settings["unit"]["options"] = settings["unit"]["options"] || {};
			let url = URLUtil.parseURL(classRef);
			settings["unit"]["options"]["path"] = url.path;
			settings["unit"]["options"]["fileName"] = url.filenameWithoutExtension;
			if (url.extension === "html")
			{
				settings["unit"]["options"]["autoMorph"] = ( settings["unit"]["options"]["autoMorph"] ? settings["unit"]["options"]["autoMorph"] : true );
			}
		}

		tagName = tagName.toLowerCase();
		let className = Util.safeGet(settings, "unit.options.className", Util.getClassNameFromTagName(tagName));
		let baseClassName = Util.safeGet(settings, "unit.options.autoMorph", className );
		baseClassName = ( baseClassName === true ? "BITSMIST.v1.Component" : baseClassName );

		// Load the class if needed
		let promise = Promise.resolve();
		if (ComponentPerk.__hasExternalClass(tagName, baseClassName, settings))
		{
			if (this._classes[baseClassName] && this._classes[baseClassName]["state"] === "loading")
			{
				// Already loading
				console.debug(`ComponentPerk._loadClass(): Class Already loading. className=${className}, baseClassName=${baseClassName}`);
				promise = this._classes[baseClassName].promise;
			}
			else
			{
				// Need loading
				console.debug(`ClassPerk._loadClass(): Loading class. className=${className}, baseClassName=${baseClassName}`);
				this._classes[baseClassName] = {"state":"loading"};

				let options = {
					"splitClass": Util.safeGet(settings, "unit.options.splitClass", BITSMIST.v1.Component.get("settings", "system.splitClass", false)),
				};
				promise = AjaxUtil.loadClass(ComponentPerk.__getClassURL(tagName, settings), options).then(() => {
					this._classes[baseClassName] = {"state":"loaded"};
				});
				this._classes[baseClassName].promise = promise;
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
		if (component.get("inventory", `unit.units.${tagName}.object`))
		{
			console.debug(`ComponentPerk._loadComponent(): Already loaded. name=${component.tagName}, tagName=${tagName}`);
			return Promise.resolve(component.get("inventory", `unit.units.${tagName}.object`));
		}

		// Get the tag name from settings if specified
		let tag = Util.safeGet(settings, "unit.options.tag");
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
			component.set("inventory", `unit.units.${tagName}.object`, addedComponent);
		}).then(() => {
			// Wait for the added component to be ready
			let sync = Util.safeGet(options, "syncOnAdd", Util.safeGet(settings, "unit.options.syncOnAdd"));
			if (sync)
			{
				let state = (sync === true ? "ready" : sync);

				return component.use("skill", "state.wait", [{
					"id":		addedComponent.uniqueId,
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
			"unit": {
				"options": {}
			}
		};

		// Class name
		if (element.hasAttribute("bm-classname"))
		{
			settings["unit"]["options"]["className"] = element.getAttribute("bm-classname");
		}

		// Split component
		if (element.hasAttribute("bm-split"))
		{
			settings["unit"]["options"]["splitClass"] = true;
		}

		// Path
		if (element.hasAttribute("bm-path"))
		{
			settings["unit"]["options"]["path"] = element.getAttribute("bm-path");
		}

		// File name
		if (element.hasAttribute("bm-filename"))
		{
			settings["unit"]["options"]["fileName"] = element.getAttribute("bm-filename");
		}

		// Morphing
		if (element.hasAttribute("bm-automorph"))
		{
			settings["unit"]["options"]["autoMorph"] = ( element.getAttribute("bm-automorph") ? element.getAttribute("bm-automorph") : true );
		}
		if (element.hasAttribute("bm-htmlref"))
		{
			settings["unit"]["options"]["autoMorph"] = ( element.getAttribute("bm-htmlref") ? element.getAttribute("bm-htmlref") : true );
		}

		// Auto loading
		if (element.hasAttribute("bm-autoload"))
		{
			settings["unit"]["options"]["autoLoad"] = ( element.getAttribute("bm-autoload") ? element.getAttribute("bm-autoload") : true );
		}
		if (element.hasAttribute("bm-classref"))
		{
			settings["unit"]["options"]["autoLoad"] = ( element.getAttribute("bm-classref") ? element.getAttribute("bm-classref") : true );
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

		if ((Util.safeGet(settings, "unit.options.classRef"))
				|| (Util.safeGet(settings, "unit.options.htmlRef"))
				|| (Util.safeGet(settings, "unit.options.autoLoad"))
				|| (Util.safeGet(settings, "unit.options.autoMorph")))
		{
			ret = true;

			if (customElements.get(tagName))
			{
				ret = false;
			}
			else if (this._classes[className] && this._classes[className]["state"] === "loaded")
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
		if (Util.safeGet(settings, "unit.options.parentNode"))
		{
			root = document.querySelector(Util.safeGet(settings, "unit.options.parentNode"));
		}
		else
		{
			root = component;
		}

		Util.assert(root, `ComponentPerk.__insertTag(): Root node does not exist. name=${component.tagName}, tagName=${tagName}, parentNode=${Util.safeGet(settings, "unit.options.parentNode")}`, ReferenceError);

		// Build tag
		let tag = ( Util.safeGet(settings, "unit.options.tag") ? Util.safeGet(settings, "unit.options.tag") : `<${tagName}></${tagName}>` );

		// Insert tag
		if (Util.safeGet(settings, "unit.options.replaceParent"))
		{
			root.outerHTML = tag;
			addedComponent = root;
		}
		else
		{
			let position = Util.safeGet(settings, "unit.options.adjacentPosition", "afterbegin");
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
			Util.safeGet(settings, "system.appBaseURL", BITSMIST.v1.Component.get("settings", "system.appBaseURL", "")),
			Util.safeGet(settings, "system.componentPath", BITSMIST.v1.Component.get("settings", "system.componentPath", "")),
			Util.safeGet(settings, "unit.options.path", ""),
		]);
		let fileName = Util.safeGet(settings, "unit.options.fileName", tagName);
		let query = Util.safeGet(settings, "unit.options.query");

		return Util.concatPath([path, fileName]) + (query ? `?${query}` : "");

	}

}
