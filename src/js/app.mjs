// =============================================================================
/**
 * Bitsmist WebView - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import {NoClassError} from './error/errors';

// =============================================================================
//	App class
// =============================================================================

export default class App
{

	// -------------------------------------------------------------------------
	//  Constructor
	// -------------------------------------------------------------------------

	/**
	 * Constructor.
	 *
	 * @param	{array}			settings		Settings.
	 */
	constructor(settings)
	{

		this.__waitFor = {};

		// Init error handling
		this.__initError();

		// Init a container
		this.container = {};
		this.container["app"] = this;
		this.container["settings"] = settings;
		this.container["appInfo"] = {};
		this.container["sysInfo"] = {};
		this.container["components"] = {};
		this.container["resources"] = {};
		this.container["masters"] = {};
		this.container["preferences"] = settings["preferences"];

		// Init system information
		this.container["sysInfo"]["version"] = settings["defaults"]["apiVersion"];
		this.container["sysInfo"]["baseUrl"] = settings["defaults"]["apiBaseUrl"];

		// Init application information
		this.container["appInfo"]["version"] = settings["defaults"]["appVersion"];
		this.container["appInfo"]["baseUrl"] = settings["defaults"]["appBaseUrl"];

		// Init loader
		let loaderOptions = {"container": this.container};
		this.container["loader"] = this.createObject(this.container["settings"]["loader"]["className"], loaderOptions);

		// load services
		this.container["loader"].loadServices();

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
	 * Start the application.
	 */
	run()
	{

		// load preferences
		this.container["loader"].loadPreferences();

		// Init router
		if (this.container["settings"]["router"])
		{
			let routerOptions = {"container": this.container};
			let options = Object.assign({"container": this.container}, this.container["settings"]["router"]);
			this.container["router"] = this.createObject(this.container["settings"]["router"]["className"], options);

			this.container["loader"].loadApp(this.container["router"].routeInfo["specName"]);
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Instantiate the component.
	 *
	 * @param	{String}		className			Class name.
	 * @param	{Object}		options				Options for the component.
	 *
	 * @return  {Object}		Initaiated object.
	 */
	createObject(className, ...args)
	{

		let c = window;

		className.split(".").forEach((value) => {
			c = c[value];
			if (!c)
			{
				throw new NoClassError(`Class not found. className=${className}`);
			}
		});

		return new c(...args);

	}

    // -------------------------------------------------------------------------

	/**
	 * Check if the class exists.
	 *
	 * @param	{string}		className			Class name.
	 *
	 * @return  {bool}			True if exists.
	 */
	isExistsClass(className)
	{

		let ret = true;
		let c = window;

		className.split(".").forEach((value) => {
			c = c[value];
			if (!c)
			{
				ret = false;
			}
		});

		return ret;

	}

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
	 * Wait for components to be loaded.
	 *
	 * @param	{Array}			componentNames		Component names to wait.
	 *
	 * @return  {Array}			Promises.
	 */
	waitFor(componentNames)
	{

		let promises = [];

		for (let i = 0; i < componentNames.length; i++)
		{
			let promise;
			if (!this.__waitFor[componentNames[i]])
			{
				this.__waitFor[componentNames[i]] = {};
				promise = new Promise((resolve, reject) => {
					this.__waitFor[componentNames[i]]["resolve"] = resolve;
				});
				this.__waitFor[componentNames[i]]["promise"] = promise;
			}
			else
			{
				promise = this.__waitFor[componentNames[i]]["promise"];
			}

			promises.push(promise);
		}

		return promises;

	}

	// -------------------------------------------------------------------------

	/**
	 * Init error handling.
	 */
	__initError()
	{

		window.addEventListener("_bm_component_init", (e) => {
			e.detail.sender.container = this.container;
		});

		window.addEventListener("_bm_component_ready", (e) => {
			if (this.__waitFor[e.detail.sender.name] && this.__waitFor[e.detail.sender.name]["resolve"])
			{
				this.__waitFor[e.detail.sender.name]["resolve"]();
			}
			else if (!this.__waitFor[e.detail.sender.name])
			{
				this.__waitFor[e.detail.sender.name] = {"promise": Promise.resolve()};
			}
		});

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

	// -------------------------------------------------------------------------

	/**
	 * Get an error name for the given error object.
	 *
	 * @param	{Object}		error				Error object.
	 *
	 * @return  {String}		Error name.
	 */
	__getErrorName(error)
	{

		let name;
		let e;

		if (error.reason)
		{
			e = error.reason;
		}
		else if (error.error)
		{
			e = error.error;
		}
		else
		{
			e = error.message;
		}

		if (e.name)
		{
			name = e.name;
		}
		else if (e instanceof TypeError)
		{
			name = "TypeError";
		}
		else if (e instanceof XMLHttpRequest)
		{
			name = "AjaxError";
		}
		else if (e instanceof EvalError)
		{
			name = "EvalError";
		}
		/*
		else if (e instanceof InternalError)
		{
			name = "InternalError";
		}
		*/
		else if (e instanceof RangeError)
		{
			name = "RangeError";
		}
		else if (e instanceof ReferenceError)
		{
			name = "ReferenceError";
		}
		else if (e instanceof SyntaxError)
		{
			name = "SyntaxError";
		}
		else if (e instanceof URIError)
		{
			name = "URIError";
		}
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

	// -------------------------------------------------------------------------

	/**
	 * Handle an exeption.
	 *
	 * @param	{Object}		e					Error object.
	 */
	__handleException(e)
	{

		if (this.container["errorManager"] && this.container["errorManager"].plugins.length > 0)
		{
			this.container["errorManager"].handle(e);
		}
		else
		{
//			console.error(e);
		}

	}

}

