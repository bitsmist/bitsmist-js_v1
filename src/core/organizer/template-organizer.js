// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import AjaxUtil from '../util/ajax-util';
import Organizer from './organizer';
import Pad from '../pad';
import Util from '../util/util';

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
		Pad.prototype.cloneTemplate = function(templateName) { return TemplateOrganizer._clone(this, templateName); }
		Pad.prototype.isActiveTemplate = function(templateName) { return TemplateOrganizer._isActive(this, templateName); }

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

		let templates = settings["templates"];
		if (templates)
		{
			Object.keys(templates).forEach((key) => {
				let templateInfo = TemplateOrganizer.__getTemplateInfo(component, key);
				templateInfo["html"] = templates[key];
			});
		}

		return settings;

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

	/**
	 * Check if event is target.
	 *
	 * @param	{String}		conditions			Event name.
	 * @param	{Object}		organizerInfo		Organizer info.
	 * @param	{Component}		component			Component.
	 *
	 * @return 	{Boolean}		True if it is target.
	 */
	static isTarget(conditions, organizerInfo, component)
	{

		let ret = false;

		if (component instanceof BITSMIST.v1.Pad)
		{
			ret = super.isTarget(conditions, organizerInfo, component);
			/*
			if (conditions == "*" || conditions == "beforeStart")
			{
				ret = true;
			}
			*/
		}

		return ret;

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
	static _isActive(component, templateName)
	{

		let ret = false;

		let templateInfo = TemplateOrganizer.__getTemplateInfo(component, templateName);
		if (templateInfo["isAppended"])
		{
			ret = true;
		}

		return ret;

	}

	// -------------------------------------------------------------------------

	/**
	 * Add a component to parent component.
	 *
	 * @param	{Component}		component			Parent component.
	 * @param	{String}		templateName		Template name.
	 * @param	{Object}		options				Options for the template.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _addTemplate(component, templateName, options)
	{

		let templateInfo = TemplateOrganizer.__getTemplateInfo(component, templateName);
		if (templateInfo["isAppended"])
		{
			throw new ReferenceError(`Template already appended. name=${component.name}, templateName=${templateName}`);
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

			return TemplateOrganizer.__applyTemplate(component, templateInfo);
		}).then(() => {
			if (component._templates[component.settings.get("settings.templateName")])
			{
				component._templates[component.settings.get("settings.templateName")]["isAppended"] = false;
			}
			component._templates[templateName]["isAppended"] = true;
			component.settings.set("settings.templateName", templateName);
		});

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

		if (!templateInfo)
		{
			throw new ReferenceError(`Template not loaded. name=${component.name}, templateName=${templateName}`);
		}

		let clone;
		if (templateInfo["node"])
		{
			// template is a template tag
			clone = document.importNode(templateInfo["node"], true);
		}
		else
		{
			// template is not a template tag
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
			component._templates[templateName]["isAppended"] = false;
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
		if (!rootNode)
		{
			throw new ReferenceError(`Root node does not exist. name=${component.name}, rootNode=${templateNodeName}, templateName=${templateInfo["name"]}`);
		}

		rootNode.insertAdjacentHTML("afterbegin", templateInfo["html"]);
		let node = rootNode.children[0];
		templateInfo["node"] = ('content' in node ? node.content : node);

	}

	// -------------------------------------------------------------------------

	/**
	 * Apply template.
	 *
	 * @param	{Component}		component			Parent component.
	 * @param	{Object}		templateInfo		Template info.
	 */
	static __applyTemplate(component, templateInfo)
	{

		if (templateInfo["node"])
		{
			let clone = TemplateOrganizer.clone(component, templateInfo["name"]);
			component.insertBefore(clone, component.firstChild);
		}
		else
		{
			component.innerHTML = templateInfo["html"];
		}

		console.debug(`TemplateOrganizer.__applyTemplate(): Applied template. name=${component.name}, templateName=${templateInfo["name"]}, id=${component.id}`);

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
		if (component.hasAttribute("data-templatepath"))
		{
			component.settings.set("system.templatePath", component.getAttribute("data-templatepath"));
		}

		// Get template name from attribute
		if (component.hasAttribute("data-templatename"))
		{
			component.settings.set("templateName", component.getAttribute("data-templatename"));
		}

		// Get template ref from templateref
		if (component.hasAttribute("data-templateref"))
		{
			let arr = Util.getFilenameAndPathFromUrl(component.getAttribute("data-templateref"));
			component.settings.set("system.templatePath", arr[0]);
			component.settings.set("templateName", arr[1].replace(".html", ""));
		}
		*/

	}

}
