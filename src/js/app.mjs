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
//import {NoClassError} from './error/errors';
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

		this._app = this;
		this._spec;
		/*
		this._serviceManagers = {};
		this._serviceManagers["error"] = this._createObject("BITSMIST.v1.ServiceManager", {"app":this});
		this._serviceManagers["preference"] = this._createObject("BITSMIST.v1.ServiceManager", {"app":this});
		*/
		// this._serviceManagers["error"] = {};
		// this._serviceManagers["preference"] = {};
		//this._serviceManager = this._createObject("BITSMIST.v1.ServiceManager", {"app":this});
		this._serviceManager;
		this._masters = {};

		this.__waitFor = {};

		/*
		this.watchers = {};
		this.watchers["error"] = {};
		this.watchers["preference"] = {};
		*/

		this.__initGlobalEventListener();

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
	//  Protected
	// -------------------------------------------------------------------------

	_getOptions()
	{

		return {
			"name": "App",

			"events": {
				"setup": {
					"handler": this.onSetup,
				}
			},

			"components": {
			}
		};

	}

	onSetup(sender, e)
	{

		/*
		this._serviceManagers["preference"].setup({
			"newPreferences":e.detail.newPreferences,
			"currentPreferences":e.detail.currentPreferences
		});

		this._serviceManagers["preference"].save(e.detail.newPreferences);
		*/

		this._serviceManager.setup({
			"newPreferences":e.detail.newPreferences,
			"currentPreferences":e.detail.currentPreferences
		}, (service) => {
			return service.options["type"] == "preference"
		});
		this._serviceManager.save(e.detail.newPreferences);

		/*
		Object.keys(this.watchers["preference"]).forEach((key) => {
			this.watchers["preference"][key].setup({
				"newPreferences":e.detail.newPreferences,
				"currentPreferences":e.detail.currentPreferences
			});
		});

		Object.keys(this.watchers["preference"]).forEach((key) => {
			this.watchers["preference"][key].save(e.detail.newPreferences);
		});
		*/

	}

	// -------------------------------------------------------------------------

	run(settings)
	{

		this._settings = settings;

		// load services
		//this.loadServices();
		//this._serviceManager.load(this._settings["services"]);
		this._serviceManager = this._createObject("BITSMIST.v1.ServiceManager", {"app":this, "services":settings["services"]});

		// Init router
		if (this._settings["router"])
		{
			let options = Object.assign({"app": this._app}, this._settings["router"]);
			this._router = this._createObject(this._settings["router"]["className"], options);
		}

		// load preference
		/*
		this._serviceManagers["preference"].load().then((preferences) => {
			for (let i = 0; i < preferences.length; i++)
			{
				this._settings["preferences"] = Object.assign(this._settings["preferences"], preferences[i]);
			}
		});
		*/

		this._serviceManager.load(null, (service) => {
			return service.options["type"] == "preference"
		}).then((preferences) => {
			for (let i = 0; i < preferences.length; i++)
			{
				this._settings["preferences"] = Object.assign(this._settings["preferences"], preferences[i]);
			}
		});

		/*
		Object.keys(this.watchers["preference"]).forEach((key) => {
			this.watchers["preference"][key].load().then((preferences) => {
				for (let i = 0; i < preferences.length; i++)
				{
					this._settings["preferences"] = Object.assign(this._settings["preferences"], preferences[i]);
				}
			});
		});
		*/

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
	//  Methods
	// -------------------------------------------------------------------------

	/**
	 * Check if the class exists.
	 *
	 * @param	{Array}			eventNames			Array of event names.
	 * @param	{String}		title				Servce name.
	 * @param	{Object}		manager				Servce manager.
	 */
	/*
	registerService(eventNames, title, manager)
	{

		for (let i = 0; i < eventNames.length; i++)
		{
			this._serviceManagers[eventNames[i]][title] = manager;
		}

	}
	*/

	/*
	registerService(serviceName, component, options)
	//registerServiceClient(serviceName, component, options)
	{

		console.log("@@@registerService:", serviceName, component.name, options);
	//	this._serviceManagers[""][serviceName].
		let service = this._serviceManager.get(serviceName);
		console.log("@@@registerService:", service);

		if (service && service.register)
		{
			service.register(component, options);
		}

	}
	*/

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
	//  Privates
	// -------------------------------------------------------------------------

	/**
	 * Init error handling.
	 */
	__initGlobalEventListener()
	{

		window.addEventListener("_bm_component_init", (e) => {
			e.detail.sender._app = this;
			e.detail.sender._router = this._router;
			e.detail.sender._settings = this._settings;
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

		/*
		//Object.keys(this.watchers["error"]).forEach((key) => {
		Object.keys(this._serviceManagers["error"]).forEach((key) => {
			//this.watchers["error"][key].triggerEvent("error", e);
			//this.watchers["error"][key].handle(e);
			this._serviceManagers["error"][key].handle(e);
		});
		*/

	//	this._serviceManagers["error"].handle(e);
		this._serviceManager.handle(e, (service) => {
			return service.options["type"] == "error";
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

	// -------------------------------------------------------------------------

	/**
	 * Load services.
	 */
	/*
	loadServices()
	{

		Object.keys(this._settings["services"]).forEach((key) => {
			// Create manager
			let className = ( this._settings["services"][key]["className"] ? this._settings["services"][key]["className"] : "BITSMIST.v1.ServiceManager" );
			this._serviceManagers[key] = this._createObject(className, {"app":this});

			// Watch
			if (this._settings["services"][key]["options"]["watch"])
			{
				this.registerService(this._settings["services"][key]["options"]["watch"], key, this._serviceManagers[key]);
			}

			// Add handlers
			Object.keys(this._settings["services"][key]["handlers"]).forEach((handlerName) => {
				let options = this._settings["services"][key]["handlers"][handlerName];
				this._serviceManagers[key].add(handlerName, options);
			});
		});

	}
	*/

	/*
	loadServices()
	{

		Object.keys(this._settings["services"]).forEach((key) => {
			let type = this._settings["services"][key]["type"];

			// Add handler
			let options = this._settings["services"][key];
			this._serviceManagers[type].add(key, options);
		});

	}
	*/

	/*
	loadServices()
	{

		Object.keys(this._settings["services"]).forEach((key) => {
			let options = this._settings["services"][key];
			this._serviceManager.add(key, options);
		});

	}
	*/

	// registerService(eventNames, title, manager)
	// {

	// 	for (let i = 0; i < eventNames.length; i++)
	// 	{
	// 		this._serviceManagers[eventNames[i]][title] = manager;
	// 	}

	// }


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
