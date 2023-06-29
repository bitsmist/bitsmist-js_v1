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
import StatusPerk from "./status-perk.js";
import Store from "../store/store.js";
import URLUtil from "../util/url-util.js";
import Util from "../util/util.js";

// =============================================================================
//	Unit Perk Class
// =============================================================================

export default class UnitPerk extends Perk
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

		// Upgrade Unit
		this.upgrade(BITSMIST.v1.Unit, "spell", "unit.materializeAll", function(...args) { return UnitPerk._loadTags(...args); });
		this.upgrade(BITSMIST.v1.Unit, "spell", "unit.materialize", function(...args) { return UnitPerk._loadUnit(...args); });
		this.upgrade(BITSMIST.v1.Unit, "spell", "unit.summon", function(...args) { return UnitPerk._loadClass(...args); });

	}

	// -------------------------------------------------------------------------

	static init(unit, options)
	{

		// Upgrade unit
		this.upgrade(unit, "inventory", "unit.units", {});
		this.upgrade(unit, "event", "doApplySettings", UnitPerk.UnitPerk_onDoApplySettings);

	}

	// -------------------------------------------------------------------------
	//  Event Handlers
	// -------------------------------------------------------------------------

	static UnitPerk_onDoApplySettings(sender, e, ex)
	{

		let chain = Promise.resolve();

		Object.entries(Util.safeGet(e.detail, "settings.unit.units", {})).forEach(([sectionName, sectionValue]) => {
			chain = chain.then(() => {
				if (!this.get("inventory", `unit.units.${sectionName}.object`))
				{
					return UnitPerk._loadUnit(this, sectionName, sectionValue);
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
	 * @param	{Object}		settings			Unit settings.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _loadClass(tagName, settings)
	{

		console.debug(`UnitPerk._loadClass(): Loading class. tagName=${tagName}`);

		// Override settings if URL is specified
		let classRef = Util.safeGet(settings, "unit.options.autoLoad");
		if (classRef && classRef !== true)
		{
			settings["system"] = settings["system"] || {};
			settings["system"]["appBaseURL"] = "";
			settings["system"]["unitPath"] = "";
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
		baseClassName = ( baseClassName === true ? "BITSMIST.v1.Unit" : baseClassName );

		// Load the class if needed
		let promise = Promise.resolve();
		if (UnitPerk.__hasExternalClass(tagName, baseClassName, settings))
		{
			if (this._classes[baseClassName] && this._classes[baseClassName]["status"] === "loading")
			{
				// Already loading
				console.debug(`UnitPerk._loadClass(): Class Already loading. className=${className}, baseClassName=${baseClassName}`);
				promise = this._classes[baseClassName].promise;
			}
			else
			{
				// Need loading
				console.debug(`ClassPerk._loadClass(): Loading class. className=${className}, baseClassName=${baseClassName}`);
				this._classes[baseClassName] = {"status":"loading"};

				let options = {
					"splitClass": Util.safeGet(settings, "unit.options.splitClass", BITSMIST.v1.Unit.get("settings", "system.splitClass", false)),
				};
				promise = AjaxUtil.loadClass(UnitPerk.__getClassURL(tagName, settings), options).then(() => {
					this._classes[baseClassName] = {"status":"loaded"};
				});
				this._classes[baseClassName].promise = promise;
			}
		}

		return promise.then(() => {
			// Morph
			if (baseClassName !== className)
			{
				let superClass = ClassUtil.getClass(baseClassName);
				ClassUtil.newUnit(className, settings, superClass, tagName);
			}

			// Define the tag
			if (!customElements.get(tagName))
			{
				let classDef = ClassUtil.getClass(className);
				Util.assert(classDef, `UnitPerk_loadClass(): Class does not exists. tagName=${tagName}, className=${className}`);

				customElements.define(tagName, classDef);
			}
		});

		return promise;

	}

	// -------------------------------------------------------------------------

	/**
	 * Load the unit and add to parent unit.
	 *
	 * @param	{Unit}			unit				Parent unit.
	 * @param	{String}		tagName				Unit tag name.
	 * @param	{Object}		settings			Settings for the unit.
	 * @param	{Object}		options				Load Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _loadUnit(unit, tagName, settings, options)
	{

		console.debug(`UnitPerk._loadUnit(): Adding the unit. name=${unit.tagName}, tagName=${tagName}`);

		// Already loaded
		if (unit.get("inventory", `unit.units.${tagName}.object`))
		{
			console.debug(`UnitPerk._loadUnit(): Already loaded. name=${unit.tagName}, tagName=${tagName}`);
			return Promise.resolve(unit.get("inventory", `unit.units.${tagName}.object`));
		}

		// Get the tag name from settings if specified
		let tag = Util.safeGet(settings, "unit.options.tag");
		if (tag)
		{
			let pattern = /([\w-]+)\s+\w+.*?>/;
			tagName = tag.match(pattern)[1];
		}

		let addedUnit;
		return Promise.resolve().then(() => {
			return UnitPerk._loadClass(tagName, settings);
		}).then(() => {
			// Insert tag
			addedUnit = UnitPerk.__insertTag(unit, tagName, settings);
			unit.set("inventory", `unit.units.${tagName}.object`, addedUnit);
		}).then(() => {
			// Wait for the added unit to be ready
			let sync = Util.safeGet(options, "syncOnAdd", Util.safeGet(settings, "unit.options.syncOnAdd"));
			if (sync)
			{
				let status = (sync === true ? "ready" : sync);

				return unit.use("spell", "status.wait", [{
					"id":		addedUnit.uniqueId,
					"status":	status
				}]);
			}
		}).then(() => {
			return addedUnit;
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Load scripts for tags that has bm-autoload/bm-automorph attribute.
	 *
	 * @param	{Unit}			unit				Unit. Nullable.
	 * @param	{HTMLElement}	rootNode			Target node.
	 * @param	{Object}		options				Load Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _loadTags(unit, rootNode, options)
	{

		console.debug(`UnitPerk._loadTags(): Loading tags. rootNode=${rootNode.tagName}`);

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
			promises.push(UnitPerk._loadClass(element.tagName, settings).then(() => {
				element.removeAttribute("bm-autoloading");
			}));
		});

		return Promise.all(promises).then(() => {
			let waitFor = Util.safeGet(options, "waitForTags");
			if (waitFor)
			{
				return UnitPerk.__waitForChildren(rootNode);
			}
		});

	}

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
	 * Get settings from element's attribute.
	 *
	 * @param	{Unit}			unit				Unit.
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

		// Split  class
		if (element.hasAttribute("bm-splitclass"))
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
	 * Check if the unit has the external class file.
	 *
	 * @param	{String}		tagName				Tag name.
	 * @param	{String}		className			Class name.
	 * @param	{Object}		settings			Unit settings.
	 *
	 * @return  {Boolean}		True if the unit has the external class file.
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
			else if (this._classes[className] && this._classes[className]["status"] === "loaded")
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
	 * Insert the tag and return the inserted unit.
	 *
	 * @param	{String}		tagName				Tagname.
	 * @param	{Object}		settings			Unit settings.
	 *
	 * @return  {Unit}		Unit.
	 */
	static __insertTag(unit, tagName, settings)
	{

		let addedUnit;
		let root;

		// Check root node
		if (Util.safeGet(settings, "unit.options.parentNode"))
		{
			root = document.querySelector(Util.safeGet(settings, "unit.options.parentNode"));
		}
		else
		{
			root = unit;
		}

		Util.assert(root, `UnitPerk.__insertTag(): Root node does not exist. name=${unit.tagName}, tagName=${tagName}, parentNode=${Util.safeGet(settings, "unit.options.parentNode")}`, ReferenceError);

		// Build tag
		let tag = ( Util.safeGet(settings, "unit.options.tag") ? Util.safeGet(settings, "unit.options.tag") : `<${tagName}></${tagName}>` );

		// Insert tag
		if (Util.safeGet(settings, "unit.options.replaceParent"))
		{
			root.outerHTML = tag;
			addedUnit = root;
		}
		else
		{
			let position = Util.safeGet(settings, "unit.options.adjacentPosition", "afterbegin");
			root.insertAdjacentHTML(position, tag);

			// Get new instance
			switch (position)
			{
			case "beforebegin":
				addedUnit = root.previousSibling;
				break;
			case "afterbegin":
				addedUnit = root.children[0];
				break;
			case "beforeend":
				addedUnit = root.lastChild;
				break;
			case "afterend":
				addedUnit = root.nextSibling;
				break;
			}
		}

		// Inject settings to added unit
		addedUnit._injectSettings = function(curSettings){
			return Util.deepMerge(curSettings, settings);
		};

		return addedUnit;

	}

	// -------------------------------------------------------------------------

	/**
	 * Wait for units under the specified root node to be ready.
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
				let waitItem = {"object":element, "status":"ready"};
				waitList.push(waitItem);
			}
		});

		return StatusPerk.waitFor(waitList, {"waiter":rootNode});

	}

	// -------------------------------------------------------------------------

	/**
	 * Return URL to Class file.
	 *
	 * @param	{String}		tagName				Tag name.
	 * @param	{Object}		settings			Unit settings.
	 *
	 * @return  {String}		URL.
	 */
	static __getClassURL(tagName, settings)
	{

		let path = Util.concatPath([
			Util.safeGet(settings, "system.appBaseURL", BITSMIST.v1.Unit.get("settings", "system.appBaseURL", "")),
			Util.safeGet(settings, "system.unitPath", BITSMIST.v1.Unit.get("settings", "system.unitPath", "")),
			Util.safeGet(settings, "unit.options.path", ""),
		]);
		let fileName = Util.safeGet(settings, "unit.options.fileName", tagName);
		let query = Util.safeGet(settings, "unit.options.query");

		return Util.concatPath([path, fileName]) + (query ? `?${query}` : "");

	}

}
