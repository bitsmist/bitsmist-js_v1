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
import Util from '../util/util';

// =============================================================================
//	Event organizer class
// =============================================================================

export default class EventOrganizer
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

		Component.prototype.addEventHandler = function(element, eventName, eventInfo, options, bindTo) {
			EventOrganizer.addEventHandler(this, element, eventName, eventInfo, options, bindTo);
		}

		Component.prototype.trigger = function(eventName, sender, options, element) {
			return EventOrganizer.trigger(this, eventName, sender, options, element)
		}

		Component.prototype.triggerSync = function(eventName, sender, options, element) {
			return EventOrganizer.triggerSync(this, eventName, sender, options, element)
		}

		Component.prototype.setHtmlEventHandlers = function(elementName, options, rootNode) {
			EventOrganizer.setHtmlEventHandlers(this, elementName, options, rootNode)
		}

		Component.prototype.getEventHandler = function(component, eventInfo, bindTo, eventName) {
			return EventOrganizer.getEventHandler(this, component, eventInfo, bindTo, eventName)
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

		let events = settings["events"];
		if (events)
		{
			Object.keys(events).forEach((eventName) => {
				let arr = ( Array.isArray(events[eventName]) ? events[eventName] : [events[eventName]] );
				for (let i = 0; i < arr.length; i++)
				{
					component.addEventHandler(component, eventName, arr[i]);
				}
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

		if (eventName == "*" || eventName == "beforeStart")
		{
			ret = true;
		}

		return ret;

	}

	// -------------------------------------------------------------------------

	/**
	 * Add an event handler.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{HTMLElement}	element					HTML element.
	 * @param	{String}		eventName				Event name.
	 * @param	{Object/Function/String}	eventInfo	Event info.
	 * @param	{Object}		options					Options passed to elements.
	 * @param	{Object}		bindTo					Object which binds to handler.
	 */
	static addEventHandler(component, element, eventName, eventInfo, options, bindTo)
	{

		// Get handler
		let handler = EventOrganizer.getEventHandler(component, eventInfo, bindTo);
		if (typeof handler !== "function")
		{
			let pluginName = ( bindTo ? bindTo.name : "" );
			throw TypeError(`Event handler is not a function. componentName=${component.name}, pluginName=${pluginName}, eventName=${eventName}`);
		}

		// Init holder object for the element
		if (!element._bm_detail)
		{
			element._bm_detail = { "component":component, "listeners":{}, "promises":{}, "statuses":{} };
		}

		// Add hook event handler
		let listeners = element._bm_detail.listeners;
		if (!listeners[eventName])
		{
			listeners[eventName] = [];
			element.addEventListener(eventName, EventOrganizer.__callEventHandler);
		}

		listeners[eventName].push({"handler":handler, "options":Object.assign({}, options), "bind":bindTo, "order":order});

		// Stable sort by order
		let order = (typeof eventInfo === "object" && eventInfo["order"] ? eventInfo["order"] : 0);
		listeners[eventName].sort((a, b) => {
			if (a.order == b.order)		return 0;
			else if (a.order > b.order)	return 1;
			else 						return -1
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Trigger the event.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{String}		eventName				Event name to trigger.
	 * @param	{Object}		sender					Object which triggered the event.
	 * @param	{Object}		options					Event parameter options.
	 */
	static trigger(component, eventName, sender, options, element)
	{

		options = Object.assign({}, options);
		options["sender"] = sender;
		element = ( element ? element : component );
		let e = null;

		try
		{
			e = new CustomEvent(eventName, { detail: options });
		}
		catch(error)
		{
			e  = document.createEvent('CustomEvent');
			e.initCustomEvent(eventName, false, false, options);
		}

		element.dispatchEvent(e);

		// return the promise if exists
		return Util.safeGet(element, "_bm_detail.promises." + eventName) || Promise.resolve();

	}

	// -------------------------------------------------------------------------

	/**
	 * Trigger the event synchronously.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{String}		eventName				Event name to trigger.
	 * @param	{Object}		sender					Object which triggered the event.
	 * @param	{Object}		options					Event parameter options.
	 */
	static triggerSync(component, eventName, sender, options, element)
	{

		options = options || {};
		options["async"] = false;

		return EventOrganizer.trigger.call(component, component, eventName, sender, options, element);

	}

	// -----------------------------------------------------------------------------

	/**
	 * Set html elements event handlers.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{String}		elementName			Element name.
	 * @param	{Options}		options				Options.
	 */
	static setHtmlEventHandlers(component, elementName, options, rootNode)
	{

		rootNode = ( rootNode ? rootNode : component );
		let elementInfo = component._settings.get("elements." + elementName);
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
		let events = elementInfo["events"];
		for (let i = 0; i < elements.length; i++)
		{
			Object.keys(events).forEach((eventName) => {
				options = Object.assign({}, events[eventName]["options"], options);
				EventOrganizer.addEventHandler(component, elements[i], eventName, events[eventName], options);
			});
		}

	}

	// -----------------------------------------------------------------------------

	/**
	 * Get event handler from event info object.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object/Function/String}	eventInfo	Event info.
	 * @param	{Object}		bindTo					Object which binds to handler.
	 */
	static getEventHandler(component, eventInfo, bindTo, eventName)
	{

		bindTo = bindTo || component;
		let handler = ( typeof eventInfo === "object" ? eventInfo["handler"] : eventInfo );

		if ( typeof handler === "string" )
		{
			handler = ( bindTo ? bindTo[handler] : component[handler] );
		}

		if (handler)
		{
			handler = handler.bind(bindTo);
		}

		return handler;

	}

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
	 * Call event handlers.
	 *
	 * This function is registered as event listener by element.addEventListner(),
	 * so "this" is HTML element which triggered the event.
	 *
	 * @param	{Object}		e						Event parameter.
	 */
	static __callEventHandler(e)
	{

		let listeners = Util.safeGet(this, "_bm_detail.listeners." + e.type);
		let sender = Util.safeGet(e, "detail.sender", this);
		let target = Util.safeGet(this, "_bm_detail.component");

		// Check if handler is already running
		if (Util.safeGet(this, "_bm_detail.statuses." + e.type) == "handling")
		{
			throw new Error(`Event handler is already running. name=${this.tagName}, eventName=${e.type}`);
			return;
		}

		Util.safeSet(this, "_bm_detail.statuses." + e.type, "handling");

		if (Util.safeGet(e, "detail.async", true))
		{
			// call asynchronously
			this._bm_detail["promises"][e.type] = EventOrganizer.__handleAsync(e, sender, target, listeners);
			this._bm_detail["promises"][e.type].then(() => {
				Util.safeSet(this, "_bm_detail.promises." + e.type, null);
				Util.safeSet(this, "_bm_detail.statuses." + e.type, "");
			});
		}
		else
		{
			// call synchronously
			this._bm_detail["promises"][e.type] = EventOrganizer.__handleSync(e, sender, target, listeners);
			Util.safeSet(this, "_bm_detail.promises." + e.type, null);
			Util.safeSet(this, "_bm_detail.statuses." + e.type, "");
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Call event handlers asynchronously.
	 *
	 * @param	{Object}		e						Event parameter.
	 * @param	{Object}		sender					Sender object.
	 * @param	{Object}		target					Target component.
	 * @param	{Object}		listener				Listers info.
	 */
	static __handleAsync(e, sender, target, listeners)
	{

		let chain = Promise.resolve();
		let results = [];
		let stopPropagation = false;

		for (let i = 0; i < listeners.length; i++)
		{
			// Options set on addEventHandler()
			let ex = {
				"target": target,
				"options": ( listeners[i]["options"] ? listeners[i]["options"] : {} )
			}

			// Execute handler
			chain = chain.then((result) => {
				if (result)
				{
					results.push(result);
				}

				return listeners[i]["handler"](sender, e, ex);
			});

			stopPropagation = (listeners[i]["options"] && listeners[i]["options"]["stopPropagation"] ? true : stopPropagation)
		}

		if (stopPropagation)
		{
			e.stopPropagation();
		}

		return chain.then((result) => {
			if (result)
			{
				results.push(result);
			}

			return results;
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Call event handlers synchronously.
	 *
	 * @param	{Object}		e						Event parameter.
	 * @param	{Object}		sender					Sender object.
	 * @param	{Object}		target					Target component.
	 * @param	{Object}		listener				Listers info.
	 */
	static __handleSync(e, sender, target, listeners)
	{

		let stopPropagation = false;

		for (let i = 0; i < listeners.length; i++)
		{
			// Options set on addEventHandler()
			let ex = {
				"target": target,
				"options": ( listeners[i]["options"] ? listeners[i]["options"] : {} )
			}

			// Execute handler
			listeners[i]["handler"](sender, e, ex);

			stopPropagation = (listeners[i]["options"] && listeners[i]["options"]["stopPropagation"] ? true : stopPropagation)
		}

		if (stopPropagation)
		{
			e.stopPropagation();
		}

		return Promise.resolve();

	}

}
