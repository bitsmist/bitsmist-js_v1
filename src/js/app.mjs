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
import Component from './ui/component';
import LoaderUtil from './util/loader-util';
import ServiceManager from './manager/service-manager';

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

	BITSMIST.v1._app = this;
	BITSMIST.v1.Settings = Object.assign({}, settings);

	this._components = {};
	this._serviceManager = new ServiceManager({"app":this});
	this._settings = BITSMIST.v1.Settings;
	this._spec;

	// Init error listeners
	this.__initErrorListeners();

	// load services
	this._serviceManager.loadServices(this._settings["services"]);

	// Init router
	if (this._settings["router"])
	{
		let options = Object.assign({"app": this}, this._settings["router"]);
		BITSMIST.v1._router = LoaderUtil.createObject(this._settings["router"]["className"], options);
	}

	// load preference
	this._serviceManager.load(null, (service) => {
		return service.options["serviceType"] == "preference"
	}).then((preferences) => {
		for (let i = 0; i < preferences.length; i++)
		{
			this._settings["preferences"] = Object.assign(this._settings["preferences"], preferences[i]);
		}
	});

}

// -----------------------------------------------------------------------------
//  Setter/Getter
// -----------------------------------------------------------------------------

/**
 * Service manager.
 *
 * @type	{Object}
 */
Object.defineProperty(App.prototype, 'serviceManager', {
	get()
	{
		return this._serviceManager;
	}
})

Object.defineProperty(App.prototype, 'router', {
	get()
	{
		return BITSMIST.v1._router;
	}
})

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

	// load spec
	let specName = this.router.routeInfo["specName"];
	if (specName)
	{
		promise = new Promise((resolve, reject) => {
			LoaderUtil.loadSpec(specName, this._settings).then((spec) => {
				this._spec = spec;

				this.router.__initRoutes(spec["routes"].concat(this._settings["router"]["routes"]));

				Object.keys(spec["components"]).forEach((key) => {
					this._components[key] = spec["components"][key];
					let className = spec["components"][key]["className"];
					LoaderUtil.createComponent(className, spec["components"][key]).then((component) => {
						component._parent = this;
						this._components[key].object = component;

						component.open();
					});
				});

				resolve();
			});
		});
	}

}

// -----------------------------------------------------------------------------

/**
 * Setup event handler.
 *
 * @param   {Object}        options				Options.
 */
App.prototype.setup = function(options)
{

	// Setup
	this._serviceManager.setup({
		"newPreferences":options["newPreferences"],
	}, (service) => {
		return service.options["serviceType"] == "preference"
	}).then(() => {
		// Merge new settings
		this._settings["preferences"] = Object.assign(this._settings["preferences"], options["newPreferences"]);

		// Save settings
		this._serviceManager.save(options["newPreferences"], (service) => {
			return service.options["serviceType"] == "preference"
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

	this._serviceManager.handle(e, (service) => {
		return service.options["serviceType"] == "error";
	});

}
