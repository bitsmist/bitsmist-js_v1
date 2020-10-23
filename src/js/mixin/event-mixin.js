// =============================================================================
/**
 * Bitsmist WebView - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

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

		let order = (typeof eventInfo === "object" && eventInfo["order"] ? eventInfo["order"] : order);
		let listeners = ( element._bm_detail && element._bm_detail.listeners ? element._bm_detail.listeners : {} );

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
			element._bm_detail = { "component":this, "listeners":listeners, "promises":{} };
		}

		// Add hook event handler
		if (!listeners[eventName])
		{
			listeners[eventName] = [];
			element.addEventListener(eventName, this.__callEventHandler);
		}

		listeners[eventName].push({"handler":handler, "options":options, "bind":bindTo, "order":order});

		// Stable sort
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
		if (element._bm_detail && element._bm_detail["promises"] && element._bm_detail["promises"][eventName])
		{
			return element._bm_detail["promises"][eventName];
		}
		else
		{
			return Promise.resolve();
		}

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

		rootNode = ( rootNode ? rootNode : this._element );
		let elementInfo = this.settings.get("elements." + elementName);

		// Get target elements
		let elements;
		if (elementName == "_self")
		{
			elements = [rootNode];
		}
		else if (elementInfo["rootNode"])
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
		let handler;

		if ( typeof eventInfo === "object" )
		{
			handler = eventInfo["handler"];
		}
		else
		{
			handler = eventInfo;
		}

		if ( typeof handler === "string" )
		{
			if (bindTo)
			{
				handler = bindTo[handler];
			}
			else
			{
				handler = this[handler];
			}
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
	 * Call event handler.
	 *
	 * This function is registered as event listener to element.addEventListner(),
	 * so "this" is HTML element which triggered the event.
	 *
	 * @param	{Object}		e						Event parameter.
	 */
	static __callEventHandler(e)
	{

		let promise = new Promise((resolve, reject) => {
			let listeners = ( this._bm_detail && this._bm_detail["listeners"] ? this._bm_detail["listeners"][e.type] : [] );
			let sender = ( e.detail && e.detail.sender ? e.detail.sender : this );
			let stopPropagation = false;
			let chain = Promise.resolve();
			let results = [];

			for (let i = 0; i < listeners.length; i++)
			{
				// Options set on addEventHandler()
				e.extraDetail = ( listeners[i]["options"] ? listeners[i]["options"] : {} );

				// Execute handler
				chain = chain.then((result) => {
					if (result)
					{
						results.push(result);
					}

					return listeners[i]["handler"](sender, e);
				});

				stopPropagation = (listeners[i]["options"] && listeners[i]["options"]["stopPropagation"] ? true : stopPropagation)
			}

			if (stopPropagation)
			{
				e.stopPropagation();
			}

			chain.then((result) => {
				if (result)
				{
					results.push(result);
				}
				resolve(results);
			});
		});

		this._bm_detail["promises"][e.type] = promise;

	}

}
