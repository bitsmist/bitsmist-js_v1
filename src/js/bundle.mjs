window.BITSMIST = window.BITSMIST || {};
window.BITSMIST.v1 = window.BITSMIST.v1 || {};

// App
import App from './app';

window.BITSMIST.v1.App = App;

// Error
import {NoClassError, NoNodeError, NoMethodError, NoResourceError, NoRouteError, NotValidFunctionError} from './error/errors';
import AjaxErrorHandler from './error/ajax-error-handler';
import NoRouteErrorHandler from './error/no-route-error-handler';

window.BITSMIST.v1.NoClassError = NoClassError;
window.BITSMIST.v1.NoNodeError = NoNodeError;
window.BITSMIST.v1.NoMethodError = NoMethodError;
window.BITSMIST.v1.NoResourceError = NoResourceError;
window.BITSMIST.v1.NoRouteError = NoRouteError;
window.BITSMIST.v1.NotValidFunctionError = NotValidFunctionError;
window.BITSMIST.v1.AjaxErrorHandler = AjaxErrorHandler;
window.BITSMIST.v1.NoRouteErrorHandler = NoRouteErrorHandler;

// Loader
import DefaultLoader from './loader/default-loader';

window.BITSMIST.v1.DefaultLoader = DefaultLoader;

// Manager
import ErrorManager from './manager/error-manager';
import PreferenceManager from './manager/preference-manager';
import ServiceManager from './manager/service-manager';

window.BITSMIST.v1.ErrorManager = ErrorManager;
window.BITSMIST.v1.PreferenceManager = PreferenceManager;
window.BITSMIST.v1.ServiceManager = ServiceManager;

// Router
import DefaultRouter from './router/default-router';

window.BITSMIST.v1.DefaultRouter = DefaultRouter;

// Preference
import BroadcastPreferenceHandler from './preference/broadcast-preference-handler';
import CookiePreferenceHandler from './preference/cookie-preference-handler';
import ObserverPreferenceHandler from './preference/observer-preference-handler';

window.BITSMIST.v1.BroadcastPreferenceHandler = BroadcastPreferenceHandler;
window.BITSMIST.v1.CookiePreferenceHandler = CookiePreferenceHandler;
window.BITSMIST.v1.ObserverPreferenceHandler = ObserverPreferenceHandler;

// UI
import Component from './ui/component';
import Form from './ui/form';
import List from './ui/list';

window.BITSMIST.v1.Component = Component;
window.BITSMIST.v1.Form = Form;
window.BITSMIST.v1.List = List;

// Util
import AjaxUtil from './util/ajax-util';
import AuthenticationUtil from './util/authentication-util';
import FormUtil from './util/form-util';
import FormatterUtil from './util/formatter-util';
import MasterUtil from './util/master-util';
import ResourceUtil from './util/resource-util';

window.BITSMIST.v1.AjaxUtil = AjaxUtil;
window.BITSMIST.v1.AuthenticationUtil = AuthenticationUtil;
window.BITSMIST.v1.FormUtil = FormUtil;
window.BITSMIST.v1.FormatterUtil = FormatterUtil;
window.BITSMIST.v1.MasterUtil = MasterUtil;
window.BITSMIST.v1.ResourceUtil = ResourceUtil;

