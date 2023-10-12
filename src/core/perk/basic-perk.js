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
import UnitPerk from "./unit-perk.js";
import Perk from "./perk.js";
import Store from "../store/store.js";
import URLUtil from "../util/url-util.js";
import Util from "../util/util.js";

// =============================================================================
//	Basic Perk Class
// =============================================================================

export default class BasicPerk extends Perk
{

	// -------------------------------------------------------------------------
	//  Properties
	// -------------------------------------------------------------------------

	static get info()
	{

		return {
			"section":		"basic",
			"order":		0,
		};

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static globalInit()
	{

		// Init vars
		BasicPerk._classInfo = {};
		BasicPerk._unitInfo = {};
		BasicPerk._indexes = {
			"tagName": {},
			"className": {},
			"id": {},
		};

		// Upgrade Unit
		BITSMIST.v1.Unit.__bm_assets = {};
		this.upgrade(BITSMIST.v1.Unit, "asset", "state", new ChainableStore());
		this.upgrade(BITSMIST.v1.Unit, "asset", "vault", new ChainableStore());
		this.upgrade(BITSMIST.v1.Unit, "asset", "inventory", new ChainableStore());
		this.upgrade(BITSMIST.v1.Unit, "asset", "skill", new ChainableStore());
		this.upgrade(BITSMIST.v1.Unit, "asset", "spell", new ChainableStore());
		this.upgrade(BITSMIST.v1.Unit, "method", "get", this._get);
		this.upgrade(BITSMIST.v1.Unit, "method", "set", this._set);
		this.upgrade(BITSMIST.v1.Unit, "method", "use", this._use);
		this.upgrade(BITSMIST.v1.Unit, "property", "uniqueId", {
			get() { return "00000000-0000-0000-0000-000000000000"; },
		});
		this.upgrade(BITSMIST.v1.Unit, "property", "tagName", {
			get() { return "BODY"; },
		});
		this.upgrade(BITSMIST.v1.Unit, "property", "unitRoot", {
			get() { return document.body; },
		});
		this.upgrade(BITSMIST.v1.Unit, "spell", "basic.start", function(...args) { return BasicPerk._start(...args); });
		this.upgrade(BITSMIST.v1.Unit, "spell", "basic.stop", function(...args) { return BasicPerk._stop(...args); });
		this.upgrade(BITSMIST.v1.Unit, "spell", "basic.transform", function(...args) { return BasicPerk._transform(...args); });
		this.upgrade(BITSMIST.v1.Unit, "spell", "basic.setup", function(...args) { return BasicPerk._setup(...args); });
		this.upgrade(BITSMIST.v1.Unit, "spell", "basic.refresh", function(...args) { return BasicPerk._refresh(...args); });
		this.upgrade(BITSMIST.v1.Unit, "spell", "basic.fetch", function(...args) { return BasicPerk._fetch(...args); });
		this.upgrade(BITSMIST.v1.Unit, "spell", "basic.fill", function(...args) { return BasicPerk._fill(...args); });
		this.upgrade(BITSMIST.v1.Unit, "spell", "basic.clear", function(...args) { return BasicPerk._clear(...args); });
		this.upgrade(BITSMIST.v1.Unit, "skill", "basic.scan", function(...args) { return BasicPerk._scan(...args); });
		this.upgrade(BITSMIST.v1.Unit, "skill", "basic.scanAll", function(...args) { return BasicPerk._scanAll(...args); });
		this.upgrade(BITSMIST.v1.Unit, "skill", "basic.locate", function(...args) { return BasicPerk._locate(...args); });
		this.upgrade(BITSMIST.v1.Unit, "skill", "basic.locateAll", function(...args) { return BasicPerk._locateAll(...args); });

		// Upgrade unit
		this.upgrade(BITSMIST.v1.Unit.prototype, "method", "_connectedHandler", this._connectedHandler);
		this.upgrade(BITSMIST.v1.Unit.prototype, "method", "_disconnectedHandler", this._disconnectedHandler);
		this.upgrade(BITSMIST.v1.Unit.prototype, "method", "_adoptedHandler", this._connectedHandler);
		this.upgrade(BITSMIST.v1.Unit.prototype, "method", "_attributeChangedHandler", this._attributeChangedHandler);
		this.upgrade(BITSMIST.v1.Unit.prototype, "method", "get", this._get);
		this.upgrade(BITSMIST.v1.Unit.prototype, "method", "set", this._set);
		this.upgrade(BITSMIST.v1.Unit.prototype, "method", "has", this._has);
		this.upgrade(BITSMIST.v1.Unit.prototype, "method", "use", this._use);
		this.upgrade(BITSMIST.v1.Unit.prototype, "property", "uniqueId", {
			get() { return this.__bm_uniqueid; },
		});
		this.upgrade(BITSMIST.v1.Unit.prototype, "property", "unitRoot", {
			get() { return this.__bm_unitroot; },
			set(value) { this.__bm_unitroot = value; },
		});

		// Create a promise that resolves when document is ready
		BITSMIST.v1.Unit.set("inventory", "promise.documentReady", new Promise((resolve, reject) => {
			if ((document.readyState === "interactive" || document.readyState === "complete"))
			{
				resolve();
			}
			else
			{
				document.addEventListener("DOMContentLoaded", () => {
					resolve();
				});
			}
		}));

		// Load tags
		BITSMIST.v1.Unit.get("inventory", "promise.documentReady").then(() => {
			if (BITSMIST.v1.Unit.get("setting", "system.unit.options.autoLoadOnStartup", true))
			{
				BITSMIST.v1.UnitPerk._loadTags(null, document.body, {"waitForTags":false});
			}
		});

	}

	// -------------------------------------------------------------------------
	// 	Methods (unit)
	// -------------------------------------------------------------------------

	/**
	 * Connected callback handler.
	 */
	static _connectedHandler(unit)
	{

		// The first time only initialization
		if (!this.__bm_uniqueid)
		{
			this.__bm_initialized = false;
			this.__bm_ready = Promise.resolve(); // A promise to prevent from starting/stopping while stopping/starting
			this.__bm_uniqueid = Util.getUUID();
			this.__bm_unitroot = this;
			this.setAttribute("bm-powered", "");
			BasicPerk._register(this);
		}

		// Start
		this.__bm_ready = this.__bm_ready.then(() => {
			console.debug(`BasicPerk._connectedHandler(): Unit is connected. name=${this.tagName}, id=${this.id}, uniqueId=${this.uniqueId}`);

			if (!this.__bm_initialized || this.get("setting", "basic.options.autoRestart", false))
			{
				this.__bm_initialized = true;

				// Upgrade unit
				unit.__bm_assets = {};
				Perk.upgrade(unit, "asset", "state", new ChainableStore({"chain":BITSMIST.v1.Unit.__bm_assets["state"]}));
				Perk.upgrade(unit, "asset", "vault", new ChainableStore());
				Perk.upgrade(unit, "asset", "inventory", new ChainableStore({"chain":BITSMIST.v1.Unit.__bm_assets["inventory"]}));
				Perk.upgrade(unit, "asset", "skill", new ChainableStore({"chain":BITSMIST.v1.Unit.__bm_assets["skill"]}));
				Perk.upgrade(unit, "asset", "spell", new ChainableStore({"chain":BITSMIST.v1.Unit.__bm_assets["spell"]}));

				// Attach default perks
				return Promise.resolve().then(() => {
					return this.use("spell", "perk.attach", BITSMIST.v1.BasicPerk);
				}).then(() => {
					return this.use("spell", "perk.attach", BITSMIST.v1.SettingPerk);
				}).then(() => {
					return this.use("spell", "perk.attach", BITSMIST.v1.PerkPerk);
				}).then(() => {
					return this.use("spell", "perk.attach", BITSMIST.v1.StatusPerk);
				}).then(() => {
					return this.use("spell", "perk.attach", BITSMIST.v1.EventPerk);
				}).then(() => {
					return this.use("spell", "perk.attach", BITSMIST.v1.SkinPerk);
				}).then(() => {
					return this.use("spell", "perk.attach", BITSMIST.v1.StylePerk);
				}).then(() => {
					return this.use("spell", "perk.attach", BITSMIST.v1.UnitPerk);
				}).then(() => {
					return this.use("spell", "basic.start");
				});
			}
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Disconnected callback handler.
	 */
	static _disconnectedHandler(unit)
	{

		// Stop
		this.__bm_ready = this.__bm_ready.then(() => {
			return this.use("spell", "basic.stop");
		}).then(() => {
			console.debug(`BasicPerk.disconnectedHandler(): Unit is disconnected. name=${this.tagName}, id=${this.id}, uniqueId=${this.uniqueId}`);
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Adopted callback handler.
	 */
	static _adoptedHandler(unit)
	{

		return unit.use("spell", "event.trigger", "afterAdopt");

	}

	// -------------------------------------------------------------------------

	/**
	 * Attribute changed callback handler.
	 */
	static _attributeChangedHandler(unit, name, oldValue, newValue)
	{

		if (this.__bm_initialized)
		{
			return unit.use("spell", "event.trigger", "afterAttributeChange", {"name":name, "oldValue":oldValue, "newValue":newValue});
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Get the value from the asset.
	 *
	 * @param	{String}		assetName			Asset name.
	 * @param	{String}		key					Key.
	 * @param	{*}				...args				Arguments.
	 *
	 * @return  {*}				Value.
	 */
	static _get(assetName, key, ...args)
	{

		return this.__bm_assets[assetName].get(key, ...args);

	}

	// -------------------------------------------------------------------------

	/**
	 * Set the value to the asset.
	 *
	 * @param	{String}		assetName			Asset name.
	 * @param	{String}		key					Key.
	 * @param	{*}				value				Value.
	 */
	static _set(assetName, key, value)
	{

		this.__bm_assets[assetName].set(key, value);

	}

	// -------------------------------------------------------------------------

	/**
	 * Return if the unit has the asset.
	 *
	 * @param	{String}		assetName			Asset name.
	 * @param	{String}		key					Key.
	 */
	static _has(assetName, key)
	{

		this.__bm_assets[assetName].has(key);

	}

	// -------------------------------------------------------------------------

	/**
	 * Call the function in the asset.
	 *
	 * @param	{String}		assetName			Asset name.
	 * @param	{String}		key					Key.
	 * @param	{*}				...args				Arguments.
	 */
	static _use(assetName, key, ...args)
	{

		let func = this.__bm_assets[assetName].get(key);
		Util.assert(typeof(func) === "function", `${assetName} is not available. ${assetName}Name=${key}`);

		return func.call(this, this, ...args);

	}

	// -------------------------------------------------------------------------
	//  Skills
	// -------------------------------------------------------------------------

	/**
	 * Start unit.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _start(unit, options)
	{

		return Promise.resolve().then(() => {
			console.debug(`BasicPerk._start(): Starting unit. name=${unit.tagName}, id=${unit.id}, uniqueId=${unit.uniqueId}`);

			return unit.use("spell", "setting.apply", {"settings":unit.__bm_assets["setting"].items});
		}).then(() => {
			return unit.use("spell", "event.trigger", "beforeStart");
		}).then(() => {
			return unit.use("skill", "status.change", "starting");
		}).then(() => {
			if (unit.get("setting", "basic.options.autoTransform", true))
			{
				return unit.use("spell", "basic.transform", {"skinName": "default", "styleName": "default"});
			}
		}).then(() => {
			return unit.use("spell", "event.trigger", "doStart");
		}).then(() => {
			if (unit.get("setting", "basic.options.autoRefresh", true))
			{
				return unit.use("spell", "basic.refresh");
			}
		}).then(() => {
			console.debug(`BasicPerk._start(): Started unit. name=${unit.tagName}, id=${unit.id}, uniqueId=${unit.uniqueId}`);
			return unit.use("skill", "status.change", "started");
		}).then(() => {
			return unit.use("spell", "event.trigger", "afterStart");
		}).then(() => {
			console.debug(`BasicPerk._start(): Unit is ready. name=${unit.tagName}, id=${unit.id}, uniqueId=${unit.uniqueId}`);
			return unit.use("skill", "status.change", "ready");
		}).then(() => {
			return unit.use("spell", "event.trigger", "afterReady");
		});

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
	static _stop(unit, options)
	{

		options = options || {};

		return Promise.resolve().then(() => {
			console.debug(`BasicPerk._stop(): Stopping unit. name=${unit.tagName}, id=${unit.id}, uniqueId=${unit.uniqueId}`);
			return unit.use("skill", "status.change", "stopping");
		}).then(() => {
			return unit.use("spell", "event.trigger", "beforeStop", options);
		}).then(() => {
			return unit.use("spell", "event.trigger", "doStop", options);
		}).then(() => {
			console.debug(`BasicPerk._stop(): Stopped unit. name=${unit.tagName}, id=${unit.id}, uniqueId=${unit.uniqueId}`);
			return unit.use("skill", "status.change", "stopped");
		}).then(() => {
			return unit.use("spell", "event.trigger", "afterStop", options);
		});

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
	static _transform(unit, options)
	{

		options = options || {};

		return Promise.resolve().then(() => {
			console.debug(`BasicPerk._transform(): Transforming. name=${unit.tagName}, id=${unit.id}, uniqueId=${unit.uniqueId}`);
			return unit.use("spell", "event.trigger", "beforeTransform", options);
		}).then(() => {
			if (unit.get("setting", "basic.options.autoSetup", true))
			{
				return unit.use("spell", "basic.setup", options);
			}
		}).then(() => {
			return unit.use("spell", "event.trigger", "doTransform", options);
		}).then(() => {
			return unit.use("spell", "unit.materializeAll", unit);
		}).then(() => {
			console.debug(`BasicPerk._transform(): Transformed. name=${unit.tagName}, id=${unit.id}, uniqueId=${unit.uniqueId}`);
			return unit.use("spell", "event.trigger", "afterTransform", options);
		});

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
	static _setup(unit, options)
	{

		options = options || {};

		return Promise.resolve().then(() => {
			console.debug(`BasicPerk._setup(): Setting up unit. name=${unit.tagName}, id=${unit.id}, uniqueId=${unit.uniqueId}`);
			return unit.use("spell", "event.trigger", "beforeSetup", options);
		}).then(() => {
			return unit.use("spell", "event.trigger", "doSetup", options);
		}).then(() => {
			console.debug(`BasicPerk._setup(): Set up unit. name=${unit.tagName}, id=${unit.id}, uniqueId=${unit.uniqueId}`);
			return unit.use("spell", "event.trigger", "afterSetup", options);
		});

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
	static _refresh(unit, options)
	{

		options = options || {};

		return Promise.resolve().then(() => {
			console.debug(`BasicPerk._refresh(): Refreshing unit. name=${unit.tagName}, id=${unit.id}, uniqueId=${unit.uniqueId}`);
			return unit.use("spell", "event.trigger", "beforeRefresh", options);
		}).then(() => {
			let autoClear = Util.safeGet(options, "autoClear", unit.get("setting", "basic.options.autoClear", true));
			if (autoClear)
			{
				return unit.use("spell", "basic.clear", options);
			}
		}).then(() => {
			if (Util.safeGet(options, "autoFetch", unit.get("setting", "basic.options.autoFetch", true)))
			{
				return unit.use("spell", "basic.fetch", options);
			}
		}).then(() => {
			if (Util.safeGet(options, "autoFill", unit.get("setting", "basic.options.autoFill", true)))
			{
				return unit.use("spell", "basic.fill", options);
			}
		}).then(() => {
			return unit.use("spell", "event.trigger", "doRefresh", options);
		}).then(() => {
			console.debug(`BasicPerk._refresh(): Refreshed unit. name=${unit.tagName}, id=${unit.id}, uniqueId=${unit.uniqueId}`);
			return unit.use("spell", "event.trigger", "afterRefresh", options);
		});

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
	static _fetch(unit, options)
	{

		options = options || {};

		return Promise.resolve().then(() => {
			console.debug(`BasicPerk._fetch(): Fetching data. name=${unit.tagName}, uniqueId=${unit.uniqueId}`);
			return unit.use("spell", "event.trigger", "beforeFetch", options);
		}).then(() => {
			return unit.use("spell", "event.trigger", "doFetch", options);
		}).then(() => {
			return unit.use("spell", "event.trigger", "afterFetch", options);
		}).then(() => {
			console.debug(`BasicPerk._fetch(): Fetched data. name=${unit.tagName}, uniqueId=${unit.uniqueId}`);
		});

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
	static _fill(unit, options)
	{

		options = options || {};

		return Promise.resolve().then(() => {
			console.debug(`BasicPerk._fill(): Filling with data. name=${unit.tagName}, uniqueId=${unit.uniqueId}`);
			return unit.use("spell", "event.trigger", "beforeFill", options);
		}).then(() => {
			return unit.use("spell", "event.trigger", "doFill", options);
		}).then(() => {
			console.debug(`BasicPerk._fill(): Filled with data. name=${unit.tagName}, uniqueId=${unit.uniqueId}`);
			return unit.use("spell", "event.trigger", "afterFill", options);
		});

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
	static _clear(unit, options)
	{

		options = options || {};

		return Promise.resolve().then(() => {
			console.debug(`BasicPerk._clear(): Clearing the unit. name=${unit.tagName}, uniqueId=${unit.uniqueId}`);
			return unit.use("spell", "event.trigger", "beforeClear", options);
		}).then(() => {
			return unit.use("spell", "event.trigger", "doClear", options);
		}).then(() => {
			console.debug(`BasicPerk._clear(): Cleared the unit. name=${unit.tagName}, uniqueId=${unit.uniqueId}`);
			return unit.use("spell", "event.trigger", "afterClear", options);
		});

	}

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
	static _scanAll(unit, query, options)
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
	static _scan(unit, query, options)
	{

		let nodes = Util.scopedSelectorAll(unit, query, options);

		return ( nodes ? nodes[0] : null );

	}

	// -------------------------------------------------------------------------

	/**
	 * Register the unit.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {HTMLElement}	Element.
	 */
	static _register(unit, options)
	{

		let c = customElements.get(unit.tagName.toLowerCase());

		BasicPerk._unitInfo[unit.uniqueId] = {
			"object":		unit,
			"class":		c,
			"classInfo":	BasicPerk._classInfo[c.name],
		};

		// Indexes
		BasicPerk._indexes["tagName"][unit.tagName] = BasicPerk._indexes["tagName"][unit.tagName] || [];
		BasicPerk._indexes["tagName"][unit.tagName].push(unit)
		BasicPerk._indexes["className"][c.name] = BasicPerk._indexes["className"][c.name] || [];
		BasicPerk._indexes["className"][c.name].push(unit)
		if (unit.id)
		{
			BasicPerk._indexes["id"][unit.id] = BasicPerk._indexes["id"][unit.id] || [];
			BasicPerk._indexes["id"][unit.id].push(unit)
		}

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
	static _locateAll(unit, target)
	{

		if (typeof(target) === "object")
		{
			if ("selector" in target)
			{
				return document.querySelectorAll(target["selector"]);
			}
			else if ("scan" in target)
			{
				let nodes = unit.use("skill", "basic.scan", target["scan"]);
				return unit.use("skill", "basic.scanAll", target["scan"]);
			}
			else if ("uniqueId" in target)
			{
				return [BasicPerk._unitInfo[target["uniqueId"]].object];
			}
			else if ("tagName" in target)
			{
				return BasicPerk._indexes["tagName"][target["tagName"].toUpperCase()];
			}
			else if ("object" in target)
			{
				return [target["object"]];
			}
			else if ("id" in target)
			{
				return BasicPerk._indexes["id"][target["id"]];
			}
			else if ("className" in target)
			{
				return BasicPerk._indexes["className"][target["className"]];
			}
		}
		else if (typeof(target) === "string")
		{
			return BasicPerk._indexes["tagName"][target.toUpperCase()];
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
	static _locate(unit, target)
	{

		let units = BasicPerk._locateAll(unit, target);

		if (units)
		{
			return units[0];
		}

	}

}
