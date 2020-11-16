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
import AttrOrganizer from './organizer/attr-organizer';
import ComponentOrganizer from './organizer/component-organizer';
import ElementOrganizer from './organizer/element-organizer';
import EventOrganizer from './organizer/event-organizer';
import ServiceOrganizer from './organizer/service-organizer';
import TemplateOrganizer from './organizer/template-organizer';
Globals.organizers.register(AttrOrganizer, "attrs");
Globals.organizers.register(ComponentOrganizer, "components");
Globals.organizers.register(ElementOrganizer, "elements");
Globals.organizers.register(EventOrganizer, "events");
Globals.organizers.register(ServiceOrganizer, "services");
Globals.organizers.register(TemplateOrganizer, "templates");

// Pad
import Pad from './pad';
window.BITSMIST.v1.Pad = Pad;

// Mixin
import EventMixin from './mixin/event-mixin';
import LoaderMixin from './mixin/loader-mixin';
import WaitforMixin from './mixin/waitfor-mixin';

// Store
import Store from './store';
window.BITSMIST.v1.Store = Store;

// Util
import AjaxUtil from './util/ajax-util';
window.BITSMIST.v1.AjaxUtil = AjaxUtil;

import ClassUtil from './util/class-util';
window.BITSMIST.v1.ClassUtil = ClassUtil;

import Util from './util/util';
window.BITSMIST.v1.Util = Util;

import ComponentObserver from './component-observer';
window.BITSMIST.v1.ComponentObserver = ComponentObserver;

