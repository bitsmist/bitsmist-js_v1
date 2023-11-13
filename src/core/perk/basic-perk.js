// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/main/LICENSE
 */
// =============================================================================

import ChainableStore from "../store/chainable-store.js";
import Perk from "./perk.js";
import Store from "../store/store.js";
import Unit from "../unit/unit.js";
import URLUtil from "../util/url-util.js";
import Util from "../util/util.js";

// =============================================================================
//	Basic Perk Class
// =============================================================================

export default class BasicPerk extends Perk
{

	// -------------------------------------------------------------------------
	//  Private Variables
	// -------------------------------------------------------------------------

	static #__unitInfo = {};
	static #__indexes = {
		"tagName":			{},
		"className":		{},
		"id":				{},
	};
	static #__info = {
		"sectionName":		"basic",
		"order":			0,
	};
	static #__skills = {
		"scan":				BasicPerk.#_scan,
		"scanAll":			BasicPerk.#_scanAll,
		"locate":			BasicPerk.#_locate,
		"locateAll":		BasicPerk.#_locateAll,
	};
	static #__spells = {
		"start":			BasicPerk.#_start,
		"stop":				BasicPerk.#_stop,
		"transform":		BasicPerk.#_transform,
		"setup":			BasicPerk.#_setup,
		"refresh":			BasicPerk.#_refresh,
		"fetch":			BasicPerk.#_fetch,
		"fill":				BasicPerk.#_fill,
		"clear":			BasicPerk.#_clear,
	};

	// -------------------------------------------------------------------------
	//  Properties
	// -------------------------------------------------------------------------

	static get info()
	{

		return BasicPerk.#__info;

	}

	// -------------------------------------------------------------------------

	static get skills()
	{

		return BasicPerk.#__skills;

	}

	// -------------------------------------------------------------------------

	static get spells()
	{

		return BasicPerk.#__spells;

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static globalInit()
	{

		// Upgrade Unit
		Unit.upgrade("asset", "inventory", new ChainableStore());
		Unit.upgrade("callback", "initializeCallback", BasicPerk.#_initializeHandler.bind(BasicPerk));
		Unit.upgrade("callback", "connectedCallback", BasicPerk.#_connectedHandler.bind(BasicPerk));
		Unit.upgrade("callback", "disconnectedCallback", BasicPerk.#_disconnectedHandler.bind(BasicPerk));
		Unit.upgrade("callback", "adoptedCallback", BasicPerk.#_connectedHandler.bind(BasicPerk));
		Unit.upgrade("callback", "attributeChangedCallback", BasicPerk.#_attributeChangedHandler.bind(BasicPerk));
		Unit.upgrade("method", "use", BasicPerk.#_use);
		Unit.upgrade("method", "cast", BasicPerk.#_cast);

		// Create a promise that resolves when document is ready
		Unit.set("inventory", "promise.documentReady", new Promise((resolve, reject) => {
			if ((document.readyState === "interactive" || document.readyState === "complete"))
			{
				Unit.set("inventory", "basic.unitRoot", document.body);
				resolve();
			}
			else
			{
				document.addEventListener("DOMContentLoaded", () => {
					Unit.set("inventory", "basic.unitRoot", document.body);
					resolve();
				});
			}
		}));

	}

	// -------------------------------------------------------------------------
	//  Callbacks (Unit)
	// -------------------------------------------------------------------------

	/**
	 * Initialize callback handler.
	 */
	static #_initializeHandler(unit)
	{

		// Register unit
		BasicPerk.#__register(unit);

		// Upgrade unit
		unit.upgrade("asset", "perk", {});
		unit.upgrade("asset", "inventory", new ChainableStore({"chain":Unit.assets["inventory"]}));
		unit.upgrade("method", "use", BasicPerk.#_use);
		unit.upgrade("method", "cast", BasicPerk.#_cast);
		unit.upgrade("inventory", "basic.unitRoot", unit);

		// Attach default perks
		let chain = Promise.resolve();
		["BasicPerk","Perk","SettingPerk","UnitPerk","StatusPerk","EventPerk", "SkinPerk", "StylePerk"].forEach((perkName) => {
			chain = chain.then(() => {
				return unit.cast("perk.attach", Perk.getPerk(perkName));
			});
		});

		return chain.then(() => {
			return unit.cast("basic.start");
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Connected callback handler.
	 */
	static #_connectedHandler(unit)
	{
	}

	// -------------------------------------------------------------------------

	/**
	 * Disconnected callback handler.
	 */
	static #_disconnectedHandler(unit)
	{

		return unit.cast("basic.stop");

	}

	// -------------------------------------------------------------------------

	/**
	 * Adopted callback handler.
	 */
	static #_adoptedHandler(unit)
	{

		return unit.cast("event.trigger", "afterAdopt");

	}

	// -------------------------------------------------------------------------

	/**
	 * Attribute changed callback handler.
	 */
	static #_attributeChangedHandler(unit, name, oldValue, newValue)
	{

		return unit.cast("event.trigger", "afterAttributeChange", {"name":name, "oldValue":oldValue, "newValue":newValue});

	}

	// -------------------------------------------------------------------------
	//  Methods (Unit)
	// -------------------------------------------------------------------------

	/**
	 * Call the aynchronous function.
	 *
	 * @param	{String}		assetName			Asset name.
	 * @param	{String}		key					Key.
	 * @param	{*}				...args				Arguments.
	 */
	static #_cast(key, ...args)
	{

		let pos = key.indexOf(".");
		let sectionName = key.slice(0, pos);
		let spellName = key.slice(pos + 1);

		let func = Perk.getPerkFromSectionName(sectionName).spells[spellName];
		Util.assert(typeof(func) === "function", () => `Spell is not available. spellName=${key}`);

		return func.call(this, this, ...args);

	}

	// -------------------------------------------------------------------------

	/**
	 * Call the synchronous function.
	 *
	 * @param	{String}		assetName			Asset name.
	 * @param	{String}		key					Key.
	 * @param	{*}				...args				Arguments.
	 */
	static #_use(key, ...args)
	{

		let pos = key.indexOf(".");
		let func = Perk.getPerkFromSectionName(key.slice(0, pos)).skills[key.slice(pos + 1)];

		Util.assert(typeof(func) === "function", () => `Skill is not available. skillName=${key}`);

		return func.call(this, this, ...args);

	}

	// -------------------------------------------------------------------------
	//  Skills (Unit)
	// -------------------------------------------------------------------------

	/**
	 * Get elements inside the unit speicified by the query.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{String}		query				Query.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {NodeList}		Elements.
	 */
	static #_scanAll(unit, query, options)
	{

		return Util.scopedSelectorAll(unit, query, options);

	}

	// -------------------------------------------------------------------------

	/**
	 * Get the first element inside the unit speicified by the query.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{String}		query				Query.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {HTMLElement}	Element.
	 */
	static #_scan(unit, query, options)
	{

		let nodes = Util.scopedSelectorAll(unit, query, options);

		return ( nodes ? nodes[0] : null );

	}

	// -------------------------------------------------------------------------

	/**
	 * Locate all the unit.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{Object/String/Unit}	target		Target to locate.
	 *
	 * @return  {HTMLElement}	Target element.
	 */
	static #_locateAll(unit, target)
	{

		if (typeof(target) === "object")
		{
			if ("selector" in target)
			{
				return document.querySelectorAll(target["selector"]);
			}
			else if ("scan" in target)
			{
				let nodes = unit.use("basic.scan", target["scan"]);
				return unit.use("basic.scanAll", target["scan"]);
			}
			else if ("uniqueId" in target)
			{
				return [BasicPerk.#__unitInfo[target["uniqueId"]].object];
			}
			else if ("tagName" in target)
			{
				return BasicPerk.#__indexes["tagName"][target["tagName"].toUpperCase()];
			}
			else if ("object" in target)
			{
				return [target["object"]];
			}
			else if ("id" in target)
			{
				return BasicPerk.#__indexes["id"][target["id"]];
			}
			else if ("className" in target)
			{
				return BasicPerk.#__indexes["className"][target["className"]];
			}
		}
		else if (typeof(target) === "string")
		{
			return BasicPerk.#__indexes["tagName"][target.toUpperCase()];
		}
		else
		{
			return [target];
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Locate the unit.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{Object/String/Unit}	target		Target to locate.
	 *
	 * @return  {HTMLElement}	Target element.
	 */
	static #_locate(unit, target)
	{

		let units = BasicPerk.#_locateAll(unit, target);

		if (units)
		{
			return units[0];
		}

	}

	// -------------------------------------------------------------------------
	//  Spells (Unit)
	// -------------------------------------------------------------------------

	/**
	 * Start unit.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static async #_start(unit, options)
	{

		console.debug(`BasicPerk._start(): Starting unit. name=${unit.tagName}, id=${unit.id}, uniqueId=${unit.uniqueId}`);
		await unit.cast("setting.apply", {"settings":unit.assets["setting"].items});
		await unit.cast("event.trigger", "beforeStart");
		unit.use("status.change", "starting");
		if (unit.get("setting", "basic.options.autoTransform", true))
		{
			await unit.cast("basic.transform", {"skinName": "default", "styleName": "default"});
		}
		await unit.cast("event.trigger", "doStart");
		if (unit.get("setting", "basic.options.autoRefresh", true))
		{
			await unit.cast("basic.refresh");
		}
		console.debug(`BasicPerk._start(): Started unit. name=${unit.tagName}, id=${unit.id}, uniqueId=${unit.uniqueId}`);
		unit.use("status.change", "started");
		await unit.cast("event.trigger", "afterStart");
		console.debug(`BasicPerk._start(): Unit is ready. name=${unit.tagName}, id=${unit.id}, uniqueId=${unit.uniqueId}`);
		unit.use("status.change", "ready");
		await unit.cast("event.trigger", "afterReady");

	}

	// -------------------------------------------------------------------------

	/**
	 * Stop unit.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{Object}		options				Options for the unit.
	 *
	 * @return  {Promise}		Promise.
	 */
	static async #_stop(unit, options)
	{

		options = options || {};

		console.debug(`BasicPerk._stop(): Stopping unit. name=${unit.tagName}, id=${unit.id}, uniqueId=${unit.uniqueId}`);
		unit.use("status.change", "stopping");
		await unit.cast("event.trigger", "beforeStop", options);
		await unit.cast("event.trigger", "doStop", options);
		console.debug(`BasicPerk._stop(): Stopped unit. name=${unit.tagName}, id=${unit.id}, uniqueId=${unit.uniqueId}`);
		unit.use("status.change", "stopped");
		await unit.cast("event.trigger", "afterStop", options);

	}

	// -------------------------------------------------------------------------

	/**
	 * Transform unit (Load HTML and attach to node).
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static async #_transform(unit, options)
	{

		options = options || {};

		console.debug(`BasicPerk._transform(): Transforming. name=${unit.tagName}, id=${unit.id}, uniqueId=${unit.uniqueId}`);
		await unit.cast("event.trigger", "beforeTransform", options);
		if (unit.get("setting", "basic.options.autoSetup", true))
		{
			await unit.cast("basic.setup", options);
		}
		await unit.cast("event.trigger", "doTransform", options);
		await unit.cast("unit.materializeAll", unit);
		console.debug(`BasicPerk._transform(): Transformed. name=${unit.tagName}, id=${unit.id}, uniqueId=${unit.uniqueId}`);
		await unit.cast("event.trigger", "afterTransform", options);

	}

	// -------------------------------------------------------------------------

	/**
	 * Setup unit.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static async #_setup(unit, options)
	{

		options = options || {};

		console.debug(`BasicPerk._setup(): Setting up unit. name=${unit.tagName}, id=${unit.id}, uniqueId=${unit.uniqueId}`);
		await unit.cast("event.trigger", "beforeSetup", options);
		await unit.cast("event.trigger", "doSetup", options);
		console.debug(`BasicPerk._setup(): Set up unit. name=${unit.tagName}, id=${unit.id}, uniqueId=${unit.uniqueId}`);
		await unit.cast("event.trigger", "afterSetup", options);

	}

	// -------------------------------------------------------------------------

	/**
	 * Refresh unit.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static async #_refresh(unit, options)
	{

		options = options || {};

		console.debug(`BasicPerk._refresh(): Refreshing unit. name=${unit.tagName}, id=${unit.id}, uniqueId=${unit.uniqueId}`);
		await unit.cast("event.trigger", "beforeRefresh", options);
		let autoClear = Util.safeGet(options, "autoClear", unit.get("setting", "basic.options.autoClear", true));
		if (autoClear)
		{
			await unit.cast("basic.clear", options);
		}
		if (Util.safeGet(options, "autoFetch", unit.get("setting", "basic.options.autoFetch", true)))
		{
			await unit.cast("basic.fetch", options);
		}
		if (Util.safeGet(options, "autoFill", unit.get("setting", "basic.options.autoFill", true)))
		{
			await unit.cast("basic.fill", options);
		}
		await unit.cast("event.trigger", "doRefresh", options);
		console.debug(`BasicPerk._refresh(): Refreshed unit. name=${unit.tagName}, id=${unit.id}, uniqueId=${unit.uniqueId}`);
		await unit.cast("event.trigger", "afterRefresh", options);

	}

	// -------------------------------------------------------------------------

	/**
	 * Fetch data.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static async #_fetch(unit, options)
	{

		options = options || {};

		console.debug(`BasicPerk._fetch(): Fetching data. name=${unit.tagName}, uniqueId=${unit.uniqueId}`);
		await unit.cast("event.trigger", "beforeFetch", options);
		await unit.cast("event.trigger", "doFetch", options);
		await unit.cast("event.trigger", "afterFetch", options);
		console.debug(`BasicPerk._fetch(): Fetched data. name=${unit.tagName}, uniqueId=${unit.uniqueId}`);

	}

	// -------------------------------------------------------------------------

	/**
	 * Fill unit.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static async #_fill(unit, options)
	{

		options = options || {};

		console.debug(`BasicPerk._fill(): Filling with data. name=${unit.tagName}, uniqueId=${unit.uniqueId}`);
		await unit.cast("event.trigger", "beforeFill", options);
		await unit.cast("event.trigger", "doFill", options);
		console.debug(`BasicPerk._fill(): Filled with data. name=${unit.tagName}, uniqueId=${unit.uniqueId}`);
		await unit.cast("event.trigger", "afterFill", options);

	}

	// -------------------------------------------------------------------------

	/**
	 * Clear unit.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static async #_clear(unit, options)
	{

		options = options || {};

		console.debug(`BasicPerk._clear(): Clearing the unit. name=${unit.tagName}, uniqueId=${unit.uniqueId}`);
		await unit.cast("event.trigger", "beforeClear", options);
		await unit.cast("event.trigger", "doClear", options);
		console.debug(`BasicPerk._clear(): Cleared the unit. name=${unit.tagName}, uniqueId=${unit.uniqueId}`);
		await unit.cast("event.trigger", "afterClear", options);

	}

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
	 * Register the unit.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {HTMLElement}	Element.
	 */
	static #__register(unit, options)
	{

		let c = customElements.get(unit.tagName.toLowerCase());

		BasicPerk.#__unitInfo[unit.uniqueId] = {
			"object":		unit,
			"class":		c,
		};

		// Indexes
		BasicPerk.#__indexes["tagName"][unit.tagName] = BasicPerk.#__indexes["tagName"][unit.tagName] || [];
		BasicPerk.#__indexes["tagName"][unit.tagName].push(unit)
		BasicPerk.#__indexes["className"][c.name] = BasicPerk.#__indexes["className"][c.name] || [];
		BasicPerk.#__indexes["className"][c.name].push(unit)
		if (unit.id)
		{
			BasicPerk.#__indexes["id"][unit.id] = BasicPerk.#__indexes["id"][unit.id] || [];
			BasicPerk.#__indexes["id"][unit.id].push(unit)
		}

	}

}
