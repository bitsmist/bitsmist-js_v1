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
import ComponentInitializer from './initializer/component-initializer';
import EventMixin from './mixin/event-mixin';
import Globals from './globals';
import InitializerMixin from './mixin/initializer-mixin';
import LoaderMixin from './mixin/loader-mixin';
import Store from './store';
import Util from './util/util';
import WaitforMixin from './mixin/waitfor-mixin';

// =============================================================================
//	Component class
// =============================================================================

// -----------------------------------------------------------------------------
//  Constructor
// -----------------------------------------------------------------------------

/**
 * Constructor.
 *
 * @param	{Object}		settings			Settings.
 */
export default function Component(settings)
{

	// super()
	let _this = Reflect.construct(HTMLElement, [], this.constructor);

	// Init variables
	_this._element = _this;
	_this._status = "";
	_this._uniqueId = new Date().getTime().toString(16) + Math.floor(100*Math.random()).toString(16);

	// Init stores
	let defaults = {
		"autoOpen": true,
		"autoSetup":true
	};
	settings = Object.assign({}, defaults, settings, _this._getSettings());
	_this._settings = new Store({"items":settings});
	_this._settings.chain(Globals["settings"]);
	let preferences = Object.assign({}, settings["preferences"]);
	_this._preferences = new Store({"items":preferences});
	_this._preferences.chain(Globals["preferences"]);
	_this._store = new Store();

	// Init settings
	_this._settings.set("name", Util.safeGet(settings, "name", _this.constructor.name));

	_this.applyInitializerSync(_this._settings.items, "initComponent");
	_this.trigger("initComponent", _this);

	return _this;

}

// Inherit & Mixin
ClassUtil.inherit(Component, HTMLElement);
Object.assign(Component.prototype, EventMixin);
Object.assign(Component.prototype, InitializerMixin);
Object.assign(Component.prototype, LoaderMixin);
Object.assign(Component.prototype, WaitforMixin);

customElements.define("bm-component", Component);

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
 * Element.
 *
 * @type	{String}
 */
Object.defineProperty(Component.prototype, 'element', {
	get()
	{
		return this._element;
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
		return ( this.id ? this.id : this._uniqueId );
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

/**
 * Preferences.
 *
 * @type	{String}
 */
Object.defineProperty(Component.prototype, 'preferences', {
	get()
	{
		return this._preferences;
	},
	configurable: true
})

// -----------------------------------------------------------------------------

/**
 * Store.
 *
 * @type	{String}
 */
Object.defineProperty(Component.prototype, 'store', {
	get()
	{
		return this._store;
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

	console.debug(`Component.open(): Opening component. name=${this.name}`);

	return new Promise((resolve, reject) => {
		options = Object.assign({}, options);
		let sender = ( options["sender"] ? options["sender"] : this );

		this.registerComponent(this, "opening");
		Promise.resolve().then(() => {
			if (this._settings.get("autoSetup"))
			{
				return this.setup();
			}
		}).then(() => {
			if (this._settings.get("autoRefresh"))
			{
				return this.refresh();
			}
		}).then(() => {
			return this.trigger("beforeOpen", sender, {"options":options});
		}).then(() => {
			return this.trigger("open", sender, {"options":options});
		}).then(() => {
			console.debug(`Component.open(): Opened component. name=${this.name}`);
			this.registerComponent(this, "opened");
			resolve();
		});
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

	console.debug(`Component.close(): Closing component. name=${this.name}`);

	return new Promise((resolve, reject) => {
		options = Object.assign({}, options);
		let sender = ( options["sender"] ? options["sender"] : this );

		this.registerComponent(this, "closing");
		Promise.resolve().then(() => {
			return this.trigger("beforeClose", sender);
		}).then(() => {
			return this.trigger("close", sender);
		}).then(() => {
			console.debug(`Component.close(): Closed component. name=${this.name}`);
			if (this._isModal)
			{
				this._modalPromise.resolve(this._modalResult);
			}
			this.registerComponent(this, "closed");
			resolve();
		});
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

	return new Promise((resolve, reject) => {
		options = Object.assign({}, options);
		let sender = ( options["sender"] ? options["sender"] : this );

		Promise.resolve().then(() => {
			return this.trigger("beforeRefresh", sender, {"options":options});
		}).then(() => {
			if (this._settings.get("autoFill"))
			{
				return this.fill(options);
			}
		}).then(() => {
			return this.trigger("refresh", sender, {"options":options});
		}).then(() => {
			resolve();
		});
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

	console.debug(`Component.setup(): Setting up component. name=${this.name}`);

	return new Promise((resolve, reject) => {
		options = Object.assign({}, options);
		let defaultPreferences = Object.assign({}, this._preferences.items);
		options["currentPreferences"] = ( options["currentPreferences"] ? options["currentPreferences"] : defaultPreferences);
		options["newPreferences"] = ( options["newPreferences"] ? options["newPreferences"] : defaultPreferences);
		let sender = ( options["sender"] ? options["sender"] : this );

		Promise.resolve().then(() => {
			return this.trigger("formatSettings", sender, options);
		}).then(() => {
			return this.trigger("validateSettings", sender,  options);
		}).then(() => {
			return this.trigger("beforeSetup", sender, options);
		}).then(() => {
			return this.trigger("setup", sender, options);
		}).then(() => {
			resolve();
		});
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

	return ComponentInitializer.addComponent(this, componentName, options);

}

// -----------------------------------------------------------------------------
//  Callbacks
// -----------------------------------------------------------------------------

/**
 * Connected callback.
 */
Component.prototype.connectedCallback = function()
{

	console.debug(`Component.connectedCallback(): Component is connected. name=${this.name}`);

	Promise.resolve().then(() => {
		// Load extra settings
		let arr = this.__getPathFromAttribute();
		let settingsPath = arr[0];
		let settingsName = arr[1];
		if (settingsName || settingsPath)
		{
			return this.loadSetting(settingsName, settingsPath);
		}
	}).then((newSettings) => {
		if (newSettings)
		{
			this._settings.merge(newSettings);
			return this.applyInitializer(newSettings, "connected");
		}
	}).then(() => {
		// Get settings from attributes
		let attrSettings = this.__getSettingsFromAttribute();
		if (attrSettings)
		{
			this._settings.merge(attrSettings);
			return this.applyInitializer(attrSettings, "connected");
		}
	}).then(() => {
		// Trigger an event
		return this.trigger("connected", this);
	}).then(() => {
		// Register as connected
		this.registerComponent(this, "connected");
	}).then(() => {
		// Open
		if (this._settings.get("autoOpen"))
		{
			this.open();
		}
	});

}

// -----------------------------------------------------------------------------
//  Protected
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
 * Get settings path and name from attribute.
 */
Component.prototype.__getPathFromAttribute = function(attrName)
{

	let name, path;
	attrName = attrName || "setting";

	let href = ( this._element.getAttribute("data-" + attrName + "href") ? this._element.getAttribute("data-" + attrName + "href") : "" );
	if (href)
	{
		name = href.slice(0, -3);
		path = "";
	}
	else
	{
		path = ( this._element.getAttribute("data-" + attrName + "path") ? this._element.getAttribute("data-" + attrName + "path") : "" );
		name = ( this._element.getAttribute("data-" + attrName + "name") ? this._element.getAttribute("data-" + attrName + "name") : "" );
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

	// Get options from the attribute
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
