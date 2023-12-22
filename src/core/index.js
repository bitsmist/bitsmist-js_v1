// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

// Util
import Util from "./util/util.js";
import ClassUtil from "./util/class-util.js";
import AjaxUtil from "./util/ajax-util.js";
import URLUtil from "./util/url-util.js";

// Store
import Store from "./store/store.js";
import ChainableStore from "./store/chainable-store.js";

// Unit
import Unit from "./unit/unit.js";

// Perk
import Perk from "./perk/perk.js";
import BasicPerk from "./perk/basic-perk.js";
import SettingPerk from "./perk/setting-perk.js";
import StatusPerk from "./perk/status-perk.js";
import SkinPerk from "./perk/skin-perk.js";
import StylePerk from "./perk/style-perk.js";
import EventPerk from "./perk/event-perk.js";
import UnitPerk from "./perk/unit-perk.js";

// Export to global BITSMIST.V1
if (!globalThis.BITSMIST)
{
	globalThis.BITSMIST = {};
	globalThis.BITSMIST.V1 = {};
	globalThis.BITSMIST.V1.$CORE = {};
	globalThis.BITSMIST.V1.$CORE.Util = Util;
	globalThis.BITSMIST.V1.$CORE.ClassUtil = ClassUtil;
	globalThis.BITSMIST.V1.$CORE.AjaxUtil = AjaxUtil;
	globalThis.BITSMIST.V1.$CORE.URLUtil = URLUtil;
	globalThis.BITSMIST.V1.$CORE.Store = Store;
	globalThis.BITSMIST.V1.$CORE.ChainableStore = ChainableStore;
	globalThis.BITSMIST.V1.$CORE.Perk = Perk;
	globalThis.BITSMIST.V1.$CORE.Unit = Unit;
}

// Shortcut
globalThis.BITSMIST.V1.Unit = Unit;

// Register Perks (Order matters)
Perk.registerPerk(BasicPerk);
Perk.registerPerk(Perk);
Perk.registerPerk(SettingPerk);
Perk.registerPerk(StatusPerk);
Perk.registerPerk(SkinPerk);
Perk.registerPerk(StylePerk);
Perk.registerPerk(EventPerk);
Perk.registerPerk(UnitPerk);

// Load Tags
BasicPerk.ready.then(async () => {
	if (Unit.get("setting", "system.unit.options.autoLoadOnStartup", true))
	{
		Unit.cast("unit.materializeAll", document.body, {"waitForTags":false});
	}
});

// Export
export {
	Util,
	ClassUtil,
	AjaxUtil,
	URLUtil,
	Store,
	ChainableStore,
	Perk,
	Unit,
};
