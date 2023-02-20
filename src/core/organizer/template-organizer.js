// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import AjaxUtil from "../util/ajax-util";
import Organizer from "./organizer";
import Util from "../util/util";

// =============================================================================
//	Template organizer class
// =============================================================================

export default class TemplateOrganizer extends Organizer
{

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	static get name()
	{

		return "TemplateOrganizer";

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static getInfo()
	{

		return {
			"sections":		"templates",
			"order":		200,
		};

	}

	// -------------------------------------------------------------------------

	static globalInit()
	{

		// Add properties to Component
		Object.defineProperty(BITSMIST.v1.Component.prototype, 'templates', { get() { return this._templates; }, });
		Object.defineProperty(BITSMIST.v1.Component.prototype, 'activeTemplateName', { get() { return this._activeTemplateName; }, set(value) { this._activeTemplateName = value; } });

		// Add methods to Component
		BITSMIST.v1.Component.prototype.loadTemplate = function(...args) { return TemplateOrganizer._loadTemplate(this, ...args); }
		BITSMIST.v1.Component.prototype.applyTemplate = function(...args) { return TemplateOrganizer._applyTemplate(this, ...args); }
		BITSMIST.v1.Component.prototype.cloneTemplate = function(...args) { return TemplateOrganizer._clone(this, ...args); }

	}

	// -------------------------------------------------------------------------

	static init(component, options)
	{

		// Init component vars
		component._templates = {};
		component._activeTemplateName = "";

		// Set defaults if not set
		if (!component.settings.get("templates.settings.templateName"))
		{
			let templateName = component.settings.get("settings.fileName", component.tagName.toLowerCase());
			component.settings.set("templates.settings.templateName", templateName);
		}

		// Add event handlers to component
		this._addOrganizerHandler(component, "doOrganize", TemplateOrganizer.TemplateOrganizer_onDoOrganize);
		this._addOrganizerHandler(component, "doTransform", TemplateOrganizer.TemplateOrganizer_onDoTransform);
		this._addOrganizerHandler(component, "afterTransform", TemplateOrganizer.TemplateOrganizer_onAfterTransform);

	}

	// -------------------------------------------------------------------------

	/**
	 * Load the template html.
	 *
	 * @param	{String}		fileName			File name.
	 * @param	{String}		path				Path to the file.
	 * @param	{Object}		loadOptions			Load Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static loadFile(fileName, path, loadOptions)
	{

		console.debug(`Loading template file. fileName=${fileName}, path=${path}`);

		let query = Util.safeGet(loadOptions, "query");
		let url = Util.concatPath([path, fileName]) + ".html" + (query ? "?" + query : "");
		return AjaxUtil.ajaxRequest({url:url, method:"GET"}).then((xhr) => {
			console.debug(`Loaded template. fileName=${fileName}, path=${path}`);

			return xhr.responseText;
		});

	}

	// -------------------------------------------------------------------------
	//  Event Handlers
	// -------------------------------------------------------------------------

	static TemplateOrganizer_onDoOrganize(sender, e, ex)
	{

		let promises = [];

		this._enumSettings(e.detail.settings["templates"], (sectionName, sectionValue) => {
			if (sectionValue["type"] === "html" || sectionValue["type"] === "url")
			{
				promises.push(this.loadTemplate(sectionName));
			}
		});

	}

	// -------------------------------------------------------------------------

	static TemplateOrganizer_onDoTransform(sender, e, ex)
	{

		if (this.settings.get("templates.settings.hasTemplate", true))
		{
			let templateName = this.settings.get("templates.settings.templateName");

			return Promise.resolve().then(() => {
				return this.loadTemplate(templateName);
			}).then(() => {
				return this.applyTemplate(templateName);
			});
		}

	}

	// -------------------------------------------------------------------------

	static TemplateOrganizer_onAfterTransform(sender, e, ex)
	{

		let promises = [];

		this._enumSettings(this.settings.get("templates"), (sectionName, sectionValue) => {
			if (sectionValue["type"] === "node")
			{
				promises.push(this.loadTemplate(sectionName));
			}
		});

		return Promise.all(promises);

	}

	// -------------------------------------------------------------------------
	//  Protected
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
	static _loadTemplate(component, templateName, loadOptions)
	{

		let templateInfo = component._templates[templateName] || TemplateOrganizer.__createTemplateInfo(component, templateName);

		if (templateInfo["isLoaded"])
		//if (templateInfo["isLoaded"] && options && !options["forceLoad"])
		{
			console.debug(`TemplateOrganizer._loadTemplate(): Template already loaded. name=${component.name}, templateName=${templateName}, id=${component.id}, uniqueId=${component.uniqueId}`);
			return Promise.resolve();
		}

		let promise;
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
					component.settings.get("system.appBaseUrl", ""),
					component.settings.get("system.templatePath", component.settings.get("system.componentPath", "")),
					component.settings.get("settings.path", ""),
				])
			);

			promise = TemplateOrganizer.loadFile(templateInfo["name"], path, loadOptions).then((template) => {
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
	 * Apply template.
	 *
	 * @param	{Component}		component			Parent component.
	 * @param	{String}		templateName		Template name.
	 */
	static _applyTemplate(component, templateName)
	{

		if (component._activeTemplateName === templateName)
		{
			console.debug(`TemplateOrganizer._applyTemplate(): Template already applied. name=${component.name}, templateName=${templateName}, id=${component.id}, uniqueId=${component.uniqueId}`);
			return Promise.resolve();
		}

		let templateInfo = component._templates[templateName];

		Util.assert(templateInfo,`TemplateOrganizer._applyTemplate(): Template not loaded. name=${component.name}, templateName=${templateName}, id=${component.id}, uniqueId=${component.uniqueId}`, ReferenceError);

		if (templateInfo["node"])
		{
			// Template node
			let clone = TemplateOrganizer.clone(component, templateInfo["name"]);
			component.insertBefore(clone, component.firstChild);
		}
		else
		{
			// HTML
			component.innerHTML = templateInfo["html"];
		}

		// Change active template
		component._activeTemplateName = templateName;

		console.debug(`TemplateOrganizer._applyTemplate(): Applied template. name=${component.name}, templateName=${templateInfo["name"]}, id=${component.id}, uniqueId=${component.uniqueId}`);

	}

	// -------------------------------------------------------------------------

	/**
	 * Clone the component.
	 *
	 * @param	{Component}		component			Parent component.
	 * @param	{String}		templateName		Template name.
	 *
	 * @return  {Object}		Cloned component.
	 */
	static _clone(component, templateName)
	{

		templateName = templateName || component.settings.get("settings.templateName");
		let templateInfo = component._templates[templateName];

		Util.assert(templateInfo,`TemplateOrganizer._clone(): Template not loaded. name=${component.name}, templateName=${templateName}, id=${component.id}, uniqueId=${component.uniqueId}`, ReferenceError);

		let clone;
		if (templateInfo["node"])
		{
			// A template tag
			clone = document.importNode(templateInfo["node"], true);
		}
		else
		{
			// Not a template tag
			let ele = document.createElement("div");
			ele.innerHTML = templateInfo["html"];

			clone = ele.firstElementChild;
		}

		return clone;

	}

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
	 * Returns a new template info object.
	 *
	 * @param	{Component}		component			Parent component.
	 * @param	{String}		templateName		Template name.
	 *
	 * @return  {Object}		Template info.
	 */
	static __createTemplateInfo(component, templateName)
	{

		if (!component._templates[templateName])
		{
			component._templates[templateName] = {};
			component._templates[templateName]["name"] = templateName;
			component._templates[templateName]["html"] = "";
			component._templates[templateName]["isLoaded"] = false;
		}

		return component._templates[templateName];

	}

}
