// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/main/LICENSE
 */
// =============================================================================

import Perk from "./perk.js";
import Util from "../util/util.js";

// =============================================================================
//	Event Perk class
// =============================================================================

export default class EventPerk extends Perk
{

	// -------------------------------------------------------------------------
	//  Private Variables
	// -------------------------------------------------------------------------

	static #__eventInfo = new WeakMap();
	static #__info = {
		"sectionName":		"event",
		"order":			210,
	};
	static #__skills = {
		"add":				EventPerk.#_addEventHandler,
		"remove":			EventPerk.#_removeEventHandler,
		"init":				EventPerk.#_initEvents,
		"reset":			EventPerk.#_removeEvents,
		"triggerSync":		EventPerk.#_triggerSync,
	};
	static #__spells = {
		"trigger":			EventPerk.#_trigger,
	};

	// -------------------------------------------------------------------------
	//  Properties
	// -------------------------------------------------------------------------

	static get info()
	{

		return EventPerk.#__info;

	}

	// -------------------------------------------------------------------------

	static get skills()
	{

		return EventPerk.#__skills;

	}

	// -------------------------------------------------------------------------

	static get spells()
	{

		return EventPerk.#__spells;

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static init(unit, options)
	{

		// Add event handlers
		unit.use("event.add", "doApplySettings", {"handler":EventPerk.#EventPerk_onDoApplySettings, "order":EventPerk.info["order"]});
		unit.use("event.add", "afterTransform", {"handler":EventPerk.#EventPerk_onAfterTransform, "order":EventPerk.info["order"]});

	}

	// -------------------------------------------------------------------------

	static deinit(unit, options)
	{

		let events = unit.get("setting", "event");
		if (events)
		{
			Object.keys(events).forEach((elementName) => {
				EventPerk.#_removeEvents(unit, elementName, events[eventName]);
			});
		}

	}

	// -------------------------------------------------------------------------
	//  Event Handlers (Unit)
	// -------------------------------------------------------------------------

	static #EventPerk_onDoApplySettings(sender, e, ex)
	{

		Object.entries(Util.safeGet(e.detail, "settings.event.events", {})).forEach(([sectionName, sectionValue]) => {
			EventPerk.#_initEvents(this, sectionName, sectionValue);
		});

	}

	// -------------------------------------------------------------------------

	static #EventPerk_onAfterTransform(sender, e, ex)
	{

		Object.entries(this.get("setting", "event.events", {})).forEach(([sectionName, sectionValue]) => {
			// Initialize only elements inside unit
			if (!EventPerk.#__isTargetSelf(sectionName, sectionValue))
			{
				EventPerk.#_initEvents(this, sectionName, sectionValue);
			}
		});

	}

	// -------------------------------------------------------------------------
	//  Skills (Unit)
	// -------------------------------------------------------------------------

	/**
	 * Add an event handler.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{String}		eventName			Event name.
	 * @param	{Object/Function/String}	handlerInfo	Event handler info.
	 * @param	{HTMLElement}	element				HTML element.
	 * @param	{Object}		bindTo				Object that binds to the handler.
	 */
	static #_addEventHandler(unit, eventName, handlerInfo, element, bindTo)
	{

		element = element || unit;
		let handlerOptions = (typeof handlerInfo === "object" ? handlerInfo : {});

		// Get handler
		let handler = EventPerk.#__getEventHandler(unit, handlerInfo);
		Util.assert(handler, () => `EventPerk.#_addEventHandler(): handler not found. name=${unit.tagName}, eventName=${eventName}`);

		// Init event info object for the element
		if (!EventPerk.#__eventInfo.get(element))
		{
			EventPerk.#__eventInfo.set(element, {"unit":unit, "listeners":{}, "promises":{}, "statuses":{}});
		}

		// Add hook event handler
		let listeners = EventPerk.#__eventInfo.get(element)["listeners"];
		if (!listeners[eventName])
		{
			listeners[eventName] = [];
			element.addEventListener(eventName, EventPerk.#__callEventHandler, handlerOptions["listnerOptions"]);
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
	 * @param	{Unit}			unit				Unit.
	 * @param	{String}		eventName			Event name.
	 * @param	{HTMLElement}	element				HTML element.
	 * @param	{Object/Function/String}	handlerInfo	Event handler info.
	 */
	static #_removeEventHandler(unit, eventName, handlerInfo, element)
	{

		element = element || unit;

		// Get handler
		let handler = EventPerk.#__getEventHandler(unit, handlerInfo);
		Util.assert(handler, () => `EventPerk.#_removeEventHandler(): handler not found. name=${unit.tagName}, eventName=${eventName}`);

		let listeners = Util.safeGet(EventPerk.#__eventInfo.get(element), `.listeners.${eventName}`);
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
	 * @param	{Unit}			unit				Unit.
	 * @param	{String}		elementName			Element name.
	 * @param	{Object}		eventInfo			Event info.
	 * @param	{HTMLElement}	rootNode			Root node of elements.
	 */
	static #_initEvents(unit, elementName, eventInfo, rootNode)
	{

		eventInfo = ( eventInfo ? eventInfo : unit.get("setting", `event.events.${elementName}`) );

		// Get target elements
		let elements = EventPerk.#__getTargetElements(unit, rootNode, elementName, eventInfo);
		//Util.warn(elements.length > 0, `EventPerk.#_initEvents: No elements for the event found. name=${unit.tagName}, elementName=${elementName}`);

		// Set event handlers
		Object.keys(eventInfo["handlers"]).forEach((eventName) => {
			let handlers = ( Array.isArray(eventInfo["handlers"][eventName]) ? eventInfo["handlers"][eventName] : [eventInfo["handlers"][eventName]] );
			for (let i = 0; i < handlers.length; i++)
			{
				for (let j = 0; j < elements.length; j++)
				{
					EventPerk.#_addEventHandler(unit, eventName, handlers[i], elements[j]);
				}
			}
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Remove event handlers from the element.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{String}		elementName			Element name.
	 * @param	{Object}		eventInfo			Event info.
	 * @param	{HTMLElement}	rootNode			Root node of elements.
	 */
	static #_removeEvents(unit, elementName, eventInfo, rootNode)
	{

		eventInfo = ( eventInfo ? eventInfo : unit.get("setting", `event.events.${elementName}`) );

		// Get target elements
		let elements = EventPerk.#__getTargetElements(unit, rootNode, elementName, eventInfo);
		//Util.warn(elements.length > 0, `EventPerk.#_removeEvents: No elements for the event found. name=${unit.tagName}, elementName=${elementName}`);

		// Remove event handlers
		Object.keys(eventInfo["handlers"]).forEach((eventName) => {
			let handlers = ( Array.isArray(eventInfo["handlers"][eventName]) ? eventInfo["handlers"][eventName] : [eventInfo["handlers"][eventName]] );
			for (let i = 0; i < handlers.length; i++)
			{
				for (let j = 0; j < elements.length; j++)
				{
					unit.removeEventHandler(eventName, handlers[i], elements[j]);
				}
			}
		});

	}

	// -------------------------------------------------------------------------
	//  Spells (Unit)
	// -------------------------------------------------------------------------

	/**
	 * Trigger the event synchronously.
	 *
	 * @param	{Unit}			unit					Unit.
	 * @param	{String}		eventName				Event name to trigger.
	 * @param	{Object}		options					Event parameter options.
	 * @param	{HTMLElement}	element					HTML element.
	 */
	static #_trigger(unit, eventName, options, element)
	{

		options = options || {};
		element = ( element ? element : unit );

		element.dispatchEvent(new CustomEvent(eventName, { detail: options }));

		// return the promise if exists
		return Util.safeGet(EventPerk.#__eventInfo.get(element), `promises.${eventName}`) || Promise.resolve();

	}

	// -------------------------------------------------------------------------

	/**
	 * Trigger the event synchronously.
	 *
	 * @param	{Unit}			unit					Unit.
	 * @param	{String}		eventName				Event name to trigger.
	 * @param	{Object}		options					Event parameter options.
	 * @param	{HTMLElement}	element					HTML element.
	 */
	static #_triggerSync(unit, eventName, options, element)
	{

		options = options || {};
		options["async"] = true;

		return EventPerk.#_trigger(unit, eventName, options, element);

	}

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
	 * Get the event handler from the handler info object.
	 *
	 * @param	{Unit}			unit					Unit.
	 * @param	{Object/Function/String}	handlerInfo	Handler info.
	 */
	static #__getEventHandler(unit, handlerInfo)
	{

		let handler = ( typeof handlerInfo === "object" ? handlerInfo["handler"] : handlerInfo );

		return handler;

	}

	// -------------------------------------------------------------------------

	/**
	 * Check if the target element is unit itself.
	 *
	 * @param	{String}		elementName			Element name.
	 * @param	{Object}		elementInfo			Element info.
	 *
	 * @return 	{Boolean}		Target node list.
	 */
		static #__isTargetSelf(elementName, eventInfo)
	{

		let ret = false;

		if (elementName === "this" || eventInfo && eventInfo["selector"] === "this")
		{
			ret = true;
		}

		return ret;

	}

	// -------------------------------------------------------------------------

	/**
	 * Get target elements for the eventInfo.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{HTMLElement}	rootNode			Root node to search elements.
	 * @param	{String}		elementName			Element name.
	 * @param	{Object}		elementInfo			Element info.
	 *
	 * @return 	{Array}			Target node list.
	 */
	static #__getTargetElements(unit, rootNode, elementName, eventInfo)
	{

		rootNode = rootNode || unit;
		let elements;

		if (EventPerk.#__isTargetSelf(elementName, eventInfo))
		{
			// Target is "this"
			elements = [rootNode];
		}
		else if (eventInfo && eventInfo["selector"])
		{
			// If eventInfo["selector"] is specified, target is eventInfo["selector"]
			elements = Util.scopedSelectorAll(rootNode, eventInfo["selector"]);
		}
		else
		{
			// Target is #elementName
			elements = Util.scopedSelectorAll(rootNode, `#${elementName}`);
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
	static #__isHandlerInstalled(element, eventName, handler)
	{

		let isInstalled = false;
		let listeners = Util.safeGet(EventPerk.#__eventInfo.get(element), `listeners.${eventName}`);

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
	static #__callEventHandler(e)
	{

		let eventInfo = EventPerk.#__eventInfo.get(this);
		let listeners = Util.safeGet(eventInfo, `listeners.${e.type}`);
		let sender = Util.safeGet(e, "detail.sender", this);
		let unit = Util.safeGet(eventInfo, "unit");
		let templateStatuses = `statuses.${e.type}`;
		let templatePromises = `promises.${e.type}`;

		// Check if handler is already running
		//Util.warn(Util.safeGet(this, templateStatuses) !== "handling", `EventPerk.#__callEventHandler(): Event handler is already running. name=${this.tagName}, eventName=${e.type}`);

		Util.safeSet(eventInfo, templateStatuses, "handling");

		if (Util.safeGet(e, "detail.async", false) === false)
		{
			// Async
			eventInfo["promises"][e.type] = EventPerk.#__handle(e, sender, unit, listeners).then(() => {
				Util.safeSet(eventInfo, templatePromises, null);
				Util.safeSet(eventInfo, templateStatuses, "");
			}).catch((err) => {
				Util.safeSet(eventInfo, templatePromises, null);
				Util.safeSet(eventInfo, templateStatuses, "");
				throw(err);
			});
		}
		else
		{
			// Sync
			try
			{
				eventInfo["promises"][e.type] = EventPerk.#__handleSync(e, sender, unit, listeners);
				Util.safeSet(eventInfo, templatePromises, null);
				Util.safeSet(eventInfo, templateStatuses, "");
			}
			catch (err)
			{
				Util.safeSet(eventInfo, templatePromises, null);
				Util.safeSet(eventInfo, templateStatuses, "");
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
	 * @param	{Object}		unit					Target unit.
	 * @param	{Object}		listener				Listers info.
	 */
	static #__handle(e, sender, unit, listeners)
	{

		let chain = Promise.resolve();
		let stopPropagation = false;

		for (let i = 0; i < listeners.length; i++)
		{
			// Options set in addEventHandler()
			let ex = {
				"unit": unit,
				"options": ( listeners[i]["options"] ? listeners[i]["options"] : {} )
			}

			chain = chain.then(() => {
				// Get the handler
				let handler = listeners[i]["handler"];
				handler = ( typeof handler === "string" ? unit[handler] : handler );
				Util.assert(typeof handler === "function", () => `EventPerk.#__handle(): Event handler is not a function. name=${unit.tagName}, eventName=${e.type}`, TypeError);

				// Execute the handler
				let bindTo = ( listeners[i]["bindTo"] ? listeners[i]["bindTo"] : unit );
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
	 * Call event handlers Synchronously.
	 *
	 * @param	{Object}		e						Event parameter.
	 * @param	{Object}		sender					Sender object.
	 * @param	{Object}		unit					Target unit.
	 * @param	{Object}		listener				Listers info.
	 */
	static #__handleSync(e, sender, unit, listeners)
	{

		let stopPropagation = false;

		for (let i = 0; i < listeners.length; i++)
		{
			// Options set on addEventHandler()
			let ex = {
				"unit": unit,
				"options": ( listeners[i]["options"] ? listeners[i]["options"] : {} )
			}

			// Get the handler
			let handler = listeners[i]["handler"];
			handler = ( typeof handler === "string" ? unit[handler] : handler );
			Util.assert(typeof handler === "function", () => `EventPerk.#__handleSync(): Event handler is not a function. name=${unit.tagName}, eventName=${e.type}`, TypeError);

			// Execute handler
			let bindTo = ( listeners[i]["bindTo"] ? listeners[i]["bindTo"] : unit );
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
