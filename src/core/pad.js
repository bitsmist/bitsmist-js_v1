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
import Component from './component';
import Globals from './globals';
import Util from './util/util';

// =============================================================================
//	Pad class
// =============================================================================

// -----------------------------------------------------------------------------
//  Constructor
// -----------------------------------------------------------------------------

/**
 * Constructor.
 */
export default function Pad()
{

	// super()
	return Reflect.construct(Component, [], this.constructor);

}

// Inherit
ClassUtil.inherit(Pad, Component);

// -----------------------------------------------------------------------------
//  Methods
// -----------------------------------------------------------------------------

/**
 * Open pad.
 *
 * @param	{Object}		options				Options.
 *
 * @return  {Promise}		Promise.
 */
Pad.prototype.open = function(options)
{

	options = Object.assign({}, options);
	let sender = ( options["sender"] ? options["sender"] : this );

	return Promise.resolve().then(() => {
//		return StateOrganizer.waitForTransitionableState(this, "opening")
//	}).then(() => {
		console.debug(`Pad.open(): Opening pad. name=${this.name}`);
		return this.changeState("opening");
	}).then(() => {
		return this.switchTemplate(this._settings.get("templateName"));
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
		console.debug(`Pad.open(): Opened pad. name=${this.name}`);
		return this.changeState("opened");
	});

}

// -----------------------------------------------------------------------------

/**
 * Open pad modally.
 *
 * @param	{array}			options				Options.
 *
 * @return  {Promise}		Promise.
 */
Pad.prototype.openModal = function(options)
{

	console.debug(`Pad.openModal(): Opening pad modally. name=${this.name}`);

	return new Promise((resolve, reject) => {
		options = Object.assign({}, options);
		this._settings.items = Object.assign(this._settings.items, options); //@@@fix
		this._isModal = true;
		this._modalResult = {"result":false};
		this._modalOptions = options;
		this._modalPromise = { "resolve": resolve, "reject": reject };
		this.open();
	});

}

// -----------------------------------------------------------------------------

/**
 * Close pad.
 *
 * @param	{Object}		options				Options.
 *
 * @return  {Promise}		Promise.
 */
Pad.prototype.close = function(options)
{

	options = Object.assign({}, options);
	let sender = ( options["sender"] ? options["sender"] : this );

	return Promise.resolve().then(() => {
//		return StateOrganizer.waitForTransitionableState(this, "closing")
//	}).then(() => {
		console.debug(`Pad.close(): Closing pad. name=${this.name}`);
		return this.changeState("closing");
	}).then(() => {
		return this.trigger("beforeClose", sender);
	}).then(() => {
		return this.trigger("doClose", sender);
	}).then(() => {
		return this.trigger("afterClose", sender);
	}).then(() => {
		if (this._isModal)
		{
			this._modalPromise.resolve(this._modalResult);
		}
	}).then(() => {
		console.debug(`Pad.close(): Closed pad. name=${this.name}`);
		return this.changeState("closed");
	});

}

// -----------------------------------------------------------------------------

/**
 * Refresh pad.
 *
 * @return  {Promise}		Promise.
 */
Pad.prototype.refresh = function(options)
{

	console.debug(`Pad.refresh(): Refreshing pad. name=${this.name}`);

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
 * Change template html.
 *
 * @param	{String}		templateName		Template name.
 *
 * @return  {Promise}		Promise.
 */
Pad.prototype.switchTemplate = function(templateName)
{

	console.debug(`Pad.switchTemplate(): Switching template. name=${this.name}, templateName=${templateName}`);

	if (this.isActiveTemplate(templateName))
	{
		return Promise.resolve();
	}

	return Promise.resolve().then(() => {
		return this.addTemplate(templateName, {"rootNode":this._settings.get("rootNode"), "templateNode":this._settings.get("templateNode")});
	}).then(() => {
		let path = Util.concatPath([this._settings.get("system.appBaseUrl", ""), this._settings.get("system.componentPath", "")]);
		let splitComponent = this._settings.get("system.splitComponent", false);
		return this.loadTags(this, path, {"splitComponent":splitComponent});
	}).then(() => {
		return BITSMIST.v1.Globals.organizers.notify("organize", "afterAppend", this);
	}).then(() => {
		return this.trigger("afterAppend", this);
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
Pad.prototype.fill = function(options)
{
}

// -----------------------------------------------------------------------------

/**
 * Start pad.
 *
 * @param	{Object}		settings			Settings.
 *
 * @return  {Promise}		Promise.
 */
Pad.prototype.start = function(settings)
{

	// Init vars
	this._isModal = false;
	this._modalOptions;
	this._modalPromise;
	this._modalResult;

	// Initial settings
	let defaults = {
		"autoOpen": true,
		"autoClose": true,
		"autoSetup": null, // To not run setup() on parent.start()
	};
	settings = Object.assign({}, defaults, settings);

	// super()
	return Promise.resolve().then(() => {
		return Component.prototype.start.call(this, settings);
	}).then(() => {
		// If autoSetup was not overwritten by parent, then set it to true as default
		if (this._settings.get("autoSetup") === null)
		{
			this._settings.set("autoSetup", true);
		}
		return BITSMIST.v1.Globals.organizers.notify("init", "initPad", this);
	}).then(() => {
		return BITSMIST.v1.Globals.organizers.notify("organize", "afterStartPad", this);
	}).then(() => {
		return this.trigger("afterStartPad", this);
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
 * Clone the pad.
 *
 * @return  {Object}		Cloned pad.
 */
Pad.prototype.clone = function()
{

	return this.cloneTemplate(this._settings.get("templateName"));

}
