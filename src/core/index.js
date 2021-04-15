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

import Component from './component';
window.BITSMIST.v1.Component = Component;

// Organizer

import Organizer from './organizer/organizer';
window.BITSMIST.v1.Organizer = Organizer;

import OrganizerOrganizer from './organizer/organizer-organizer';
window.BITSMIST.v1.OrganizerOrganizer = OrganizerOrganizer;
OrganizerOrganizer.globalInit();

import SettingOrganizer from './organizer/setting-organizer';
window.BITSMIST.v1.SettingOrganizer = SettingOrganizer;
SettingOrganizer.globalInit();

import StateOrganizer from './organizer/state-organizer';
OrganizerOrganizer.organizers.set("StateOrganizer", {"object":StateOrganizer, "targetWords":"waitFor", "targetEvents":["afterAppend"], "order":200});
window.BITSMIST.v1.StateOrganizer = StateOrganizer;

import EventOrganizer from './organizer/event-organizer';
OrganizerOrganizer.organizers.set("EventOrganizer", {"object":EventOrganizer, "targetWords":"events", "targetEvents":["beforeStart"], "order":300});
window.BITSMIST.v1.EventOrganizer = EventOrganizer;

import AttrOrganizer from './organizer/attr-organizer';
OrganizerOrganizer.organizers.set("AttrOrganizer", {"object":AttrOrganizer, "targetWords":"attrs", "targetEvents":["beforeStart"], "order":600});
window.BITSMIST.v1.AttrOrganizer = AttrOrganizer;

import TemplateOrganizer from './organizer/template-organizer';
OrganizerOrganizer.organizers.set("TemplateOrganizer", {"object":TemplateOrganizer, "targetWords":"templates", "targetEvents":["beforeStart"], "order":600});
window.BITSMIST.v1.TemplateOrganizer = TemplateOrganizer;

import AutoloadOrganizer from './organizer/autoload-organizer';
OrganizerOrganizer.organizers.set("AutoloadOrganizer", {"object":AutoloadOrganizer, "targetWords":"autoloads", "targetEvents":["beforeStart"], "order":700});
window.BITSMIST.v1.AutoloadOrganizer = AutoloadOrganizer;

import ElementOrganizer from './organizer/element-organizer';
OrganizerOrganizer.organizers.set("ElementOrganizer", {"object":ElementOrganizer, "targetWords":"elements","targetEvents":["afterAppend"], "order":700});
window.BITSMIST.v1.ElementOrganizer = ElementOrganizer;

import ComponentOrganizer from './organizer/component-organizer';
OrganizerOrganizer.organizers.set("ComponentOrganizer", {"object":ComponentOrganizer, "targetWords":"components","targetEvents":["afterAppend"], "order":800});
window.BITSMIST.v1.ComponentOrganizer = ComponentOrganizer;

// Pad

import Pad from './pad';
window.BITSMIST.v1.Pad = Pad;

// Store

import Store from './store/store';
window.BITSMIST.v1.Store = Store;

import ObserverStore from './store/observer-store';
window.BITSMIST.v1.ObserverStore = ObserverStore;

import OrganizerStore from './store/organizer-store';

// Util

import AjaxUtil from './util/ajax-util';
window.BITSMIST.v1.AjaxUtil = AjaxUtil;

import ClassUtil from './util/class-util';
window.BITSMIST.v1.ClassUtil = ClassUtil;

import Util from './util/util';
window.BITSMIST.v1.Util = Util;

// Settings

BITSMIST.v1.settings = SettingOrganizer.globalSettings;
ClassUtil.newComponent(Component, {
	"settings": {
		"name":					"SettingManager",
		"loadGlobalSettings":	true,
	}
}, "bm-setting", "SettingManager");

// Tag loader

ClassUtil.newComponent(Component, {
	"settings": {
		"name":					"TagLoader",
		"autoSetup":			false,
	},
	"organizers": {
		"AutoloadOrganizer":	""
	}
}, "bm-tagloader", "TagLoader");

// Load tags

document.addEventListener('DOMContentLoaded', () => {
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
