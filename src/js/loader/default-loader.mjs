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
import MasterUtil from '../util/master-util';
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
	 * @param	{String}		componentName		Component name.
	 * @param	{Object}		options				Options for the loader.
     */
	constructor(componentName, options)
	{

		this.name = componentName;
		this.options = options;
		this.container = options["container"];

		this.container["errorManager"] = this.container["app"].createObject("BITSMIST.v1.ErrorManager", {"container":this.container});
		this.container["settingManager"] = this.container["app"].createObject("BITSMIST.v1.SettingManager", {"container":this.container});

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
		if (this.container["settings"]["errorHandlers"])
		{
			Object.keys(this.container["settings"]["errorHandlers"]).forEach((pluginName) => {
				let options = this.container["settings"]["errorHandlers"][pluginName];
				options["events"] = this.container["errorManager"].events;
				options["parent"] = this.container["errorManager"];
				this.container["errorManager"].add(pluginName, options);
			});
		}

		// Setting handlers
		if (this.container["settings"]["settingHandlers"])
		{
			Object.keys(this.container["settings"]["settingHandlers"]).forEach((pluginName) => {
				let options = this.container["settings"]["settingHandlers"][pluginName];
				this.container["settingManager"].add(pluginName, options);
			});
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Load the spec file for this page.
	 *
	 * @return  {Promise}		Promise.
	 */
	loadSpec()
	{

		let routeInfo = this.container["router"].loadRoute();
		let urlCommon = this.buildSpecUrl("common");
		let url = this.buildSpecUrl(routeInfo["resourceName"]);
		let specCommon;
		let spec;

		return new Promise((resolve, reject) => {
			let promises = [];
			let responseCommon;
			let response
			let promise;

			if (!routeInfo["resourceName"])
			{
				// No route
				throw new NoRouteError(`No route. url=${url}`);
			}

			// load common spec
			promise = new Promise((resolve, reject) => {
				AjaxUtil.ajaxRequest({url:urlCommon, method:"GET"}).then((xhr) => {
					responseCommon = xhr.responseText;
					resolve();
				}).catch((xhr) => {
					responseCommon = "{}";
					resolve();
				});
			});
			promises.push(promise);

			// load spec
			promise = new Promise((resolve, reject) => {
				AjaxUtil.ajaxRequest({url:url, method:"GET"}).then((xhr) => {
					response = xhr.responseText;
					resolve();
				}).catch((xhr) => {
					throw new NoRouteError(`No route. url=${url}`);
				});
			})
			promises.push(promise);

			Promise.all(promises).then(() => {
				// Convert to json
				try
				{
					specCommon = JSON.parse(responseCommon);
					spec = JSON.parse(response);
				}
				catch(e)
				{
					throw new Error(`Illegal json string. url=${(specCommon ? url : urlCommon)}`);
				}

				// Merge to common spec.
				let specMerged = this.__mergeSettings(specCommon, spec);

				// Merge settings to spec
				Object.keys(specMerged).forEach((key) => {
					Object.keys(specMerged[key]).forEach((componentName) => {
						if (key in this.container["settings"] && componentName in this.container["settings"][key])
						{
							specMerged[key][componentName] = this.__mergeSettings(this.container["settings"][key][componentName], specMerged[key][componentName]);
						}
					});
				});

				resolve(specMerged);
			});
		});

	}

    // -------------------------------------------------------------------------

	/**
	 * Load resources.
	 *
	 * @param	{array}			spec				Spec for resources.
	 */
	loadResources(spec)
	{

		Object.keys(spec).forEach((resourceName) => {
			let options = Object.assign({}, spec[resourceName]);
			options["container"] = this.container;
			if ("class" in options)
			{
				this.container["resources"][resourceName] = this.container["app"].createObject(options["class"], options);
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
	 * @param	{array}			spec				Spec for masters.
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
	 * @param	{array}			spec				Spec for components.
	 */
	loadComponents(spec)
	{

		return new Promise((resolve, reject) => {
			let promises = [];
			let chain = Promise.resolve();
			Object.keys(spec).forEach((componentName) => {
				let options = Object.assign({}, spec[componentName]);

				// create component
				/*
				chain = chain.then(() => {
					return new Promise((resolve, reject) => {
						let promise;
						this.createComponent(componentName, options).then((component) => {
							if (component.options["autoOpen"])
							{
								// Open component
								promise = component.open();
							}
						});

						Promise.all([promise]).then(() => {
							resolve();
						});
					});
				});
				*/

				promises.push(this.createComponent(componentName, options).then((component) => {
					if (component.options["autoOpen"])
					{
						// Open component
						return component.open();
					}
				}));
			});

			Promise.all(promises).then(() => {
			//chain.then(() => {
				resolve();
			});
		});

	}

    // -------------------------------------------------------------------------

	/**
	 * Create the component.
	 *
	 * @param	{string}		componentName		Component name.
	 * @param	{array}			options				Options for the component.
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

				promise = component.listener.trigger("_initComponent", this).then(() => {
					return component.listener.trigger("initComponent", this);
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
	 * @param	{string}		specName			Spec name.
	 *
	 * @return  {string}		Url.
	 */
	buildSpecUrl(specName)
	{

		return this.container["appInfo"]["baseUrl"] + "/specs/" + specName + ".js";

	}

    // -------------------------------------------------------------------------

	/**
	 * Build url for the component script.
	 *
	 * @param	{string}		componentName		Component name.
	 * @param	{string}		path				Path.
	 *
	 * @return  {string}		Url.
	 */
	buildComponentScriptUrl(componentName, path)
	{

		return this.container["appInfo"]["baseUrl"] + "/components/" + (path ? path + "/" : "") + componentName;

	}

    // -------------------------------------------------------------------------

	/**
	 * Build url for the template html.
	 *
	 * @param	{string}		componentName		Component name.
	 * @param	{string}		path				Path.
	 *
	 * @return  {string}		Url.
	 */
	buildTemplateUrl(componentName, path)
	{

		return this.container["appInfo"]["baseUrl"]+ "/components/" + (path ? path + "/" : "") + componentName + ".html";

	}

    // -------------------------------------------------------------------------

	/**
	 * Build url for the api.
	 *
	 * @param	{string}		resource			API resource.
	 * @param	{string}		id					Id for the resource.
	 * @param	{Object}		options				Query options.
	 *
	 * @return  {string}		Url.
	 */
	buildApiUrl(resource, id, options)
	{

		let url = this.container["sysInfo"]["baseUrl"] + "/v" + this.container["sysInfo"]["version"] + "-" + this.container["appInfo"]["version"] + "/" +  resource + "/" + id + ".json" + this.buildUrlOption(options);

		return url;

	}

    // -------------------------------------------------------------------------

	/**
	 * Build url for the app.
	 *
	 * @param	{Object}		routeInfo			Route information.
	 * @param	{Object}		options				Query options.
	 *
	 * @return  {string}		Url.
	 */
	buildUrl(routeInfo, options)
	{

		if (!routeInfo)
		{
			routeInfo = this.container["router"].loadRoute();
		}

		var url = this.container["appInfo"]["baseUrl"] + "/" + routeInfo["resourceName"] + "/" + routeInfo["commandName"] + "/" + this.buildUrlOption(options);

		return url;

	}

    // -------------------------------------------------------------------------

	/**
	 * Build query string from the options array.
	 *
	 * @param	{array}			options				Query options.
	 *
	 * @return  {string}		Query string.
	 */
	buildUrlOption(options)
	{

		let search = "";
		if (options)
		{
			for (let key in options)
			{
				if (options[key])
				{
					if (Array.isArray(options[key]))
					{
						search += encodeURIComponent(key) + "=" + encodeURIComponent(options[key].join()) + "&";
					}
					else
					{
						search += encodeURIComponent(key) + "=" + encodeURIComponent(options[key]) + "&";
					}
				}
			}
			if (search)
			{
				search = "?" + search.substr(0, search.length - 1);
			}
		}

		return search;

	}

    // -------------------------------------------------------------------------

	/**
	 * Create options array from the current url.
	 *
	 * @return  {Array}			Options.
	 */
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

	// -------------------------------------------------------------------------
	//	Private
	// -------------------------------------------------------------------------

	/**
	 * Load the component if not loaded yet.
	 *
	 * @param	{string}		componentName		Component name.
	 * @param	{Object}		options				Query options.
	 *
	 * @return  {Promise}		Promise.
	 */
	__autoloadComponent(componentName, options)
	{

		return new Promise((resolve, reject) => {
			if (!this.__isExistsComponent(componentName))
			{
				let path = "";
				if (options && "path" in options)
				{
					path = options["path"];
				}
				console.debug(`Loader.__autoLoadComponent(): Auto loading component. component=${componentName}, path=${path}`);
				let promise = this.__loadComponentScript(componentName, path).then(() => {
					console.debug(`Loader.__autoLoadComponent(): Auto loaded component. component=${componentName}, path=${path}`);
					resolve();
				});
			}
			else
			{
				console.debug("component Already exists.", componentName);
				resolve();
			}
		});

	}

    // -------------------------------------------------------------------------

	/**
	 * Load the component js files.
	 *
	 * @param	{string}		componentName		Component name.
	 *
	 * @return  {Promise}		Promise.
	 */
	__loadComponentScript(componentName, path) {

		return new Promise((resolve, reject) => {
			let url1 = this.buildComponentScriptUrl(componentName, path) + ".auto.js";
			let url2 = this.buildComponentScriptUrl(componentName, path) + ".js";

			AjaxUtil.loadScript(url1).then(() => {
				AjaxUtil.loadScript(url2).then(() => {
					resolve();
				});
			});
		});

	}

    // -------------------------------------------------------------------------

	/**
	 * Check if the component exists.
	 *
	 * @param	{string}		componentName		Component name.
	 *
	 * @return  {bool}			True if exists.
	 */
	__isExistsComponent(componentName)
	{

		let ret = false;
		let isExists = Function('"use strict";return (typeof ' + componentName+ ' === "function")')();

	    if(isExists) {
	        ret = true;
	    }

		return ret;

	}

    // -------------------------------------------------------------------------

	/**
	 * Merge settings.
	 *
	 * @param	{array}			arr1					Array1.
	 * @param	{array}			arr2					Array2.
	 *
	 * @return  {array}			Merged array.
	 */
	__mergeSettings(arr1, arr2)
	{

		Object.keys(arr2).forEach((key) => {
			if (arr1.hasOwnProperty(key) && typeof arr1[key] === 'object' && !(arr1[key] instanceof Array))
			{
				this.__mergeSettings(arr1[key], arr2[key]);
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

}
