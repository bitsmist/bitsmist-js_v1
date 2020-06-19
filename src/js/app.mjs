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
import ServiceManager from './manager/service-manager';

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
	constructor(settings)
	{

		super();

		this._app = this;
		this._router;
		this._serviceManager = new ServiceManager({"app":this});
		this._settings = ( settings ? settings : {} );
		this._spec;
		this.__waiting = [];
		this.__loaded = [];

		// Init global listeners
		this.__initComponentListeners();
		this.__initErrorListeners();

	}

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	/**
     * Service manager.
     *
	 * @type	{Object}
     */
	get serviceManager()
	{

		return this._serviceManager;

	}

	// -------------------------------------------------------------------------

	/**
     * Router.
     *
	 * @type	{Object}
     */
	get router()
	{

		return this._router;

	}

	// -------------------------------------------------------------------------
	//  Protected
	// -------------------------------------------------------------------------

	/**
	 * Get component options.  Need to override.
	 */
	_getOptions()
	{

		return {
			"name": "App",
			"templateName": "",

			"events": {
				"setup": {
					"handler": this.onSetup,
				}
			},
		};

	}

	// -------------------------------------------------------------------------
	//  Event Handler
	// -------------------------------------------------------------------------

	/**
	 * Setup event handler.
	 *
	 * @param   {Object}        sender              Sender.
	 * @param   {Object}        e                   Event info.
	 */
	onSetup(sender, e)
	{

		// Setup
		this._serviceManager.setup({
			"newPreferences":e.detail.newPreferences,
	//		"currentPreferences":e.detail.currentPreferences
		}, (service) => {
			return service.options["serviceType"] == "preference"
		}).then(() => {
			// Merge new settings
			this._settings["preferences"] = Object.assign(this._settings["preferences"], e.detail.newPreferences);

			// Save settings
			this._serviceManager.save(e.detail.newPreferences, (service) => {
				return service.options["serviceType"] == "preference"
			});
		});

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
	 * Start application.
	 *
	 * @param	{Object}		settings			Settings.
	 *
	 * @return  {Array}			Promises.
	 */
	//run(settings)
	run()
	{

		/*
		if (settings)
		{
			this._settings = settings;
		}
		*/

		// load services
		this._serviceManager.loadServices(this._settings["services"]);

		// Init router
		if (this._settings["router"])
		{
			let options = Object.assign({"app": this._app}, this._settings["router"]);
			this._router = this._createObject(this._settings["router"]["className"], options);
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

		// load spec
		let specName = this._router.routeInfo["specName"];
		if (specName)
		{
			this.loadSpec(specName).then((spec) => {
				this._spec = spec;

				this._router.__initRoutes(spec["routes"].concat(this._settings["router"]["routes"]));

				Object.keys(spec["components"]).forEach((key) => {
					this._components[key] = spec["components"][key];
				});

				this.open();
			});
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Set settings.
	 *
	 * @param	{String}		settingName			Setting name.
	 * @param	{Object}		settings			Settings.
	 */
	setSettings(settingName, settings)
	{

		this._settings[settingName] = settings;

	}

	// -------------------------------------------------------------------------

	/**
	 * Get settings.
	 *
	 * @param	{String}		settingName			Setting name.
	 *
	 * @return  {Object}		settings.
	 */
	getSettings(settingName)
	{

		return Object.assign({}, this._settings[settingName]);

	}

	// -------------------------------------------------------------------------

	/**
	 * Wait for components to be loaded.
	 *
	 * @param	{Array}			waitlist			Components to wait.
	 *
	 * @return  {Array}			Promises.
	 */
	waitFor(waitlist)
	{

		let promise;

		if (!waitlist || this.__isLoaded(waitlist))
		{
			promise = Promise.resolve();
		}
		else
		{
			let waitInfo = {};
			waitInfo["waitlist"] = waitlist;

			promise = new Promise((resolve, reject) => {
				waitInfo["resolve"] = resolve;
				waitInfo["reject"] = reject;
			});
			waitInfo["promise"] = promise;

			this.__waiting.push(waitInfo);
		}

		return promise;

	}

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
	 * Check if components are loaded.
	 *
	 * @param	{Array}			waitlist			Components to wait.
	 *
	 * @return  {Array}			Promises.
	 */
	__isLoaded(waitlist)
	{

		let result = true;

		for (let i = 0; i < waitlist.length; i++)
		{
			let match = false;

			for (let j = 0; j < this.__loaded.length; j++)
			{
				if (this.__loaded[j].name == waitlist[i]["componentName"])
				{
					match = true;
					break;
				}
			}

			if (!match)
			{
				result = false;
				break;
			}
		}

		return result;

	}

	// -------------------------------------------------------------------------

	/**
	 * Init component handling listeners.
	 */
	__initComponentListeners()
	{

		window.addEventListener("_bm_component_init", (e) => {
			e.detail.sender._app = this;
		});

		window.addEventListener("_bm_component_ready", (e) => {
			this.__loaded.push(e.detail.sender);

			for (let i = 0; i < this.__waiting.length; i++)
			{
				if (this.__isLoaded(this.__waiting[i]["waitlist"]))
				{
					this.__waiting[i].resolve();
				}
			}
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Init error handling listeners.
	 */
	__initErrorListeners()
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

	// -------------------------------------------------------------------------

	/**
	 * Handle an exeption.
	 *
	 * @param	{Object}		e					Error object.
	 */
	__handleException(e)
	{

		this._serviceManager.handle(e, (service) => {
			return service.options["serviceType"] == "error";
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Load the spec file for this page.
	 *
	 * @param	{String}		specName			Spec name.
	 *
	 * @return  {Promise}		Promise.
	 */
	loadSpec(specName)
	{

		let basePath = this._router["options"]["options"]["specs"];
		let urlCommon = basePath + "common.js";
		let url = basePath + specName + ".js";
		let spec;
		let specCommon;
		let specMerged;

		return new Promise((resolve, reject) => {
			let promises = [];

			// Load specs
			promises.push(this.__loadSpecFile(urlCommon, "{}"));
			promises.push(this.__loadSpecFile(url));

			Promise.all(promises).then((result) => {
				// Convert to json
				try
				{
					specCommon = JSON.parse(result[0]);
					spec = JSON.parse(result[1]);
				}
				catch(e)
				{
					throw new Error(`Illegal json string. url=${(specCommon ? url : urlCommon)}`);
				}

				// Merge common spec, spec and settings
				specMerged = this.__deepMerge(specCommon, spec);
				specMerged = this.__mergeSettings(specMerged, this._settings);

				resolve(specMerged);
			});
		});

	}

    // -------------------------------------------------------------------------

	/**
	 * Load spec file.
	 *
	 * @param	{String}		url					Spec file url.
	 * @param	{String}		defaultResponse		Response when error.
	 *
	 * @return  {Promise}		Promise.
	 */
	__loadSpecFile(url, defaultResponse)
	{

		return new Promise((resolve, reject) => {
			let response;

			AjaxUtil.ajaxRequest({"url":url, "method":"GET"}).then((xhr) => {
				response = xhr.responseText;
				resolve(response);
			}).catch((xhr) => {
				if (defaultResponse)
				{
					response = defaultResponse;
					resolve(response);
				}
			});
		});

	}

    // -------------------------------------------------------------------------

	/**
	 * Merge settings to spec.
	 *
	 * @param	{Object}		spec					Spec.
	 * @param	{Object}		settings				Settings.
	 *
	 * @return  {Object}		Merged array.
	 */
	__mergeSettings(spec, settings)
	{

		Object.keys(spec).forEach((key) => {
			Object.keys(spec[key]).forEach((componentName) => {
				if (key in settings && componentName in settings[key])
				{
					spec[key][componentName] = this.__mergeSettings(settings[key][componentName], spec[key][componentName]);
				}
			});
		});

		return spec;

	}

    // -------------------------------------------------------------------------

	/**
	 * Deep merge.
	 *
	 * @param	{Object}		arr1					Array1.
	 * @param	{Object}		arr2					Array2.
	 *
	 * @return  {Object}		Merged array.
	 */
	__deepMerge(arr1, arr2)
	{

		Object.keys(arr2).forEach((key) => {
			if (arr1.hasOwnProperty(key) && typeof arr1[key] === 'object' && !(arr1[key] instanceof Array))
			{
				this.__deepMerge(arr1[key], arr2[key]);
			}
			else
			{
				arr1[key] = arr2[key];
			}
		});

		return arr1;

	}

}

customElements.define("bm-app", App);
