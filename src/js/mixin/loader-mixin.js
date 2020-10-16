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
import Globals from '../globals';
import Util from '../util/util';

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
				component = ClassUtil.createObject(className, options);
				resolve(component);
			});
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Load the template html.
	 *
	 * @param	{String}		componentName		Component name.
	 * @param	{Object}		options				Component options.
	 * @param	{String}		path				Path to component.
	 * @param	{Object}		settings			System settings.
	 *
	 * @return  {Promise}		Promise.
	 */
	static loadComponent(componentName, options, path, settings)
	{

		return this.__autoloadComponent(componentName, options, path, settings);

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

		let urlCommon = Util.concatPath([path, "common.js"]);
		let url = Util.concatPath([path, specName + ".js"]);
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
				specMerged = Util.deepMerge(specCommon, spec);

				resolve(specMerged);
			});
		});

	}

	// -----------------------------------------------------------------------------

	/**
	 * Load scripts for tags which has data-autoload attribute.
	 *
	 * @param	{HTMLElement}	rootNode			Target node.
	 */
	static loadTags(rootNode)
	{

		rootNode.querySelectorAll("[data-autoload]").forEach((element) => {
			if (element.getAttribute("href"))
			{
				let url = element.getAttribute("href");
				return AjaxUtil.loadScript(url);
			}
			else
			{
				let className = ( element.getAttribute("data-classname") ? element.getAttribute("data-classname") : this.__getDefaultClassName(element.tagName) );
				let path = element.getAttribute("data-path");
				path = Util.concatPath([this.getSetting("system.appBaseUrl", ""), this.getSetting("system.componentPath", ""), path]);
				let options;
				let splitComponent = this.getSetting("system.splitComponent", false);
				this.loadComponent(className, options, path, {"splitComponent":splitComponent});
			}
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

		return this.__autoLoadTemplate(templateName, path);

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

		/*
		// Check existence from cache
		if (Globals["classes"][className] && Globals["classes"][className]["status"] == "loaded")
		{
			return ret;
		}
		*/

		if (Globals["classes"][className]["status"] == "loaded")
		{
			return ret;
		}

		try
		{
			let c = window;

			className.split(".").forEach((value) => {
				c = c[value];
				if (!c)
				{
					ret = false;
				}
			});
		}
		catch(e)
		{
			ret = false;
		}

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

		console.debug(`LoaderMixin.__autoLoadComponent(): Auto loading component. className=${className}, path=${path}`);

		let promise;

		if (!Globals["classes"][className])
		{
			Globals["classes"][className] = {};
		}

		if (this.__isLoadedClass(className))
		{
			console.debug(`LoaderMixin.__autoLoadComponent(): Component Already exists. className=${className}`, );
			promise = Promise.resolve();
		}
		else if (Globals["classes"][className]["status"] == "loading")
		{
			console.debug(`LoaderMixin.__autoLoadComponent(): Component Already loading. className=${className}`, );
			promise = Globals["classes"][className]["promise"];
		}
		else
		{
			Globals["classes"][className]["status"] = "loading";
			promise = new Promise ((resolve, reject) => {
				this.__loadComponentScript(className, path, settings).then(() => {
					Globals["classes"][className]["status"] = "loaded";
					resolve();
				});
			});
		}

		Globals["classes"][className]["promise"] = promise;

		return promise;

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
	static __loadComponentScript(componentName, path, settings)
	{

		console.debug(`LoaderMixin.__loadComponentScript(): Loading script. componentName=${componentName}, path=${path}`);

		settings = ( settings ? settings : {} );

		return new Promise((resolve, reject) => {
			let url1 = Util.concatPath([path, componentName + ".js"]);
			let url2 = Util.concatPath([path, componentName + ".settings.js"]);

			Promise.resolve().then(() => {
				return AjaxUtil.loadScript(url1);
			}).then(() => {
				if (settings["splitComponent"])
				{
					return AjaxUtil.loadScript(url2);
				}
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
				promise = new Promise((resolve, reject) => {
					let url = Util.concatPath([path, templateInfo["name"] + ".html"]);

					this.__loadTemplateFile(url).then((template) => {
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
	 * Load the template html.
	 *
	 * @param	{String}		url					Template url.
	 *
	 * @return  {Promise}		Promise.
	 */
	static __loadTemplateFile(url)
	{

		console.debug(`LoaderMixin.loadTemplate(): Loading template. url=${url}`);

		return new Promise((resolve, reject) => {
			AjaxUtil.ajaxRequest({url:url, method:"GET"}).then((xhr) => {
				console.debug(`LoaderMixin.loadTemplate(): Loaded template. url=${url}`);
				resolve(xhr.responseText);
			});
		});

	}

	// -----------------------------------------------------------------------------

	/**
	 * Get a class name from tag name.
	 *
	 * @param	{String}		tagName				Tag name.
	 *
	 * @return  {String}		Class name.
	 */
	static __getDefaultClassName(tagName)
	{

		let tag = tagName.split("-");
		let className = tag[0].charAt(0).toUpperCase() + tag[0].slice(1).toLowerCase() + tag[1].charAt(0).toUpperCase() + tag[1].slice(1).toLowerCase();

		return className;

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

}
