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

// Store

import Store from "./store/store.js";
window.BITSMIST.v1.Store = Store;

import ChainableStore from "./store/chainable-store.js";
window.BITSMIST.v1.ChainableStore = ChainableStore;

// Util

import AjaxUtil from "./util/ajax-util.js";
window.BITSMIST.v1.AjaxUtil = AjaxUtil;

import ClassUtil from "./util/class-util.js";
window.BITSMIST.v1.ClassUtil = ClassUtil;

import Util from "./util/util.js";
window.BITSMIST.v1.Util = Util;

// Component

import Component from "./component/component.js";
window.BITSMIST.v1.Component = Component;

// Organizer

import Organizer from "./organizer/organizer.js";
window.BITSMIST.v1.Organizer = Organizer;

import OrganizerOrganizer from "./organizer/organizer-organizer.js";
window.BITSMIST.v1.OrganizerOrganizer = OrganizerOrganizer;
OrganizerOrganizer.register(window.BITSMIST.v1.OrganizerOrganizer);

import SettingOrganizer from "./organizer/setting-organizer.js";
window.BITSMIST.v1.SettingOrganizer = SettingOrganizer;
OrganizerOrganizer.register(window.BITSMIST.v1.SettingOrganizer);
window.BITSMIST.v1.settings = SettingOrganizer.globalSettings;

import StateOrganizer from "./organizer/state-organizer.js";
window.BITSMIST.v1.StateOrganizer = StateOrganizer;
OrganizerOrganizer.register(window.BITSMIST.v1.StateOrganizer);

import TemplateOrganizer from "./organizer/template-organizer.js";
window.BITSMIST.v1.TemplateOrganizer = TemplateOrganizer;
OrganizerOrganizer.register(window.BITSMIST.v1.TemplateOrganizer);

import EventOrganizer from "./organizer/event-organizer.js";
window.BITSMIST.v1.EventOrganizer = EventOrganizer;
OrganizerOrganizer.register(window.BITSMIST.v1.EventOrganizer);

import ComponentOrganizer from "./organizer/component-organizer.js";
window.BITSMIST.v1.ComponentOrganizer = ComponentOrganizer;
OrganizerOrganizer.register(window.BITSMIST.v1.ComponentOrganizer);
