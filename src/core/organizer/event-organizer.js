// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import Component from "../component/component.js";
import Organizer from "./organizer.js";
import Util from "../util/util.js";

// =============================================================================
//	Event organizer class
// =============================================================================

export default class EventOrganizer extends Organizer
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
		Component.prototype.initEvents = function(elementName, handlerInfo, rootNode) {
			EventOrganizer._initEvents(this, elementName, handlerInfo, rootNode)
		}
		Component.prototype.addEventHandler = function(eventName, handlerInfo, element, bindTo) {
			EventOrganizer._addEventHandler(this, element, eventName, handlerInfo, bindTo);
		}
		Component.prototype.trigger = function(eventName, options, element) {
			return EventOrganizer._trigger(this, eventName, options, element)
		}
		Component.prototype.triggerAsync = function(eventName, options, element) {
			return EventOrganizer._triggerAsync(this, eventName, options, element)
		}
		Component.prototype.getEventHandler = function(handlerInfo) {
			return EventOrganizer._getEventHandler(this, handlerInfo)
		}
		Component.prototype.removeEventHandler = function(eventName, handlerInfo, element) {
			return EventOrganizer._removeEventHandler(this, element, eventName, handlerInfo)
		}

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
	static init(component, settings)
	{
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

		let events = settings["events"];
		if (events)
		{
			let targets = EventOrganizer.__filterElements(component, events, conditions);

			Object.keys(targets).forEach((elementName) => {
				EventOrganizer._initEvents(component, elementName, events[elementName]);
			});
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Unorganize.
	 *
	 * @param	{Object}		conditions			Conditions.
	 * @param	{Component}		component			Component.
	 * @param	{Object}		settings			Settings.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static unorganize(conditions, component, settings)
	{

		let events = settings["events"];
		if (events)
		{
			Object.keys(events).forEach((elementName) => {
				EventOrganizer._removeEvents(component, elementName, events[elementName]);
			});
		}

	}

	// -------------------------------------------------------------------------
	//  Protected
	// -------------------------------------------------------------------------

	/**
	 * Add an event handler.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{HTMLElement}	element					HTML element.
	 * @param	{String}		eventName				Event name.
	 * @param	{Object/Function/String}	handlerInfo	Event handler info.
	 * @param	{Object}		bindTo					Object that binds to the handler.
	 */
	static _addEventHandler(component, element, eventName, handlerInfo, bindTo)
	{

		element = element || component;
		let handlerOptions = (typeof handlerInfo === "object" ? Util.deepClone(handlerInfo) : {});

		// Get handler
		let handler = EventOrganizer._getEventHandler(component, handlerInfo);
		Util.assert(handler, `EventOrganizer._addEventHandler(): handler not found. name=${component.name}, eventName=${eventName}`);

		// Init holder object for the element
		if (!element.__bm_eventinfo)
		{
			element.__bm_eventinfo = { "component":component, "listeners":{}, "promises":{}, "statuses":{} };
		}

		// Add hook event handler
		let listeners = element.__bm_eventinfo.listeners;
		if (!listeners[eventName])
		{
			listeners[eventName] = [];
			element.addEventListener(eventName, EventOrganizer.__callEventHandler, handlerOptions["listnerOptions"]);
		}

		// Register listener info
		listeners[eventName].push({"handler":handler, "options":handlerOptions["options"], "bindTo":bindTo});

		// Stable sort by order
		let order = Util.safeGet(handlerOptions, "order");
		listeners[eventName].sort((a, b) => {
			if (a.order === b.order)	return 0;
			else if (a.order > b.order)	return 1;
			else 						return -1
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Remove an event handler.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{HTMLElement}	element					HTML element.
	 * @param	{String}		eventName				Event name.
	 * @param	{Object/Function/String}	handlerInfo	Event handler info.
	 */
	static _removeEventHandler(component, element, eventName, handlerInfo)
	{

		element = element || component;

		// Get handler
		let handler = EventOrganizer._getEventHandler(component, handlerInfo);
		Util.assert(handler, `EventOrganizer._removeEventHandler(): handler not found. name=${component.name}, eventName=${eventName}`);

		let listeners = Util.safeGet(element, "__bm_eventinfo.listeners." + eventName);
		if (listeners)
		{
			for (let i = listeners.length - 1; i >= 0; i--)
			{
				if (listeners[i]["handler"] === handler)
				{
					listeners.splice(i, 1);
					break;
				}
			}
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Set event handlers to the element.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{String}		elementName			Element name.
	 * @param	{Object}		eventInfo			Event info.
	 * @param	{HTMLElement}	rootNode			Root node of elements.
	 */
	static _initEvents(component, elementName, eventInfo, rootNode)
	{

		rootNode = ( rootNode ? rootNode : component );
		eventInfo = ( eventInfo ? eventInfo : component.settings.get("events." + elementName) );

		// Get target elements
		let elements = EventOrganizer.__getTargetElements(component, rootNode, elementName, eventInfo);
		//Util.assert(elements.length > 0, `EventOrganizer._initEvents: No elements for the event found. name=${component.name}, elementName=${elementName}`, TypeError);

		// Set event handlers
		Object.keys(eventInfo["handlers"]).forEach((eventName) => {
			let handlers = ( Array.isArray(eventInfo["handlers"][eventName]) ? eventInfo["handlers"][eventName] : [eventInfo["handlers"][eventName]] );
			for (let i = 0; i < handlers.length; i++)
			{
				for (let j = 0; j < elements.length; j++)
				{
					component.addEventHandler(eventName, handlers[i], elements[j]);
				}
			}
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Remove event handlers from the element.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{String}		elementName			Element name.
	 * @param	{Object}		eventInfo			Event info.
	 * @param	{HTMLElement}	rootNode			Root node of elements.
	 */
	static _removeEvents(component, elementName, eventInfo, rootNode)
	{

		rootNode = ( rootNode ? rootNode : component );

		// Get target elements
		let elements = EventOrganizer.__getTargetElements(component, rootNode, elementName, eventInfo);

		// Remove event handlers
		Object.keys(eventInfo["handlers"]).forEach((eventName) => {
			let handlers = ( Array.isArray(eventInfo["handlers"][eventName]) ? eventInfo["handlers"][eventName] : [eventInfo["handlers"][eventName]] );
			for (let i = 0; i < handlers.length; i++)
			{
				for (let j = 0; j < elements.length; j++)
				{
					component.removeEventHandler(eventName, handlers[i], elements[j]);
				}
			}
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Trigger the event synchronously.
	 *
	 * @param	{Component}		component				Component.
	 * @param	{String}		eventName				Event name to trigger.
	 * @param	{Object}		options					Event parameter options.
	 * @param	{HTMLElement}	element					HTML element.
	 */
	static _trigger(component, eventName, options, element)
	{

		options = Util.deepMerge({}, options);
		options["sender"] = options["sender"] || component;
		element = ( element ? element : component );
		let e = null;

		try
		{
			e = new CustomEvent(eventName, { detail: options });
		}
		catch(error)
		{
			e  = document.createEvent("CustomEvent");
			e.initCustomEvent(eventName, false, false, options);
		}

		element.dispatchEvent(e);

		// return the promise if exists
		return Util.safeGet(element, "__bm_eventinfo.promises." + eventName) || Promise.resolve();

	}

	// -------------------------------------------------------------------------

	/**
	 * Trigger the event asynchronously.
	 *
	 * @param	{Component}		component				Component.
	 * @param	{String}		eventName				Event name to trigger.
	 * @param	{Object}		options					Event parameter options.
	 * @param	{HTMLElement}	element					HTML element.
	 */
	static _triggerAsync(component, eventName, options, element)
	{

		options = options || {};
		options["async"] = true;

		return EventOrganizer._trigger.call(component, component, eventName, options, element);

	}

	// -----------------------------------------------------------------------------

	/**
	 * Get an event handler from a handler info object.
	 *
	 * @param	{Component}		component				Component.
	 * @param	{Object/Function/String}	handlerInfo	Handler info.
	 */
	static _getEventHandler(component, handlerInfo)
	{

		let handler = ( typeof handlerInfo === "object" ? handlerInfo["handler"] : handlerInfo );

		return handler;

	}

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
	 * Filter target elements according to a condition.
	 *
	 * @param	{Object}		component			Component.
	 * @param	{Object}		eventInfo			Event settings.
	 * @param	{Object}		conditions			Conditions.
	 *
	 * @return 	{Object}		Target elements.
	 */
	static __filterElements(component, eventInfo, conditions)
	{

		let keys;

		switch (conditions)
		{
		case "beforeStart":
			// Return events only for the component itself.
			keys = Object.keys(eventInfo).filter((elementName) => {
				return EventOrganizer.__isTargetSelf(elementName, eventInfo[elementName]);
			});
			break;
		case "afterAppend":
			// Return events only for elements inside the component.
			keys = Object.keys(eventInfo).filter((elementName) => {
				return !EventOrganizer.__isTargetSelf(elementName, eventInfo[elementName]);
			});
			break;
		case "afterSpecLoad":
			// Return all
			keys = Object.keys(eventInfo);
			break;
		}

		let targets = keys.reduce((result, key) => {
			result[key] = eventInfo[key];
			return result;
		}, {});

		return targets;

	}

	// -------------------------------------------------------------------------

	/**
	 * Check if a target element is component itself.
	 *
	 * @param	{String}		elementName			Element name.
	 * @param	{Object}		elementInfo			Element info.
	 *
	 * @return 	{Boolean}			Target node list.
	 */
		static __isTargetSelf(elementName, eventInfo)
	{

		let ret = false;

		if (elementName === "this" || eventInfo && eventInfo["rootNode"] === "this")
		{
			ret = true;
		}

		return ret;

	}

	// -------------------------------------------------------------------------

	/**
	 * Get target elements for the eventInfo.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{HTMLElement}	rootNode			A root node to search elements.
	 * @param	{String}		elementName			Element name.
	 * @param	{Object}		elementInfo			Element info.
	 *
	 * @return 	{Array}			Target node list.
	 */
	static __getTargetElements(component, rootNode, elementName, eventInfo)
	{

		let elements;

		if (EventOrganizer.__isTargetSelf(elementName, eventInfo))
		{
			elements = [rootNode];
		}
		else if (eventInfo && eventInfo["rootNode"])
		{
			elements = Util.scopedSelectorAll(rootNode, eventInfo["rootNode"]);
		}
		else
		{
			elements = Util.scopedSelectorAll(rootNode, "#" + elementName);
		}

		return elements;

	}

	// -------------------------------------------------------------------------

	/**
	 * Check if the given handler is already installed.
	 *
	 * @param	{HTMLElement}	element				HTMLElement to check.
	 * @param	{String}		eventName			Event name.
	 * @param	{Function}		handler				Event handler.
	 *
	 * @return 	{Boolean}		True if already installed.
	 */
	static __isHandlerInstalled(element, eventName, handler)
	{

		let isInstalled = false;
		let listeners = Util.safeGet(element.__bm_eventinfo, "listeners." + eventName);

		if (listeners)
		{
			for (let i = 0; i < listeners.length; i++)
			{
				if (listeners[i]["handler"] === handler)
				{
					isInstalled = true;
					break;
				}
			}
		}

		return isInstalled;

	}

	// -------------------------------------------------------------------------

	/**
	 * Call event handlers.
	 *
	 * This function is registered as event listener by element.addEventListener(),
	 * so "this" is HTML element that triggered the event.
	 *
	 * @param	{Object}		e						Event parameter.
	 */
	static __callEventHandler(e)
	{

		let listeners = Util.safeGet(this, "__bm_eventinfo.listeners." + e.type);
		let sender = Util.safeGet(e, "detail.sender", this);
		let component = Util.safeGet(this, "__bm_eventinfo.component");

		// Check if handler is already running
		//Util.assert(Util.safeGet(this, "__bm_eventinfo.statuses." + e.type) !== "handling", `EventOrganizer.__callEventHandler(): Event handler is already running. name=${this.tagName}, eventName=${e.type}`, Error);
		Util.warn(Util.safeGet(this, "__bm_eventinfo.statuses." + e.type) !== "handling", `EventOrganizer.__callEventHandler(): Event handler is already running. name=${this.tagName}, eventName=${e.type}`);

		Util.safeSet(this, "__bm_eventinfo.statuses." + e.type, "handling");

		if (Util.safeGet(e, "detail.async", false) === false)
		{
			// Wait previous handler
			this.__bm_eventinfo["promises"][e.type] = EventOrganizer.__handle(e, sender, component, listeners).then(() => {
				Util.safeSet(this, "__bm_eventinfo.promises." + e.type, null);
				Util.safeSet(this, "__bm_eventinfo.statuses." + e.type, "");
			}).catch((err) => {
				Util.safeSet(this, "__bm_eventinfo.promises." + e.type, null);
				Util.safeSet(this, "__bm_eventinfo.statuses." + e.type, "");
				throw(err);
			});
		}
		else
		{
			// Does not wait previous handler
			try
			{
				this.__bm_eventinfo["promises"][e.type] = EventOrganizer.__handleAsync(e, sender, component, listeners);
				Util.safeSet(this, "__bm_eventinfo.promises." + e.type, null);
				Util.safeSet(this, "__bm_eventinfo.statuses." + e.type, "");
			}
			catch (err)
			{
				Util.safeSet(this, "__bm_eventinfo.promises." + e.type, null);
				Util.safeSet(this, "__bm_eventinfo.statuses." + e.type, "");
				throw err;
			}
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Call event handlers.
	 *
	 * @param	{Object}		e						Event parameter.
	 * @param	{Object}		sender					Sender object.
	 * @param	{Object}		component				Target component.
	 * @param	{Object}		listener				Listers info.
	 */
	static __handle(e, sender, component, listeners)
	{

		let chain = Promise.resolve();
		let stopPropagation = false;

		for (let i = 0; i < listeners.length; i++)
		{
			// Options set in addEventHandler()
			let ex = {
				"component": component,
				"options": ( listeners[i]["options"] ? listeners[i]["options"] : {} )
			}

			chain = chain.then(() => {
				// Get a handler
				let handler = listeners[i]["handler"];
				handler = ( typeof handler === "string" ? component[handler] : handler );
				Util.assert(typeof handler === "function", `EventOrganizer._addEventHandler(): Event handler is not a function. name=${component.name}, eventName=${e.type}`, TypeError);

				// Execute the handler
				let bindTo = ( listeners[i]["bindTo"] ? listeners[i]["bindTo"] : component );
				return handler.call(bindTo, sender, e, ex);
			});

			stopPropagation = (listeners[i]["options"] && listeners[i]["options"]["stopPropagation"] ? true : stopPropagation)
		}

		if (stopPropagation)
		{
			e.stopPropagation();
		}

		return chain;

	}

	// -------------------------------------------------------------------------

	/**
	 * Call event handlers (Async).
	 *
	 * @param	{Object}		e						Event parameter.
	 * @param	{Object}		sender					Sender object.
	 * @param	{Object}		component				Target component.
	 * @param	{Object}		listener				Listers info.
	 */
	static __handleAsync(e, sender, component, listeners)
	{

		let stopPropagation = false;

		for (let i = 0; i < listeners.length; i++)
		{
			// Options set on addEventHandler()
			let ex = {
				"component": component,
				"options": ( listeners[i]["options"] ? listeners[i]["options"] : {} )
			}

			// Get a handler
			let handler = listeners[i]["handler"];
			handler = ( typeof handler === "string" ? component[handler] : handler );
			Util.assert(typeof handler === "function", `EventOrganizer._addEventHandler(): Event handler is not a function. name=${component.name}, eventName=${e.type}`, TypeError);

			// Execute handler
			let bindTo = ( listeners[i]["bindTo"] ? listeners[i]["bindTo"] : component );
			handler.call(bindTo, sender, e, ex);

			stopPropagation = (listeners[i]["options"] && listeners[i]["options"]["stopPropagation"] ? true : stopPropagation)
		}

		if (stopPropagation)
		{
			e.stopPropagation();
		}

		return Promise.resolve();

	}

}
