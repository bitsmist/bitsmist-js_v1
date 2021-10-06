// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import ClassUtil from "./util/class-util.js";
import OrganizerOrganizer from "./organizer/organizer-organizer.js";
import SettingOrganizer from "./organizer/setting-organizer.js";
import Util from "./util/util.js";

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

	if (!this.isInitialized())
	{
		this.start();
	}

}

// -----------------------------------------------------------------------------

/**
 * Disconnected callback.
 */
Component.prototype.disconnectedCallback = function()
{

	if (this.settings.get("settings.autoStop"))
	{
		this.stop();
	}

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
			"autoSetup":			true,
			"autoPostStart":		true,
			"autoRefreshOnStart":	false,
			"autoStop":				true,
			"triggerAppendOnStart": true,
			"useGlobalSettings":	true,
		},
		"organizers": {
			"OrganizerOrganizer":	{"settings":{"attach":true}},
			"SettingOrganizer":		{"settings":{"attach":true}},
			"StateOrganizer":		{"settings":{"attach":true}},
			"EventOrganizer":		{"settings":{"attach":true}},
		}
	};
	settings = ( settings ? Util.deepMerge(defaults, settings) : defaults );

	// Init vars
	this.setAttribute("bm-powered", "");
	this._uniqueId = new Date().getTime().toString(16) + Math.floor(100*Math.random()).toString(16);
	this._name = this.constructor.name;
	this._rootElement = Util.safeGet(settings, "settings.rootElement", this);

	return Promise.resolve().then(() => {
		return this._initStart(settings);
	}).then(() => {
		return this._preStart();
	}).then(() => {
		if (this.settings.get("settings.autoPostStart"))
		{
			return this._postStart();
		}
	}).then(() => {
		// Refresh
		if (this.settings.get("settings.autoRefreshOnStart"))
		{
			return this.refresh();
		}
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

	options = Object.assign({}, options);

	return Promise.resolve().then(() => {
		console.debug(`Component.stop(): Stopping component. name=${this.name}, id=${this.id}`);
		return this.changeState("stopping");
	}).then(() => {
		return this.trigger("beforeStop", options);
	}).then(() => {
		return this.trigger("doStop", options);
	}).then(() => {
		return this.trigger("afterStop", options);
	}).then(() => {
		console.debug(`Component.stop(): Stopped component. name=${this.name}, id=${this.id}`);
		return this.changeState("stopped");
	});

}

// -----------------------------------------------------------------------------

/**
 * Apply settings.
 *
 * @param	{Object}		options				Options.
 *
 * @return  {Promise}		Promise.
 */
Component.prototype.setup = function(options)
{

	options = Object.assign({}, options);

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

	options = Object.assign({}, options);

	return Promise.resolve().then(() => {
		console.debug(`Component.refresh(): Refreshing component. name=${this.name}`);
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
		return this.trigger("doRefresh", options);
	}).then(() => {
		return this.trigger("afterRefresh", options);
	}).then(() => {
		console.debug(`Component.refresh(): Refreshed component. name=${this.name}`);
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

	options = Object.assign({}, options);

	return Promise.resolve().then(() => {
		console.debug(`Component.fetch(): Fetching data. name=${this.name}`);
		return this.trigger("beforeFetch", options);
	}).then(() => {
		return this.callOrganizers("doFetch", options);
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

/**
 * Initialize start processing.
 *
 * @param	{Object}		settings			Settings.
 *
 * @return  {Promise}		Promise.
 */
Component.prototype._initStart = function(settings)
{

	return Promise.resolve().then(() => {
		return this._injectSettings(settings);
	}).then((newSettings) => {
		return SettingOrganizer.init(this, newSettings); // now settings are included in this.settings
	}).then(() => {
		return this.initOrganizers(this.settings.items);
	});

}

// -----------------------------------------------------------------------------

/**
 * Pre start processing.
 *
 * @return  {Promise}		Promise.
 */
Component.prototype._preStart = function()
{

	return Promise.resolve().then(() => {
		console.debug(`Component.start(): Starting component. name=${this.name}, id=${this.id}`);
		return this.changeState("starting");
	}).then(() => {
		return SettingOrganizer.organize("beforeStart", this, this.settings.items);
	}).then(() => {
		return this.addOrganizers(this.settings.items);
	}).then(() => {
		return this.callOrganizers("beforeStart", this.settings.items);
	}).then((newSettings) => {
		return this.trigger("beforeStart");
	}).then(() => {
		let autoSetupOnStart = this.settings.get("settings.autoSetupOnStart");
		let autoSetup = this.settings.get("settings.autoSetup");
		if ( autoSetupOnStart || (autoSetupOnStart !== false && autoSetup) )
		{
			return this.setup(this.settings.items);
		}
	}).then(() => {
		let triggerAppendOnStart = this.settings.get("settings.triggerAppendOnStart");
		if (triggerAppendOnStart)
		{
			return Promise.resolve().then(() => {
				return this.callOrganizers("afterAppend", this.settings.items);
			}).then(() => {
				return this.trigger("afterAppend", this.settings.items);
			});
		}
	});

}

// -----------------------------------------------------------------------------

/**
 * Post start processing.
 *
 * @return  {Promise}		Promise.
 */
Component.prototype._postStart = function()
{

	return Promise.resolve().then(() => {
		console.debug(`Component.start(): Started component. name=${this.name}, id=${this.id}`);
		return this.changeState("started");
	}).then(() => {
		return this.callOrganizers("afterStart", this.settings.items);
	}).then(() => {
		return this.trigger("afterStart");
	});

}

// -----------------------------------------------------------------------------

customElements.define("bm-component", Component);
