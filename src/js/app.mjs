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
			this.container["exceptionManager"].events.addEventHandler("error", (sender, e) => {
				this.__handleException(e);
			});

			let promises = [];

			// load resources
			promises.push(this.container["loader"].loadResources(this.container["appInfo"]["spec"]["resources"]));

			// load masters
			promises.push(this.container["loader"].loadMasters(this.container["appInfo"]["spec"]["masters"]));

			// load components
			promises.push(this.container["loader"].loadComponents(this.container["appInfo"]["spec"]["components"]));

			// Open startup pad
			Promise.all(promises).then(() => {
				let commandName = this.container["loader"].loadRoute()["commandName"];
				let padName = this.container["appInfo"]["spec"]["commands"][commandName]["startup"];
				this.container["components"][padName].object.open();
			});

			if (window.history && window.history.pushState){
				window.addEventListener("popstate", (event) => {
					let routeInfo = this.container["loader"].loadRoute();
					let option = this.container["loader"].getUrlVars();
					this.container["loader"].openRoute(routeInfo, option, false, true);
				});
			}
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

	}

	// -------------------------------------------------------------------------

	/**
	 * Init error handling.
	 */
	__initError()
	{

		window.addEventListener("unhandledrejection", (event) => {
			let e = {};
			if (event.reason instanceof XMLHttpRequest)
			{
				e.message = event.reason.statusText;
				e.status = event.reason.status;
				e.object = event.reason;
			}
			else
			{
				e.message = event.reason;
			}
			this.__handleException(e);

			return false;
		});

		window.addEventListener("error", (error, file, line, col) => {
			let e = {};
			e.messsage = error;
			e.file = file;
			e.line = line;
			e.col = col;
			this.__handleException(e);

			return false;
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Instantiate the component.
	 *
	 * @param	{object}		e					Error object.
	 */
	__handleException(e)
	{

		if (this.container["exceptionManager"].length == 0)
		{
			// No error handler available
			throw e;
		}

		this.container["exceptionManager"].handle(e);

	}

}

