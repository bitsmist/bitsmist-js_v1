// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import Util from '../util/util';

// =============================================================================
//	Event mixin class
// =============================================================================

export default class EventMixin
{

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
	 * Add an event handler.
	 *
	 * @param	{HTMLElement}	element					HTML element.
	 * @param	{String}		eventName				Event name.
	 * @param	{Object/Function/String}	eventInfo	Event info.
	 * @param	{Object}		options					Options passed to elements.
	 * @param	{Object}		bindTo					Object which binds to handler.
	 */
	static addEventHandler(element, eventName, eventInfo, options, bindTo)
	{

		// Get handler
		let handler = this.getEventHandler(eventInfo, bindTo);
		if (typeof handler !== "function")
		{
			let pluginName = ( bindTo ? bindTo.name : "" );
			throw TypeError(`Event handler is not a function. componentName=${this.name}, pluginName=${pluginName}, eventName=${eventName}`);
		}

		// Init holder object for the element
		if (!element._bm_detail)
		{
			element._bm_detail = { "component":this, "listeners":{}, "promises":{}, "statuses":{} };
		}

		// Add hook event handler
		let listeners = element._bm_detail.listeners;
		if (!listeners[eventName])
		{
			listeners[eventName] = [];
			element.addEventListener(eventName, this.__callEventHandler);
		}

		listeners[eventName].push({"handler":handler, "options":options, "bind":bindTo, "order":order});

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
	 * @param	{String}		eventName				Event name to trigger.
	 * @param	{Object}		sender					Object which triggered the event.
	 * @param	{Object}		options					Event parameter options.
	 */
	static trigger(eventName, sender, options, element)
	{

		options = Object.assign({}, options);
		options["eventName"] = eventName;
		options["sender"] = sender;
		element = ( element ? element : this );
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
	 * @param	{String}		eventName				Event name to trigger.
	 * @param	{Object}		sender					Object which triggered the event.
	 * @param	{Object}		options					Event parameter options.
	 */
	static triggerSync(eventName, sender, options, element)
	{

		options = options || {};
		options["async"] = false;

		return EventMixin.trigger.call(this, eventName, sender, options, element);

	}

	// -----------------------------------------------------------------------------

	/**
	 * Set html elements event handlers.
	 *
	 * @param	{String}		elementName			Element name.
	 * @param	{Options}		options				Options.
	 */
	static setHtmlEventHandlers(elementName, options, rootNode)
	{

		rootNode = ( rootNode ? rootNode : this );
		let elementInfo = this._settings.get("elements." + elementName);
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
				this.addEventHandler(elements[i], eventName, events[eventName], options);
			});
		}

	}

	// -----------------------------------------------------------------------------

	/**
	 * Get event handler from event info object.
	 *
	 * @param	{Object/Function/String}	eventInfo	Event info.
	 * @param	{Object}		bindTo					Object which binds to handler.
	 */
	static getEventHandler(eventInfo, bindTo, eventName)
	{

		bindTo = bindTo || this;
		let handler = ( typeof eventInfo === "object" ? eventInfo["handler"] : eventInfo );

		if ( typeof handler === "string" )
		{
			handler = ( bindTo ? bindTo[handler] : this[handler] );
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
			this._bm_detail["promises"][e.type] = EventMixin.__handleAsync(e, sender, target, listeners);
			this._bm_detail["promises"][e.type].then(() => {
				Util.safeSet(this, "_bm_detail.promises." + e.type, null);
				Util.safeSet(this, "_bm_detail.statuses." + e.type, "");
			});
		}
		else
		{
			// call synchronously
			this._bm_detail["promises"][e.type] = EventMixin.__handleSync(e, sender, target, listeners);
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
