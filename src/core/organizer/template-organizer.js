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
import Pad from "../pad";
import Util from "../util/util";

// =============================================================================
//	Template organizer class
// =============================================================================

export default class TemplateOrganizer extends Organizer
{

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
	 * Global init.
	 */
	static globalInit()
	{

		// Add methods
		Pad.prototype.addTemplate = function(templateName, options) { return TemplateOrganizer._addTemplate(this, templateName, options); }
		Pad.prototype.applyTemplate = function(templateName) { return TemplateOrganizer._applyTemplate(this, templateName); }
		Pad.prototype.cloneTemplate = function(templateName) { return TemplateOrganizer._clone(this, templateName); }
		Pad.prototype.isActiveTemplate = function(templateName) { return TemplateOrganizer._isActiveTemplate(this, templateName); }

	}

	// -------------------------------------------------------------------------

	/**
	 * Init.
	 *
	 * @param	{Object}		conditions			Conditions.
	 * @param	{Component}		component			Component.
	 * @param	{Object}		settings			Settings.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static init(conditions, component, setttings)
	{

		// Init vars
		component._templates = {};
		component._activeTemplateName = "";

		// Set defaults if not set already
		component.settings.set("settings.templateName", component.settings.get("settings.templateName", component.tagName.toLowerCase()));

		// Load settings from attributes
		TemplateOrganizer.__loadAttrSettings(component);

	}

	// -------------------------------------------------------------------------

	/**
	 * Organize.
	 *
	 * @param	{Object}		conditions			Conditions.
	 * @param	{Component}		component			Component.
	 * @param	{Object}		settings			Settings.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static organize(conditions, component, settings)
	{

		let promises = [];
		let templates = settings["templates"];
		if (templates)
		{
			Object.keys(templates).forEach((templateName) => {
				let templateInfo = TemplateOrganizer.__getTemplateInfo(component, templateName);
				promises.push(TemplateOrganizer.__getTemplate(component, conditions, templates[templateName], templateInfo));
			});
		}

		return Promise.all(promises).then(() => {
			return settings;
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Clear.
	 *
	 * @param	{Component}		component			Component.
	 */
	static clear(component)
	{

		component._templates = {};

	}

	// -------------------------------------------------------------------------
	//  Protected
	// -------------------------------------------------------------------------

	/**
	 * Check if the template is active.
	 *
	 * @param	{Component}		component			Parent component.
	 * @param	{String}		templateName		Template name.
	 *
	 * @return  {Boolean}		True when active.
	 */
	static _isActiveTemplate(component, templateName)
	{

		let ret = false;

		if (component._activeTemplateName === templateName)
		{
			ret = true;
		}

		return ret;

	}

	// -------------------------------------------------------------------------

	/**
	 * Add a template.
	 *
	 * @param	{Component}		component			Parent component.
	 * @param	{String}		templateName		Template name.
	 * @param	{Object}		options				Options for adding a template.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _addTemplate(component, templateName, options)
	{

		let templateInfo = TemplateOrganizer.__getTemplateInfo(component, templateName);
		if (templateInfo["isLoaded"])
		{
			console.debug(`TemplateOrganizer._addTemplate(): Template already loaded. name=${component.name}, templateName=${templateName}`);
			return Promise.resolve();
		}

		return Promise.resolve().then(() => {
			let path = Util.concatPath([
				component.settings.get("system.appBaseUrl", ""),
				component.settings.get("system.templatePath", ""),
				component.settings.get("settings.path", "")
			]);
			return TemplateOrganizer._loadTemplate(component, templateInfo, path);
		}).then(() => {
			if (component.settings.get("settings.templateNode"))
			{
				TemplateOrganizer.__storeTemplateNode(component, templateInfo, component.settings.get("settings.templateNode"));
			}
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

		if (component._activeTemplateName == templateName)
		{
			console.debug(`TemplateOrganizer._applyTemplate(): Template already applied. name=${component.name}, templateName=${templateName}`);
			return Promise.resolve();
		}

		let templateInfo = TemplateOrganizer.__getTemplateInfo(component, templateName);
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

		console.debug(`TemplateOrganizer._applyTemplate(): Applied template. name=${component.name}, templateName=${templateInfo["name"]}, id=${component.id}`);

	}

	// -------------------------------------------------------------------------

	/**
	 * Load the template html.
	 *
	 * @param	{Component}		component			Parent component.
	 * @param	{Object}		templateInfo		Template info.
	 * @param	{String}		path				Path to template.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _loadTemplate(component, templateInfo, path)
	{

		return TemplateOrganizer.__autoLoadTemplate(component, templateInfo, path);

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

		templateName = templateName || component._settings.get("settings.templateName");
		let templateInfo = component._templates[templateName];

		Util.assert(templateInfo,`TemplateOrganizer._addTemplate(): Template not loaded. name=${component.name}, templateName=${templateName}`, ReferenceError);

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
	 * Load the template html if not loaded yet.
	 *
	 * @param	{Component}		component			Parent component.
	 * @param	{Object}		templateInfo		Template info.
	 *
	 * @return  {Promise}		Promise.
	 */
	static __autoLoadTemplate(component, templateInfo, path)
	{

		console.debug(`TemplateOrganizer.__autoLoadTemplate(): Auto loading template. name=${component.name}, templateName=${templateInfo["name"]}, id=${component.id}`);

		let promise;

		if (templateInfo["html"] || templateInfo["node"])
		{
			console.debug(`TemplateOrganizer.__autoLoadTemplate(): Template Already exists. name=${component.name}, templateName=${templateInfo["name"]}, id=${component.id}`, );
		}
		else
		{
			let url = Util.concatPath([path, templateInfo["name"] + ".html"]);

			promise = TemplateOrganizer.__loadTemplateFile(url).then((template) => {
				templateInfo["html"] = template;
			});
		}

		return Promise.all([promise]).then(() => {
			if (!templateInfo["isLoaded"])
			{
				return component.trigger("afterLoadTemplate", component);
			}
		}).then(() => {
			templateInfo["isLoaded"] = true;
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

		console.debug(`TemplateOrganzier.loadTemplate(): Loading template. url=${url}`);

		return AjaxUtil.ajaxRequest({url:url, method:"GET"}).then((xhr) => {
			console.debug(`TemplateOrganzier.loadTemplate(): Loaded template. url=${url}`);

			return xhr.responseText;
		});

	}

	// -----------------------------------------------------------------------------

	/**
	 * Returns templateInfo for the specified templateName. Create one if not exists.
	 *
	 * @param	{Component}		component			Parent component.
	 * @param	{String}		templateName		Template name.
	 *
	 * @return  {Object}		Template info.
	 */
	static __getTemplateInfo(component, templateName)
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

	// -------------------------------------------------------------------------

	/**
	 * Store a template node.
	 *
	 * @param	{Component}		component			Parent component.
	 * @param	{Object}		templateInfo		Template info.
	 * @param	{String}		templateNodeName	Template node name.
	 */
	static __storeTemplateNode(component, templateInfo, templateNodeName)
	{

		let rootNode = document.querySelector(templateNodeName);
		Util.assert(rootNode, `TemplateOrganizer._addTemplate(): Root node does not exist. name=${component.name}, rootNode=${templateNodeName}, templateName=${templateInfo["name"]}`, ReferenceError);

		rootNode.insertAdjacentHTML("afterbegin", templateInfo["html"]);
		let node = rootNode.children[0];
		templateInfo["node"] = ('content' in node ? node.content : node);

	}

	// -----------------------------------------------------------------------------

	/**
	 * Get settings from element's attribute.
	 *
	 * @param	{Component}		component			Component.
	 */
	static __loadAttrSettings(component)
	{

		/*
		// Get template path from attribute
		if (component.hasAttribute("bm-templatepath"))
		{
			component.settings.set("system.templatePath", component.getAttribute("bm-templatepath"));
		}

		// Get template name from attribute
		if (component.hasAttribute("bm-templatename"))
		{
			component.settings.set("templateName", component.getAttribute("bbmmplatename"));
		}

		// Get template ref from templateref
		if (component.hasAttribute("bm-templateref"))
		{
			let arr = Util.getFilenameAndPathFromUrl(component.getAttribute("bm-templateref"));
			component.settings.set("system.templatePath", arr[0]);
			component.settings.set("templateName", arr[1].replace(".html", ""));
		}
		*/

	}

	// -------------------------------------------------------------------------

	/**
	 * Get a template html according to settings.
	 *
	 * @param	{Object}		settings			Settings.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static __getTemplate(component, conditions, settings, templateInfo)
	{

		let promise = Promise.resolve();
		let dataType = settings["type"];

		if (conditions == "beforeStart")
		{
			switch (dataType) {
			case "html":
				templateInfo["html"] = settings["html"];
				break;
			case "url":
				//todo
				promise = TemplateOrganizer.loadTemplate(component, templateInfo, settings["url"]).then((html) => {
					templateInfo["html"] = html;
				});
				break;
			}
		}
		else if (conditions == "afterAppend")
		{
			switch (dataType) {
			case "node":
				templateInfo["html"] = component.querySelector(settings["rootNode"]).innerHTML;
				break;
			}
		}

		return promise;

	}

}
