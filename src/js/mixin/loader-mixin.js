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
import ClassUtil from '../util/class-util';

// =============================================================================
//	Loader mixin class
// =============================================================================

export default class LoadeMixin
{

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
	 * Create component.
	 *
	 * @param	{String}		componentName		Component name.
	 * @param	{Object}		options				Component options.
	 * @param	{String}		path				Path to component.
	 * @param	{Object}		settings			System settings.
	 *
	 * @return  {Promise}		Promise.
	 */
	static createComponent(componentName, options, path, settings)
	{

		return new Promise((resolve, reject) => {
			options = Object.assign({}, options);
			let className = ( "className" in options ? options["className"] : componentName );
			let component = null;

			this.__autoloadComponent(className, options, path, settings).then(() => {
				let promise;

				component = ClassUtil.createObject(className, options);

				Promise.all([promise]).then(() => {
					resolve(component);
				});
			});
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Load the spec file for this page.
	 *
	 * @param	{String}		specName			Spec name.
	 * @param	{String}		path				Path to spec.
	 *
	 * @return  {Promise}		Promise.
	 */
	static loadSpec(specName, path)
	{

		let urlCommon = path + "common.js";
		let url = path + specName + ".js";
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
					throw new SyntaxError(`Illegal json string. url=${(specCommon ? url : urlCommon)}`);
				}
				specMerged = this.__deepMerge(specCommon, spec);

				resolve(specMerged);
			});
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Load the template html.
	 *
	 * @param	{String}		templateName		Template name.
	 * @param	{String}		path				Path to template.
	 *
	 * @return  {Promise}		Promise.
	 */
	static loadTemplate(templateName, path)
	{

		let basePath = (path ? path + "/" : "");
		let url = basePath + templateName + ".html";

		console.debug(`LoaderMixin.loadTemplate(): Loading template. templateName=${templateName}, path=${path}`);

		return new Promise((resolve, reject) => {
			AjaxUtil.ajaxRequest({url:url, method:"GET"}).then((xhr) => {
				console.debug(`LoaderMixin.loadTemplate(): Loaded template. templateName=${templateName}`);
				resolve(xhr.responseText);
			});
		});

	}

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
	 * Check if the class exists.
	 *
	 * @param	{String}		className			Class name.
	 *
	 * @return  {Bool}			True if exists.
	 */
	static __isLoadedClass(className)
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
	 * Load the component if not loaded yet.
	 *
	 * @param	{String}		className			Component class name.
	 * @param	{Object}		options				Options.
	 * @param	{String}		path				Path to component.
	 * @param	{Object}		settings			System settings.
	 *
	 * @return  {Promise}		Promise.
	 */
	static __autoloadComponent(className, options, path, settings)
	{

		console.debug(`LoaderMixin.__autoLoadComponent(): Auto loading component. className=${className}`);

		return new Promise((resolve, reject) => {
			if (this.__isLoadedClass(className))
			{
				console.debug(`LoaderMixin.__autoLoadComponent(): Component Already exists. className=${className}`, );
				resolve();
			}
			else
			{
				if (options && "path" in options)
				{
					path = path + options["path"];
				}

				this.__loadComponentScript(className, path, settings).then(() => {
					resolve();
				});
			}
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Load the component js files.
	 *
	 * @param	{String}		componentName		Component name.
	 * @param	{String}		path				Path to component.
	 * @param	{Object}		settings			System settings.
	 *
	 * @return  {Promise}		Promise.
	 */
	static __loadComponentScript(componentName, path, settings) {

		console.debug(`LoaderMixin.__loadComponentScript(): Loading script. componentName=${componentName}, path=${path}`);

		settings = ( settings ? settings : {} );

		return new Promise((resolve, reject) => {
			let url1 = path + "/" + componentName + ".auto.js";
			let url2 = path + "/" + componentName + ".js";

			Promise.resolve().then(() => {
				if (settings["splitComponent"])
				{
					return AjaxUtil.loadScript(url1);
				}
			}).then(() => {
				return AjaxUtil.loadScript(url2);
			}).then(() => {
				console.debug(`LoaderMixin.__loadComponentScript(): Loaded script. componentName=${componentName}`);
				resolve();
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
	static __loadSpecFile(url, defaultResponse)
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
	 * Load the template html if not loaded yet.
	 *
	 * @param	{Object}		templateInfo		Template info.
	 *
	 * @return  {Promise}		Promise.
	 */
	static __autoLoadTemplate(templateInfo, path)
	{

		console.debug(`Mixin.autoLoadTemplate(): Auto loading template. name=${this.name}, templateName=${templateInfo["name"]}`);

		return new Promise((resolve, reject) => {
			let promise;

			if (!templateInfo["name"] || templateInfo["html"])
			{
				console.debug(`Mixin.autoLoadTemplate(): Template Already exists. name=${this.name}, templateName=${templateInfo["name"]}`, );
			}
			else
			{
				let base = this.getSetting("system.appBaseUrl", "") + this.getSetting("system.templatePath", "/components/");
				let path = this.settings.get("path", "");

				promise = new Promise((resolve, reject) => {
					this.loadTemplate(templateInfo["name"], base + path).then((template) => {
						templateInfo["html"] = template;
						resolve();
					});
				});
			}

			Promise.all([promise]).then(() => {
				if (!templateInfo["isLoaded"])
				{
					return this.trigger("load", this);
				}
			}).then(() => {
				templateInfo["isLoaded"] = true;
				resolve();
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
	/*
	static __mergeSettings(spec, settings)
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
	*/

	// -------------------------------------------------------------------------

	/**
	 * Deep merge.
	 *
	 * @param	{Object}		arr1					Array1.
	 * @param	{Object}		arr2					Array2.
	 *
	 * @return  {Object}		Merged array.
	 */
	static __deepMerge(arr1, arr2)
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
