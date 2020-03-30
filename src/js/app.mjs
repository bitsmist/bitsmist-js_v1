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

		// Init loader and router;
		this.__initLoaderAndRouter();

		// Init system information
		this.container["sysInfo"]["version"] = settings["options"]["apiVersion"];
		this.container["sysInfo"]["baseUrl"] = settings["options"]["apiBaseUrl"];

		// Init application information
		this.container["appInfo"]["version"] = settings["options"]["appVersion"];
		this.container["appInfo"]["baseUrl"] = settings["options"]["appBaseUrl"];

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

		// load spec
		this.container["loader"].loadSpec().then((spec) => {
			this.container["appInfo"]["spec"] = spec;

			let promises = [];

			// load settings
			promises.push(new Promise((resolve, reject) => {
				this.container["settingManager"].load().then((results) => {
					Object.assign(this.container["settings"]["options"], results[0]);
					resolve();
				});
			}));

			// load resources
			promises.push(this.container["loader"].loadResources(this.container["appInfo"]["spec"]["resources"]));

			// load masters
			promises.push(this.container["loader"].loadMasters(this.container["appInfo"]["spec"]["masters"]));

			// load components
			promises.push(this.container["loader"].loadComponents(this.container["appInfo"]["spec"]["components"]));

			Promise.all(promises).then(() => {
				// Open startup pad
				let routeInfo = this.container["router"].loadRoute();
				this.container["router"].openRoute(routeInfo, {"autoOpen":true});
			});

			// Init pop state handling
			this.__initPopState();
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Instantiate the component.
	 *
	 * @param	{string}		componentName		Component name.
	 * @param	{array}			options				Options for the component.
	 *
	 * @return  {Object}		Initaiated object.
	 */
	createObject(componentName, options)
	{

		let ret = null;

		try
		{
			let c = Function("return (" + componentName + ")")();
			ret  = new c(componentName, options);
		}
		catch(e)
		{
			if (e instanceof TypeError)
			{
				throw new NoClassError(`Class not found. componentName=${componentName}`);
			}
			else
			{
				throw e;
			}
		}

		return ret;

	}

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
	 * Init loader and router.
	 */
	__initLoaderAndRouter()
	{

		let loaderOptions = {"container": this.container};
		this.container["loader"] = this.createObject(this.container["settings"]["loader"]["class"], loaderOptions);

		let routerOptions = {"container": this.container};
		this.container["router"] = this.createObject(this.container["settings"]["router"]["class"], routerOptions);

		// Init exception manager
		this.container["errorManager"].listener.addEventHandler("error", (sender, e, ex) => {
			let error = {
				"type":		"error",
				"message":	ex.message,
				"filename":	ex.filename,
				"funcname":	ex.funcname,
				"stack":	(ex.object && ex.object.stack ? ex.object.stack : undefined),
				"object":	ex.object
			};
			this.__handleException(error);
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Init error handling.
	 */
	__initError()
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

	// -------------------------------------------------------------------------

	/**
	 * Init pop state handling.
	 */
	__initPopState()
	{

		if (window.history && window.history.pushState){
			window.addEventListener("popstate", (event) => {
				let routeInfo = this.container["router"].loadRoute();
				this.container["router"].openRoute(routeInfo, {"autoRefresh":true});
			});
		}

	}

}

