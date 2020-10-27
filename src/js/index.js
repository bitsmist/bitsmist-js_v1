window.BITSMIST = window.BITSMIST || {};
window.BITSMIST.v1 = window.BITSMIST.v1 || {};

// Global variables
import Globals from './globals';
window.BITSMIST.v1.Globals = Globals;

// Component
import Component from './component';
window.BITSMIST.v1.Component = Component;

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

