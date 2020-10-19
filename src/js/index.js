window.BITSMIST = window.BITSMIST || {};
window.BITSMIST.v1 = window.BITSMIST.v1 || {};

// Tag loader
import TagLoader from './tagloader';

// App
import App from './app';
window.BITSMIST.v1.App = App;

// Component
import Component from './component';
window.BITSMIST.v1.Component = Component;

// Router
import Router from './router';
window.BITSMIST.v1.Router = Router;

// Mixin
import EventMixin from './mixin/event-mixin';
import LoaderMixin from './mixin/loader-mixin';
import WaitforMixin from './mixin/waitfor-mixin';

// Plugin
import Plugin from './plugin/plugin';
import Store from './plugin/store';
window.BITSMIST.v1.Plugin = Plugin;
window.BITSMIST.v1.Store = Store;

// Util
import AjaxUtil from './util/ajax-util';
import ClassUtil from './util/class-util';
import Util from './util/util';
window.BITSMIST.v1.AjaxUtil = AjaxUtil;
window.BITSMIST.v1.ClassUtil = ClassUtil;
window.BITSMIST.v1.Util = Util;

