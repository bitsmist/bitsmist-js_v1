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
import TemplateOrganizer from './organizer/template-organizer';
import ComponentOrganizer from './organizer/component-organizer';
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
 *
 * @param	{Object}		settings			Settings.
 */
export default function Pad(settings)
{

	// super()
	let _this = Reflect.construct(Component, [settings], this.constructor);

	// Init settings
	_this._settings.set("templateName", _this._settings.get("templateName", _this.tagName.toLowerCase()));

	// Init vars
	_this._isModal = false;
	_this._modalOptions;
	_this._modalPromise;
	_this._modalResult;
	_this._shadowRoot;
	_this._templates = _this._templates || {};

	_this.trigger("afterInitPad", _this);

	return _this;

}

// Inherit & Mixin
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

	return Promise.resolve().then(() => {
		return this.switchTemplate(this._settings.get("templateName"));
	}).then(() => {
		return Component.prototype.open.call(this, options);
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
 * Close component.
 *
 * @param	{Object}		options				Options.
 *
 * @return  {Promise}		Promise.
 */
Pad.prototype.close = function(options)
{

	return Promise.resolve().then(() => {
		return Component.prototype.close.call(this, options);
	}).then(() => {
		if (this._isModal)
		{
			this._modalPromise.resolve(this._modalResult);
		}
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

	return Promise.resolve().then(() => {
		return TemplateOrganizer.addTemplate(this, templateName, {"rootNode":this._settings.get("rootNode"), "templateNode":this._settings.get("templateNode")});
	}).then(() => {
		let path = Util.concatPath([this._settings.get("system.appBaseUrl", ""), this._settings.get("system.componentPath", "")]);
		let splitComponent = this._settings.get("system.splitComponent", false);
		return ComponentOrganizer.loadTags(this, path, {"splitComponent":splitComponent});
	}).then(() => {
		return BITSMIST.v1.Globals.organizers.notify("organize", "afterAppend", this, this._settings.items);
	}).then(() => {
		return this.trigger("afterAppend", this);
	});

}

// -----------------------------------------------------------------------------

/**
 * Clone the component.
 *
 * @param	{String}		templateName		Template name.
 *
 * @return  {Object}		Cloned component.
 */
Pad.prototype.clone = function()
{

	return TemplateOrganizer.clone(this, this._settings.get("templateName"));

}
