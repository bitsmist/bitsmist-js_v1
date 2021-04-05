// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import Component from '../component';
import Organizer from './organizer';

// =============================================================================
//	Element organizer class
// =============================================================================

export default class ElementOrganizer extends Organizer
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
		Component.prototype.initElements = function(elementName, options, rootNode) {
			ElementOrganizer._initElements(this, elementName, options, rootNode)
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

		let elements = settings["elements"];
		if (elements)
		{
			Object.keys(elements).forEach((elementName) => {
				component.initElements(elementName);
			});
		}

		return settings;

	}

	// -------------------------------------------------------------------------
	//  Protected
	// -------------------------------------------------------------------------

	/**
	 * Set html elements event handlers.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{String}		elementName			Element name.
	 * @param	{Options}		options				Options.
	 * @param	{HTMLElement}	rootNode			Root node of elements.
	 */
	static _initElements(component, elementName, options, rootNode)
	{

		rootNode = ( rootNode ? rootNode : component.rootElement );
		let elementInfo = component.settings.get("elements." + elementName);
		let elements;

		// Get target elements
		if (elementInfo["rootNode"])
		{
			elements = rootNode.querySelectorAll(elementInfo["rootNode"]);
		}
		else
		{
			elements = rootNode.querySelectorAll("#" + elementName);
		}

		// Set event handlers
		this.__initEvents(component, elements, elementInfo["events"], options);

	}

	// -------------------------------------------------------------------------
	//  Protected
	// -------------------------------------------------------------------------

	/**
	 * Set html elements event handlers.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Array}			elements			Target elements.
	 * @param	{Object}		events				Event info.
	 * @param	{Options}		options				Event options.
	 */
	static __initEvents(component, elements, events, options)
	{

		for (let i = 0; i < elements.length; i++)
		{
			Object.keys(events).forEach((eventName) => {
				options = Object.assign({}, events[eventName]["options"], options);
				component.addEventHandler(elements[i], eventName, events[eventName], options);
			});
		}

	}

}
