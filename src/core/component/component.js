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

	// Create a promise to prevent from start/stop while stopping/starting
	if (!this._ready)
	{
		this._ready = Promise.resolve();
	}

	// Start
	this._ready = this._ready.then(() => {
		if (!this._initialized || this.settings.get("settings.autoRestart"))
		{
			this._initialized = true;
			return this.start();
		}
		else
		{
			console.debug(`Component.start(): Restarted component. name=${this.name}, id=${this.id}`);
			return this.changeState("started");
		}
	});

}

// -----------------------------------------------------------------------------

/**
 * Disconnected callback.
 */
Component.prototype.disconnectedCallback = function()
{

	if (this.settings.get("settings.autoStop"))
	{
		this._ready = this._ready.then(() => {
			return this.stop();
		});
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
			"autoFetch":			true,
			"autoFill":				true,
			"autoPostStart":		true,
			"autoRefresh":			true,
			"autoRestart":			false,
			"autoSetup":			true,
			"autoStop":				true,
			"hasTemplate":			true,
			"useGlobalSettings":	true,
		},
		"organizers": {
			"OrganizerOrganizer":	{"settings":{"attach":true}},
			"SettingOrganizer":		{"settings":{"attach":true}},
			"StateOrganizer":		{"settings":{"attach":true}},
			"EventOrganizer":		{"settings":{"attach":true}},
			"LoaderOrganizer":		{"settings":{"attach":true}},
			"TemplateOrganizer":	{"settings":{"attach":true}},
		}
	};
	settings = ( settings ? Util.deepMerge(defaults, settings) : defaults );

	// Init vars
	this.setAttribute("bm-powered", "");
	this._uniqueId = new Date().getTime().toString(16) + Math.floor(100*Math.random()).toString(16);
	this._name = this.constructor.name;
	this._rootElement = Util.safeGet(settings, "settings.rootElement", this);

	return Promise.resolve().then(() => {
		return this._injectSettings(settings);
	}).then((newSettings) => {
		return SettingOrganizer.init(this, newSettings); // now settings are included in this.settings
	}).then(() => {
		this._adjustSettings();
		return this.initOrganizers(this.settings.items);
	}).then(() => {
		return this._preStart();
	}).then(() => {
		if (this.settings.get("settings.autoPostStart"))
		{
			return this._postStart();
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
		console.debug(`Component.stop(): Stopped component. name=${this.name}, id=${this.id}`);
		return this.changeState("stopped");
	}).then(() => {
		return this.trigger("afterStop", options);
	});

}

// -----------------------------------------------------------------------------

/**
 * Change template html.
 *
 * @param	{String}		templateName		Template name.
 * @param	{Object}		options				Options.
 *
 * @return  {Promise}		Promise.
 */
Component.prototype.switchTemplate = function(templateName, options)
{

	options = Object.assign({}, options);

	if (this.activeTemplateName === templateName)
	{
		return Promise.resolve();
	}

	return Promise.resolve().then(() => {
		// Switch template
		if (this.settings.get("settings.hasTemplate"))
		{
			return Promise.resolve().then(() => {
				console.debug(`Component.switchTemplate(): Switching template. name=${this.name}, templateName=${templateName}, id=${this.id}`);
				return this.addTemplate(templateName);
			}).then(() => {
				return this.applyTemplate(templateName);
			}).then(() => {
				console.debug(`Component.switchTemplate(): Switched template. name=${this.name}, templateName=${templateName}, id=${this.id}`);
			});
		}
	}).then(() => {
		// Setup
		let autoSetup = this.settings.get("settings.autoSetup");
		if (autoSetup)
		{
			return this.setup(this.settings.items);
		}
	 }).then(() => {
		this.hideConditionalElements();
 		return this.loadTags(this.rootElement);
	}).then(() => {
		return this.callOrganizers("afterAppend", this.settings.items);
	}).then(() => {
		return this.trigger("afterAppend", options);
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
		this.showConditionalElements(this.item);
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
 * Fill component.
 *
 * @param	{Object}		options				Options.
 *
 * @return  {Promise}		Promise.
 */
Component.prototype.fill = function(options)
{

	return Promise.resolve().then(() => {
		console.debug(`Component.fill(): Filling with data. name=${this.name}`);
		return this.trigger("beforeFill", options);
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
		return this.callOrganizers("beforeStart", this.settings.items);
	}).then(() => {
		return this.trigger("beforeStart");
	}).then(() => {
		return this.switchTemplate(this.settings.get("settings.templateName"));
	}).then(() => {
		// Refresh
		if (this.settings.get("settings.autoRefresh"))
		{
			return this.refresh();
		}
	}).then(() => {
		console.debug(`Component.start(): Started component. name=${this.name}, id=${this.id}`);
		return this.changeState("started");
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
		return this.callOrganizers("afterStart", this.settings.items);
	}).then(() => {
		return this.trigger("afterStart");
	});

}

// -----------------------------------------------------------------------------

/**
 * Adjust default settings according to current setttings.
 *
 * @param	{Object}		settings			Settings.
 */
Component.prototype._adjustSettings = function()
{

	// root element
	this._rootElement = this.settings.get("settings.rootElement", this);

	// Overwrite name if specified
	let name = this.settings.get("settings.name");
	if (name)
	{
		this._name = name;
	}

	// Do not refresh/setup on start when component is morphing
	if (this.settings.get("settings.autoMorph"))
	{
		this.settings.set("settings.autoRefresh", false);
		this.settings.set("settings.autoSetup", false);
	}

}

customElements.define("bm-component", Component);
