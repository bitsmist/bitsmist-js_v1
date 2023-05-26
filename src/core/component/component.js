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
import ComponentPerk from "../perk/component-perk.js";
import Util from "../util/util.js";
import Store from "../store/store.js";

// =============================================================================
//	Component class
// =============================================================================

export default class Component extends HTMLElement
{

	// -------------------------------------------------------------------------
	//  Static
	// -------------------------------------------------------------------------

	static
	{

		// Init Component vars
		this._assets = {
			"report":		new Store(),
			"promise": 		new ChainableStore(),
		};
		this.report = this._assets["report"];
		this.promises = this._assets["promise"];

		// Create a promise that resolves when document is ready
		Component.promises["documentReady"] = new Promise((resolve, reject) => {
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
		Component.promises["documentReady"].then(() => {
			if (Component.settings.get("system.autoLoadOnStartup", true))
			{
				ComponentPerk._loadTags(null, document.body, {"waitForTags":false});
			}
		});

	}

	// -------------------------------------------------------------------------
	//  Callbacks
	// -------------------------------------------------------------------------

	/**
	 * Connected callback.
	 */
	connectedCallback()
	{

		// The first time only initialization
		if (!this.__ready)
		{
			// Create a promise to prevent from start/stop while stopping/starting
			this.__ready = Promise.resolve();

			this.setAttribute("bm-powered", "");
			this._uniqueId = Util.getUUID();
		}

		// Start
		this.__ready = this.__ready.then(() => {
			console.debug(`Component.connectedCallback(): Component is connected. name=${this.tagName}, id=${this.id}, uniqueId=${this._uniqueId}`);
			//return this.skills.use("state.change", "connected");
		}).then(() => {
			if (!this.__initialized || this.settings.get("setting.autoRestart"))
			{
				this.__initialized = true;
				return this._start();
			}
			else
			{
				console.debug(`Component.connectedCallback(): Restarted component. name=${this.tagName}, id=${this.id}, uniqueId=${this._uniqueId}`);
				//return this.skills.use("state.change", "ready");
			}
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Disconnected callback.
	 */
	disconnectedCallback()
	{

		// Stop
		this.__ready = this.__ready.then(() => {
			if (this.settings.get("setting.autoStop"))
			{
				return this._stop();
			}
		}).then(() => {
			console.debug(`Component.disconnectedCallback(): Component is disconnected. name=${this.tagName}, id=${this.id}, uniqueId=${this._uniqueId}`);
			//return this.skills.use("state.change", "disconnected");
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Adopted callback.
	 */
	adoptedCallback()
	{
	}

	// -------------------------------------------------------------------------

	/**
	 * Attribute changed callback.
	 */
	attributeChangedCallback()
	{
	}

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	/**
	 * Instance's unique id.
	 *
	 * @type	{String}
	 */
	get uniqueId()
	{

		return this._uniqueId;

	}

	// -------------------------------------------------------------------------
	//  Protected
	// -------------------------------------------------------------------------

	/**
	 * Start component.
	 *
	 * @param	{Object}		settings			Settings.
	 *
	 * @return  {Promise}		Promise.
	 */
	_start(options)
	{

		return Promise.resolve().then(() => {
			return BITSMIST.v1.BasicPerk.init(this);
		}).then(() => {
			return this.skills.use("perk.attach", BITSMIST.v1.SettingPerk, options);
		}).then(() => {
			return this.skills.use("event.trigger", "beforeStart");
		}).then(() => {
			console.debug(`Component._start(): Starting component. name=${this.tagName}, id=${this.id}, uniqueId=${this._uniqueId}`);
			return this.skills.use("state.change", "starting");
		}).then(() => {
			if (this.settings.get("setting.autoTransform"))
			{
				return this.skills.use("basic.transform");
			}
		}).then(() => {
			if (this.settings.get("setting.autoSetup"))
			{
				return this.skills.use("basic.setup", options);
			}
		}).then(() => {
			return this.skills.use("event.trigger", "doStart");
		}).then(() => {
			if (this.settings.get("setting.autoRefresh"))
			{
				return this.skills.use("basic.refresh");
			}
		}).then(() => {
			window.getComputedStyle(this).getPropertyValue("visibility"); // Recalc styles

			console.debug(`Component._start(): Started component. name=${this.tagName}, id=${this.id}, uniqueId=${this._uniqueId}`);
			return this.skills.use("state.change", "started");
		}).then(() => {
			return this.skills.use("event.trigger", "afterStart");
		}).then(() => {
			console.debug(`Component._start(): Component is ready. name=${this.tagName}, id=${this.id}, uniqueId=${this._uniqueId}`);
			return this.skills.use("state.change", "ready");
		}).then(() => {
			return this.skills.use("event.trigger", "afterReady");
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Stop component.
	 *
	 * @param	{Object}		options				Options for the component.
	 *
	 * @return  {Promise}		Promise.
	 */
	_stop(options)
	{

		options = options || {};

		return Promise.resolve().then(() => {
			console.debug(`Component._stop(): Stopping component. name=${this.tagName}, id=${this.id}, uniqueId=${this._uniqueId}`);
			return this.skills.use("state.change", "stopping");
		}).then(() => {
			return this.skills.use("event.trigger", "beforeStop", options);
		}).then(() => {
			return this.skills.use("event.trigger", "doStop", options);
		}).then(() => {
			console.debug(`Component._stop(): Stopped component. name=${this.tagName}, id=${this.id}, uniqueId=${this._uniqueId}`);
			return this.skills.use("state.change", "stopped");
		}).then(() => {
			return this.skills.use("event.trigger", "afterStop", options);
		});

	}

}

customElements.define("bm-component", Component);
