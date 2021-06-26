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

// Component

import Component from "./component.js";
window.BITSMIST.v1.Component = Component;

// Organizer

import Organizer from "./organizer/organizer.js";
window.BITSMIST.v1.Organizer = Organizer;

import OrganizerOrganizer from "./organizer/organizer-organizer.js";
window.BITSMIST.v1.OrganizerOrganizer = OrganizerOrganizer;
OrganizerOrganizer.globalInit();

import SettingOrganizer from "./organizer/setting-organizer.js";
window.BITSMIST.v1.SettingOrganizer = SettingOrganizer;
SettingOrganizer.globalInit();

import StateOrganizer from "./organizer/state-organizer.js";
OrganizerOrganizer.organizers.set("StateOrganizer", {"object":StateOrganizer, "targetWords":"waitFor", "targetEvents":"*", "order":200});
window.BITSMIST.v1.StateOrganizer = StateOrganizer;

import EventOrganizer from "./organizer/event-organizer.js";
OrganizerOrganizer.organizers.set("EventOrganizer", {"object":EventOrganizer, "targetWords":"events", "targetEvents":["beforeStart", "afterAppend"], "order":300});
window.BITSMIST.v1.EventOrganizer = EventOrganizer;

import TemplateOrganizer from "./organizer/template-organizer.js";
OrganizerOrganizer.organizers.set("TemplateOrganizer", {"object":TemplateOrganizer, "targetWords":"templates", "targetEvents":["beforeStart"], "order":600});
window.BITSMIST.v1.TemplateOrganizer = TemplateOrganizer;

import AutoloadOrganizer from "./organizer/autoload-organizer.js";
OrganizerOrganizer.organizers.set("AutoloadOrganizer", {"object":AutoloadOrganizer, "targetWords":"autoloads", "targetEvents":["beforeStart"], "order":700});
window.BITSMIST.v1.AutoloadOrganizer = AutoloadOrganizer;

import ComponentOrganizer from "./organizer/component-organizer.js";
OrganizerOrganizer.organizers.set("ComponentOrganizer", {"object":ComponentOrganizer, "targetWords":"components","targetEvents":["afterAppend"], "order":800});
window.BITSMIST.v1.ComponentOrganizer = ComponentOrganizer;

// Pad

import Pad from "./pad.js";
window.BITSMIST.v1.Pad = Pad;

// Store

import Store from "./store/store.js";
window.BITSMIST.v1.Store = Store;

import OrganizerStore from "./store/organizer-store.js";
window.BITSMIST.v1.OrganizerStore = OrganizerStore;

import ChainableStore from "./store/chainable-store.js";
window.BITSMIST.v1.ChainableStore = ChainableStore;

// Widget

import SettingManager from "./widget/bm-setting.js";
import TagLoader from "./widget/bm-tagloader.js";

// Util

import AjaxUtil from "./util/ajax-util.js";
window.BITSMIST.v1.AjaxUtil = AjaxUtil;

import ClassUtil from "./util/class-util.js";
window.BITSMIST.v1.ClassUtil = ClassUtil;

import Util from "./util/util.js";
window.BITSMIST.v1.Util = Util;

// Settings

BITSMIST.v1.settings = SettingOrganizer.globalSettings;

// Load tags

document.addEventListener("DOMContentLoaded", () => {
	if (BITSMIST.v1.settings.get("system.autoLoadOnStartup", true))
	{
		let path = Util.concatPath([
			BITSMIST.v1.settings.get("system.appBaseUrl", ""),
			BITSMIST.v1.settings.get("system.componentPath", "")
		]);
		let splitComponent = BITSMIST.v1.settings.get("system.splitComponent", false);
		ComponentOrganizer.loadTags(document, path, {"splitComponent":splitComponent});
	}
});
