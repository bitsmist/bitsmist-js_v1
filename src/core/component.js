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
import Util from './util/util';

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
customElements.define("bm-component", Component);

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
		"autoSetup": true,
		"autoStop": true,
		"organizers": {
			"OrganizerOrganizer": "",
			"SettingOrganizer": "",
			"StateOrganizer": "",
//			"EventOrganizer": "",
//			"ComponentOrganizer": "",
//			"ServiceOrganizer": "",
//			"PluginOrganizer": "",
		}
	};
	settings = Util.deepMerge(defaults, settings);

	// Init vars
	this._uniqueId = new Date().getTime().toString(16) + Math.floor(100*Math.random()).toString(16);
	this._name = this.constructor.name;

	return Promise.resolve().then(() => {
		return this._injectSettings(settings);
	}).then((newSettings) => {
		return this.initOrganizers(newSettings);
	// }).then(() => {
		// suspend
		// return ( this.hasAttribute("data-suspend") || this._settings.get("autoSuspend") ? this.suspend("start") : null );
	}).then(() => {
		console.debug(`Component.start(): Starting component. name=${this.name}`);
		return this.changeState("starting");
	}).then(() => {
		return this.callOrganizers("beforeStart");
	}).then(() => {
		return this.trigger("beforeStart", this);
	}).then(() => {
		let autoSetupOnStart = this._settings.get("autoSetupOnStart");
		let autoSetup = this._settings.get("autoSetup");
		if ( autoSetupOnStart || (autoSetupOnStart !== false && autoSetup) )
		{
			let defaultPreferences = Object.assign({}, BITSMIST.v1.Globals["preferences"].items);
			return this.setup({"newPreferences":defaultPreferences});
		}
	}).then(() => {
		return this.trigger("afterStart", this);
	}).then(() => {
		console.debug(`Component.start(): Started component. name=${this.name}`);
		return this.changeState("started");
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
		console.debug(`Component.stop(): Stopping component. name=${this.name}`);
		return this.changeState("stopping");
	}).then(() => {
		return this.trigger("beforeStop", this);
	}).then(() => {
		return this.trigger("doStop", this);
	}).then(() => {
		return this.trigger("afterStop", this);
	}).then(() => {
		console.debug(`Component.stop(): Stopped component. name=${this.name}`);
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

	console.debug(`Component.setup(): Setting up component. name=${this.name}, state=${this.state}`);

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
 * Get component settings.  Need to override.
 *
 * @return  {Object}		Options.
 */
Component.prototype._getSettings = function()
{

	return {};

}
