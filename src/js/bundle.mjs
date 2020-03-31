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
import SettingManager from './manager/setting-manager';
import ServiceManager from './manager/service-manager';

window.BITSMIST.v1.ErrorManager = ErrorManager;
window.BITSMIST.v1.SettingManager = SettingManager;
window.BITSMIST.v1.ServiceManager = ServiceManager;

// Router
import DefaultRouter from './router/default-router';

window.BITSMIST.v1.DefaultRouter = DefaultRouter;

// Setting
import BroadcastSetupper from './setting/broadcast-setupper';
import CookieHandler from './setting/cookie-handler';

window.BITSMIST.v1.BroadcastSetupper = BroadcastSetupper;
window.BITSMIST.v1.CookieHandler = CookieHandler;

// UI
import Component from './ui/component';
import EventHandler from './ui/event-handler';
import Form from './ui/form';
import List from './ui/list';
import Pad from './ui/pad';

window.BITSMIST.v1.Component = Component;
window.BITSMIST.v1.EventHandler= EventHandler;;
window.BITSMIST.v1.Form = Form;
window.BITSMIST.v1.List = List;
window.BITSMIST.v1.Pad = Pad;

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

