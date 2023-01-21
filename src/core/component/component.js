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
import OrganizerOrganizer from "../organizer/organizer-organizer.js";
import SettingOrganizer from "../organizer/setting-organizer.js";
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
		this._uniqueId = new Date().getTime().toString(16) + Math.floor(100*Math.random()).toString(16);
		this._name = this.constructor.name;
	}

	// Start
	this._ready = this._ready.then(() => {
		console.debug(`Component.connectedCallback(): Component is connected. name=${this.name}, id=${this.id}, uniqueId=${this._uniqueId}`);
		return this.changeState("connected");
	}).then(() => {
		if (!this._initialized || this.settings.get("settings.autoRestart"))
		{
			this._initialized = true;
			return this.start();
		}
		else
		{
			console.debug(`Component.start(): Restarted component. name=${this.name}, id=${this.id}`);
			return this.changeState("ready");
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
		if (this.settings.get("settings.autoStop"))
		{
			return this.stop();
		}
	}).then(() => {
		console.debug(`Component.disconnectedCallback(): Component is disconnected. name=${this.name}, id=${this.id}`);
		return this.changeState("disconnected");
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
		"settings": {
			"autoFetch":			true,
			"autoFill":				true,
			"autoRefresh":			true,
			"autoRestart":			false,
			"autoSetup":			true,
			"autoStop":				true,
			"hasTemplate":			true,
			"useGlobalSettings":	true,
		},
		"organizers": {
//			"OrganizerOrganizer":	{"settings":{"attach":true}},
//			"SettingOrganizer":		{"settings":{"attach":true}},
			"StateOrganizer":		{"settings":{"attach":true}},
			"EventOrganizer":		{"settings":{"attach":true}},
			"TemplateOrganizer":	{"settings":{"attach":true}},
			"ComponentOrganizer":	{"settings":{"attach":true}},
		}
	};
	settings = Util.deepMerge(defaults, settings);

	return Promise.resolve().then(() => {
		return this._injectSettings(settings);
	}).then((newSettings) => {
		return SettingOrganizer.attach(this, newSettings); // now settings are included in this.settings
	}).then(() => {
		this._name = this.settings.get("settings.name", this._name);
		this._rootElement = this.settings.get("settings.rootElement", this);
		return OrganizerOrganizer.attach(this);
	}).then(() => {
		console.debug(`Component.start(): Starting component. name=${this.name}, id=${this.id}`);
		return this.changeState("starting");
	}).then(() => {
		return this.trigger("beforeStart");
	}).then(() => {
		if (this.settings.get("settings.hasTemplate"))
		{
			return this.transform({"templateName":this.settings.get("settings.templateName")});
		}
	}).then(() => {
		if (this.settings.get("settings.autoRefresh"))
		{
			return this.refresh();
		}
	}).then(() => {
		return this.trigger("doStart");
	}).then(() => {
		console.debug(`Component.start(): Started component. name=${this.name}, id=${this.id}`);
		return this.changeState("started");
	}).then(() => {
		return this.trigger("afterStart");
	}).then(() => {
		console.debug(`Component.start(): Component is ready. name=${this.name}, id=${this.id}`);
		return this.changeState("ready");
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
		console.debug(`Component.stop(): Stopping component. name=${this.name}, id=${this.id}`);
		return this.changeState("stopping");
	}).then(() => {
		return this.trigger("beforeStop", options);
	}).then(() => {
		return this.trigger("doStop", options);
	}).then(() => {
		console.debug(`Component.stop(): Stopped component. name=${this.name}, id=${this.id}`);
		return this.changeState("stopped");
	}).then(() => {
		return this.trigger("afterStop", options);
	});

}

// -----------------------------------------------------------------------------

/**
 * Transform component.
 *
 * @param	{String}		templateName		Template name.
 * @param	{Object}		options				Options.
 *
 * @return  {Promise}		Promise.
 */
Component.prototype.transform = function(options)
{

	options = options || {};
	let templateName = Util.safeGet(options, "templateName", "");

	return Promise.resolve().then(() => {
		console.debug(`Component.transform(): Transforming. name=${this.name}, templateName=${templateName}, id=${this.id}`);
		return this.trigger("beforeTransform", options);
	}).then(() => {
		return this.trigger("doTransform", options);
	}).then(() => {
		// Setup
		let autoSetup = this.settings.get("settings.autoSetup");
		if (autoSetup)
		{
			return this.setup(options);
		}
	 }).then(() => {
 		return this.loadTags(this.rootElement, this.settings.get("loadings"));
	}).then(() => {
		return this.trigger("afterTransform", options);
	}).then(() => {
		console.debug(`Component.transform(): Transformed. name=${this.name}, templateName=${templateName}, id=${this.id}`);
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
		console.debug(`Component.setup(): Setting up component. name=${this.name}, state=${this.state}, id=${this.id}`);
		return this.trigger("beforeSetup", options);
	}).then(() => {
		return this.trigger("doSetup", options);
	}).then(() => {
		return this.trigger("afterSetup", options);
	}).then(() => {
		console.debug(`Component.setup(): Set up component. name=${this.name}, state=${this.state}, id=${this.id}`);
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
		console.debug(`Component.refresh(): Refreshing component. name=${this.name}, id=${this.id}`);
		return this.trigger("beforeRefresh", options);
	}).then(() => {
		return this.trigger("doTarget", options);
	}).then(() => {
		// Fetch
		if (Util.safeGet(options, "autoFetch", this.settings.get("settings.autoFetch")))
		{
			return this.fetch(options);
		}
	}).then(() => {
		// Fill
		if (Util.safeGet(options, "autoFill", this.settings.get("settings.autoFill")))
		{
			return this.fill(options);
		}
	}).then(() => {
		return this.trigger("doRefresh", options);
	}).then(() => {
		return this.trigger("afterRefresh", options);
	}).then(() => {
		console.debug(`Component.refresh(): Refreshed component. name=${this.name}, id=${this.id}`);
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
		console.debug(`Component.fetch(): Fetching data. name=${this.name}`);
		return this.trigger("beforeFetch", options);
	}).then(() => {
		return this.trigger("doFetch", options);
	}).then(() => {
		return this.trigger("afterFetch", options);
	}).then(() => {
		console.debug(`Component.fetch(): Fetched data. name=${this.name}`);
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
		console.debug(`Component.fill(): Filling with data. name=${this.name}`);
		return this.trigger("beforeFill", options);
	}).then(() => {
		let autoClear = Util.safeGet(options, "autoClear", this.settings.get("settings.autoClear"));
		if (autoClear)
		{
			return this.clear();
		}
	}).then(() => {
		return this.trigger("doFill", options);
	}).then(() => {
		return this.trigger("afterFill", options);
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

	return Promise.resolve().then(() => {
		console.debug(`Component.clear(): Clearing the component. name=${this.name}`);
		return this.trigger("beforeClear", options);
	}).then(() => {
		return this.trigger("doClear", options);
	}).then(() => {
		return this.trigger("afterClear", options);
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

customElements.define("bm-component", Component);
