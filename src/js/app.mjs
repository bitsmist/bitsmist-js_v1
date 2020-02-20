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

	/*
		// Load route info
		this.container["loader"].loadRoute();

		// Load request & response
		this.container["request"];
		this.container["response"];
	*/

		// Init system information
		this.container["sysInfo"]["version"] = settings["options"]["apiVersion"];
		this.container["sysInfo"]["baseUrl"] = settings["options"]["apiBaseUrl"];

		// Init application information
		this.container["appInfo"]["version"] = settings["options"]["appVersion"];
		this.container["appInfo"]["baseUrl"] = settings["options"]["appBaseUrl"];

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
			this.container["loader"].loadServices();

			let promises = [];

			// load resources
			promises.push(this.container["loader"].loadResources(this.container["appInfo"]["spec"]["resources"]));

			// load masters
			promises.push(this.container["loader"].loadMasters(this.container["appInfo"]["spec"]["masters"]));

			// load components
			promises.push(this.container["loader"].loadComponents(this.container["appInfo"]["spec"]["components"]));

			Promise.all(promises).then(() => {
				// todo:common startup script comes here

				// Open startup pad
				let commandName = this.container["loader"].loadRoute()["commandName"];
				let padName = this.container["appInfo"]["spec"]["commands"][commandName]["startup"];
				this.container["components"][padName].object.open();
			});

			// Init pop state handling
			this.__initPopState();
		});

	}

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

		this.container["exceptionManager"].events.addEventHandler("error", (sender, e) => {
			let error = {"type":"error", "message":e.detail.message, "filename":e.detail.filename, "object":e.detail.object};
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

			if (error.reason instanceof XMLHttpRequest)
			{
				e.message = error.reason.statusText;
				e.status = error.reason.status;
			}
			else if (error["reason"])
			{
				e.message = error.reason.message;
				e.type = error.type;
			}
			else
			{
				e.message = error;
			}
			e.type = "unhandledrejection";
			e.filename = "";
			e.lineno = "";
			e.colno = "";
			e.object = error;

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
				let option = this.container["loader"].getUrlVars();
				this.container["loader"].openRoute(routeInfo, option, false, true);
			});
		}

	}

}

