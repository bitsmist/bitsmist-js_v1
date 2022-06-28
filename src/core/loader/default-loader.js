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

		component.settings.set("loadings", this._loadAttrSettings(component));

	}

	// -------------------------------------------------------------------------

	/**
	 * Load scripts for tags which has bm-autoload attribute.
	 *
	 * @param	{HTMLElement}	rootNode			Target node.
	 * @param	{Object}		options				Load Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static loadTags(rootNode, options)
	{

		console.debug(`Loading tags. rootNode=${rootNode.tagName}`);

		let promises = [];
		let waitList = [];

		// Load tags that has bm-autoload/bm-automorph attribute
		let targets = Util.scopedSelectorAll(rootNode, "[bm-autoload]:not([bm-autoloading]):not([bm-powered]),[bm-automorph]:not([bm-autoloading]):not([bm-powered])");
		targets.forEach((element) => {
			element.setAttribute("bm-autoloading", "");

			// Load a tag
			let loader = ( element.hasAttribute("bm-loadername") ? LoaderOrganizer.getLoader(element.getAttribute("bm-loadername")).object : this);
			let settings = { "loadings": this._loadAttrSettings(element) };
			let className = Util.getClassNameFromTagName(element.tagName);
			element._injectSettings = function(curSettings){
				return Util.deepMerge(curSettings, settings);
			};
			promises.push(loader.loadComponent(element.tagName.toLowerCase(), className, settings).then(() => {
				element.removeAttribute("bm-autoloading");
			}));
		});

		/*
		// Create waiting list to wait Bitsmist components
		targets = Util.scopedSelectorAll(rootNode, "[bm-powered],[bm-autoloading]");
		targets.forEach((element) => {
			if (rootNode != element.rootElement && !element.hasAttribute("bm-nowait"))
			{
				let waitItem = {"object":element, "state":"ready"};
				waitList.push(waitItem);
			}
		});

		// Wait for the components to be loaded
		return Promise.all(promises).then(() => {
			let waitFor = Util.safeGet(options, "waitForTags") && waitList.length > 0;
			if (waitFor)
			{
				// Wait for the components to become "ready"
				return BITSMIST.v1.StateOrganizer.waitFor(waitList, {"waiter":rootNode});
			}
		});
		*/

	}

	// -------------------------------------------------------------------------

	/**
	 * Load a component.
	 *
	 * @param	{String}		tagName				Tag name.
	 * @param	{String}		className			Class name.
	 * @param	{Object}		settings			Component settings.
	 * @param	{Object}		loadOptions			Load options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static loadComponent(tagName, className, settings, loadOptions)
	{

		console.debug(`Loading a component. tagName=${tagName}, className=${className}`);

		// Check if the tag is already defined
		if (customElements.get(tagName))
		{
			console.debug(`Tag already defined. className=${className}, tagName=${tagName}`);
			return Promise.resolve();
		}

		// Override path and file name when url is specified in autoLoad option
		let href = Util.safeGet(settings, "loadings.autoLoad");
		href = ( href === true ? "" : href );
		if (href)
		{
			let arr = Util.getFilenameAndPathFromUrl(href);

			// Path
			settings["loadings"]["appBaseUrl"] = "";
			settings["loadings"]["componentPath"] = "";
			settings["loadings"]["templatePath"] = "";
			settings["loadings"]["path"] = arr[0];

			// File name
			if (href.slice(-3).toLowerCase() === ".js")
			{
				settings["loadings"]["fileName"] = arr[1].substring(0, arr[1].length - 3);
			}
			else if (href.slice(-5).toLowerCase() === ".html")
			{
				settings["loadings"]["autoMorph"] = ( settings["loadings"]["autoMorph"] ? settings["loadings"]["autoMorph"] : true );
				settings["loadings"]["fileName"] = arr[1].substring(0, arr[1].length - 5);
			}
		}

		// Get a base class name
		let baseClassName = Util.safeGet(settings, "loadings.autoMorph", className );
		baseClassName = ( baseClassName === true ? "BITSMIST.v1.Component" : baseClassName );

		// Get a path
		let path = Util.safeGet(loadOptions, "path",
			Util.concatPath([
				Util.safeGet(settings, "loadings.appBaseUrl", BITSMIST.v1.settings.get("system.appBaseUrl", "")),
				Util.safeGet(settings, "loadings.componentPath", BITSMIST.v1.settings.get("system.componentPath", "")),
				Util.safeGet(settings, "loadings.path", ""),
			])
		);

		// Load a class
		let fileName = Util.safeGet(settings, "loadings.fileName", tagName.toLowerCase());
		let split = Util.safeGet(loadOptions, "splitComponent", Util.safeGet(settings, "loadings.splitComponent", BITSMIST.v1.settings.get("system.splitComponent", false)));
		return this._autoloadComponent(baseClassName, fileName, path, {"splitComponent": split}).then(() => {
			// Morphing
			if (baseClassName !== className)
			{
				let superClass = ClassUtil.getClass(baseClassName);
				ClassUtil.newComponent(className, settings, superClass, tagName);
			}

			if (!customElements.get(tagName))
			{
				let classDef = ClassUtil.getClass(className);
				customElements.define(tagName, classDef);
			}
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Get a template html according to settings.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{String}		templateName		Template name.
	 * @param	{Object}		loadOptions			Load options.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static loadTemplate(component, templateName, loadOptions)
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
			let path = Util.safeGet(loadOptions, "path",
				Util.concatPath([
					component.settings.get("loadings.appBaseUrl", BITSMIST.v1.settings.get("system.appBaseUrl", "")),
					component.settings.get("loadings.templatePath", BITSMIST.v1.settings.get("system.templatePath", "")),
					component.settings.get("loadings.path", ""),
				])
			);

			promise = this._loadTemplateFile(templateInfo["name"], path, loadOptions).then((template) => {
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
	 * Load a setting file and merge to component's settings.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{String}		settingName			Setting name.
	 * @param	{Object}		loadOptions			Load options.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static loadSetting(component, settingName, loadOptions)
	{

		let path;
		return Promise.resolve().then(() => {
			path = Util.safeGet(loadOptions, "path",
				Util.concatPath([
					component.settings.get("loadings.appBaseUrl", BITSMIST.v1.settings.get("system.appBaseUrl", "")),
					component.settings.get("loadings.componentPath", BITSMIST.v1.settings.get("system.componentPath", "")),
					component.settings.get("loadings.path", ""),
				])
			);

			return this.loadSettingFile(settingName, path, {"type":"js", "bindTo":component});
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
	static loadSettingFile(settingName, path, loadOptions)
	{

		let type = Util.safeGet(loadOptions, "type", "js");
		let url = Util.concatPath([path, settingName + "." + type]);
		let settings;

		console.debug(`Loading setting. settingName=${settingName}, path=${path}`);

		return AjaxUtil.ajaxRequest({url:url, method:"GET"}).then((xhr) => {
			console.debug(`Loaded settings. url=${url}`);

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
				let bindTo = Util.safeGet(loadOptions, "bindTo");
				settings = Function('"use strict";return (' + xhr.responseText + ')').call(bindTo);
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
	 * @param	{Object}		loadOptions			Load Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _autoloadComponent(className, fileName, path, loadOptions)
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
			promise = this._loadComponentFile(fileName, path, loadOptions).then(() => {
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
	 * @param	{Object}		loadOptions			Load Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _loadComponentFile(fileName, path, loadOptions)
	{

		console.debug(`Loading script. fileName=${fileName}, path=${path}`);

		let url1 = Util.concatPath([path, fileName + ".js"]);
		let url2 = Util.concatPath([path, fileName + ".settings.js"]);

		return Promise.resolve().then(() => {
			return AjaxUtil.loadScript(url1);
		}).then(() => {
			if (loadOptions["splitComponent"])
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
	 * @param	{String}		templateName		Template name.
	 * @param	{String}		path				Path to template.
	 * @param	{Object}		loadOptions			Load options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _loadTemplateFile(templateName, path, loadOptions)
	{

		console.debug(`Loading template. templateName=${templateName}, path=${path}`);

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
	static _loadAttrSettings(element)
	{

		let settings = {};

		// Split component
		if (element.hasAttribute("bm-split"))
		{
			settings["splitComponent"] = true;
		}

		// Path
		if (element.hasAttribute("bm-path"))
		{
			settings["path"] = element.getAttribute("bm-path");
		}

		// File name
		if (element.hasAttribute("bm-filename"))
		{
			settings["fileName"] = element.getAttribute("bm-filename");
		}

		// Morphing
		if (element.hasAttribute("bm-automorph"))
		{
			settings["autoMorph"] = ( element.getAttribute("bm-automorph") ? element.getAttribute("bm-automorph") : true );
		}

		// Auto loading
		if (element.hasAttribute("bm-autoload"))
		{
			settings["autoLoad"] = ( element.getAttribute("bm-autoload") ? element.getAttribute("bm-autoload") : true );
		}

		return settings;

	}

}

// Init
DefaultLoader._classes = new Store();
