// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import AjaxUtil from "../util/ajax-util.js";
import LoaderOrganizer from "../organizer/loader-organizer.js";
import ClassUtil from "../util/class-util.js";
import Store from "../store/store.js";
import Util from "../util/util.js";

// =============================================================================
//	Default loader class
// =============================================================================

export default class DefaultLoader
{

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
	 * Init.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object}		options				Options.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static init(component, options)
	{

		this._loadAttrSettings(component);

	}

	// -------------------------------------------------------------------------

	/**
	 * Load scripts for tags which has bm-autoload attribute.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{HTMLElement}	rootNode			Target node.
	 * @param	{Object}		options				Load Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static loadTags(component, rootNode, options)
	{

		console.debug(`Loading tags. name=${component.name}, rootNode=${rootNode.tagName}`);

		let promises = [];
		let waitList = [];

		// Load tags that has bm-autoload/bm-automorph attribute
		let targets = Util.scopedSelectorAll(rootNode, "[bm-autoload]:not([bm-autoloading]):not([bm-powered]),[bm-automorph]:not([bm-autoloading]):not([bm-powered])");
		targets.forEach((element) => {
			element.setAttribute("bm-autoloading", "");

			let loader = ( element.hasAttribute("bm-loader") ? LoaderOrganizer.getLoader(element.getAttribute("bm-loader")).object : this);
			promises.push(loader.loadTag(component, element, options).then(() => {
				element.removeAttribute("bm-autoloading");
			}));
		});

		// Create waiting list to wait Bitsmist components
		targets = Util.scopedSelectorAll(rootNode, "[bm-powered],[bm-autoloading]");
		targets.forEach((element) => {
			if (rootNode != element.rootElement && !element.hasAttribute("bm-nowait"))
			{
				let waitItem = {"object":element, "state":"started"};
				waitList.push(waitItem);
			}
		});

		// Wait for the elements to be loaded
		return Promise.all(promises).then(() => {
			let waitFor = Util.safeGet(options, "waitForTags") && waitList.length > 0;
			if (waitFor)
			{
				// Wait for the elements to become "started"
				return BITSMIST.v1.StateOrganizer.waitFor(waitList, {"waiter":rootNode});
			}
		});

	}

	// -----------------------------------------------------------------------------

	/**
	 * Load a tag.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{HTMLElement}	element				Target element.
	 * @param	{Object}		options				Load Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static loadTag(component, element, options)
	{

		console.debug(`Loading a tag. name=${component.name}, element=${element.tagName}`);

		// Get settings from attributes
		let href = element.getAttribute("bm-autoload");
		let className = element.getAttribute("bm-classname") || Util.getClassNameFromTagName(element.tagName);
		let path = element.getAttribute("bm-path") || "";
		let split = Util.safeGet(options, "splitComponent", component.settings.get("system.splitComponent", false));
		let morph = ( element.hasAttribute("bm-automorph") ?
			( element.getAttribute("bm-automorph") ? element.getAttribute("bm-automorph") : true ) :
			false
		);
		let settings = {"settings":{"autoMorph":morph, "path":path}};
		let loadOptions = {"splitComponent":split};

		// Override path,fileName,autoMorph when bm-autoload is set
		if (href)
		{
			let arr = Util.getFilenameAndPathFromUrl(href);
			loadOptions["path"] = arr[0];
			if (href.slice(-3).toLowerCase() === ".js")
			{
				settings["settings"]["fileName"] = arr[1].substring(0, arr[1].length - 3);
			}
			else if (href.slice(-5).toLowerCase() === ".html")
			{
				settings["settings"]["autoMorph"] = true;
				settings["settings"]["fileName"] = arr[1].substring(0, arr[1].length - 5);
			}
		}

		return this.loadComponent(component, className, settings, loadOptions, element.tagName);

	}

	// -------------------------------------------------------------------------

	/**
	 * Load a component.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{String}		className			Class name.
	 * @param	{Object}		settings			Component settings.
	 * @param	{Object}		options				Load options.
	 * @param	{String}		tagName				Component's tag name
	 *
	 * @return  {Promise}		Promise.
	 */
	static loadComponent(component, className, settings, options, tagName)
	{

		console.debug(`Loading a component. name=${component.name}, className=${className}, tagName=${tagName}`);

		tagName = tagName.toLowerCase();
		let promise;
		let path = Util.safeGet(options, "path",
			Util.concatPath([
				component.settings.get("system.appBaseUrl", ""),
				component.settings.get("system.componentPath", ""),
				Util.safeGet(settings, "settings.path"),
			])
		);

		// Check if the tag is already defined
		if (customElements.get(tagName))
		{
			console.debug(`Tag already defined. className=${className}, tagName=${tagName}`);
			return Promise.resolve();
		}

		let morph = Util.safeGet(settings, "settings.autoMorph");
		if (morph)
		{
			// Morphing
			let superClass = ( morph === true ?  BITSMIST.v1.Component : ClassUtil.getClass(morph) );
			console.debug(`Morphing component. className=${className}, superClassName=${superClass.name}, tagName=${tagName}`);

			ClassUtil.newComponent(superClass, settings, tagName, className);
		}
		else
		{
			// Loading
			let fileName = Util.safeGet(settings, "settings.fileName", tagName);
			promise = this._autoloadComponent(className, fileName, path, options);
		}

		return Promise.all([promise]).then(() => {
			// Define tag if not defined yet
			if (!customElements.get(tagName))
			{
				let newClass = ClassUtil.getClass(className);
				customElements.define(tagName, newClass);
			}
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Get a template html according to settings.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{String}		templateName		Template name.
	 * @param	{Object}		options				Load options.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static loadTemplate(component, templateName, options)
	{

		let promise;
		let templateInfo = component._templates[templateName];
		let settings = component.settings.get("templates." + templateName, {});

		switch (settings["type"]) {
		case "html":
			templateInfo["html"] = settings["html"];
			promise = Promise.resolve();
			break;
		case "node":
			templateInfo["html"] = component.querySelector(settings["rootNode"]).innerHTML;
			promise = Promise.resolve();
			break;
		case "url":
		default:
			promise = this._loadTemplateFile(component, templateInfo["name"], options).then((template) => {
				templateInfo["html"] = template;
			});
			break;
		}

		return promise.then(() => {
			templateInfo["isLoaded"] = true;
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Get a template html according to settings.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{String}		settingName			Setting name.
	 * @param	{Object}		options				Load options.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static loadSetting(component, settingName, options)
	{

		let path;
		return Promise.resolve().then(() => {
			path = Util.safeGet(options, "path",
				Util.concatPath([
					component.settings.get("system.appBaseUrl", ""),
					component.settings.get("system.componentPath", ""),
					component.settings.get("settings.componentPath", ""),
				])
			);

			return this.loadSettingFile(component, settingName, path, "js");
		}).then((extraSettings) => {
			if (extraSettings)
			{
				component.settings.merge(extraSettings);
			}
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Load setting file.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{String}		settingName			Setting name.
	 * @param	{String}		path				Path to setting file.
	 * @param	{String}		type				Type of setting file.
	 *
	 * @return  {Promise}		Promise.
	 */
	static loadSettingFile(component, settingName, path, type)
	{

		type = type || "js";
		let url = Util.concatPath([path, settingName + "." + type]);
		let settings;

		console.debug(`Loading settings. name=${component.name}, url=${url}`);

		return AjaxUtil.ajaxRequest({url:url, method:"GET"}).then((xhr) => {
			console.debug(`Loaded settings. name=${component.name}, url=${url}`);

			switch (type)
			{
			case "json":
				try
				{
					settings = JSON.parse(xhr.responseText);
				}
				catch(e)
				{
					if (e instanceof SyntaxError)
					{
						throw new SyntaxError(`Illegal json string. url=${url}, message=${e.message}`);
					}
					else
					{
						throw e;
					}
				}
				break;
			case "js":
			default:
				settings = Function('"use strict";return (' + xhr.responseText + ')').call(component);
				break;
			}

			return settings;
		});

	}

	// -------------------------------------------------------------------------
	//  Protected
	// -------------------------------------------------------------------------

	/**
	 * Check if the class exists.
	 *
	 * @param	{String}		className			Class name.
	 *
	 * @return  {Bool}			True if exists.
	 */
	static _isLoadedClass(className)
	{

		let ret = false;

		if (DefaultLoader._classes.get(className, {})["state"] === "loaded")
		{
			ret = true;
		}
		else if (ClassUtil.getClass(className))
		{
			ret = true;
		}

		return ret;

	}

	// -------------------------------------------------------------------------

	/**
	 * Load the component if not loaded yet.
	 *
	 * @param	{String}		className			Component class name.
	 * @param	{String}		fileName			Component file name.
	 * @param	{String}		path				Path to component.
	 * @param	{Object}		options				Load Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _autoloadComponent(className, fileName, path, options)
	{

		console.debug(`Auto loading component. className=${className}, fileName=${fileName}, path=${path}`);

		let promise;

		if (this._isLoadedClass(className))
		{
			// Already loaded
			console.debug(`Component Already exists. className=${className}`);
			DefaultLoader._classes.set(className, {"state":"loaded"});
			promise = Promise.resolve();
		}
		else if (DefaultLoader._classes.get(className, {})["state"] === "loading")
		{
			// Already loading
			console.debug(`Component Already loading. className=${className}`);
			promise = DefaultLoader._classes.get(className)["promise"];
		}
		else
		{
			// Not loaded
			DefaultLoader._classes.set(className, {"state":"loading"});
			promise = this._loadComponentScript(fileName, path, options).then(() => {
				DefaultLoader._classes.set(className, {"state":"loaded", "promise":null});
			});
			DefaultLoader._classes.set(className, {"promise":promise});
		}

		return promise;

	}

	// -------------------------------------------------------------------------

	/**
	 * Load the component js files.
	 *
	 * @param	{String}		className			Class name.
	 * @param	{String}		path				Path to component.
	 * @param	{Object}		options				Load Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _loadComponentScript(fileName, path, options)
	{

		console.debug(`Loading script. fileName=${fileName}, path=${path}`);

		let url1 = Util.concatPath([path, fileName + ".js"]);
		let url2 = Util.concatPath([path, fileName + ".settings.js"]);

		return Promise.resolve().then(() => {
			return AjaxUtil.loadScript(url1);
		}).then(() => {
			if (options["splitComponent"])
			{
				return AjaxUtil.loadScript(url2);
			}
		}).then(() => {
			console.debug(`Loaded script. fileName=${fileName}`);
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Load the template html.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{String}		templateName		Template name.
	 * @param	{Object}		options				Load options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _loadTemplateFile(component, templateName, options)
	{

		console.debug(`Loading template. name=${component.name}, templateName=${templateName}`);

		let path = Util.concatPath([
			component.settings.get("system.appBaseUrl", ""),
			component.settings.get("system.templatePath", ""),
			component.settings.get("settings.path", ""),
		]);

		let url = Util.concatPath([path, templateName]) + ".html";
		return AjaxUtil.ajaxRequest({url:url, method:"GET"}).then((xhr) => {
			console.debug(`Loaded template. templateName=${templateName}, path=${path}`);

			return xhr.responseText;
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Get settings from element's attribute.
	 *
	 * @param	{Component}		component			Component.
	 */
	static _loadAttrSettings(component)
	{

		// Get path from  bm-autoload
		if (component.getAttribute("bm-autoload"))
		{
			let arr = Util.getFilenameAndPathFromUrl(component.getAttribute("bm-autoload"));
			component._settings.set("system.appBaseUrl", "");
			component._settings.set("system.templatePath", arr[0]);
			component._settings.set("system.componentPath", arr[0]);
			component._settings.set("settings.path", "");
			if (arr[1].slice(-3).toLowerCase() === ".js")
			{
				component._settings.set("settings.fileName", arr[1].substring(0, arr[1].length - 3));
			}
			else if (arr[1].slice(-5).toLowerCase() === ".html")
			{
				component._settings.set("settings.fileName", arr[1].substring(0, arr[1].length - 5));
			}
		}

		// Get path from attribute
		if (component.hasAttribute("bm-path"))
		{
			component._settings.set("settings.path", component.getAttribute("bm-path"));
		}

	}

}

// Init
DefaultLoader._classes = new Store();
