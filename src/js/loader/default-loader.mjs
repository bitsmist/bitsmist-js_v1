// =============================================================================
/**
 * Bitsmist WebView - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import AjaxUtil from '../util/ajax-util';
import {NoRouteError, NoClassError, NotValidFunctionError} from '../error/errors';
import ErrorManager from '../manager/error-manager';
import MasterUtil from '../util/master-util';
import PreferenceManager from '../manager/preference-manager';
import ResourceUtil from '../util/resource-util';

// =============================================================================
//	Default loader class
// =============================================================================

export default class DefaultLoader
{

	// -------------------------------------------------------------------------
	//  Constructor
	// -------------------------------------------------------------------------

	/**
     * Constructor.
     *
	 * @param	{Object}		options				Options for the loader.
     */
	constructor(options)
	{

		this.options = options;
		this.container = options["container"];

		this.container["errorManager"] = new ErrorManager({"container":this.container});
		this.container["preferenceManager"] = new PreferenceManager({"container":this.container});

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
	 * Load services.
	 */
	loadServices()
	{

		// Error handlers
		if (this.container["settings"]["errorManager"] && this.container["settings"]["errorManager"]["handlers"])
		{
			Object.keys(this.container["settings"]["errorManager"]["handlers"]).forEach((pluginName) => {
				let options = this.container["settings"]["errorManager"]["handlers"][pluginName];
				options["events"] = this.container["errorManager"].events;
				options["parent"] = this.container["errorManager"];
				this.container["errorManager"].add(pluginName, options);
			});
		}

		// Preference handlers
		if (this.container["settings"]["preferenceManager"] && this.container["settings"]["preferenceManager"]["handlers"])
		{
			Object.keys(this.container["settings"]["preferenceManager"]["handlers"]).forEach((pluginName) => {
				let options = this.container["settings"]["preferenceManager"]["handlers"][pluginName];
				this.container["preferenceManager"].add(pluginName, options);
			});
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Load the spec file for this page.
	 *
	 * @return  {Promise}		Promise.
	 */
	loadSpec(spec)
	{

		let basePath = this.container["router"]["options"]["options"]["specs"];
		let urlCommon = basePath + "common.js";
		let url = basePath + spec + ".js";
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
				specMerged = this.__mergeSettings(specMerged, this.container["settings"]);

				resolve(specMerged);
			});
		});

	}

    // -------------------------------------------------------------------------

	/**
	 * Load preferences.
	 */
	loadPreferences()
	{

		return new Promise((resolve, reject) => {
			this.container["preferenceManager"].load().then((results) => {
				if (results.length > 0)
				{
					Object.assign(this.container["preferences"], results[0]);
				}
				resolve();
			});
		})

	}

    // -------------------------------------------------------------------------

	/**
	 * Load resources.
	 *
	 * @param	{Object}		spec				Spec for resources.
	 */
	loadResources(spec)
	{

		Object.keys(spec).forEach((resourceName) => {
			let options = Object.assign({}, spec[resourceName]);
			options["container"] = this.container;
			if ("class" in options)
			{
				this.container["resources"][resourceName] = this.container["app"].createObject(options["class"], resourceName, options);
			}
			else
			{
				this.container["resources"][resourceName] = new ResourceUtil(resourceName, options);
			}
		});

	}

    // -------------------------------------------------------------------------

	/**
	 * Load masters.
	 *
	 * @param	{Object}		spec				Spec for masters.
	 */
	loadMasters(spec)
	{

		return new Promise((resolve, reject) => {
			let promises = [];

			Object.keys(spec).forEach((masterName) => {
				let options = Object.assign({}, spec[masterName]);
				options["container"] = this.container;
				this.container["masters"][masterName] = new MasterUtil(masterName, options);
				if ("autoLoad" in options && options["autoLoad"])
				{
					promises.push(this.container["masters"][masterName].load());
				}
			});

			Promise.all(promises).then(() => {
				resolve();
			});
		});

	}

    // -------------------------------------------------------------------------

	/**
	 * Load components.
	 *
	 * @param	{Object}		spec				Spec for components.
	 */
	loadComponents(spec)
	{

		return new Promise((resolve, reject) => {
			let promises = [];
			let chain = Promise.resolve();

			Object.keys(spec).forEach((componentName) => {
				let options = Object.assign({}, spec[componentName]);

				// Create component
				promises.push(this.createComponent(componentName, options).then((component) => {
					if (component.getOption("autoOpen"))
					{
						// Open component
						return component.open({"sender":this});
					}
				}));
			});

			Promise.all(promises).then(() => {
				resolve();
			});
		});

	}

    // -------------------------------------------------------------------------

	/**
	 * Create the component.
	 *
	 * @param	{String}		componentName		Component name.
	 * @param	{Object}		options				Options for the component.
	 *
	 * @return  {Promise}		Promise.
	 */
	createComponent(componentName, options)
	{

		return new Promise((resolve, reject) => {
			options = ( options ? options : {} );
			let className = ( "class" in options ? options["class"] : componentName );
			let component = null;

			this.__autoloadComponent(className, options).then(() => {
				let promise;

				options["container"] = this.container;
				component = this.container["app"].createObject(className, options);
				this.container["components"][componentName] = {};
				this.container["components"][componentName].object = component;

				promise = component.trigger("_initComponent", this).then(() => {
					return component.trigger("initComponent", this);
				});

				Promise.all([promise]).then(() => {
					resolve(component);
				});
			});
		});

	}

   	// -------------------------------------------------------------------------

	/**
	 * Build url for the spec file.
	 *
	 * @param	{String}		specName			Spec name.
	 *
	 * @return  {String}		Url.
	 */
	/*
	buildSpecUrl(specName)
	{

		return this.container["appInfo"]["baseUrl"] + "/specs/" + specName + ".js";

	}
	*/

    // -------------------------------------------------------------------------

	/**
	 * Build url for the component script.
	 *
	 * @param	{String}		componentName		Component name.
	 * @param	{String}		path				Path.
	 *
	 * @return  {String}		Url.
	 */
	/*
	buildComponentScriptUrl(componentName, path)
	{

		return this.container["appInfo"]["baseUrl"] + "/components/" + (path ? path + "/" : "") + componentName;

	}
	*/

    // -------------------------------------------------------------------------

	/**
	 * Build url for the template html.
	 *
	 * @param	{String}		componentName		Component name.
	 * @param	{String}		path				Path.
	 *
	 * @return  {String}		Url.
	 */
	/*
	buildTemplateUrl(componentName, path)
	{

		return this.container["appInfo"]["baseUrl"]+ "/components/" + (path ? path + "/" : "") + componentName + ".html";

	}
	*/

    // -------------------------------------------------------------------------

	/**
	 * Build url for the api.
	 *
	 * @param	{String}		resource			API resource.
	 * @param	{String}		id					Id for the resource.
	 * @param	{Object}		options				Query options.
	 *
	 * @return  {String}		Url.
	 */
	/*
	buildApiUrl(resource, id, options)
	{

		let url = this.container["sysInfo"]["baseUrl"] + "/v" + this.container["sysInfo"]["version"] + "-" + this.container["appInfo"]["version"] + "/" +  resource + "/" + id + ".json" + this.buildUrlOption(options);

		return url;

	}
	*/

    // -------------------------------------------------------------------------

	/**
	 * Build url for the app.
	 *
	 * @param	{Object}		routeInfo			Route information.
	 * @param	{Object}		options				Query options.
	 *
	 * @return  {string}		Url.
	 */
	/*
	buildUrl(routeInfo, options)
	{

		if (!routeInfo)
		{
			routeInfo = this.container["router"].loadRoute();
		}

		var url
		if (routeInfo["resourceName"] && routeInfo["commandName"])
		{
			url = this.container["appInfo"]["baseUrl"] + "/" + routeInfo["resourceName"] + "/" + routeInfo["commandName"] + "/" + this.buildUrlOption(options);
		}
		else
		{
			url = routeInfo["path"] + this.buildUrlOption(options);
		}

		return url;

	}
	*/

    // -------------------------------------------------------------------------

	/**
	 * Build query string from the options array.
	 *
	 * @param	{Object}		options				Query options.
	 *
	 * @return  {String}		Query string.
	 */
	/*
	buildUrlOption(options)
	{

		let query = "";

		if (options)
		{
			query = Object.keys(options).reduce((result, current) => {
				if (Array.isArray(options[current]))
				{
					result += encodeURIComponent(current) + "=" + encodeURIComponent(options[current].join()) + "&";
				}
				else if (options[current])
				{
					result += encodeURIComponent(current) + "=" + encodeURIComponent(options[current]) + "&";
				}

				return result;
			}, "");
		}

		return ( query ? "?" + query.slice(0, -1) : "");

	}
	*/

    // -------------------------------------------------------------------------

	/**
	 * Create options array from the current url.
	 *
	 */
	/*
	loadParameters()
	{

		let vars = {}, hash, value;

		if (window.location.href.indexOf("?") > -1)
		{
			let hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');

			for(var i = 0; i < hashes.length; i++) {
				hash = hashes[i].split('=');
				if (hash[1]){
					value = hash[1].split('#')[0];
				} else {
					value = hash[1];
				}
				vars[hash[0]] = decodeURIComponent(value);
			}
		}

		return vars;

	}
	*/

	// -------------------------------------------------------------------------
	//	Private
	// -------------------------------------------------------------------------

	/**
	 * Load the component if not loaded yet.
	 *
	 * @param	{String}		className			Component class name.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	__autoloadComponent(className, options)
	{

		console.debug(`Loader.__autoLoadComponent(): Auto loading component. className=${className}`);

		return new Promise((resolve, reject) => {
			if (!this.container["app"].isExistsClass(className))
			{
				let path = "";
				if (options && "path" in options)
				{
					path = options["path"];
				}

				let promise = this.__loadComponentScript(className, path).then(() => {
					console.debug(`Loader.__autoLoadComponent(): Auto loaded component. className=${className}, path=${path}`);
					resolve();
				});
			}
			else
			{
				console.debug(`Loader.__autoLoadComponent(): Component Already exists. className=${className}`, );
				resolve();
			}
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Load the component js files.
	 *
	 * @param	{String}		componentName		Component name.
	 *
	 * @return  {Promise}		Promise.
	 */
	__loadComponentScript(componentName, path) {

		return new Promise((resolve, reject) => {
			let basePath = this.container["router"]["options"]["options"]["specs"] + (path ? path + "/" : "");
			let url1 = basePath + componentName + ".auto.js";
			let url2 = basePath + componentName + ".js";

			AjaxUtil.loadScript(url1).then(() => {
				AjaxUtil.loadScript(url2).then(() => {
					resolve();
				});
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
	 * Load the template html.
	 *
	 * @param	{String}		templateName		Template name.
	 *
	 * @return  {Promise}		Promise.
	 */
	/*
	__loadTemplate(templateName, path)
	{

		let basePath = this.container["router"]["options"]["options"]["templates"] + (path ? path + "/" : "");
		let url = basePath + templateName + ".html";
		console.debug(`Loader.__loadTemplate(): Loading template. templateName=${templateName}, path=${path}`);

		return new Promise((resolve, reject) => {
			AjaxUtil.ajaxRequest({url:url, method:"GET"}).then((xhr) => {
				console.debug(`Loader.__loadTemplate(): Loaded template. templateName=${templateName}`);
				resolve(xhr.responseText);
			});
		});

	}
	*/

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
				//this.__mergeSettings(arr1[key], arr2[key]);
				this.__deepMerge(arr1[key], arr2[key]);
			}
			else
			{
				arr1[key] = arr2[key];
			}
		});

		return arr1;

	}

    // -------------------------------------------------------------------------

	/**
	 * Get target pad name.
	 *
	 * @param	{String}		commandName			Command name.
	 *
	 * @return  {String}		Pad name.
	 */
	/*
	__getTargetPadName(commandName)
	{

		let padName;

		if (this.container["appInfo"]["spec"]["commands"][commandName])
		{
			padName = this.container["appInfo"]["spec"]["commands"][commandName]["startup"];
		}
		else if (this.container["appInfo"]["spec"]["commands"]["*"])
		{
			padName = this.container["appInfo"]["spec"]["commands"]["*"]["startup"];
		}

		return padName;

	}
	*/

}
