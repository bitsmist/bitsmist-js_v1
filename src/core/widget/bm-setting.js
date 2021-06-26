// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import ClassUtil from "../util/class-util.js";
import Component from "../component.js";
import AutoloadOrganizer from "../organizer/autoload-organizer.js";

// =============================================================================
//	TagLoader class
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
	return Reflect.construct(HTMLElement, [], this.constructor);

}

ClassUtil.inherit(TagLoader, Component);

// -----------------------------------------------------------------------------

/**
 * Get component settings.
 *
 * @return  {Object}		Options.
 */
TagLoader.prototype._getSettings = function()
{

	return {
		"settings": {
			"name":					"TagLoader",
			"autoSetup":			false,
		}
	};

}

// -----------------------------------------------------------------------------

customElements.define("bm-tagloader", TagLoader);
