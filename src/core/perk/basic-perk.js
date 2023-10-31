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
		BasicPerk._unitInfo = {};
		BasicPerk._indexes = {
			"tagName": {},
			"className": {},
			"id": {},
		};

		// Upgrade Unit
		BITSMIST.v1.Unit.upgrade("asset", "callback", new ChainableStore());
		BITSMIST.v1.Unit.upgrade("asset", "state", new ChainableStore());
		BITSMIST.v1.Unit.upgrade("asset", "vault", new ChainableStore());
		BITSMIST.v1.Unit.upgrade("asset", "inventory", new ChainableStore());
		BITSMIST.v1.Unit.upgrade("asset", "skill", new ChainableStore());
		BITSMIST.v1.Unit.upgrade("asset", "spell", new ChainableStore());
		BITSMIST.v1.Unit.upgrade("property", "unitRoot", {
			get() { return document.body; },
		});
		BITSMIST.v1.Unit.upgrade("callback", "connectedCallback", this._connectedHandler);
		BITSMIST.v1.Unit.upgrade("callback", "disconnectedCallback", this._disconnectedHandler);
		BITSMIST.v1.Unit.upgrade("callback", "adoptedCallback", this._connectedHandler);
		BITSMIST.v1.Unit.upgrade("callback", "attributeChangedCallback", this._attributeChangedHandler);
		BITSMIST.v1.Unit.upgrade("spell", "basic.start", function(...args) { return BasicPerk._start(...args); });
		BITSMIST.v1.Unit.upgrade("spell", "basic.stop", function(...args) { return BasicPerk._stop(...args); });
		BITSMIST.v1.Unit.upgrade("spell", "basic.transform", function(...args) { return BasicPerk._transform(...args); });
		BITSMIST.v1.Unit.upgrade("spell", "basic.setup", function(...args) { return BasicPerk._setup(...args); });
		BITSMIST.v1.Unit.upgrade("spell", "basic.refresh", function(...args) { return BasicPerk._refresh(...args); });
		BITSMIST.v1.Unit.upgrade("spell", "basic.fetch", function(...args) { return BasicPerk._fetch(...args); });
		BITSMIST.v1.Unit.upgrade("spell", "basic.fill", function(...args) { return BasicPerk._fill(...args); });
		BITSMIST.v1.Unit.upgrade("spell", "basic.clear", function(...args) { return BasicPerk._clear(...args); });
		BITSMIST.v1.Unit.upgrade("skill", "basic.scan", function(...args) { return BasicPerk._scan(...args); });
		BITSMIST.v1.Unit.upgrade("skill", "basic.scanAll", function(...args) { return BasicPerk._scanAll(...args); });
		BITSMIST.v1.Unit.upgrade("skill", "basic.locate", function(...args) { return BasicPerk._locate(...args); });
		BITSMIST.v1.Unit.upgrade("skill", "basic.locateAll", function(...args) { return BasicPerk._locateAll(...args); });
		Object.defineProperty(BITSMIST.v1.Unit.prototype, "unitRoot", {
			get() { return this.get("vault", "unitroot"); },
			set(value) { this.set("vault", "unitroot", value); },
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

	}

	// -------------------------------------------------------------------------
	// 	Methods (unit)
	// -------------------------------------------------------------------------

	/**
	 * Connected callback handler.
	 */
	static _connectedHandler(unit)
	{

		if (!unit.__bm_initialized || unit.get("setting", "basic.options.autoRestart", false))
		{
			// Upgrade unit
			unit.upgrade("asset", "state", new ChainableStore(), {"chain":true});
			unit.upgrade("asset", "vault", new ChainableStore(), {"chain":true, "acl":"ro"});
			unit.upgrade("asset", "inventory", new ChainableStore(), {"chain":true});
			unit.upgrade("asset", "skill", new ChainableStore(), {"chain":true});
			unit.upgrade("asset", "spell", new ChainableStore(), {"chain":true});
			unit.upgrade("vault", "unitroot", unit);

			BasicPerk._register(unit);

			// Attach default perks
			let chain = Promise.resolve();
			["BasicPerk","Perk","SettingPerk","UnitPerk","StatusPerk","EventPerk", "SkinPerk", "StylePerk"].forEach((perkName) => {
				chain = chain.then(() => {
					return unit.use("spell", "perk.attach", Perk.getPerk(perkName));
				});
			});

			// Start
			return chain.then(() => {
				return unit.use("spell", "basic.start");
			});
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Disconnected callback handler.
	 */
	static _disconnectedHandler(unit)
	{

		return unit.use("spell", "basic.stop");

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

		return unit.use("spell", "event.trigger", "afterAttributeChange", {"name":name, "oldValue":oldValue, "newValue":newValue});

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

			return unit.use("spell", "setting.apply", {"settings":unit.get("setting")});
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
