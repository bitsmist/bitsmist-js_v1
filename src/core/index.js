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

// Store

import Store from "./store/store.js";
window.BITSMIST.v1.Store = Store;

import ChainableStore from "./store/chainable-store.js";
window.BITSMIST.v1.ChainableStore = ChainableStore;

// Component

import Component from "./component/component.js";
window.BITSMIST.v1.Component = Component;

// Organizer

import Organizer from "./organizer/organizer.js";
window.BITSMIST.v1.Organizer = Organizer;

import OrganizerOrganizer from "./organizer/organizer-organizer.js";
window.BITSMIST.v1.OrganizerOrganizer = OrganizerOrganizer;
OrganizerOrganizer.register(OrganizerOrganizer);

import SettingOrganizer from "./organizer/setting-organizer.js";
window.BITSMIST.v1.SettingOrganizer = SettingOrganizer;
OrganizerOrganizer.register(SettingOrganizer);
window.BITSMIST.v1.settings = SettingOrganizer.globalSettings;

import StateOrganizer from "./organizer/state-organizer.js";
window.BITSMIST.v1.StateOrganizer = StateOrganizer;
OrganizerOrganizer.register(StateOrganizer);

import TemplateOrganizer from "./organizer/template-organizer.js";
window.BITSMIST.v1.TemplateOrganizer = TemplateOrganizer;
OrganizerOrganizer.register(TemplateOrganizer);

import EventOrganizer from "./organizer/event-organizer.js";
window.BITSMIST.v1.EventOrganizer = EventOrganizer;
OrganizerOrganizer.register(EventOrganizer);

import ComponentOrganizer from "./organizer/component-organizer.js";
window.BITSMIST.v1.ComponentOrganizer = ComponentOrganizer;
OrganizerOrganizer.register(ComponentOrganizer);
