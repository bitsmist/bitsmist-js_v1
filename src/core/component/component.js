// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import ClassUtil from "../util/class-util.js";
import Util from "../util/util.js";

// =============================================================================
//	Component class
// =============================================================================

// -----------------------------------------------------------------------------
//  Constructor
// -----------------------------------------------------------------------------

/**
 * Constructor.
 */
export default function Component()
{

	// super()
	return Reflect.construct(HTMLElement, [], this.constructor);

}

ClassUtil.inherit(Component, HTMLElement);

// -----------------------------------------------------------------------------
//  Callbacks
// -----------------------------------------------------------------------------

/**
 * Connected callback.
 */
Component.prototype.connectedCallback = function()
{

	// The first time only initialization
	if (!this._ready)
	{
		// Create a promise to prevent from start/stop while stopping/starting
		this._ready = Promise.resolve();

		this.setAttribute("bm-powered", "");
		this._uniqueId = Util.getUUID();
		this._name = this.constructor.name;
		this._rootElement = this;
	}

	// Start
	this._ready = this._ready.then(() => {
		console.debug(`Component.connectedCallback(): Component is connected. name=${this._name}, id=${this.id}, uniqueId=${this._uniqueId}`);
		//return this.skills.use("state.change", "connected");
	}).then(() => {
		if (!this._initialized || this.settings.get("setting.autoRestart"))
		{
			this._initialized = true;
			return this._start();
		}
		else
		{
			console.debug(`Component.connectedCallback(): Restarted component. name=${this._name}, id=${this.id}, uniqueId=${this._uniqueId}`);
			return this.skills.use("state.change", "ready");
		}
	});

}

// -----------------------------------------------------------------------------

/**
 * Disconnected callback.
 */
Component.prototype.disconnectedCallback = function()
{

	// Stop
	this._ready = this._ready.then(() => {
		if (this.settings.get("setting.autoStop"))
		{
			return this._stop();
		}
	}).then(() => {
		console.debug(`Component.disconnectedCallback(): Component is disconnected. name=${this._name}, id=${this.id}, uniqueId=${this._uniqueId}`);
		return this.skills.use("state.change", "disconnected");
	});

}

// -----------------------------------------------------------------------------

/**
 * Adopted callback.
 */
Component.prototype.adoptedCallback = function()
{
}

// -----------------------------------------------------------------------------

/**
 * Attribute changed callback.
 */
Component.prototype.attributeChangedCallback = function()
{
}

// -----------------------------------------------------------------------------
//  Setter/Getter
// -----------------------------------------------------------------------------

/**
 * Component name.
 *
 * @type	{String}
 */
Object.defineProperty(Component.prototype, 'name', {
	get()
	{
		return this._name;
	}
})

// -----------------------------------------------------------------------------

/**
 * Instance's unique id.
 *
 * @type	{String}
 */
Object.defineProperty(Component.prototype, 'uniqueId', {
	get()
	{
		return this._uniqueId;
	}
})

// -----------------------------------------------------------------------------

/**
 * Root element.
 *
 * @type	{HTMLElement}
 */
Object.defineProperty(Component.prototype, 'rootElement', {
	get()
	{
		return this._rootElement;
	}
})

// -----------------------------------------------------------------------------
//  Protected
// -----------------------------------------------------------------------------

/**
 * Start component.
 *
 * @param	{Object}		settings			Settings.
 *
 * @return  {Promise}		Promise.
 */
Component.prototype._start = function(options)
{

	return Promise.resolve().then(() => {
		return BITSMIST.v1.BasicPerk.init(this);
	}).then(() => {
		return this.skills.use("perk.attach", BITSMIST.v1.SettingPerk, options);
	}).then(() => {
		return this.skills.use("event.trigger", "beforeStart");
	}).then(() => {
		console.debug(`Component._start(): Starting component. name=${this._name}, id=${this.id}, uniqueId=${this._uniqueId}`);
		return this.skills.use("state.change", "starting");
	}).then(() => {
		if (this.settings.get("setting.autoTransform"))
		{
			return this.skills.use("basic.transform");
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

		console.debug(`Component._start(): Started component. name=${this._name}, id=${this.id}, uniqueId=${this._uniqueId}`);
		return this.skills.use("state.change", "started");
	}).then(() => {
		return this.skills.use("event.trigger", "afterStart");
	}).then(() => {
		console.debug(`Component._start(): Component is ready. name=${this._name}, id=${this.id}, uniqueId=${this._uniqueId}`);
		return this.skills.use("state.change", "ready");
	}).then(() => {
		return this.skills.use("event.trigger", "afterReady");
	});

}

// -----------------------------------------------------------------------------

/**
 * Stop component.
 *
 * @param	{Object}		options				Options for the component.
 *
 * @return  {Promise}		Promise.
 */
Component.prototype._stop = function(options)
{

	options = options || {};

	return Promise.resolve().then(() => {
		console.debug(`Component._stop(): Stopping component. name=${this._name}, id=${this.id}, uniqueId=${this._uniqueId}`);
		return this.skills.use("state.change", "stopping");
	}).then(() => {
		return this.skills.use("event.trigger", "beforeStop", options);
	}).then(() => {
		return this.skills.use("event.trigger", "doStop", options);
	}).then(() => {
		console.debug(`Component._stop(): Stopped component. name=${this._name}, id=${this.id}, uniqueId=${this._uniqueId}`);
		return this.skills.use("state.change", "stopped");
	}).then(() => {
		return this.skills.use("event.trigger", "afterStop", options);
	});

}

// -----------------------------------------------------------------------------

/**
 * Execute query on this component excluding nested components inside.
 *
 * @param	{String}		query				Query.
 *
 * @return  {Array}			Array of matched elements.
 */
Component.prototype._scopedSelectorAll = function(query)
{

	return Util.scopedSelectorAll(this, query);

}

// -----------------------------------------------------------------------------

customElements.define("bm-component", Component);
