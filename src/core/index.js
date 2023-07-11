// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

window.BITSMIST = window.BITSMIST || {};
window.BITSMIST.v1 = window.BITSMIST.v1 || {};

// Util

import Util from "./util/util.js";
window.BITSMIST.v1.Util = Util;

import ClassUtil from "./util/class-util.js";
window.BITSMIST.v1.ClassUtil = ClassUtil;

import AjaxUtil from "./util/ajax-util.js";
window.BITSMIST.v1.AjaxUtil = AjaxUtil;

import URLUtil from "./util/url-util.js";
window.BITSMIST.v1.URLUtil = URLUtil;

// Store

import Store from "./store/store.js";
window.BITSMIST.v1.Store = Store;

import ChainableStore from "./store/chainable-store.js";
window.BITSMIST.v1.ChainableStore = ChainableStore;

// Unit

import Unit from "./unit/unit.js";
window.BITSMIST.v1.Unit = Unit;

// Perk

import Perk from "./perk/perk.js";
window.BITSMIST.v1.Perk = Perk;

import BasicPerk from "./perk/basic-perk.js";
window.BITSMIST.v1.BasicPerk = BasicPerk;
PerkPerk.register(BasicPerk);

import PerkPerk from "./perk/perk-perk.js";
window.BITSMIST.v1.PerkPerk = PerkPerk;
PerkPerk.register(PerkPerk);

import SettingPerk from "./perk/setting-perk.js";
window.BITSMIST.v1.SettingPerk = SettingPerk;
PerkPerk.register(SettingPerk);

import StatusPerk from "./perk/status-perk.js";
window.BITSMIST.v1.StatusPerk = StatusPerk;
PerkPerk.register(StatusPerk);

import SkinPerk from "./perk/skin-perk.js";
window.BITSMIST.v1.SkinPerk = SkinPerk;
PerkPerk.register(SkinPerk);

import StylePerk from "./perk/style-perk.js";
window.BITSMIST.v1.StylePerk = StylePerk;
PerkPerk.register(StylePerk);

import EventPerk from "./perk/event-perk.js";
window.BITSMIST.v1.EventPerk = EventPerk;
PerkPerk.register(EventPerk);

import UnitPerk from "./perk/unit-perk.js";
window.BITSMIST.v1.UnitPerk = UnitPerk;
PerkPerk.register(UnitPerk);
