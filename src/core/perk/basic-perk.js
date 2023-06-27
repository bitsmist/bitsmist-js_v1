// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import ChainableStore from "../store/chainable-store.js";
import ComponentPerk from "./component-perk.js";
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
			"section":		"",
			"order":		0,
		};

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static globalInit()
	{

		// Upgrade Component
		BITSMIST.v1.Component._assets = {};
		this.upgrade(BITSMIST.v1.Component, "asset", "state", new ChainableStore());
		this.upgrade(BITSMIST.v1.Component, "asset", "vault", new ChainableStore());
		this.upgrade(BITSMIST.v1.Component, "asset", "inventory", new ChainableStore());
		this.upgrade(BITSMIST.v1.Component, "asset", "skill", new ChainableStore());
		this.upgrade(BITSMIST.v1.Component, "asset", "spell", new ChainableStore());
		this.upgrade(BITSMIST.v1.Component, "method", "get", this._get);
		this.upgrade(BITSMIST.v1.Component, "method", "set", this._set);
		this.upgrade(BITSMIST.v1.Component, "method", "use", this._use);
		this.upgrade(BITSMIST.v1.Component, "spell", "basic.start", function(...args) { return BasicPerk._start(...args); });
		this.upgrade(BITSMIST.v1.Component, "spell", "basic.stop", function(...args) { return BasicPerk._stop(...args); });
		this.upgrade(BITSMIST.v1.Component, "spell", "basic.transform", function(...args) { return BasicPerk._transform(...args); });
		this.upgrade(BITSMIST.v1.Component, "spell", "basic.setup", function(...args) { return BasicPerk._setup(...args); });
		this.upgrade(BITSMIST.v1.Component, "spell", "basic.refresh", function(...args) { return BasicPerk._refresh(...args); });
		this.upgrade(BITSMIST.v1.Component, "spell", "basic.fetch", function(...args) { return BasicPerk._fetch(...args); });
		this.upgrade(BITSMIST.v1.Component, "spell", "basic.fill", function(...args) { return BasicPerk._fill(...args); });
		this.upgrade(BITSMIST.v1.Component, "spell", "basic.clear", function(...args) { return BasicPerk._clear(...args); });
		this.upgrade(BITSMIST.v1.Component, "skill", "basic.scan", function(...args) { return BasicPerk._scan(...args); });
		this.upgrade(BITSMIST.v1.Component, "skill", "basic.scanAll", function(...args) { return BasicPerk._scanAll(...args); });

		// Upgrade component
		this.upgrade(BITSMIST.v1.Component.prototype, "method", "_connectedHandler", this._connectedHandler);
		this.upgrade(BITSMIST.v1.Component.prototype, "method", "_disconnectedHandler", this._disconnectedHandler);
		this.upgrade(BITSMIST.v1.Component.prototype, "method", "get", this._get);
		this.upgrade(BITSMIST.v1.Component.prototype, "method", "set", this._set);
		this.upgrade(BITSMIST.v1.Component.prototype, "method", "has", this._has);
		this.upgrade(BITSMIST.v1.Component.prototype, "method", "use", this._use);
		this.upgrade(BITSMIST.v1.Component.prototype, "property", "uniqueId", {
			get() { return this._uniqueId; },
		});

		// Create a promise that resolves when document is ready
		BITSMIST.v1.Component.set("inventory", "promise.documentReady", new Promise((resolve, reject) => {
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
		BITSMIST.v1.Component.get("inventory", "promise.documentReady").then(() => {
			//if (BITSMIST.v1.Component.get("settings", "system.autoLoadOnStartup", true))
			{
				BITSMIST.v1.ComponentPerk._loadTags(null, document.body, {"waitForTags":false});
			}
		});

	}

	// -------------------------------------------------------------------------

	static init(component, options)
	{

		// Upgrade component
		component._assets = {};
		this.upgrade(component, "asset", "state", new ChainableStore({"chain":BITSMIST.v1.Component._assets["state"]}));
		this.upgrade(component, "asset", "vault", new ChainableStore());
		this.upgrade(component, "asset", "inventory", new ChainableStore({"chain":BITSMIST.v1.Component._assets["inventory"]}));
		this.upgrade(component, "asset", "skill", new ChainableStore({"chain":BITSMIST.v1.Component._assets["skill"]}));
		this.upgrade(component, "asset", "spell", new ChainableStore({"chain":BITSMIST.v1.Component._assets["spell"]}));

		// Attach default perks
		return Promise.resolve().then(() => {
			return component.use("spell", "perk.attach", BITSMIST.v1.SettingPerk, options);
		}).then(() => {
			return component.use("spell", "perk.attach", BITSMIST.v1.PerkPerk, options);
		}).then(() => {
			return component.use("spell", "perk.attach", BITSMIST.v1.StatusPerk, options);
		}).then(() => {
			return component.use("spell", "perk.attach", BITSMIST.v1.EventPerk, options);
		}).then(() => {
			return component.use("spell", "perk.attach", BITSMIST.v1.SkinPerk, options);
		}).then(() => {
			return component.use("spell", "perk.attach", BITSMIST.v1.StylePerk, options);
		}).then(() => {
			return component.use("spell", "perk.attach", BITSMIST.v1.ComponentPerk, options);
		});

	}

	// -------------------------------------------------------------------------
	// 	Methods (component)
	// -------------------------------------------------------------------------

	/**
	 * Connected callback handler.
	 */
	static _connectedHandler(component)
	{

		// The first time only initialization
		if (!this.__initialized)
		{
			this.__ready = Promise.resolve(); // A promise to prevent from start/stop while stopping/starting
			this._uniqueId = Util.getUUID();
			this._root = this;
			this.setAttribute("bm-powered", "");
		}

		// Start
		this.__ready = this.__ready.then(() => {
			console.debug(`Component._connectedHandler(): Component is connected. name=${this.tagName}, id=${this.id}, uniqueId=${this._uniqueId}`);

			if (!this.__initialized || this.get("settings", "basic.options.autoRestart", false))
			{
				this.__initialized = true;

				return BasicPerk.init(component).then(() => {
					return this.use("spell", "basic.start");
				});
			}
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Disconnected callback handler.
	 */
	static _disconnectedHandler(component)
	{

		// Stop
		this.__ready = this.__ready.then(() => {
			return this.use("spell", "basic.stop");
		}).then(() => {
			console.debug(`Component.disconnectedHandler(): Component is disconnected. name=${this.tagName}, id=${this.id}, uniqueId=${this._uniqueId}`);
		});

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

		return this._assets[assetName].get(key, ...args);

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

		this._assets[assetName].set(key, value);

	}

	// -------------------------------------------------------------------------

	/**
	 * Return if the component has the asset.
	 *
	 * @param	{String}		assetName			Asset name.
	 * @param	{String}		key					Key.
	 */
	static _has(assetName, key)
	{

		this._assets[assetName].has(key);

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

		let func = this._assets[assetName].get(key);
		Util.assert(typeof(func) === "function", `${assetName} is not available. ${assetName}Name=${key}`);

		return func.call(this, this, ...args);

	}

	// -------------------------------------------------------------------------
	//  Skills
	// -------------------------------------------------------------------------

	/**
	 * Start component.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _start(component, options)
	{

		return Promise.resolve().then(() => {
			console.debug(`BasicPerk._start(): Starting component. name=${component.tagName}, id=${component.id}, uniqueId=${component._uniqueId}`);

			return component.use("spell", "setting.apply", {"settings":component._assets["settings"].items});
		}).then(() => {
			return component.use("spell", "event.trigger", "beforeStart");
		}).then(() => {
			return component.use("skill", "status.change", "starting");
		}).then(() => {
			if (component.get("settings", "basic.options.autoTransform", true))
			{
				return component.use("spell", "basic.transform");
			}
		}).then(() => {
			if (component.get("settings", "basic.options.autoSetup", true))
			{
				return component.use("spell", "basic.setup", options);
			}
		}).then(() => {
			return component.use("spell", "event.trigger", "doStart");
		}).then(() => {
			if (component.get("settings", "basic.options.autoRefresh", true))
			{
				return component.use("spell", "basic.refresh");
			}
		}).then(() => {
			window.getComputedStyle(component).getPropertyValue("visibility"); // Recalc styles

			console.debug(`Component._start(): Started component. name=${component.tagName}, id=${component.id}, uniqueId=${component._uniqueId}`);
			return component.use("skill", "status.change", "started");
		}).then(() => {
			return component.use("spell", "event.trigger", "afterStart");
		}).then(() => {
			console.debug(`BasicPerk._start(): Component is ready. name=${component.tagName}, id=${component.id}, uniqueId=${component._uniqueId}`);
			return component.use("skill", "status.change", "ready");
		}).then(() => {
			return component.use("spell", "event.trigger", "afterReady");
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Stop component.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object}		options				Options for the component.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _stop(component, options)
	{

		options = options || {};

		return Promise.resolve().then(() => {
			console.debug(`BasicPerk._stop(): Stopping component. name=${component.tagName}, id=${component.id}, uniqueId=${component._uniqueId}`);
			return component.use("skill", "status.change", "stopping");
		}).then(() => {
			return component.use("spell", "event.trigger", "beforeStop", options);
		}).then(() => {
			return component.use("spell", "event.trigger", "doStop", options);
		}).then(() => {
			console.debug(`BasicPerk._stop(): Stopped component. name=${component.tagName}, id=${component.id}, uniqueId=${component._uniqueId}`);
			return component.use("skill", "status.change", "stopped");
		}).then(() => {
			return component.use("spell", "event.trigger", "afterStop", options);
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Transform component (Load HTML and attach to node).
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _transform(component, options)
	{

		options = options || {};

		return Promise.resolve().then(() => {
			console.debug(`BasicPerk._transform(): Transforming. name=${component.tagName}, id=${component.id}, uniqueId=${component.uniqueId}`);
			return component.use("spell", "event.trigger", "beforeTransform", options);
		}).then(() => {
			return component.use("spell", "event.trigger", "doTransform", options);
		}).then(() => {
			return component.use("spell", "unit.materializeAll", component._root);
		}).then(() => {
			console.debug(`BasicPerk._transform(): Transformed. name=${component.tagName}, id=${component.id}, uniqueId=${component.uniqueId}`);
			return component.use("spell", "event.trigger", "afterTransform", options);
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Setup component.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _setup(component, options)
	{

		options = options || {};

		return Promise.resolve().then(() => {
			console.debug(`BasicPerk._setup(): Setting up component. name=${component.tagName}, id=${component.id}, uniqueId=${component.uniqueId}`);
			return component.use("spell", "event.trigger", "beforeSetup", options);
		}).then(() => {
			return component.use("spell", "event.trigger", "doSetup", options);
		}).then(() => {
			console.debug(`BasicPerk._setup(): Set up component. name=${component.tagName}, id=${component.id}, uniqueId=${component.uniqueId}`);
			return component.use("spell", "event.trigger", "afterSetup", options);
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Refresh component.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _refresh(component, options)
	{

		options = options || {};

		return Promise.resolve().then(() => {
			console.debug(`BasicPerk._refresh(): Refreshing component. name=${component.tagName}, id=${component.id}, uniqueId=${component.uniqueId}`);
			return component.use("spell", "event.trigger", "beforeRefresh", options);
		}).then(() => {
			let autoClear = Util.safeGet(options, "autoClear", component.get("settings", "basic.options.autoClear", true));
			if (autoClear)
			{
				return component.use("spell", "basic.clear", options);
			}
		}).then(() => {
			return component.use("spell", "event.trigger", "doTarget", options);
		}).then(() => {
			if (Util.safeGet(options, "autoFetch", component.get("settings", "basic.options.autoFetch", true)))
			{
				return component.use("spell", "basic.fetch", options);
			}
		}).then(() => {
			if (Util.safeGet(options, "autoFill", component.get("settings", "basic.options.autoFill", true)))
			{
				return component.use("spell", "basic.fill", options);
			}
		}).then(() => {
			return component.use("spell", "event.trigger", "doRefresh", options);
		}).then(() => {
			console.debug(`BasicPerk._refresh(): Refreshed component. name=${component.tagName}, id=${component.id}, uniqueId=${component.uniqueId}`);
			return component.use("spell", "event.trigger", "afterRefresh", options);
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Fetch data.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _fetch(component, options)
	{

		options = options || {};

		return Promise.resolve().then(() => {
			console.debug(`BasicPerk._fetch(): Fetching data. name=${component.tagName}, uniqueId=${component.uniqueId}`);
			return component.use("spell", "event.trigger", "beforeFetch", options);
		}).then(() => {
			return component.use("spell", "event.trigger", "doFetch", options);
		}).then(() => {
			return component.use("spell", "event.trigger", "afterFetch", options);
		}).then(() => {
			console.debug(`BasicPerk._fetch(): Fetched data. name=${component.tagName}, uniqueId=${component.uniqueId}`);
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Fill component.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _fill(component, options)
	{

		options = options || {};

		return Promise.resolve().then(() => {
			console.debug(`BasicPerk._fill(): Filling with data. name=${component.tagName}, uniqueId=${component.uniqueId}`);
			return component.use("spell", "event.trigger", "beforeFill", options);
		}).then(() => {
			return component.use("spell", "event.trigger", "doFill", options);
		}).then(() => {
			console.debug(`BasicPerk._fill(): Filled with data. name=${component.tagName}, uniqueId=${component.uniqueId}`);
			return component.use("spell", "event.trigger", "afterFill", options);
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Clear component.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _clear(component, options)
	{

		options = options || {};

		return Promise.resolve().then(() => {
			console.debug(`BasicPerk._clear(): Clearing the component. name=${component.tagName}, uniqueId=${component.uniqueId}`);
			return component.use("spell", "event.trigger", "beforeClear", options);
		}).then(() => {
			return component.use("spell", "event.trigger", "doClear", options);
		}).then(() => {
			console.debug(`BasicPerk._clear(): Cleared the component. name=${component.tagName}, uniqueId=${component.uniqueId}`);
			return component.use("spell", "event.trigger", "afterClear", options);
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Get elements inside the component speicified by the query.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{String}		query				Query.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {NodeList}		Elements.
	 */
	static _scanAll(component, query, options)
	{

		return Util.scopedSelectorAll(component._root, query, options);

	}

	// -------------------------------------------------------------------------

	/**
	 * Get the first element inside the component speicified by the query.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{String}		query				Query.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {HTMLElement}	Element.
	 */
	static _scan(component, query, options)
	{

		let nodes = Util.scopedSelectorAll(component._root, query, options);

		return ( nodes ? nodes[0] : null );

	}

}
