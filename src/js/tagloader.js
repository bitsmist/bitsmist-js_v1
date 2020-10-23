// =============================================================================
/**
 * Bitsmist JS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import AjaxUtil from './util/ajax-util';
import ClassUtil from './util/class-util';
import Component from './component';
import Globals from './globals';
import Util from './util/util';

// =============================================================================
//	Tag loader class
// =============================================================================

// -----------------------------------------------------------------------------
//  Constructor
// -----------------------------------------------------------------------------

/**
 * Constructor.
 *
 * @param	{Object}		settings			Options for the component.
 */
export default function TagLoader(settings)
{

	// super()
	settings = Object.assign({}, {"name":"TagLoader", "templateName":"", "autoSetup":false}, settings);
	let _this = Reflect.construct(Component, [settings], this.constructor);

	_this.addEventHandler(_this, "append", _this.onAppend);

	return _this;

}

ClassUtil.inherit(TagLoader, Component);
customElements.define("bm-tagloader", TagLoader);

// -----------------------------------------------------------------------------
//  Event handlers
// -----------------------------------------------------------------------------

/**
 * Append event handler.
 *
 * @param	{Object}		sender				Sender.
 * @param	{Object}		e					Event info.
 */
TagLoader.prototype.onAppend = function(sender, e)
{

	return new Promise((resolve, reject) => {
		Promise.resolve().then(() => {
			if (this.app != this)
			{
				return this.waitFor([{"name":"App", "status":"opened"}]);
			}
		}).then(() => {
			let path = Util.concatPath([this.getSetting("system.appBaseUrl", ""), this.getSetting("system.componentPath", "")]);
			let splitComponent = this.getSetting("system.splitComponent", false);
			return this.loadTags(document, path, {"splitComponent":splitComponent});
		}).then(() => {
			resolve();
		});
	});

}

