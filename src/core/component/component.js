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
import PerkPerk from "../perk/perk-perk.js";
import SettingPerk from "../perk/setting-perk.js";
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
			return this.start();
		}
		else
		{
			console.debug(`Component.start(): Restarted component. name=${this._name}, id=${this.id}, uniqueId=${this._uniqueId}`);
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
			return this.stop();
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
//  Methods
// -----------------------------------------------------------------------------

/**
 * Start component.
 *
 * @param	{Object}		settings			Settings.
 *
 * @return  {Promise}		Promise.
 */
Component.prototype.start = function(settings)
{

	// Defaults
	let defaults = {
		"setting": {
			"autoClear":			true,
			"autoFetch":			true,
			"autoFill":				true,
			"autoRefresh":			true,
			"autoRestart":			false,
			"autoSetup":			true,
			"autoStop":				true,
			"autoTransform":		true,
			"useGlobalSettings":	true,
		},
		"perk": {
//			"PerkPerk":			{"setting":{"attach":true}},	// Attach manually
//			"SettingPerk":		{"setting":{"attach":true}},	// Attach manually
			"StatePerk":		{"setting":{"attach":true}},
			"EventPerk":		{"setting":{"attach":true}},
			"SkinPerk":			{"setting":{"attach":true}},
			"ComponentPerk":	{"setting":{"attach":true}},
		}
	};
	settings = Util.deepMerge(defaults, settings);

	return Promise.resolve().then(() => {
		return PerkPerk.init(this, PerkPerk);
	//	return PerkPerk.attach(this, PerkPerk);
	}).then(() => {
		return this._injectSettings(settings);
	}).then((newSettings) => {
		return this.__mergeSettings(newSettings);
	}).then((newSettings) => {
		return this.skills.use("perk.attach", SettingPerk, {"settings":newSettings});
	}).then(() => {
		return this.skills.use("event.trigger", "beforeStart");
	}).then(() => {
		console.debug(`Component.start(): Starting component. name=${this._name}, id=${this.id}, uniqueId=${this._uniqueId}`);
		return this.skills.use("state.change", "starting");
	}).then(() => {
		if (this.settings.get("setting.autoTransform"))
		{
			return this.transform();
		}
	}).then(() => {
		return this.skills.use("event.trigger", "doStart");
	}).then(() => {
		if (this.settings.get("setting.autoRefresh"))
		{
			return this.refresh();
		}
	}).then(() => {
		window.getComputedStyle(this).getPropertyValue("visibility"); // Recalc styles

		console.debug(`Component.start(): Started component. name=${this._name}, id=${this.id}, uniqueId=${this._uniqueId}`);
		return this.skills.use("state.change", "started");
	}).then(() => {
		return this.skills.use("event.trigger", "afterStart");
	}).then(() => {
		console.debug(`Component.start(): Component is ready. name=${this._name}, id=${this.id}, uniqueId=${this._uniqueId}`);
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
Component.prototype.stop = function(options)
{

	options = options || {};

	return Promise.resolve().then(() => {
		console.debug(`Component.stop(): Stopping component. name=${this._name}, id=${this.id}, uniqueId=${this._uniqueId}`);
		return this.skills.use("state.change", "stopping");
	}).then(() => {
		return this.skills.use("event.trigger", "beforeStop", options);
	}).then(() => {
		return this.skills.use("event.trigger", "doStop", options);
	}).then(() => {
		console.debug(`Component.stop(): Stopped component. name=${this._name}, id=${this.id}, uniqueId=${this._uniqueId}`);
		return this.skills.use("state.change", "stopped");
	}).then(() => {
		return this.skills.use("event.trigger", "afterStop", options);
	});

}

// -----------------------------------------------------------------------------

/**
 * Transform component (Load HTML and attach to node).
 *
 * @param	{Object}		options				Options.
 *
 * @return  {Promise}		Promise.
 */
Component.prototype.transform = function(options)
{

	options = options || {};

	return Promise.resolve().then(() => {
		console.debug(`Component.transform(): Transforming. name=${this.name}, id=${this.id}, uniqueId=${this.uniqueId}`);
		return this.skills.use("event.trigger", "beforeTransform", options);
	}).then(() => {
		return this.skills.use("event.trigger", "doTransform", options);
	}).then(() => {
		// Setup
		let autoSetup = this.settings.get("setting.autoSetup");
		if (autoSetup)
		{
			return this.setup(options);
		}
	}).then(() => {
		return this.skills.use("component.loadTags", this.rootElement);
	}).then(() => {
		console.debug(`Component.transform(): Transformed. name=${this.name}, id=${this.id}, uniqueId=${this.uniqueId}`);
		return this.skills.use("event.trigger", "afterTransform", options);
	});

}

// -----------------------------------------------------------------------------

/**
 * Setup component.
 *
 * @param	{Object}		options				Options.
 *
 * @return  {Promise}		Promise.
 */
Component.prototype.setup = function(options)
{

	options = options || {};

	return Promise.resolve().then(() => {
		console.debug(`Component.setup(): Setting up component. name=${this._name}, state=${this.state}, id=${this.id}, uniqueId=${this._uniqueId}`);
		return this.skills.use("event.trigger", "beforeSetup", options);
	}).then(() => {
		return this.skills.use("event.trigger", "doSetup", options);
	}).then(() => {
		console.debug(`Component.setup(): Set up component. name=${this._name}, state=${this.state}, id=${this.id}, uniqueId=${this._uniqueId}`);
		return this.skills.use("event.trigger", "afterSetup", options);
	});

}

// -----------------------------------------------------------------------------

/**
 * Refresh component.
 *
 * @param	{Object}		options				Options.
 *
 * @return  {Promise}		Promise.
 */
Component.prototype.refresh = function(options)
{

	options = options || {};

	return Promise.resolve().then(() => {
		console.debug(`Component.refresh(): Refreshing component. name=${this._name}, id=${this.id}, uniqueId=${this._uniqueId}`);
		return this.skills.use("event.trigger", "beforeRefresh", options);
	}).then(() => {
		let autoClear = Util.safeGet(options, "autoClear", this.settings.get("setting.autoClear"));
		if (autoClear)
		{
			return this.clear(options);
		}
	}).then(() => {
		return this.skills.use("event.trigger", "doTarget", options);
	}).then(() => {
		// Fetch
		if (Util.safeGet(options, "autoFetch", this.settings.get("setting.autoFetch")))
		{
			return this.fetch(options);
		}
	}).then(() => {
		// Fill
		if (Util.safeGet(options, "autoFill", this.settings.get("setting.autoFill")))
		{
			return this.fill(options);
		}
	}).then(() => {
		return this.skills.use("event.trigger", "doRefresh", options);
	}).then(() => {
		console.debug(`Component.refresh(): Refreshed component. name=${this._name}, id=${this.id}, uniqueId=${this._uniqueId}`);
		return this.skills.use("event.trigger", "afterRefresh", options);
	});

}

// -----------------------------------------------------------------------------

/**
 * Fetch data.
 *
 * @param	{Object}		options				Options.
 *
 * @return  {Promise}		Promise.
 */
Component.prototype.fetch = function(options)
{

	options = options || {};

	return Promise.resolve().then(() => {
		console.debug(`Component.fetch(): Fetching data. name=${this._name}, uniqueId=${this._uniqueId}`);
		return this.skills.use("event.trigger", "beforeFetch", options);
	}).then(() => {
		return this.skills.use("event.trigger", "doFetch", options);
	}).then(() => {
		return this.skills.use("event.trigger", "afterFetch", options);
	}).then(() => {
		console.debug(`Component.fetch(): Fetched data. name=${this._name}, uniqueId=${this._uniqueId}`);
	});

}

// -----------------------------------------------------------------------------

/**
 * Fill component.
 *
 * @param	{Object}		options				Options.
 *
 * @return  {Promise}		Promise.
 */
Component.prototype.fill = function(options)
{

	options = options || {};

	return Promise.resolve().then(() => {
		console.debug(`Component.fill(): Filling with data. name=${this._name}, uniqueId=${this._uniqueId}`);
		return this.skills.use("event.trigger", "beforeFill", options);
	}).then(() => {
		return this.skills.use("event.trigger", "doFill", options);
	}).then(() => {
		console.debug(`Component.fill(): Filled with data. name=${this._name}, uniqueId=${this._uniqueId}`);
		return this.skills.use("event.trigger", "afterFill", options);
	});

}

// -----------------------------------------------------------------------------

/**
 * Clear component.
 *
 * @param	{Object}		options				Options.
 *
 * @return  {Promise}		Promise.
 */
Component.prototype.clear = function(options)
{

	options = options || {};

	return Promise.resolve().then(() => {
		console.debug(`Component.clear(): Clearing the component. name=${this._name}, uniqueId=${this._uniqueId}`);
		return this.skills.use("event.trigger", "beforeClear", options);
	}).then(() => {
		return this.skills.use("event.trigger", "doClear", options);
	}).then(() => {
		console.debug(`Component.clear(): Cleared the component. name=${this._name}, uniqueId=${this._uniqueId}`);
		return this.skills.use("event.trigger", "afterClear", options);
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
Component.prototype.scopedSelectorAll = function(query)
{

	return Util.scopedSelectorAll(this, query);

}

// -----------------------------------------------------------------------------
//  Protected
// -----------------------------------------------------------------------------

/**
 * Inject settings.
 *
 * @param	{Object}		settings			Settings.
 *
 * @return  {Object}		New settings.
 */
Component.prototype._injectSettings = function(settings)
{

	return settings;

}

// -----------------------------------------------------------------------------

/**
 * Get component settings. Need to override.
 *
 * @return  {Object}		Options.
 */
Component.prototype._getSettings = function()
{

	return {};

}

// -----------------------------------------------------------------------------
//  Privates
// -----------------------------------------------------------------------------

/**
 * Inject settings.
 *
 * @param	{Object}		settings			Settings.
 *
 * @return  {Object}		New settings.
 */
Component.prototype.__mergeSettings = function(settings)
{

	let curComponent = Object.getPrototypeOf(this);
	let curSettings = {};
	let parentSettings;

	// Merge superclass settings
	while (typeof(Object.getPrototypeOf(curComponent)._getSettings) === "function")
	{
		parentSettings = Object.getPrototypeOf(curComponent)._getSettings();
		if (Object.keys(parentSettings).length > 0)
		{
			Util.deepMerge(parentSettings, curSettings);
			curSettings = parentSettings;
		}

		curComponent= Object.getPrototypeOf(curComponent);
	}
	Util.deepMerge(settings, curSettings);

	// Merge this settings
	Util.deepMerge(settings, this._getSettings());

	return settings;

}

customElements.define("bm-component", Component);
