import '@webcomponents/custom-elements';

window.BITSMIST = window.BITSMIST || {};
window.BITSMIST.v1 = window.BITSMIST.v1 || {};

// App
import App from './app';
window.BITSMIST.v1.App = App;

// Router
import Router from './router/router';
window.BITSMIST.v1.Router = Router;

// UI
import Component from './ui/component';
window.BITSMIST.v1.Component = Component;

// Util
import AjaxUtil from './util/ajax-util';
window.BITSMIST.v1.AjaxUtil = AjaxUtil;
import LoaderUtil from './util/loader-util';
window.BITSMIST.v1.LoaderUtil = LoaderUtil;

