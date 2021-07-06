// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import AutoloadOrganizer from "../organizer/autoload-organizer.js";
import ClassUtil from "../util/class-util.js";
import Component from "../component.js";
import Util from "../util/util.js";

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
//  Methods
// -----------------------------------------------------------------------------

/**
 * Start pad.
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
		},
	};
	settings = ( settings ? BITSMIST.v1.Util.deepMerge(defaults, settings) : defaults );

	// super()
	return BITSMIST.v1.Component.prototype.start.call(this, settings).then(() => {
		if (document.readyState !== "loading")
		{
			AutoloadOrganizer.load(document.body, this.settings);
		}
		else
		{
			document.addEventListener("DOMContentLoaded", () => {
				AutoloadOrganizer.load(document.body, this.settings);
			});
		}
	});

}

// -----------------------------------------------------------------------------

customElements.define("bm-tagloader", TagLoader);
