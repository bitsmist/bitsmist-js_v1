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
		"settings": {
			"name": "TagLoader",
			"autoSetup": false,
		},
		"organizers": {
			"AutoloadOrganizer":""
		}
	}
	settings = BITSMIST.v1.Util.deepMerge(defaults, settings);

	return BITSMIST.v1.Component.prototype.start.call(this, settings);

}
