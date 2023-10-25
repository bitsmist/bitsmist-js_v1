// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/main/LICENSE
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

	static globalInit()
	{

		// Init vars
		UnitPerk._classInfo = {};

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

		let settings = this.__loadAttrSettings(unit);
		unit.use("skill", "setting.merge", settings);

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
					let parentUnit = Util.safeGet(sectionValue, "unit.options.parentUnit");
					let targetUnit = ( parentUnit ? this.use("skill", "basic.locate", parentUnit) : this );
					return targetUnit.use("spell", "unit.materialize", sectionName, sectionValue);
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

		tagName = tagName.toLowerCase();
		let className = Util.safeGet(settings, "unit.options.className", Util.getClassNameFromTagName(tagName));
		let baseClassName = Util.safeGet(settings, "unit.options.autoMorph", className );
		baseClassName = ( baseClassName === true ? "BITSMIST.v1.Unit" : baseClassName );
		//baseClassName = ( baseClassName === true ? "Unit" : baseClassName );

		// Load the class if needed
		let promise = Promise.resolve();
		if (UnitPerk.__hasExternalClass(tagName, baseClassName, settings))
		{
			if (UnitPerk._classInfo[baseClassName] && UnitPerk._classInfo[baseClassName]["status"] === "loading")
			{
				// Already loading
				console.debug(`UnitPerk._loadClass(): Class Already loading. className=${className}, baseClassName=${baseClassName}`);
				promise = UnitPerk._classInfo[baseClassName].promise;
			}
			else
			{
				// Need loading
				console.debug(`ClassPerk._loadClass(): Loading class. className=${className}, baseClassName=${baseClassName}`);
				UnitPerk._classInfo[baseClassName] = {"status":"loading"};

				promise = AjaxUtil.loadClass(UnitPerk.__getClassURL(tagName, settings)).then(() => {
					UnitPerk._classInfo[baseClassName] = {"status":"loaded"};
				});
				UnitPerk._classInfo[baseClassName].promise = promise;
			}
		}

		return promise.then(() => {
			if (baseClassName !== className)
			{
				// Morph
				let superClass = ClassUtil.getClass(baseClassName);
				let classDef = ClassUtil.newUnit(className, settings, superClass, tagName);
				UnitPerk._classInfo[className] = {"status":"loaded"};
			}
		});

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
			tagName = tag.match(/([\w-]+)\s+\w+.*?>/)[1];
		}

		let addedUnit;
		return UnitPerk._loadClass(tagName, settings).then(() => {
			// Insert tag
			addedUnit = UnitPerk.__insertTag(unit, tagName, settings);
			unit.set("inventory", `unit.units.${tagName}.object`, addedUnit);
		}).then(() => {
			// Wait for the added unit to be ready
			let sync = Util.safeGet(options, "syncOnAdd", Util.safeGet(settings, "unit.options.syncOnAdd"));
			if (sync)
			{
				return unit.use("spell", "status.wait", [{
					"uniqueId":	addedUnit.uniqueId,
					"status":	(sync === true ? "ready" : sync)
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
	 * Get settings from unit's attribute.
	 *
	 * @param	{Unit}			unit				Unit.
	 */
	static __loadAttrSettings(unit)
	{

		let settings = {
			"unit": {
				"options": {}
			}
		};

		// Class name
		if (unit.hasAttribute("bm-classname"))
		{
			settings["unit"]["options"]["className"] = unit.getAttribute("bm-classname");
		}

		// Split  class
		if (unit.hasAttribute("bm-splitclass"))
		{
			let splitClass = unit.getAttribute("bm-splitclass") || true;
			if (splitClass === "false")
			{
				splitClass = false;
			}
			settings["unit"]["options"]["splitClass"] = splitClass;
		}

		// Path
		if (unit.hasAttribute("bm-path"))
		{
			settings["unit"]["options"]["path"] = unit.getAttribute("bm-path");
		}

		// File name
		if (unit.hasAttribute("bm-filename"))
		{
			settings["unit"]["options"]["fileName"] = unit.getAttribute("bm-filename");
		}

		// Morphing
		if (unit.hasAttribute("bm-automorph"))
		{
			settings["unit"]["options"]["autoMorph"] = ( unit.getAttribute("bm-automorph") ? unit.getAttribute("bm-automorph") : true );
		}
		if (unit.hasAttribute("bm-htmlref"))
		{
			settings["unit"]["options"]["autoMorph"] = ( unit.getAttribute("bm-htmlref") ? unit.getAttribute("bm-htmlref") : true );
		}

		// Auto loading
		if (unit.hasAttribute("bm-autoload"))
		{
			settings["unit"]["options"]["autoLoad"] = ( unit.getAttribute("bm-autoload") ? unit.getAttribute("bm-autoload") : true );
		}
		if (unit.hasAttribute("bm-classref"))
		{
			settings["unit"]["options"]["autoLoad"] = ( unit.getAttribute("bm-classref") ? unit.getAttribute("bm-classref") : true );
		}

		//return settings;
		return UnitPerk.__adjustSettings(unit, settings);

	}

	// -------------------------------------------------------------------------

	/**
	 * Adjust unit settings.
	 *
	 * @param	{Unit}			unit				Unit.
	 */
	static __adjustSettings(unit, settings)
	{

		let autoLoad = Util.safeGet(settings, "unit.options.autoLoad");
		if (typeof(autoLoad) === "string")
		{
			let url = URLUtil.parseURL(autoLoad);
			settings["unit"]["options"]["path"] = url.path;
			settings["unit"]["options"]["fileName"] = url.filenameWithoutExtension;

			if (url.extension === "html")
			{
				settings["unit"]["options"]["autoMorph"] = Util.safeGet(settings, "unit.options.autoMorph", true);
			}
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
			else if (UnitPerk._classInfo[className] && UnitPerk._classInfo[className]["status"] === "loaded")
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
			root = unit.use("skill", "basic.scan", Util.safeGet(settings, "unit.options.parentNode"));
		}
		else
		{
			root = unit.unitRoot;
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
			Util.safeGet(settings, "system.unit.options.path", BITSMIST.v1.Unit.get("setting", "system.unit.options.path", "")),
			Util.safeGet(settings, "unit.options.path", ""),
		]);
		let fileName = Util.safeGet(settings, "unit.options.fileName", tagName);
		let query = Util.safeGet(settings, "unit.options.query");

		return Util.concatPath([path, fileName]) + (query ? `?${query}` : "");

	}

}
