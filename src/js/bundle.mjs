import '@webcomponents/custom-elements';

window.BITSMIST = window.BITSMIST || {};
window.BITSMIST.v1 = window.BITSMIST.v1 || {};

// App

import App from './app';
window.BITSMIST.v1.App = App;

// Error

import {NoClassError, NoNodeError, NoMethodError, NoResourceError, NoRouteError, NotValidFunctionError} from './error/errors';
window.BITSMIST.v1.NoClassError = NoClassError;
window.BITSMIST.v1.NoNodeError = NoNodeError;
window.BITSMIST.v1.NoMethodError = NoMethodError;
window.BITSMIST.v1.NoResourceError = NoResourceError;
window.BITSMIST.v1.NoRouteError = NoRouteError;
window.BITSMIST.v1.NotValidFunctionError = NotValidFunctionError;

import AjaxErrorHandler from './error/ajax-error-handler';
window.BITSMIST.v1.AjaxErrorHandler = AjaxErrorHandler;

import NoRouteErrorHandler from './error/no-route-error-handler';
window.BITSMIST.v1.NoRouteErrorHandler = NoRouteErrorHandler;

// Loader

import DefaultLoader from './loader/default-loader';
window.BITSMIST.v1.DefaultLoader = DefaultLoader;

// Manager

import ErrorManager from './manager/error-manager';
window.BITSMIST.v1.ErrorManager = ErrorManager;

import PreferenceManager from './manager/preference-manager';
window.BITSMIST.v1.PreferenceManager = PreferenceManager;

import ServiceManager from './manager/service-manager';
window.BITSMIST.v1.ServiceManager = ServiceManager;

// Router

import DefaultRouter from './router/default-router';
window.BITSMIST.v1.DefaultRouter = DefaultRouter;

// Preference

import CookiePreferenceHandler from './preference/cookie-preference-handler';
window.BITSMIST.v1.CookiePreferenceHandler = CookiePreferenceHandler;

import ObserverPreferenceHandler from './preference/observer-preference-handler';
window.BITSMIST.v1.ObserverPreferenceHandler = ObserverPreferenceHandler;

// UI

import Component from './ui/component';
window.BITSMIST.v1.Component = Component;

import Form from './ui/form';
window.BITSMIST.v1.Form = Form;

import List from './ui/list';
window.BITSMIST.v1.List = List;

// Util

import AjaxUtil from './util/ajax-util';
window.BITSMIST.v1.AjaxUtil = AjaxUtil;

import AuthenticationUtil from './util/authentication-util';
window.BITSMIST.v1.AuthenticationUtil = AuthenticationUtil;

import FormUtil from './util/form-util';
window.BITSMIST.v1.FormUtil = FormUtil;

import FormatterUtil from './util/formatter-util';
window.BITSMIST.v1.FormatterUtil = FormatterUtil;

import MasterUtil from './util/master-util';
window.BITSMIST.v1.MasterUtil = MasterUtil;

import ResourceUtil from './util/resource-util';
window.BITSMIST.v1.ResourceUtil = ResourceUtil;

