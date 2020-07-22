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
	 * @param	{Object/String}	eventInfo				Event info.
	 * @param	{Object}		options					Options passed to elements.
	 * @param	{Object}		bindTo					Object which binds to handler.
	 */
	static addEventHandler(element, eventName, eventInfo, options, bindTo)
	{

		// Get handler
		let handler;
		let order = 0;
		if ( typeof eventInfo === "object" )
		{
			handler = (typeof eventInfo === "object" ? eventInfo["handler"] : eventInfo);
			order = (eventInfo["order"] ? eventInfo["order"] : order);
		}
		else
		{
			handler = eventInfo;
		}

		// Get listeners
		let listeners = ( element._bm_detail && element._bm_detail.listeners ? element._bm_detail.listeners : {} );

		// Init holder object for the element
		if (!element._bm_detail)
		{
			element._bm_detail = { "component":this, "listeners":listeners };
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
	static trigger(eventName, sender, options)
	{

		options = Object.assign({}, options);
		options["eventName"] = eventName;
		options["sender"] = sender;
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

		return this.__callEventHandler(e);

	}

	// -------------------------------------------------------------------------

	/**
	 * Trigger the HTML event.
	 *
	 * @param	{HTMLElement}	element					Html element.
	 * @param	{String}		eventName				Event name to trigger.
	 * @param	{Object}		sender					Object which triggered the event.
	 * @param	{Object}		options					Event parameter options.
	 */
	static triggerHtmlEvent(element, eventName, sender, options)
	{

		options = Object.assign({}, options);
		options["eventName"] = eventName;
		options["sender"] = sender;
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

		return new Promise((resolve, reject) => {
			let listeners = ( this._bm_detail && this._bm_detail["listeners"] ? this._bm_detail["listeners"][e.type] : undefined );
			let stopPropagation = false;
			let chain = Promise.resolve();
			let results = [];

			if (listeners)
			{
				let component = this._bm_detail["component"];

				for (let i = 0; i < listeners.length; i++)
				{
					// Get handler
					let handler = (typeof listeners[i]["handler"] === "string" ? component[listeners[i]["handler"]] : listeners[i]["handler"] );

					// Check handler
					if (typeof handler !== "function")
					{
						let pluginName = (listeners[i]["bind"] ? listeners[i]["bind"]._options["className"] : "");
						throw TypeError(`Event handler is not a function. componentName=${this.name}, pluginName=${pluginName}, eventName=${e.type}`);
					}

					// Bind handler
					if (listeners[i]["bind"])
					{
						handler = handler.bind(listeners[i]["bind"]);
					}

					// Execute handler
					chain = chain.then((result) => {
						if (result)
						{
							results.push(result);
						}
						e.extraDetail = ( listeners[i]["options"] ? listeners[i]["options"] : {} );
						return handler.call(component, this, e, listeners[i]["options"]);
					});

					stopPropagation = (listeners[i]["options"] && listeners[i]["options"]["stopPropagation"] ? true : stopPropagation)
				}
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

	}

}
