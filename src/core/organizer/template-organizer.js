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
import Component from "../component.js";
import Organizer from "./organizer";
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

		// Add properties
		Object.defineProperty(Component.prototype, 'templates', { get() { return this._templates; }, });
		Object.defineProperty(Component.prototype, 'activeTemplateName', { get() { return this._activeTemplateName; }, set(value) { this._activeTemplateName = value; } });

		// Add methods
		Component.prototype.addTemplate = function(templateName, options) { return TemplateOrganizer._addTemplate(this, templateName, options); }
		Component.prototype.applyTemplate = function(templateName) { return TemplateOrganizer._applyTemplate(this, templateName); }
		Component.prototype.cloneTemplate = function(templateName) { return TemplateOrganizer._clone(this, templateName); }
		Component.prototype.showConditionalElements = function(item) { return TemplateOrganizer._showConditionalElements(this, item); }
		Component.prototype.hideConditionalElements = function() { return TemplateOrganizer._hideConditionalElements(this); }

	}

	// -------------------------------------------------------------------------

	/**
	 * Init.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object}		settings			Settings.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static init(component, setttings)
	{

		// Init vars
		component._templates = {};
		component._activeTemplateName = "";

		// Set defaults if not set
		if (!component.settings.get("settings.templateName"))
		{
			let templateName = component.settings.get("settings.fileName") || component.tagName.toLowerCase();
			component.settings.set("settings.templateName", templateName);
		}

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
				if (conditions === "beforeStart")
				{
					switch (templates[templateName]["type"])
					{
						case "html":
						case "url":
							promises.push(TemplateOrganizer._addTemplate(component, templateName));
							break;
					}
				}
				else if (conditions === "afterAppend")
				{
					switch (templates[templateName]["type"])
					{
						case "node":
							promises.push(TemplateOrganizer._addTemplate(component, templateName));
							break;
					}
				}
			});
		}

		return Promise.all(promises);

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

		let templateInfo = component._templates[templateName] || TemplateOrganizer.__createTemplateInfo(component, templateName);

		if (templateInfo["isLoaded"])
		//if (templateInfo["isLoaded"] && options && !options["forceLoad"])
		{
			console.debug(`TemplateOrganizer._addTemplate(): Template already loaded. name=${component.name}, templateName=${templateName}`);
			return Promise.resolve();
		}

		return component.loadTemplate(templateName);

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
			console.debug(`TemplateOrganizer._applyTemplate(): Template already applied. name=${component.name}, templateName=${templateName}`);
			return Promise.resolve();
		}

		let templateInfo = component._templates[templateName];

		Util.assert(templateInfo,`TemplateOrganizer._applyTemplate(): Template not loaded. name=${component.name}, templateName=${templateName}`, ReferenceError);

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

	/**
	 * Show "bm-visible" elements if condition passed.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object}		item				Item used to judge condition.
	 */
	static _showConditionalElements(component, item)
	{

		// Get elements with bm-visible attribute
		let elements = Util.scopedSelectorAll(component, "[bm-visible]");

		// Show elements
		elements.forEach((element) => {
			let condition = element.getAttribute("bm-visible");
			if (Util.safeEval(condition, item, item))
			{
				element.style.removeProperty("display");
			}
			else
			{
				element.style.display = "none";
			}
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Hide "bm-visible" elements.
	 *
	 * @param	{Component}		component			Component.
	 */
	static _hideConditionalElements(component)
	{

		// Get elements with bm-visible attribute
		let elements = Util.scopedSelectorAll(component, "[bm-visible]");

		// Hide elements
		elements.forEach((element) => {
			element.style.display = "none";
		});

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
