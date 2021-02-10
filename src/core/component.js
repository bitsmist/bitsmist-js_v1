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
import StateOrganizer from './organizer/state-organizer';

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

// -----------------------------------------------------------------------------
//  Callbacks
// -----------------------------------------------------------------------------

/**
 * Connected callback.
 */
Component.prototype.connectedCallback = function()
{

	if (!StateOrganizer.isInitialized(this))
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
 * State.
 *
 * @type	{String}
 */
Object.defineProperty(Component.prototype, 'state', {
	get()
	{
		return this._state;
	},
	set(value)
	{
		this._state = value;
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
 * Start component.
 *
 * @param	{Object}		settings			Settings.
 *
 * @return  {Promise}		Promise.
 */
Component.prototype.start = function(settings)
{

	return Promise.resolve().then(() => {
//		return StateOrganizer.waitForTransitionableState(this, this._state, "starting")
	// }).then(() => {
		return this._injectSettings(settings);
	 }).then((newSettings) => {
		// Init
		this._uniqueId = new Date().getTime().toString(16) + Math.floor(100*Math.random()).toString(16);
		return BITSMIST.v1.Globals.organizers.notify("init", "*", this, newSettings);
	 }).then(() => {
		return this._injectEvents();
	}).then(() => {
		console.debug(`Component.start(): Starting component. name=${this.name}`);
		return StateOrganizer.changeState(this, "starting");
	}).then(() => {
		return this.trigger("beforeStart", this);
	}).then(() => {
		return BITSMIST.v1.Globals.organizers.notify("organize", "afterStart", this, this._settings.items);
	}).then(() => {
		if (this._settings.get("autoSetup"))
		{
			let defaultPreferences = Object.assign({}, BITSMIST.v1.Globals["preferences"].items);
			return this.setup({"newPreferences":defaultPreferences});
		}
	}).then(() => {
		return this.trigger("afterStart", this);
	}).then(() => {
		console.debug(`Component.start(): Started component. name=${this.name}`);
		return StateOrganizer.changeState(this, "started");
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
//		return StateOrganizer.waitForTransitionableState(this, this._states, "stopping")
	// }).then(() => {
		console.debug(`Component.stop(): Stopping component. name=${this.name}`);
		return StateOrganizer.changeState(this, "stopping");
	}).then(() => {
		return this.trigger("beforeStop", this);
	}).then(() => {
		return this.trigger("doStop", this);
	}).then(() => {
		return this.trigger("afterStop", this);
	}).then(() => {
		console.debug(`Component.stop(): Stopped component. name=${this.name}`);
		return StateOrganizer.changeState(this, "stopped");
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
 * Wait for components to become specific states.
 *
 * @param	{Array}			waitlist			Components to wait.
 * @param	{integer}		timeout				Timeout in milliseconds.
 *
 * @return  {Promise}		Promise.
 */
Component.prototype.waitFor = function(waitlist, timeout)
{

	return StateOrganizer.waitFor(this, waitlist, timeout);

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
