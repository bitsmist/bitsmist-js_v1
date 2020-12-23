// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import ClassUtil from '../util/class-util';
import Util from '../util/util';

// =============================================================================
//	Component organizer class
// =============================================================================

export default class ComponentOrganizer
{

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
	 * Organize.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object}		settings			Settings.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static organize(component, settings)
	{

		let chain = Promise.resolve();

		let components = settings["components"];
		if (components)
		{
			Object.keys(components).forEach((componentName) => {
				chain = chain.then(() => {
					return ComponentOrganizer.addComponent(component, componentName, components[componentName]);
				});
			});
		}

		return chain;

	}

	// -------------------------------------------------------------------------

	/**
	 * Clear.
	 *
	 * @param	{Component}		component			Component.
	 */
	static clear(component)
	{

		Object.keys(component._components).forEach((key) => {
			component._components[key].parentNode.removeChild(component._components[key]);
		});

		component._components = {};

	}

	// -------------------------------------------------------------------------

	/**
	 * Check if event is target.
	 *
	 * @param	{String}		eventName			Event name.
	 *
	 * @return 	{Boolean}		True if it is target.
	 */
	static isTarget(eventName)
	{

		let ret = false;

		if (eventName == "*" || eventName == "afterAppend" || eventName == "afterSpecLoad")
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
	 * @param	{String}		componentName		Component name.
	 * @param	{Object}		options				Options for the component.
	 *
	 * @return  {Promise}		Promise.
	 */
	static addComponent(component, componentName, options)
	{

		if (!component._components)
		{
			component._components = {};
		}

		let url = Util.concatPath([component._settings.get("system.appBaseUrl", ""), component._settings.get("system.componentPath", ""), ( "path" in options ? options["path"] : "")]);
		let splitComponent = ( "splitComponent" in options ? options["splitComponent"] : component._settings.get("system.splitComponent", false) );
		let className = ( "className" in options ? options["className"] : componentName );

		return Promise.resolve().then(() => {
			if (className)
			{
				// Load component
				return component.loadComponent(className, url, {"splitComponent":splitComponent});
			}
			else
			{
				// Define empty class
				let tagName = options["tagName"] || Util.getTagNameFromClassName(componentName);
				className = componentName;
				ClassUtil.newComponent(BITSMIST.v1.Pad, {}, tagName, className);
			}
		}).then(() => {
			// Insert tag
			if (options["rootNode"] && !component._components[componentName])
			{
				// Check root node
				let root = document.querySelector(options["rootNode"]);
				if (!root)
				{
					throw new ReferenceError(`Root node does not exist when adding component ${componentName} to ${options["rootNode"]}. name=${component.name}`);
				}

				// Get tag name
				let tagName = options["tagName"] || ClassUtil.getClass(className).tagName || Util.getTagNameFromClassName(className);

				// Build tag
				let tag = ( options["tag"] ? options["tag"] : ( tagName ? "<" + tagName + " data-path='" + options["path"] + "'></" + tagName + ">" : "") );
				if (!tag)
				{
					throw new ReferenceError(`Tag name for '${componentName}' is not defined. name=${component.name}`);
				}

				// Insert tag
				root.insertAdjacentHTML("afterbegin", tag);
				component._components[componentName] = root.children[0];
			}
		});

	}

}
