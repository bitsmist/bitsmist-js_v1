// =============================================================================
/**
 * Bitsmist WebView - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

/**
 * App class.
 */
export default class App
//class App
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

		// Init a loader
		this.__initLoader(this.container);

		// Init system information
		this.container["sysInfo"]["version"] = settings["options"]["apiVersion"];
		this.container["sysInfo"]["baseUrl"] = settings["options"]["apiBaseUrl"];

		// Init application information
		this.container["appInfo"]["version"] = settings["options"]["appVersion"];
		this.container["appInfo"]["baseUrl"] = settings["options"]["appBaseUrl"];

		// load services
		this.container["loader"].loadServices();

	};

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

			// load services
			//this.container["loader"].loadServices();

			let promises = [];

			// load resources
			promises.push(this.container["loader"].loadResources(this.container["appInfo"]["spec"]["resources"]));

			// load masters
			promises.push(this.container["loader"].loadMasters(this.container["appInfo"]["spec"]["masters"]));

			// load components
			promises.push(this.container["loader"].loadComponents(this.container["appInfo"]["spec"]["components"]));

			Promise.all(promises).then(() => {
				// Open startup pad
				let routeInfo = this.container["loader"].loadRoute();
				this.container["loader"].openRoute(routeInfo, {"autoOpen":true});
			});

			// Init pop state handling
			this.__initPopState();
		});

	}

	/**
	 * Instantiate the component.
	 *
	 * @param	{string}		componentName		Component name.
	 * @param	{array}			options				Options for the component.
	 *
	 * @return  {Object}		Initaiated object.
	 */
	/*
	createObject(componentName, options)
	{

		let ret = null;

		let c = Function("return (" + componentName + ")")();
		ret  = new c(options);

		return ret;

	}
	*/

	/*
	broadcast(eventName)
	{

		this.container["components"].forEach((component) => {
			component.events.trigger(eventName, this);

			component.forEach((subComponent) => {
				subComponent.events.trigger(eventName, this);
			});
		});

	}
	*/

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
	 * Instantiate the component.
	 *
	 * @param	{string}		componentName		Component name.
	 * @param	{array}			options				Options for the component.
	 *
	 * @return  {Object}		Initaiated object.
	 */
	__createObject(componentName, options)
	{

		let ret = null;

		let c = Function("return (" + componentName + ")")();
		ret  = new c(options);

		return ret;

	}

	// -------------------------------------------------------------------------

	/**
	 * Init loader.
	 */
	__initLoader()
	{

		let options = {"container": this.container};
		this.container["loader"] = this.__createObject(this.container["settings"]["loader"]["class"], options);

		// Init exception manager
		this.container["exceptionManager"].events.addEventHandler("error", (sender, e, ex) => {
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
					error.reason.name = "XMLHttpRequest";
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
			e.filename = "";
			e.funcname = ""
			e.lineno = "";
			e.colno = "";
			e.stack = error.reason.stack;
			e.object = error.reason;

			this.__handleException(e);

			//return false;
			return true;
		});

		window.addEventListener("error", (error, file, line, col) => {
			let e = {};

			e.type = "error";
			e.message = error.message;
			e.file = error.filename;
			e.line = error.lineno;
			e.col = error.colno;
			e.stack = error.stack;
			e.object = error;

			this.__handleException(e);

			//return false;
			return true;
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Handle an exeption.
	 *
	 * @param	{object}		e					Error object.
	 */
	__handleException(e)
	{

		try
		{
			if (this.container["exceptionManager"] && this.container["exceptionManager"].plugins.length > 0)
			{
				this.container["exceptionManager"].handle(e);
			}
			else
			{
				console.error("[" + e.type + "] " + e.message);
				console.error("Error details below:");
				console.error((e.object ? e.object : e));
			}
		}
		catch(e)
		{
			console.error(`App.__handleException(): An exception in error handler. e='${e.toString()}'`);
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
				let routeInfo = this.container["loader"].loadRoute();
				this.container["loader"].openRoute(routeInfo, {"autoRefresh":true});
			});
		}

	}

}

