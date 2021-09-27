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
import Component from "./component.js";
import Util from "./util/util.js";

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

// -----------------------------------------------------------------------------
//  Setter/Getter
// -----------------------------------------------------------------------------

/**
 * Component name.
 *
 * @type	{String}
 */
Object.defineProperty(Component.prototype, 'modalResult', {
	get()
	{
		return this._modalResult;
	}
})

// -----------------------------------------------------------------------------
//  Methods
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
		"settings": {
			"autoClose":			true,
			"autoFetch":			true,
			"autoFill":				true,
			"autoOpen":				true,
			"autoRefresh":			true,
			"autoRefreshOnStart":	false,
			"autoSetupOnStart":		false,
			"autoPostStart":		false,
			"triggerAppendOnStart":	false,
		},
		"organizers":{
			"AutoloadOrganizer":	{"settings":{"attach":true}},
			"TemplateOrganizer":	{"settings":{"attach":true}},
		}
	};
	settings = ( settings ? BITSMIST.v1.Util.deepMerge(defaults, settings) : defaults );

	return Promise.resolve().then(() => {
		// super()
		return Component.prototype.start.call(this, settings);
	}).then(() => {
		return this.switchTemplate(this.settings.get("settings.templateName"));
	}).then(() => {
		return this._postStart();
	}).then(() => {
		// Open
		if (this.settings.get("settings.autoOpen"))
		{
			return this.open();
		}
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

	options = Object.assign({}, options);

	if (this.isActiveTemplate(templateName))
	{
		return Promise.resolve();
	}

	return Promise.resolve().then(() => {
		console.debug(`Pad.switchTemplate(): Switching template. name=${this.name}, templateName=${templateName}, id=${this.id}`);
		return this.addTemplate(templateName);
	}).then(() => {
		return this.applyTemplate(templateName);
	}).then(() => {
		return this.callOrganizers("afterAppend", this.settings.items);
	}).then(() => {
		return this.trigger("afterAppend", options);
	}).then(() => {
		console.debug(`Pad.switchTemplate(): Switched template. name=${this.name}, templateName=${templateName}, id=${this.id}`);
	});

}

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

	return Promise.resolve().then(() => {
		console.debug(`Pad.open(): Opening pad. name=${this.name}, id=${this.id}`);
		return this.changeState("opening");
	}).then(() => {
		return this.trigger("beforeOpen", options);
	}).then(() => {
		// Hide conditional elements
		this.hideConditionalElements();

		// Setup
		let autoSetupOnOpen = Util.safeGet(options, "autoSetupOnOpen", this.settings.get("settings.autoSetupOnOpen"));
		let autoSetup = Util.safeGet(options, "autoSetupOnOpen", this.settings.get("settings.autoSetup"));
		if ( autoSetupOnOpen || (autoSetupOnOpen !== false && autoSetup) )
		{
			return this.setup(options);
		}
	}).then(() => {
		// Refresh
		if (Util.safeGet(options, "autoRefresh", this.settings.get("settings.autoRefresh")))
		{
			return this.refresh(options);
		}
	}).then(() => {
		return this.trigger("doOpen", options);
	}).then(() => {
		// Auto focus
		let autoFocus = this.settings.get("settings.autoFocus");
		if (autoFocus)
		{
			let target = ( autoFocus === true ? this : this.querySelector(autoFocus) );
			if (target)
			{
				target.focus();
			}
		}
	}).then(() => {
		return this.trigger("afterOpen", options);
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

	return Promise.resolve().then(() => {
		console.debug(`Pad.close(): Closing pad. name=${this.name}, id=${this.id}`);
		return this.changeState("closing");
	}).then(() => {
		return this.trigger("beforeClose", options);
	}).then(() => {
		return this.trigger("doClose", options);
	}).then(() => {
		return this.trigger("afterClose", options);
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

	options = Object.assign({}, options);

	return Promise.resolve().then(() => {
		console.debug(`Pad.refresh(): Refreshing pad. name=${this.name}, id=${this.id}`);
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
		// Show condtional elements
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
		console.debug(`Pad.refresh(): Refreshed pad. name=${this.name}, id=${this.id}`);
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
 * Clear pad.
 *
 * @param	{Object}		options				Options.
 *
 * @return  {Promise}		Promise.
 */
Pad.prototype.clear = function(options)
{
}

// -----------------------------------------------------------------------------

customElements.define("bm-pad", Pad);
