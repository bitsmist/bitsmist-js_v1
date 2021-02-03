// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import Component from './component';
import ClassUtil from './util/class-util';
import Util from './util/util';

// =============================================================================
//	Tag loader class
// =============================================================================

// -----------------------------------------------------------------------------
//  Constructor
// -----------------------------------------------------------------------------

import ComponentOrganizer from './organizer/component-organizer';

/**
 * Constructor.
 *
 * @param	{Object}		settings			Options for the component.
 */
export default function TagLoader(settings)
{

	// super()
	settings = Object.assign({}, settings, {"name":"TagLoader", "autoSetup":false});
	let _this = Reflect.construct(Component, [settings], this.constructor);

	window.addEventListener('DOMContentLoaded', _this.onDOMContentLoaded.bind(_this));

	return _this;

}

ClassUtil.inherit(TagLoader, Component);
customElements.define("bm-tagloader", TagLoader);

// -----------------------------------------------------------------------------
//  Event handlers
// -----------------------------------------------------------------------------

/**
 * DOM content loaded event handler.
 *
 * @param	{Object}		sender				Sender.
 * @param	{Object}		e					Event info.
 *
 * @return  {Promise}		Promise.
 */
TagLoader.prototype.onDOMContentLoaded= function(sender, e)
{

	let path = Util.concatPath([this._settings.get("system.appBaseUrl", ""), this._settings.get("system.componentPath", "")]);
	let splitComponent = this._settings.get("system.splitComponent", false);

	ComponentOrganizer.loadTags(document, path, {"splitComponent":splitComponent});

}

