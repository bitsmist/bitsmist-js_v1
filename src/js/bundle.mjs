import '@webcomponents/custom-elements';
import 'proxy-polyfill';

window.BITSMIST = window.BITSMIST || {};
window.BITSMIST.v1 = window.BITSMIST.v1 || {};

// App
import App from './app';
window.BITSMIST.v1.App = App;

// Error
// import {NoClassError, NoNodeError, NoMethodError, NoResourceError, NoRouteError, NotValidFunctionError} from './error/errors';
// window.BITSMIST.v1.NoClassError = NoClassError;
// window.BITSMIST.v1.NoNodeError = NoNodeError;
// window.BITSMIST.v1.NoMethodError = NoMethodError;
// window.BITSMIST.v1.NoResourceError = NoResourceError;
// window.BITSMIST.v1.NoRouteError = NoRouteError;
// window.BITSMIST.v1.NotValidFunctionError = NotValidFunctionError;

// Service Manager
import ServiceManager from './manager/service-manager';
window.BITSMIST.v1.ServiceManager = ServiceManager;

// Router
import Router from './router/router';
window.BITSMIST.v1.Router = Router;

// UI
import Component from './ui/component';
window.BITSMIST.v1.Component = Component;

// Util
import AjaxUtil from './util/ajax-util';
window.BITSMIST.v1.AjaxUtil = AjaxUtil;

