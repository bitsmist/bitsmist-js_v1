// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import ClassUtil from './util/class-util';
import ComponentOrganizer from './organizer/component-organizer';
import EventMixin from './mixin/event-mixin';
import Store from './store';
import Util from './util/util';
import WaitforOrganizer from './organizer/waitfor-organizer';

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

// Inherit & Mixin
ClassUtil.inherit(Component, HTMLElement);
Object.assign(Component.prototype, EventMixin);

// customElements.define("bm-component", Component);

// -----------------------------------------------------------------------------
//  Callbacks
// -----------------------------------------------------------------------------

/**
 * Connected callback.
 */
Component.prototype.connectedCallback = function()
{

	if (!WaitforOrganizer.isInitialized(this))
	{
		return this.start();
	}
	else
	{
		return Promise.resolve();
	}

}

// -----------------------------------------------------------------------------

/**
 * Disconnected callback.
 */
Component.prototype.disconnectedCallback = function()
{

	if (this._settings.get("autoStop"))
	{
		return this.stop();
	}
	else
	{
		return Promise.resolve();
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
		return this._settings.get("name");
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
 * Status.
 *
 * @type	{String}
 */
Object.defineProperty(Component.prototype, 'status', {
	get()
	{
		return this._status;
	},
	set(value)
	{
		this._status = value;
	}
})

// -----------------------------------------------------------------------------

/**
 * Settings.
 *
 * @type	{String}
 */
Object.defineProperty(Component.prototype, 'settings', {
	get() {
		return this._settings;
	},
	configurable: true
})

// -----------------------------------------------------------------------------
//  Methods
// -----------------------------------------------------------------------------

/**
 * Open component.
 *
 * @param	{Object}		options				Options.
 *
 * @return  {Promise}		Promise.
 */
Component.prototype.open = function(options)
{

	options = Object.assign({}, options);
	let sender = ( options["sender"] ? options["sender"] : this );

	return Promise.resolve().then(() => {
//		return WaitforOrganizer.waitForTransitionableStatus(this, this._status, "opening")
//	}).then(() => {
		console.debug(`Component.open(): Opening component. name=${this.name}`);
		return this.changeStatus("opening");
	}).then(() => {
		return this.trigger("beforeOpen", sender, {"options":options});
	}).then(() => {
		if (this._settings.get("autoSetup"))
		{
			let defaultPreferences = Object.assign({}, BITSMIST.v1.Globals["preferences"].items);
			options["newPreferences"] = ( options["newPreferences"] ? options["newPreferences"] : defaultPreferences);
			return this.setup(options);
		}
	}).then(() => {
		if (this._settings.get("autoRefresh"))
		{
			return this.refresh();
		}
	}).then(() => {
		return this.trigger("doOpen", sender, {"options":options});
	}).then(() => {
		return this.trigger("afterOpen", sender, {"options":options});
	}).then(() => {
		console.debug(`Component.open(): Opened component. name=${this.name}`);
		return this.changeStatus("opened");
	});

}

// -----------------------------------------------------------------------------

/**
 * Close component.
 *
 * @param	{Object}		options				Options.
 *
 * @return  {Promise}		Promise.
 */
Component.prototype.close = function(options)
{

	options = Object.assign({}, options);
	let sender = ( options["sender"] ? options["sender"] : this );

	return Promise.resolve().then(() => {
//		return WaitforOrganizer.waitForTransitionableStatus(this, this._status, "closing")
//	}).then(() => {
		console.debug(`Component.close(): Closing component. name=${this.name}`);
		return this.changeStatus("closing");
	}).then(() => {
		return this.trigger("beforeClose", sender);
	}).then(() => {
		return this.trigger("doClose", sender);
	}).then(() => {
		return this.trigger("afterClose", sender);
	}).then(() => {
		console.debug(`Component.close(): Closed component. name=${this.name}`);
		return this.changeStatus("closed");
	});

}

// -----------------------------------------------------------------------------

/**
 * Refresh component.
 *
 * @return  {Promise}		Promise.
 */
Component.prototype.refresh = function(options)
{

	console.debug(`Component.refresh(): Refreshing component. name=${this.name}`);

	options = Object.assign({}, options);
	let sender = ( options["sender"] ? options["sender"] : this );

	return Promise.resolve().then(() => {
		return this.trigger("beforeRefresh", sender, {"options":options});
	}).then(() => {
		if (this._settings.get("autoFill"))
		{
			return this.fill(options);
		}
	}).then(() => {
		return this.trigger("doRefresh", sender, {"options":options});
	}).then(() => {
		return this.trigger("afterRefresh", sender, {"options":options});
	});

}

// -----------------------------------------------------------------------------

/**
 * Fill.
 *
 * @param	{Object}		options				Options.
 *
 * @return  {Promise}		Promise.
 */
Component.prototype.fill = function(options)
{
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

	console.debug(`Component.setup(): Setting up component. name=${this.name}`);

	options = Object.assign({}, options);
	let sender = ( options["sender"] ? options["sender"] : this );

	return Promise.resolve().then(() => {
		return this.trigger("beforeSetup", sender, options);
	}).then(() => {
		return this.trigger("doSetup", sender, options);
	}).then(() => {
		return this.trigger("afterSetup", sender, options);
	});

}

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

	return Promise.resolve().then(() => {
//		return WaitforOrganizer.waitForTransitionableStatus(this, this._status, "starting")
	// }).then(() => {
		return this._injectSettings(settings);
	 }).then((newSettings) => {
		return this.__init(newSettings);
	 }).then(() => {
		return this._injectEvents();
	}).then(() => {
		console.debug(`Component.start(): Starting component. name=${this.name}`);
		return this.changeStatus("starting");
	}).then(() => {
		return this.trigger("beforeStart", this);
	}).then(() => {
		// Load extra settings
		return this.__loadExtraSettings();
	}).then((extraSettings) => {
		if (extraSettings)
		{
			this._settings.merge(extraSettings);
		}
	}).then(() => {
		// Get settings from attributes
		let attrSettings = this.__getSettingsFromAttribute();
		if (attrSettings)
		{
			this._settings.merge(attrSettings);
		}
	}).then(() => {
		return BITSMIST.v1.Globals.organizers.notify("organize", "afterStart", this, this._settings.items);
	}).then(() => {
		return this.trigger("afterStart", this);
	}).then(() => {
		console.debug(`Component.start(): Started component. name=${this.name}`);
		return this.changeStatus("started");
	}).then(() => {
		// Open
		if (this._settings.get("autoOpen"))
		{
			return this.open();
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

	return Promise.resolve().then(() => {
//		return WaitforOrganizer.waitForTransitionableStatus(this, this._status, "stopping")
	// }).then(() => {
		// Close
		if (this._settings.get("autoClose"))
		{
			return this.close();
		}
	}).then(() => {
		console.debug(`Component.stop(): Stopping component. name=${this.name}`);
		return this.changeStatus("stopping");
	}).then(() => {
		return this.trigger("beforeStop", this);
	}).then(() => {
		return this.trigger("doStop", this);
	}).then(() => {
		return this.trigger("afterStop", this);
	}).then(() => {
		console.debug(`Component.stop(): Stopped component. name=${this.name}`);
		return this.changeStatus("stopped");
	});

}

// -----------------------------------------------------------------------------

/**
 * Add a component.
 *
 * @param	{String}		componentName		Component name.
 * @param	{Object}		options				Options for the component.
 *
 * @return  {Promise}		Promise.
 */
Component.prototype.addComponent = function(componentName, options)
{

	return ComponentOrganizer.addComponent(this, componentName, options);

}

// -----------------------------------------------------------------------------

/**
 * Wait for components to become specific statuses.
 *
 * @param	{Array}			waitlist			Components to wait.
 * @param	{integer}		timeout				Timeout in milliseconds.
 *
 * @return  {Promise}		Promise.
 */
Component.prototype.waitFor = function(waitlist, timeout)
{

	return WaitforOrganizer.waitFor(this, waitlist, timeout);

}

// -------------------------------------------------------------------------

/**
 * Change status.
 *
 * @param	{String}		status				Component status.
 *
 * @return  {Promise}		Promise.
 */
Component.prototype.changeStatus = function(status)
{

	return WaitforOrganizer.changeStatus(this, status);

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
 * Inject event handlers.
 */
Component.prototype._injectEvents = function()
{
}

// -----------------------------------------------------------------------------

/**
 * Get component options.  Need to override.
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
 * Init component.
 *
 * @return  {Promise}		Promise.
 */
Component.prototype.__init = function(settings)
{

	// Init variables
	this._uniqueId = new Date().getTime().toString(16) + Math.floor(100*Math.random()).toString(16);

	// Init settings
	let defaults = {
		"autoOpen": true,
		"autoClose": true,
		"autoSetup":true,
		"autoStop":true
	};
	this._settings = new Store({"items":Object.assign({}, defaults, this._getSettings(), settings)});
	this._settings.set("name", this._settings.get("name", this.constructor.name));
	this._settings.chain(BITSMIST.v1.Globals["settings"]);

	// Init organizers
	return BITSMIST.v1.Globals.organizers.notify("init", "*", this);

}

// -----------------------------------------------------------------------------

/**
 * Load an extra setting file.
 *
 * @return  {Promise}		Promise.
 */
Component.prototype.__loadExtraSettings = function()
{

	// Load extra settings
	let arr = this.__getPathFromAttribute();
	let settingsPath = arr[0];
	let settingsName = arr[1];
	if (settingsName || settingsPath)
	{
		return ComponentOrganizer.loadSetting(settingsName, settingsPath);
	}

}

// -----------------------------------------------------------------------------

/**
 * Get settings path and name from attribute.
 */
Component.prototype.__getPathFromAttribute = function(attrName)
{

	let name, path;
	attrName = attrName || "setting";

	if (this.hasAttribute("data-" + attrName + "href"))
	{
		let arr = Util.getFilenameAndPathFromUrl(this.getAttribute("data-" + attrName + "href"));
		path = arr[0];
		name = arr[1].slice(0, -3);
	}
	else
	{
		path = ( this.hasAttribute("data-" + attrName + "path") ? this.getAttribute("data-" + attrName + "path") : "" );
		name = ( this.hasAttribute("data-" + attrName + "name") ? this.getAttribute("data-" + attrName + "name") : "" );
		if (path && !name)
		{
			name = "settings";
		}
	}

	return [path, name];

}

// -----------------------------------------------------------------------------

/**
 * Get settings from element's attribute.
 */
Component.prototype.__getSettingsFromAttribute = function()
{

	// Get path from href
	if (this.hasAttribute("href"))
	{
		let arr = Util.getFilenameAndPathFromUrl(this.getAttribute("href"));
		this._settings.set("system.appBaseUrl", "");
		this._settings.set("system.templatePath", arr[0]);
		this._settings.set("system.componentPath", arr[0]);
		this._settings.set("path", "");
	}

	/*
	// Get template path from attribute
	if (this.hasAttribute("data-templatepath"))
	{
		this._settings.set("system.templatePath", this.getAttribute("data-templatepath"));
	}

	// Get template name from attribute
	if (this.hasAttribute("data-templatename"))
	{
		this._settings.set("templateName", this.getAttribute("data-templatename"));
	}

	// Get template href from templatehref
	if (this.hasAttribute("data-templatehref"))
	{
		let arr = Util.getFilenameAndPathFromUrl(this.getAttribute("data-templatehref"));
		this._settings.set("system.templatePath", arr[0]);
		this._settings.set("templateName", arr[1].replace(".html", ""));
	}
	*/

	// Get path from attribute
	if (this.hasAttribute("data-path"))
	{
		this._settings.set("path", this.getAttribute("data-path"));
	}

	// Get settings from the attribute

	let dataSettings = ( this._settings.get("rootNode") ?
		document.querySelector(this._settings.get("rootNode")).getAttribute("data-settings") :
		this.getAttribute("data-settings")
	);

	if (dataSettings) {
		let settings = JSON.parse(dataSettings);
		Object.keys(settings).forEach((key) => {
			this._settings.set(key, settings[key]);
		});
	}

}
