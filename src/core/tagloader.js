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
import Util from './util/util';

// =============================================================================
//	Tag loader class
// =============================================================================

// -----------------------------------------------------------------------------
//  Constructor
// -----------------------------------------------------------------------------

/**
 * Constructor.
 */
export default function TagLoader()
{

	// super()
	return Reflect.construct(Component, [], this.constructor);

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

	this.loadTags(document, path, {"splitComponent":splitComponent});

}

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
TagLoader.prototype.start = function(settings)
{

	// Defaults
	let defaults = {
		"name": "TagLoader",
		"autoSetup": false
	}
	settings = BITSMIST.v1.Util.deepMerge(defaults, settings);

	// Start
	return BITSMIST.v1.Component.prototype.start.call(this, settings).then(() => {
		if (document.readyState !== 'loading')
		{
			this.onDOMContentLoaded();
		}
		else
		{
			window.addEventListener('DOMContentLoaded', this.onDOMContentLoaded.bind(this));
		}
	});

}
