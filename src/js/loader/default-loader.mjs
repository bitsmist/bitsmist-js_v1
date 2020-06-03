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
import { NoClassError } from '../error/errors';
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
	 * @param	{Object}		options				Options for the loader.
     */
	constructor(options)
	{

		this.options = options;
		this.container = options["container"];

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
	 * Load services.
	 */
	loadServices()
	{

		Object.keys(this.container["settings"]["services"]).forEach((key) => {
			let className = this.container["settings"]["services"][key]["className"];
			this.container[key] = this.container["app"].createObject(className, {"container":this.container});
			Object.keys(this.container["settings"]["services"][key]["handlers"]).forEach((pluginName) => {
				let options = this.container["settings"]["services"][key]["handlers"][pluginName];
				this.container[key].add(pluginName, options);
			});
		});

	}

   	// -------------------------------------------------------------------------

	/**
	 * Load App.
	 *
	 * @param	{String}		specName			Spec name.
	 *
	 * @return  {Promise}		Promise.
	 */
	loadApp(specName)
	{

		return new Promise((resolve, reject) => {
			this.loadSpec(specName).then((spec) => {
				this.container["appInfo"]["spec"] = spec;

				let promises = [];

				/*
				// load preferences
				promises.push(this.loadPreferences());
				*/

				// load resources
				promises.push(this.loadResources(this.container["appInfo"]["spec"]["resources"]));

				// load masters
				promises.push(this.loadMasters(this.container["appInfo"]["spec"]["masters"]));

				// load components
				promises.push(this.loadComponents(this.container["appInfo"]["spec"]["components"]));

				// load routes
				this.container["router"].__initRoutes(spec["routes"].concat(this.container["settings"]["router"]["routes"]));

				Promise.all(promises).then(() => {
					// Open startup page
					this.container["router"].refreshRoute(this.container["router"]._routeInfo);
					resolve();
				});
			});
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

		let basePath = this.container["router"]["options"]["options"]["specs"];
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
			let basePath = this.container["router"]["options"]["options"]["components"] + (path ? path + "/" : "");
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

}
