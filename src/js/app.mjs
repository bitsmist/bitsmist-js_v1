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
//export default class App
class App
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

		this.container = {};
		this.container["app"] = this;
		this.container["settings"] = settings;
		this.container["appInfo"] = {};
		this.container["sysInfo"] = {};
		this.container["components"] = {};
		this.container["resources"] = {};
		this.container["masters"] = {};

		// Init a loader
		this.container["loader"] = this.__createObject(settings["loader"]["class"], this.container);

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

			let promises = [];

			// init resources
			promises.push(this.container["loader"].loadResources(spec["resources"]));

			// load masters
			promises.push(this.container["loader"].loadMasters(spec["masters"]));

			// load components
			Promise.all(promises).then(() => {
				this.container["loader"].loadComponents(spec["components"]);
			});
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

}

