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
import SettingOrganizer from "../organizer/setting-organizer.js";

// =============================================================================
//	SettingManager class
// =============================================================================

// -----------------------------------------------------------------------------
//  Constructor
// -----------------------------------------------------------------------------

/**
 * Constructor.
 */
export default function SettingManager()
{

	// super()
	return Reflect.construct(HTMLElement, [], this.constructor);

}

ClassUtil.inherit(SettingManager, Component);

// -----------------------------------------------------------------------------

/**
 * Get component settings.
 *
 * @return  {Object}		Options.
 */
SettingManager.prototype._getSettings = function()
{

	return {
		"settings": {
			"name":					"SettingManager",
			"loadGlobalSettings":	true,
		}
	};

}

// -----------------------------------------------------------------------------

customElements.define("bm-setting", SettingManager);
