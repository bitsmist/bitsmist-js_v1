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
		this.upgrade(BITSMIST.v1.Component, "asset", "stat", new ChainableStore());
		this.upgrade(BITSMIST.v1.Component, "asset", "vault", new ChainableStore());
		this.upgrade(BITSMIST.v1.Component, "asset", "inventory", new ChainableStore());
		this.upgrade(BITSMIST.v1.Component, "asset", "skill", new ChainableStore());
		this.upgrade(BITSMIST.v1.Component, "method", "get", this._get);
		this.upgrade(BITSMIST.v1.Component, "method", "set", this._set);
		this.upgrade(BITSMIST.v1.Component, "method", "use", this._use);
		this.upgrade(BITSMIST.v1.Component, "skill", "basic.start", function(...args) { return BasicPerk._start(...args); });
		this.upgrade(BITSMIST.v1.Component, "skill", "basic.stop", function(...args) { return BasicPerk._stop(...args); });
		this.upgrade(BITSMIST.v1.Component, "skill", "basic.transform", function(...args) { return BasicPerk._transform(...args); });
		this.upgrade(BITSMIST.v1.Component, "skill", "basic.setup", function(...args) { return BasicPerk._setup(...args); });
		this.upgrade(BITSMIST.v1.Component, "skill", "basic.refresh", function(...args) { return BasicPerk._refresh(...args); });
		this.upgrade(BITSMIST.v1.Component, "skill", "basic.fetch", function(...args) { return BasicPerk._fetch(...args); });
		this.upgrade(BITSMIST.v1.Component, "skill", "basic.fill", function(...args) { return BasicPerk._fill(...args); });
		this.upgrade(BITSMIST.v1.Component, "skill", "basic.clear", function(...args) { return BasicPerk._clear(...args); });
		BITSMIST.v1.Component.promises = new ChainableStore();

		// Create a promise that resolves when document is ready
		BITSMIST.v1.Component.promises["documentReady"] = new Promise((resolve, reject) => {
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
		});

		// Load tags
		BITSMIST.v1.Component.promises["documentReady"].then(() => {
			//if (BITSMIST.v1.Component.get("setting", "system.autoLoadOnStartup", true))
			{
				BITSMIST.v1.ComponentPerk._loadTags(null, document.body, {"waitForTags":false});
			}
		});

		// Upgrade component
		this.upgrade(BITSMIST.v1.Component.prototype, "method", "_connectedHandler", this._connectedHandler);
		this.upgrade(BITSMIST.v1.Component.prototype, "method", "_disconnectedHandler", this._disconnectedHandler);
		this.upgrade(BITSMIST.v1.Component.prototype, "method", "get", this._get);
		this.upgrade(BITSMIST.v1.Component.prototype, "method", "set", this._set);
		this.upgrade(BITSMIST.v1.Component.prototype, "method", "use", this._use);
		this.upgrade(BITSMIST.v1.Component.prototype, "property", "uniqueId", {
			get() { return this._uniqueId; },
		});

	}

	// -------------------------------------------------------------------------

	static init(component, options)
	{

		// Upgrade component
		component._assets = {};
		this.upgrade(component, "asset", "stat", new ChainableStore({"chain":BITSMIST.v1.Component._assets["stat"]}));
		this.upgrade(component, "asset", "vault", new ChainableStore());
		this.upgrade(component, "asset", "inventory", new ChainableStore());
		this.upgrade(component, "asset", "skill", new ChainableStore({"chain":BITSMIST.v1.Component._assets["skill"]}));

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

			if (!this.__initialized || this.get("setting", "setting.autoRestart"))
			{
				this.__initialized = true;
				BasicPerk.init(component);
				return this.use("skill", "basic.start");
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
			return this.use("skill", "basic.stop");
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
	 * Call the function in the asset.
	 *
	 * @param	{String}		assetName			Asset name.
	 * @param	{String}		key					Key.
	 * @param	{*}				...args				Arguments.
	 */
	static _use(assetName, key, ...args)
	{

		let func = this._assets[assetName].get(key);
		Util.assert(func, `Skill is not available. skillName=${key}`);

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
			console.debug(`Component._start(): Starting component. name=${component.tagName}, id=${component.id}, uniqueId=${component._uniqueId}`);
			//return BITSMIST.v1.BasicPerk.init(component);
		}).then(() => {
			return component.use("skill", "perk.attach", BITSMIST.v1.SettingPerk, options);
		}).then(() => {
			return component.use("skill", "event.trigger", "beforeStart");
		}).then(() => {
			return component.use("skill", "state.change", "starting");
		}).then(() => {
			if (component.get("setting", "setting.autoTransform"))
			{
				return component.use("skill", "basic.transform");
			}
		}).then(() => {
			if (component.get("setting", "setting.autoSetup"))
			{
				return component.use("skill", "basic.setup", options);
			}
		}).then(() => {
			return component.use("skill", "event.trigger", "doStart");
		}).then(() => {
			if (component.get("setting", "setting.autoRefresh"))
			{
				return component.use("skill", "basic.refresh");
			}
		}).then(() => {
			window.getComputedStyle(component).getPropertyValue("visibility"); // Recalc styles

			console.debug(`Component._start(): Started component. name=${component.tagName}, id=${component.id}, uniqueId=${component._uniqueId}`);
			return component.use("skill", "state.change", "started");
		}).then(() => {
			return component.use("skill", "event.trigger", "afterStart");
		}).then(() => {
			console.debug(`Component._start(): Component is ready. name=${component.tagName}, id=${component.id}, uniqueId=${component._uniqueId}`);
			return component.use("skill", "state.change", "ready");
		}).then(() => {
			return component.use("skill", "event.trigger", "afterReady");
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
			console.debug(`Component._stop(): Stopping component. name=${component.tagName}, id=${component.id}, uniqueId=${component._uniqueId}`);
			return component.use("skill", "state.change", "stopping");
		}).then(() => {
			return component.use("skill", "event.trigger", "beforeStop", options);
		}).then(() => {
			return component.use("skill", "event.trigger", "doStop", options);
		}).then(() => {
			console.debug(`Component._stop(): Stopped component. name=${component.tagName}, id=${component.id}, uniqueId=${component._uniqueId}`);
			return component.use("skill", "state.change", "stopped");
		}).then(() => {
			return component.use("skill", "event.trigger", "afterStop", options);
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
			return component.use("skill", "event.trigger", "beforeTransform", options);
		}).then(() => {
			return component.use("skill", "event.trigger", "doTransform", options);
		}).then(() => {
			return component.use("skill", "component.materializeAll", component._root);
		}).then(() => {
			console.debug(`BasicPerk._transform(): Transformed. name=${component.tagName}, id=${component.id}, uniqueId=${component.uniqueId}`);
			return component.use("skill", "event.trigger", "afterTransform", options);
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
			console.debug(`BasicPerk._setup(): Setting up component. name=${component.tagName}, state=${component.state}, id=${component.id}, uniqueId=${component.uniqueId}`);
			return component.use("skill", "event.trigger", "beforeSetup", options);
		}).then(() => {
			return component.use("skill", "event.trigger", "doSetup", options);
		}).then(() => {
			console.debug(`BasicPerk._setup(): Set up component. name=${component.tagName}, state=${component.state}, id=${component.id}, uniqueId=${component.uniqueId}`);
			return component.use("skill", "event.trigger", "afterSetup", options);
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
			return component.use("skill", "event.trigger", "beforeRefresh", options);
		}).then(() => {
			let autoClear = Util.safeGet(options, "autoClear", component.get("setting", "setting.autoClear"));
			if (autoClear)
			{
				return component.use("skill", "basic.clear", options);
			}
		}).then(() => {
			return component.use("skill", "event.trigger", "doTarget", options);
		}).then(() => {
			if (Util.safeGet(options, "autoFetch", component.get("setting", "setting.autoFetch")))
			{
				return component.use("skill", "basic.fetch", options);
			}
		}).then(() => {
			if (Util.safeGet(options, "autoFill", component.get("setting", "setting.autoFill")))
			{
				return component.use("skill", "basic.fill", options);
			}
		}).then(() => {
			return component.use("skill", "event.trigger", "doRefresh", options);
		}).then(() => {
			console.debug(`BasicPerk._refresh(): Refreshed component. name=${component.tagName}, id=${component.id}, uniqueId=${component.uniqueId}`);
			return component.use("skill", "event.trigger", "afterRefresh", options);
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
			return component.use("skill", "event.trigger", "beforeFetch", options);
		}).then(() => {
			return component.use("skill", "event.trigger", "doFetch", options);
		}).then(() => {
			return component.use("skill", "event.trigger", "afterFetch", options);
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
			return component.use("skill", "event.trigger", "beforeFill", options);
		}).then(() => {
			return component.use("skill", "event.trigger", "doFill", options);
		}).then(() => {
			console.debug(`BasicPerk._fill(): Filled with data. name=${component.tagName}, uniqueId=${component.uniqueId}`);
			return component.use("skill", "event.trigger", "afterFill", options);
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
			return component.use("skill", "event.trigger", "beforeClear", options);
		}).then(() => {
			return component.use("skill", "event.trigger", "doClear", options);
		}).then(() => {
			console.debug(`BasicPerk._clear(): Cleared the component. name=${component.tagName}, uniqueId=${component.uniqueId}`);
			return component.use("skill", "event.trigger", "afterClear", options);
		});

	}

}
