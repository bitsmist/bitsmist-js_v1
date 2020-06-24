// =============================================================================
/**
 * Bitsmist WebView - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import AjaxUtil from './ajax-util';

// =============================================================================
//	Loader util class
// =============================================================================

export default function LoaderUtil() {}

// -----------------------------------------------------------------------------
//  Methods
// -----------------------------------------------------------------------------

/**
 * Instantiate the component.
 *
 * @param	{String}		className			Class name.
 * @param	{Object}		options				Options for the component.
 *
 * @return  {Object}		Initaiated object.
 */
LoaderUtil.createObject = function(className, ...args)
{

	let ret;

	try
	{
		let c = Function("return (" + className + ")")();
		ret = new c(...args);
	}
	catch
	{
		let c = window;
		className.split(".").forEach((value) => {
			c = c[value];
			if (!c)
			{
				//throw new NoClassError(`Class not found. className=${className}`);
				throw new Error(`Class not found. className=${className}`);
			}
		});
		ret = new c(...args);
	}

	return ret;

}

// -----------------------------------------------------------------------------

/**
 * Create component.
 *
 * @param	{String}		componentName		Component name.
 * @param	{Object}		options				Options for the component.
 *
 * @return  {Promise}		Promise.
 */
LoaderUtil.createComponent = function(componentName, options)
{

	return new Promise((resolve, reject) => {
		options = Object.assign({}, options);
		let className = ( "className" in options ? options["className"] : componentName );
		let component = null;

		LoaderUtil.__autoloadComponent(className, options).then(() => {
			let promise;

			component = LoaderUtil.createObject(className, options);

			Promise.all([promise]).then(() => {
				resolve(component);
			});
		});
	});

}

// -----------------------------------------------------------------------------

/**
 * Load the spec file for this page.
 *
 * @param	{String}		specName			Spec name.
 * @param	{Object}		settings			Application settings.
 *
 * @return  {Promise}		Promise.
 */
LoaderUtil.loadSpec = function(specName, settings)
{

	let basePath = ( settings["system"]["specPath"] ? settings["system"]["specPath"] : "/specs/");
	let urlCommon = basePath + "/" + "common.js";
	let url = basePath + "/" + specName + ".js";
	let spec;
	let specCommon;
	let specMerged;

	return new Promise((resolve, reject) => {
		let promises = [];

		// Load specs
		promises.push(LoaderUtil.__loadSpecFile(urlCommon, "{}"));
		promises.push(LoaderUtil.__loadSpecFile(url));

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
			specMerged = LoaderUtil.__deepMerge(specCommon, spec);
			specMerged = LoaderUtil.__mergeSettings(specMerged, settings);

			resolve(specMerged);
		});
	});

}

// -----------------------------------------------------------------------------

/**
 * Load the template html.
 *
 * @param	{String}		templateName		Template name.
 *
 * @return  {Promise}		Promise.
 */
LoaderUtil.loadTemplate = function(templateName, path)
{

	let basePath = (path ? path + "/" : "");
	let url = basePath + templateName + ".html";

	console.debug(`Component.__loadTemplate(): Loading template. templateName=${templateName}, path=${path}`);

	return new Promise((resolve, reject) => {
		AjaxUtil.ajaxRequest({url:url, method:"GET"}).then((xhr) => {
			console.debug(`Component.__loadTemplate(): Loaded template. templateName=${templateName}`);
			resolve(xhr.responseText);
		});
	});

}


// -----------------------------------------------------------------------------
//  Privates
// -----------------------------------------------------------------------------

/**
 * Check if the class exists.
 *
 * @param	{String}		className			Class name.
 *
 * @return  {Bool}			True if exists.
 */
LoaderUtil.__isLoadedClass = function(className)
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

// -----------------------------------------------------------------------------

/**
 * Load the component if not loaded yet.
 *
 * @param	{String}		className			Component class name.
 * @param	{Object}		options				Options.
 *
 * @return  {Promise}		Promise.
 */
LoaderUtil.__autoloadComponent = function(className, options)
{

	console.debug(`Component.__autoLoadComponent(): Auto loading component. className=${className}`);

	return new Promise((resolve, reject) => {
		if (LoaderUtil.__isLoadedClass(className))
		{
			console.debug(`Component.__autoLoadComponent(): Component Already exists. className=${className}`, );
			resolve();
		}
		else
		{
			let path = "";
			let base = ( BITSMIST.v1.Settings["system"]["componentPath"] ? BITSMIST.v1.Settings["system"]["componentPath"] : "/components/" );
			if (options && "path" in options)
			{
				path = options["path"];
			}

			this.__loadComponentScript(className, base + path).then(() => {
				resolve();
			});
		}
	});

}

// -----------------------------------------------------------------------------

/**
* Load the component js files.
*
* @param	{String}		componentName		Component name.
* @param	{String}		path				Component path.
*
* @return  {Promise}		Promise.
*/
LoaderUtil.__loadComponentScript = function(componentName, path) {

	console.debug(`Component.__loadComponentScript(): Loading script. componentName=${componentName}, path=${path}`);

	return new Promise((resolve, reject) => {
		let url1 = path + "/" + componentName + ".auto.js";
		let url2 = path + "/" + componentName + ".js";

		Promise.resolve().then(() => {
			if (BITSMIST.v1.Settings["system"]["splitComponent"])
			{
				return AjaxUtil.loadScript(url1);
			}
		}).then(() => {
			return AjaxUtil.loadScript(url2);
		}).then(() => {
			console.debug(`Component.__loadComponentScript(): Loaded script. componentName=${componentName}`);
			resolve();
		});
	});

}

// -----------------------------------------------------------------------------

/**
 * Load spec file.
 *
 * @param	{String}		url					Spec file url.
 * @param	{String}		defaultResponse		Response when error.
 *
 * @return  {Promise}		Promise.
 */
LoaderUtil.__loadSpecFile = function(url, defaultResponse)
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

// -----------------------------------------------------------------------------

/**
 * Merge settings to spec.
 *
 * @param	{Object}		spec					Spec.
 * @param	{Object}		settings				Settings.
 *
 * @return  {Object}		Merged array.
 */
LoaderUtil.__mergeSettings = function(spec, settings)
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

// -----------------------------------------------------------------------------

/**
 * Deep merge.
 *
 * @param	{Object}		arr1					Array1.
 * @param	{Object}		arr2					Array2.
 *
 * @return  {Object}		Merged array.
 */
LoaderUtil.__deepMerge = function(arr1, arr2)
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