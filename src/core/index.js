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

// Global variables

import Globals from './globals';
window.BITSMIST.v1.Globals = Globals;

// Component

import Component from './component';
window.BITSMIST.v1.Component = Component;

// Organizer

import Organizer from './organizer/organizer';
window.BITSMIST.v1.Organizer = Organizer;

import SettingOrganizer from './organizer/setting-organizer';
Globals.organizers.set("SettingOrganizer", {"object":SettingOrganizer, "targetEvents":["beforeStart"], "order":1});
window.BITSMIST.v1.SettingOrganizer = SettingOrganizer;

import OrganizerOrganizer from './organizer/organizer-organizer';
Globals.organizers.set("OrganizerOrganizer", {"object":OrganizerOrganizer});
window.BITSMIST.v1.OrganizerOrganizer = OrganizerOrganizer;

import StateOrganizer from './organizer/state-organizer';
Globals.organizers.set("StateOrganizer", {"object":StateOrganizer, "targetWords":"waitFor", "targetEvents":["afterAppend"], "order":100});
window.BITSMIST.v1.StateOrganizer = StateOrganizer;

import AttrOrganizer from './organizer/attr-organizer';
Globals.organizers.set("AttrOrganizer", {"object":AttrOrganizer, "targetWords":"attrs", "targetEvents":["beforeStart"], "order":200});
window.BITSMIST.v1.AttrOrganizer = AttrOrganizer;

import ComponentOrganizer from './organizer/component-organizer';
Globals.organizers.set("ComponentOrganizer", {"object":ComponentOrganizer, "targetWords":"components","targetEvents":["afterAppend"], "order":300});
window.BITSMIST.v1.ComponentOrganizer = ComponentOrganizer;

import ElementOrganizer from './organizer/element-organizer';
Globals.organizers.set("ElementOrganizer", {"object":ElementOrganizer, "targetWords":"elements","targetEvents":["afterAppend"], "order":400});
window.BITSMIST.v1.ElementOrganizer = ElementOrganizer;

import EventOrganizer from './organizer/event-organizer';
Globals.organizers.set("EventOrganizer", {"object":EventOrganizer, "targetWords":"events", "targetEvents":["beforeStart"], "order":500});
window.BITSMIST.v1.EventOrganizer = EventOrganizer;

/*
import ServiceOrganizer from './organizer/service-organizer';
Globals.organizers.set("ServiceOrganizer", {"object":ServiceOrganizer, "targetWords":"services", "targetEvents":["beforeStart"], "order":600});
window.BITSMIST.v1.ServiceOrganizer = ServiceOrganizer;
*/

import TemplateOrganizer from './organizer/template-organizer';
Globals.organizers.set("TemplateOrganizer", {"object":TemplateOrganizer, "targetWords":"templates", "targetEvents":["beforeStart"], "order":700});
window.BITSMIST.v1.TemplateOrganizer = TemplateOrganizer;

import AutoloadOrganizer from './organizer/autoload-organizer';
Globals.organizers.set("AutoloadOrganizer", {"object":AutoloadOrganizer, "targetWords":"autoloads", "targetEvents":["beforeStart"], "order":800});
window.BITSMIST.v1.AutoloadOrganizer = AutoloadOrganizer;

// Pad

import Pad from './pad';
window.BITSMIST.v1.Pad = Pad;

// Store

import Store from './store/store';
window.BITSMIST.v1.Store = Store;


import ObserverStore from './store/observer-store';
window.BITSMIST.v1.ObserverStore = ObserverStore;

import OrganizerStore from './store/organizer-store';

// Tag loader

import TagLoader from './tagloader';
window.BITSMIST.v1.TagLoader = TagLoader;

// Util

import AjaxUtil from './util/ajax-util';
window.BITSMIST.v1.AjaxUtil = AjaxUtil;

import ClassUtil from './util/class-util';
window.BITSMIST.v1.ClassUtil = ClassUtil;

import Util from './util/util';
window.BITSMIST.v1.Util = Util;
