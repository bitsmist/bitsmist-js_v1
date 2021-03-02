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
import Pad from '../pad';
import Util from '../util/util';

// =============================================================================
//	Template organizer class
// =============================================================================

export default class TemplateOrganizer
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

		Pad.prototype.addTemplate = function(templateName, options) {
			return TemplateOrganizer.addTemplate(this, templateName, options);
		}

		Pad.prototype.cloneTemplate = function(templateName) {
			templateName = templateName || this._settings.get("templateName");

			return TemplateOrganizer.clone(this, templateName);
		}

		Pad.prototype.isActiveTemplate = function(templateName) {
			return TemplateOrganizer.isActive(this, templateName);
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Init.
	 *
	 * @param	{Object}		conditions			Conditions.
	 * @param	{Component}		component			Component.
	 * @param	{Object}		settings			Settings.
	 */
	static init(conditions, component, setttings)
	{

		component._templates = {};

		// Set defaults if not set already
		component.settings.set("templateName", component.settings.get("templateName", component.tagName.toLowerCase()));
		component.settings.set("autoOpen", component.settings.get("autoOpen", true));
		component.settings.set("autoClose", component.settings.get("autoClose", true));

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

		return Promise.resolve();

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
	 * @param	{String}		eventName			Event name.
	 *
	 * @return 	{Boolean}		True if it is target.
	 */
	static isTarget(eventName, observerInfo, ...args)
	{

		let ret = false;
		let component = args[0];

		if (component instanceof BITSMIST.v1.Pad)
		{
			if (eventName == "*" || eventName == "beforeStart")
			{
				ret = true;
			}
		}

		return ret;

	}

	// -------------------------------------------------------------------------

	/**
	 * Check if the template is active.
	 *
	 * @param	{Component}		component			Parent component.
	 * @param	{String}		templateName		Template name.
	 *
	 * @return  {Boolean}		True when active.
	 */
	static isActive(component, templateName)
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
	static addTemplate(component, templateName, options)
	{

		let templateInfo = TemplateOrganizer.__getTemplateInfo(component, templateName);
		if (templateInfo["isAppended"])
		{
			throw new ReferenceError(`Template already appended. name=${component.name}, templateName=${templateName}`);
		}

		return Promise.resolve().then(() => {
			let path = Util.concatPath([component._settings.get("system.appBaseUrl", ""), component._settings.get("system.templatePath", ""), component._settings.get("path", "")]);
			return TemplateOrganizer.loadTemplate(component, templateInfo, path);
		}).then(() => {
			if (component._settings.get("templateNode"))
			{
				TemplateOrganizer.__storeTemplateNode(component, templateInfo, component._settings.get("templateNode"));
			}

			return TemplateOrganizer.__applyTemplate(component, templateInfo);
		}).then(() => {
			if (component._templates[component._settings.get("templateName")])
			{
				component._templates[component._settings.get("templateName")]["isAppended"] = false;
			}
			component._templates[templateName]["isAppended"] = true;
			component._settings.set("templateName", templateName);
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
	static loadTemplate(component, templateInfo, path)
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
	static clone(component, templateName)
	{

		if (!component._templates[templateName])
		{
			throw new ReferenceError(`Template not loaded. name=${component.name}, templateName=${templateName}`);
		}

		let clone;
		if (component._templates[templateName].node)
		{
			clone = document.importNode(component._templates[templateName].node, true);
		}
		else
		{
			clone = TemplateOrganizer.__dupElement(component, templateName);
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

		//if (!templateInfo["name"] || templateInfo["html"])
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
			let clone = this.clone(templateInfo["name"]);
			component.insertBefore(clone, this.firstChild);
		}
		else
		{
			component.innerHTML = templateInfo["html"]
		}

		console.debug(`TemplateOrganizer.__applyTemplate(): Applied template. name=${component.name}, templateName=${templateInfo["name"]}, id=${component.id}`);

	}

	// -----------------------------------------------------------------------------

	/**
	 * Duplicate the component element.
	 *
	 * @param	{Component}		component			Parent component.
	 * @param	{String}		templateName		Template name.
	 *
	 * @return  {Object}		Cloned component.
	 */
	static __dupElement(component, templateName)
	{

		templateName = ( templateName ? templateName : component._settings.get("templateName") );

		let ele = document.createElement("div");
		ele.innerHTML = component._templates[templateName].html;

		return ele.firstElementChild;

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
			component._settings.set("system.templatePath", component.getAttribute("data-templatepath"));
		}

		// Get template name from attribute
		if (component.hasAttribute("data-templatename"))
		{
			component._settings.set("templateName", component.getAttribute("data-templatename"));
		}

		// Get template href from templatehref
		if (component.hasAttribute("data-templatehref"))
		{
			let arr = Util.getFilenameAndPathFromUrl(component.getAttribute("data-templatehref"));
			component._settings.set("system.templatePath", arr[0]);
			component._settings.set("templateName", arr[1].replace(".html", ""));
		}
		*/

	}

}
