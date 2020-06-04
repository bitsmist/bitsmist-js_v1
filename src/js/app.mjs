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
import Component from './ui/component';

// =============================================================================
//	App class
// =============================================================================

export default class App extends Component
{

	// -------------------------------------------------------------------------
	//  Constructor
	// -------------------------------------------------------------------------

	/**
	 * Constructor.
	 */
	constructor()
	{

		super();

		// Init a container
		this._container = {};
		this._container["app"] = this;

		this.__waitFor = {};
		this.watchers = {};
		this.watchers["error"] = {};
		this.watchers["preference"] = {};

		// Init error handling
		this.__initError();

	}

	_getOptions()
	{

		return {
			"name": "App",

			"events": {
				"initComponent": {
					"handler": this.onInitComponent,
				},
				"init": {
					"handler": this.onInit,
				},
				"setup": {
					"handler": this.onSetup,
				},
				"beforeOpen": {
					"handler": this.onBeforeOpen,
				},
				"open": {
					"handler": this.onOpen,
				},
			},
		};

	}

	onInitComponent(sender, e)
	{

		console.log("@@@onInitComponent", this.name, sender, e);

	}

	onInit(sender, e)
	{

		console.log("@@@onInit", this.name, sender, e);

	}

	onSetup(sender, e)
	{

		console.log("@@@onSetup", this.name, sender, e);

	}

	onBeforeOpen(sender, e)
	{

		console.log("@@@onBeforeOpen", this.name, sender, e);

	}

	onOpen(sender, e)
	{

		console.log("@@@onOpen", this.name, sender, e);

		let settings = e.detail.options;

		// Init a container
		this._container["settings"] = settings;
		this._container["appInfo"] = {};
		this._container["sysInfo"] = {};
		this._container["components"] = {};

		this._container["masters"] = {};
		this._container["preferences"] = {};
		this._container["resources"] = {};

		// Init system information
		this._container["sysInfo"]["version"] = settings["defaults"]["apiVersion"];
		this._container["sysInfo"]["baseUrl"] = settings["defaults"]["apiBaseUrl"];

		// Init application information
		this._container["appInfo"]["version"] = settings["defaults"]["appVersion"];
		this._container["appInfo"]["baseUrl"] = settings["defaults"]["appBaseUrl"];

		// Init loader
		let loaderOptions = {"container": this._container};
		this._container["loader"] = this.createObject(this._container["settings"]["loader"]["className"], loaderOptions);

		// load services
		this._container["loader"].loadServices();

		// Init router
		if (this._container["settings"]["router"])
		{
			let routerOptions = {"container": this._container};
			let options = Object.assign({"container": this._container}, this._container["settings"]["router"]);
			this._container["router"] = this.createObject(this._container["settings"]["router"]["className"], options);

			this._container["loader"].loadApp(this._container["router"].routeInfo["specName"]);
		}

	}

	// -------------------------------------------------------------------------
	//  Methods
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

		let ret;

		try
		{
			let c = Function("return (" + className + ")")();
			ret = new c(...args);
		}
		catch
		{
			let c = window;
			className.split(".").forEach((value) => {
				c = c[value];
				if (!c)
				{
					throw new NoClassError(`Class not found. className=${className}`);
				}
			});
			ret = new c(...args);
		}

		return ret;

		/*
		let c = window;

		className.split(".").forEach((value) => {
			c = c[value];
			if (!c)
			{
				throw new NoClassError(`Class not found. className=${className}`);
			}
		});

		return new c(...args);
		*/

	}

    // -------------------------------------------------------------------------

	/**
	 * Check if the class exists.
	 *
	 * @param	{String}		className			Class name.
	 *
	 * @return  {Bool}			True if exists.
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

	/**
	 * Check if the class exists.
	 *
	 * @param	{Array}			eventNames			Array of event names.
	 * @param	{String}		title				Servce name.
	 * @param	{Object}		manager				Servce manager.
	 */
	registerService(eventNames, title, manager)
	{

		for (let i = 0; i < eventNames.length; i++)
		{
			this.watchers[eventNames[i]][title] = manager;
		}

	}

	/*
	registerWatcher(eventNames, title, component)
	{

		for (let i = 0; i < eventNames.length; i++)
		{
			this.watchers[eventNames[i]][title] = component;
		}

	}
	*/

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
			e.detail.sender.container = this._container;
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

		Object.keys(this.watchers["error"]).forEach((key) => {
			//this.watchers["error"][key].triggerEvent("error", e);
			this.watchers["error"][key].handle(e);
		});

		/*
		if (this.container["errorManager"] && this.container["errorManager"].plugins.length > 0)
		{
			this.container["errorManager"].handle(e);
		}
		else
		{
//			console.error(e);
		}
		*/

	}

}

customElements.define("bm-app", App);
