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

ClassUtil.inherit(Pad, Component);
customElements.define("bm-pad", Pad);

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
		console.debug(`Pad.open(): Opening pad. name=${this.name}, id=${this.id}`);
		return this.changeState("opening");
	}).then(() => {
		return this.switchTemplate(this._settings.get("templateName"));
	}).then(() => {
		return this.trigger("beforeOpen", sender, options);
	}).then(() => {
		let autoSetupOnOpen = this._settings.get("autoSetupOnOpen");
		let autoSetup = this._settings.get("autoSetup");
		if ( autoSetupOnOpen || (autoSetupOnOpen !== false && autoSetup) )
		{
			let defaultPreferences = Object.assign({}, BITSMIST.v1.Globals["preferences"].items);
			options["newPreferences"] = ( options["newPreferences"] ? options["newPreferences"] : defaultPreferences);
			return this.setup(options);
		}
	}).then(() => {
		if (this._settings.get("autoRefresh"))
		{
			return this.refresh(options);
		}
	}).then(() => {
		return this.trigger("doOpen", sender, options);
	}).then(() => {
		return this.trigger("afterOpen", sender, options);
	}).then(() => {
		console.debug(`Pad.open(): Opened pad. name=${this.name}, id=${this.id}`);
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

	console.debug(`Pad.openModal(): Opening pad modally. name=${this.name}, id=${this.id}`);

	return new Promise((resolve, reject) => {
		this._isModal = true;
		this._modalResult = {"result":false};
		this._modalPromise = { "resolve": resolve, "reject": reject };
		this.open(options);
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
		console.debug(`Pad.close(): Closing pad. name=${this.name}, id=${this.id}`);
		return this.changeState("closing");
	}).then(() => {
		return this.trigger("beforeClose", sender, options);
	}).then(() => {
		return this.trigger("doClose", sender, options);
	}).then(() => {
		return this.trigger("afterClose", sender, options);
	}).then(() => {
		if (this._isModal)
		{
			this._modalPromise.resolve(this._modalResult);
		}
	}).then(() => {
		console.debug(`Pad.close(): Closed pad. name=${this.name}, id=${this.id}`);
		return this.changeState("closed");
	});

}

// -----------------------------------------------------------------------------

/**
 * Refresh pad.
 *
 * @param	{Object}		options				Options.
 *
 * @return  {Promise}		Promise.
 */
Pad.prototype.refresh = function(options)
{

	console.debug(`Pad.refresh(): Refreshing pad. name=${this.name}, id=${this.id}`);

	options = Object.assign({}, options);
	let sender = ( options["sender"] ? options["sender"] : this );

	return Promise.resolve().then(() => {
		return this.trigger("beforeRefresh", sender, options);
	}).then(() => {
		if (this._settings.get("autoFill"))
		{
			return this.fill(options);
		}
	}).then(() => {
		return this.trigger("doRefresh", sender, options);
	}).then(() => {
		return this.trigger("afterRefresh", sender, options);
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
Pad.prototype.switchTemplate = function(templateName, options)
{

	console.debug(`Pad.switchTemplate(): Switching template. name=${this.name}, templateName=${templateName}, id=${this.id}`);

	options = Object.assign({}, options);
	let sender = ( options["sender"] ? options["sender"] : this );

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
		return this.callOrganizers("afterAppend");
	}).then(() => {
		return this.trigger("afterAppend", sender, options);
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

	// Defaults
	let defaults = {
		"autoSetupOnStart":false,
		"organizers":{
			"TemplateOrganizer": "",
//			"AttrOrganizer": "",
//			"ElementOrganizer": "",
		}
	};
	settings = Util.deepMerge(defaults, settings);

	return Promise.resolve().then(() => {
		// super()
		return Component.prototype.start.call(this, settings);
	}).then(() => {
		// Open
		if (this._settings.get("autoOpen"))
		{
			return this.open();
		}
	});

}
