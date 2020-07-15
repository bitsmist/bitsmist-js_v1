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
import Component from './component';
import Globals from './globals';
import LoaderUtil from './util/loader-util';

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
	let options = {
		"name": "App",
		"templateName": "",
		"plugins": ( settings["plugins"] ? settings["plugins"] : null ),
	}
	let _this = Reflect.construct(Component, [options], this.constructor);

	// Init variables
	Globals["app"] = _this;
	Globals["settings"] = Object.assign({}, settings);

	_this.__initErrorListeners();
	_this.trigger("_appInit", this, {"settings":settings});

	return _this;

}

LoaderUtil.inherit(App, Component);
customElements.define("bm-app", App);

// -----------------------------------------------------------------------------
//  Methods
// -----------------------------------------------------------------------------

/**
 * Start application.
 *
 * @param	{Object}		settings			Settings.
 *
 * @return  {Array}			Promises.
 */
App.prototype.run = function()
{

	let promise;

	// Load spec
	let specName = ( this._plugins["router"] ? this._plugins["router"].routeInfo["specName"] : "" );
	if (specName)
	{
		promise = new Promise((resolve, reject) => {
			LoaderUtil.loadSpec(specName, Globals["settings"]).then((spec) => {
				Globals["spec"] = spec;

				// Add new routes
				for(let i = 0; i < spec["routes"].length; i++)
				{
					this._plugins["router"].addRoute(spec["routes"][i], true);
				}

				// Components
				Object.keys(spec["components"]).forEach((key) => {
					this._options["components"][key] = spec["components"][key];
				});

				resolve();
			});
		});
	}

	// Open app
	Promise.all([promise]).then(() => {
		return this.trigger("_specLoad", this, {"spec":Globals["spec"]});
	}).then(() => {
		return this.open();
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
	else if (e instanceof InternalError)		name = "InternalError";
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

	// Call plugins
	this.trigger("_error", this, {"error":e});

}
