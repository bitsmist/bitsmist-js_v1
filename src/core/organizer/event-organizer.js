// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import Organizer from "./organizer.js";
import Util from "../util/util.js";

// =============================================================================
//	Event organizer class
// =============================================================================

export default class EventOrganizer extends Organizer
{

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	static get name()
	{

		return "EventOrganizer";

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static getInfo()
	{

		return {
			"sections":		"events",
			"order":		210,
		};

	}

	// -------------------------------------------------------------------------

	static globalInit()
	{

		// Add methods to Component
		BITSMIST.v1.Component.prototype.initEvents = function(...args) { EventOrganizer._initEvents(this, ...args) }
		BITSMIST.v1.Component.prototype.addEventHandler = function(...args) { EventOrganizer._addEventHandler(this, ...args); }
		BITSMIST.v1.Component.prototype.trigger = function(...args) { return EventOrganizer._trigger(this, ...args) }
		BITSMIST.v1.Component.prototype.triggerAsync = function(...args) { return EventOrganizer._triggerAsync(this, ...args) }
		BITSMIST.v1.Component.prototype.removeEventHandler = function(...args) { return EventOrganizer._removeEventHandler(this, ...args) }

	}

	// -------------------------------------------------------------------------

	static init(component, options)
	{

		// Add event handlers to component
		this._addOrganizerHandler(component, "doOrganize", EventOrganizer.onDoOrganize);
		this._addOrganizerHandler(component, "afterTransform", EventOrganizer.onAfterTransform);

	}

	// -------------------------------------------------------------------------

	static deinit(component, options)
	{

		let events = this.settings.get("events");
		if (events)
		{
			Object.keys(events).forEach((elementName) => {
				EventOrganizer._removeEvents(component, elementName, events[eventName]);
			});
		}

	}

	// -------------------------------------------------------------------------
	//  Event Handlers
	// -------------------------------------------------------------------------

	static onAfterTransform(sender, e, ex)
	{

		this._enumSettings(this.settings.get("events"), (sectionName, sectionValue) => {
			// Initialize only elements inside component
			if (!EventOrganizer.__isTargetSelf(sectionName, sectionValue))
			{
				EventOrganizer._initEvents(this, sectionName, sectionValue);
			}
		});

	}

	// -------------------------------------------------------------------------

	static onDoOrganize(sender, e, ex)
	{

		this._enumSettings(e.detail.settings["events"], (sectionName, sectionValue) => {
			EventOrganizer._initEvents(this, sectionName, sectionValue);
		});

	}

	// -------------------------------------------------------------------------
	//  Protected
	// -------------------------------------------------------------------------

	/**
	 * Add an event handler.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{String}		eventName			Event name.
	 * @param	{Object/Function/String}	handlerInfo	Event handler info.
	 * @param	{HTMLElement}	element				HTML element.
	 * @param	{Object}		bindTo				Object that binds to the handler.
	 */
	static _addEventHandler(component, eventName, handlerInfo, element, bindTo)
	{

		element = element || component;
		let handlerOptions = (typeof handlerInfo === "object" ? handlerInfo : {});

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

		let order = Util.safeGet(handlerOptions, "order", 1000);

		// Register listener info
		listeners[eventName].push({"handler":handler, "options":handlerOptions["options"], "bindTo":bindTo, "order":order});

		// Stable sort by order
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

		options = options || {};
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
