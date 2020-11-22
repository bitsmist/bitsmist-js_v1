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
import LoaderMixin from './mixin/loader-mixin';
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
 *
 * @param	{Object}		settings			Settings.
 */
export default function Component(settings)
{

	// super()
	let _this = Reflect.construct(HTMLElement, [], this.constructor);

	// Init variables
	_this._status = "";
	_this._uniqueId = new Date().getTime().toString(16) + Math.floor(100*Math.random()).toString(16);

	// Init stores
	let defaults = {
		"autoOpen": true,
		"autoClose": true,
		"autoSetup":true
	};
	settings = Object.assign({}, defaults, settings, _this._getSettings());
	_this._settings = new Store({"items":settings});
	_this._settings.chain(BITSMIST.v1.Globals["settings"]);

	// Init settings
	_this._settings.set("name", Util.safeGet(settings, "name", _this.constructor.name));

	BITSMIST.v1.Globals.organizers.notifySync("organize", "afterInitComponent", _this, _this._settings.items);
	_this.triggerSync("afterInitComponent", _this);

	WaitforOrganizer.changeStatus(_this, "instantiated");

	return _this;

}

// Inherit & Mixin
ClassUtil.inherit(Component, HTMLElement);
Object.assign(Component.prototype, EventMixin);
Object.assign(Component.prototype, LoaderMixin);

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

	return new Promise((resolve, reject) => {
		options = Object.assign({}, options);
		let sender = ( options["sender"] ? options["sender"] : this );

		Promise.resolve().then(() => {
//			return WaitforOrganizer.waitForTransitionableStatus(this, this._status, "opening")
//		}).then(() => {
			return this.changeStatus("opening");
		}).then(() => {
			console.debug(`Component.open(): Opening component. name=${this.name}`);
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
			return this.trigger("beforeOpen", sender, {"options":options});
		}).then(() => {
			return this.trigger("afterOpen", sender, {"options":options});
		}).then(() => {
			return this.changeStatus("opened");
		}).then(() => {
			console.debug(`Component.open(): Opened component. name=${this.name}`);
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

	return new Promise((resolve, reject) => {
		options = Object.assign({}, options);
		let sender = ( options["sender"] ? options["sender"] : this );

		Promise.resolve().then(() => {
//			return WaitforOrganizer.waitForTransitionableStatus(this, this._status, "closing")
//		}).then(() => {
			return this.changeStatus("closing");
		}).then(() => {
			console.debug(`Component.close(): Closing component. name=${this.name}`);
			return this.trigger("beforeClose", sender);
		}).then(() => {
			return this.trigger("afterClose", sender);
		}).then(() => {
			if (this._isModal)
			{
				this._modalPromise.resolve(this._modalResult);
			}
			return this.changeStatus("closed");
		}).then(() => {
			console.debug(`Component.close(): Closed component. name=${this.name}`);
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
			return this.trigger("doRefresh", sender, {"options":options});
		}).then(() => {
			return this.trigger("afterRefresh", sender, {"options":options});
		}).then(() => {
			resolve();
		});
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

	return new Promise((resolve, reject) => {
		options = Object.assign({}, options);
		let sender = ( options["sender"] ? options["sender"] : this );

		Promise.resolve().then(() => {
			return this.trigger("beforeSetup", sender, options);
		}).then(() => {
			return this.trigger("doSetup", sender, options);
		}).then(() => {
			return this.trigger("afterSetup", sender, options);
		}).then(() => {
			resolve();
		});
	});

}

// -----------------------------------------------------------------------------

/**
 * Connect component.
 *
 * @return  {Promise}		Promise.
 */
Component.prototype.connect = function()
{

	return new Promise((resolve, reject) => {
		Promise.resolve().then(() => {
//			return WaitforOrganizer.waitForTransitionableStatus(this, this._status, "connecting")
//		}).then(() => {
			return this.changeStatus("connecting");
		}).then(() => {
			console.debug(`Component.connect(): Connecting component. name=${this.name}`);

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
				return BITSMIST.v1.Globals.organizers.notify("organize", "afterConnect", this, newSettings);
			}
		}).then(() => {
			// Get settings from attributes
			let attrSettings = this.__getSettingsFromAttribute();
			if (attrSettings)
			{
				this._settings.merge(attrSettings);
				return BITSMIST.v1.Globals.organizers.notify("organize", "afterConnect", this, attrSettings);
			}
		}).then(() => {
			// Trigger an event
			return this.trigger("afterConnect", this);
		}).then(() => {
			// Register as connected
			return this.changeStatus("connected");
		}).then(() => {
			console.debug(`Component.connect(): Component connected. name=${this.name}`);
			// Open
			if (this._settings.get("autoOpen"))
			{
				return this.open();
			}
		}).then(() => {
			resolve();
		});
	});

}

// -----------------------------------------------------------------------------

/**
 * Disconnect component.
 *
 * @param	{Object}		options				Options for the component.
 *
 * @return  {Promise}		Promise.
 */
Component.prototype.disconnect = function(options)
{

	return new Promise((resolve, reject) => {
		Promise.resolve().then(() => {
//			return WaitforOrganizer.waitForTransitionableStatus(this, this._status, "disconnecting")
//		}).then(() => {
			return this.changeStatus("disconnecting");
		}).then(() => {
			console.debug(`Component.desconnect(): Disconnecing component. name=${this.name}`);
			return this.trigger("beforeDestroy", this);
		}).then(() => {
			if (this._settings.get("autoClose"))
			{
				return this.close();
			}
		}).then(() => {
			return this.trigger("afterDestroy", this);
		}).then(() => {
			return this.changeStatus("instantiated");
		}).then(() => {
			console.debug(`Component.desconnect(): Disconnected component. name=${this.name}`);
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
//  Callbacks
// -----------------------------------------------------------------------------

/**
 * Connected callback.
 */
Component.prototype.connectedCallback = function()
{

	return this.connect();

}

// -----------------------------------------------------------------------------

/**
 * Disconnected callback.
 */
Component.prototype.disconnectedCallback = function()
{

	return this.disconnect();

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

	let href = ( this.getAttribute("data-" + attrName + "href") ? this.getAttribute("data-" + attrName + "href") : "" );
	if (href)
	{
		name = href.slice(0, -3);
		path = "";
	}
	else
	{
		path = ( this.getAttribute("data-" + attrName + "path") ? this.getAttribute("data-" + attrName + "path") : "" );
		name = ( this.getAttribute("data-" + attrName + "name") ? this.getAttribute("data-" + attrName + "name") : "" );
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
