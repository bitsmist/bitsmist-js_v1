// =============================================================================
/**
 * Bitsmist WebView - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import AjaxUtil from './util/ajax-util';
import ClassUtil from './util/class-util';
import Component from './component';
import Globals from './globals';
import Router from './plugin/router';
import Store from './plugin/store';

// =============================================================================
//	App class
// =============================================================================

// -----------------------------------------------------------------------------
//  Constructor
// -----------------------------------------------------------------------------

/**
 * Constructor.
 *
 * @param	{Object}		settings			Options for the component.
 */
export default function App(settings)
{

	// super()
	settings = Object.assign({}, {"name":"App", "templateName":"", "autoSetup":false}, settings);
	let _this = Reflect.construct(Component, [settings], this.constructor);

	// Init variables
	Globals["app"] = _this;

	// Init default router only when no router plugin is installed
	if (!_this.router)
	{
		_this._router = new Router(_this, _this.settings.get("router"));
		Object.defineProperty(App.prototype, 'router', {
			get()
			{
				return _this._router;
			},
			configurable: true
		})
	}

	// Init error listeners
	_this.__initErrorListeners();

	// Trigger events
	Promise.resolve().then(() => {
		return _this.preferences.load();
	}).then((preferences) => {
		return _this.preferences.merge(preferences);
	}).then(() => {
		return _this.trigger("initApp", _this, {"settings":_this.settings.items, "preferences":_this.preferences.items});
	});

	return _this;

}

ClassUtil.inherit(App, Component);
customElements.define("bm-app", App);

// -----------------------------------------------------------------------------
//  Methods
// -----------------------------------------------------------------------------

/**
 * Start application.
 */
App.prototype.run = function()
{

	let promise;

	// Load spec
	let specName = this.router.routeInfo["specName"];
	if (specName)
	{
		promise = new Promise((resolve, reject) => {
			let path = this.getSetting("system.appBaseUrl", "") + this.getSetting("system.specPath", "/specs/");
			this.loadSpec(specName, path).then((spec) => {
				this._spec = spec;

				// Add new routes
				for(let i = 0; i < spec["routes"].length; i++)
				{
					this.router.addRoute(spec["routes"][i], true);
				}

				// Components
				Object.keys(spec["components"]).forEach((key) => {
					this.settings.items["components"][key] = spec["components"][key];
				});

				resolve();
			});
		});
	}

	// Open app
	Promise.all([promise]).then(() => {
		return this.trigger("specLoad", this, {"spec":this._spec});
	}).then(() => {
		return this.open();
	});

}

// -----------------------------------------------------------------------------

/**
 * Apply settings.
 *
 * @param	{Object}		options				Options.
 *
 * @return  {Promise}		Promise.
 */
App.prototype.setup = function(options)
{

	console.debug(`App.setup(): Setting up app.`);

	return new Promise((resolve, reject) => {
		options = Object.assign({}, options);
		let sender = ( options["sender"] ? options["sender"] : this );

		Component.prototype.setup.call(this, options).then(() => {
			if (options["newPreferences"])
			{
				this.preferences.merge(options["newPreferences"]);
				this.preferences.save();
			}
		}).then(() => {
			resolve();
		});
	});

}

// -----------------------------------------------------------------------------
//  Privates
// -----------------------------------------------------------------------------

/**
 * Init error handling listeners.
 */
App.prototype.__initErrorListeners = function()
{

	window.addEventListener("unhandledrejection", (error) => {
		let e = {};

		if (error["reason"])
		{
			if (error.reason instanceof XMLHttpRequest)
			{
				e.message = error.reason.statusText;
			}
			else
			{
				e.message = error.reason.message;
			}
		}
		else
		{
			e.message = error;
		}
		e.type = error.type;
		e.name = this.__getErrorName(error);
		e.filename = "";
		e.funcname = ""
		e.lineno = "";
		e.colno = "";
		e.stack = error.reason.stack;
		e.object = error.reason;

		this.__handleException(e);

		return false;
		//return true;
	});

	window.addEventListener("error", (error, file, line, col) => {
		let e = {};

		e.type = "error";
		e.name = this.__getErrorName(error);
		e.message = error.message;
		e.file = error.filename;
		e.line = error.lineno;
		e.col = error.colno;
		if (error.error)
		{
			e.stack = error.error.stack;
			e.object = error.error;
		}

		this.__handleException(e);

		return false;
		//return true;
	});

}

// -----------------------------------------------------------------------------

/**
 * Get an error name for the given error object.
 *
 * @param	{Object}		error				Error object.
 *
 * @return  {String}		Error name.
 */
App.prototype.__getErrorName = function(error)
{

	let name;
	let e;

	if (error.reason)		e = error.reason;
	else if (error.error)	e = error.error;
	else					e = error.message;

	if (e.name)									name = e.name;
	else if (e instanceof TypeError)			name = "TypeError";
	else if (e instanceof XMLHttpRequest)		name = "AjaxError";
	else if (e instanceof EvalError)			name = "EvalError";
//	else if (e instanceof InternalError)		name = "InternalError";
	else if (e instanceof RangeError)			name = "RangeError";
	else if (e instanceof ReferenceError)		name = "ReferenceError";
	else if (e instanceof SyntaxError)			name = "SyntaxError";
	else if (e instanceof URIError)				name = "URIError";
	else
	{
		let pos = e.indexOf(":");
		if (pos > -1)
		{
			name = e.substring(0, pos);
		}
	}

	return name;

}

// -----------------------------------------------------------------------------

/**
 * Handle an exeption.
 *
 * @param	{Object}		e					Error object.
 */
App.prototype.__handleException = function(e)
{

	this.trigger("error", this, {"error":e});

}
