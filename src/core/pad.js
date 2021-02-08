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
 */
export default function Pad()
{

	// super()
	return Reflect.construct(Component, [], this.constructor);

}

// Inherit & Mixin
ClassUtil.inherit(Pad, Component);
// customElements.define("bm-pad", Pad);

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

	if (TemplateOrganizer.isActive(this, templateName))
	{
		return Promise.resolve();
	}

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
 * Start component.
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

	// super()
	return Component.prototype.start.call(this, settings);

}

// -----------------------------------------------------------------------------

/**
 * Clone the component.
 *
 * @return  {Object}		Cloned component.
 */
Pad.prototype.clone = function()
{

	return TemplateOrganizer.clone(this, this._settings.get("templateName"));

}
