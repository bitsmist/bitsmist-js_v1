// =============================================================================
/**
 * Bitsmist WebView - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import {NotValidFunctionError} from '../error/errors';

// =============================================================================
//	Event handler class
// =============================================================================

export default class EventHandler
{

	// -------------------------------------------------------------------------
	//  Constructor
	// -------------------------------------------------------------------------

	/**
     * Constructor.
     *
     * @param	{Object}		component				Component.
     */
	constructor(component)
	{

		this.component = component;
		this.container = this.component.container;
	//	this.events = new EventTarget();
		this.callbacks = {};

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
	 * Add event handlers.
	 * Events can be specified by space delimited string.
	 *
	 * @param	{string}		events				Events.
	 * @param	{function}		callback			Function called when the event triggered.
	 */
	/*
	addEventHandler(event, callback)
	{

		if (typeof callback === "function")
		{
			this.addEventListener("event", callback);
		}
		else
		{
			throw new NotValidFunctionError(`Event handler is not a function. name=${this.component.name}, events=${events}`);
		}

	}
	*/

	addEventHandler(events, callback)
	{

		if (typeof callback === "function")
		{
			let e = events.split(" ");
			for (let i = 0;  i < e.length; i++)
			{
				if (!this.callbacks[e[i]])
				{
					this.callbacks[e[i]] = [];
				}
				this.callbacks[e[i]].push(callback);
			}
		}
		else
		{
			throw new NotValidFunctionError(`Event handler is not a function. name=${this.component.name}, events=${events}`);
		}

	}

	// -------------------------------------------------------------------------

	/**
     * Add an Html event handler.
	 *
	 * @param	{Object}		element					HTML element.
	 * @param	{string}		eventName				Event name.
	 * @param	{Object}		origin					Object which set this event.
	 * @param	{function}		handler					Event handler.
	 * @param	{Object}		options					Options passed to elements.
     */
	addHtmlEventHandler(element, eventName, origin, handler, options)
	{

		if (typeof handler === "function")
		{
			element.addEventListener(eventName, this.__callNativeEventHandler);
			element.detail = { "origin": origin, "handler": handler, "options":options };
		}
		else
		{
			throw new NotValidFunctionError(`Event handler is not a function. name=${this.component.name}, eventName=${eventName}, element=${element.id}`);
		}

	}

    // -------------------------------------------------------------------------

	/**
	 * Clear event handlers for the event.
	 *
	 * @param	{string}		eventName				Event name.
	 */
	clearEventHandler(eventName)
	{

		this.callbacks[eventName] = null;

	}

    // -------------------------------------------------------------------------

	/**
	 * Get event handlers count for the event.
	 *
	 * @param	{string}		eventName				Event name.
	 *
	 * @return  {integer}		Event handlers count.
	 */
	getCount(eventName)
	{

		let ret = 0;

		if (eventName in this.callbacks)
		{
			ret = this.callbacks[eventName].length
		}

		return ret;

	}

    // -------------------------------------------------------------------------

	/**
	 * Trigger the event.
	 *
	 * @param	{string}		eventName				Event name to trigger.
	 * @param	{object}		sender					Object which triggered the event.
	 * @param	{array}			options					Event parameter options.
	 */
	/*
	trigger(eventName, sender, options)
	{

		options = options || {};
		options["component"] = sender;
		options["eventName"] = eventName;
		let e = null;

		try
		{
			e = new CustomEvent(eventName);
		}
		catch(error)
		{
			e  = document.createEvent('CustomEvent');
			e.initCustomEvent(eventName, false, false);
		}

		return this.__callEventHandler(eventName, e, options);

	}
	*/

	trigger(eventName, sender, options)
	{

		options = options || {};
		options["component"] = sender;
		options["eventName"] = eventName;
		let e = null;

		try
		{
			e = new CustomEvent(eventName);
		}
		catch(error)
		{
			e  = document.createEvent('CustomEvent');
			e.initCustomEvent(eventName, false, false);
		}

		return this.__callEventHandler(eventName, e, options);

	}

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
	 * Call event handlers for the event.
	 *
	 * @param	{string}		eventName				Event name.
	 * @param	{object}		e						Event parameter.
	 *
	 * @return  {Promise}		Promise.
	 */
	__callEventHandler(eventName, e, options)
	{

		return new Promise((resolve, reject) => {
			let chain = Promise.resolve();

			if (this.callbacks[eventName])
			{
				for (let i = 0; i < this.callbacks[eventName].length; i++)
				{
					console.debug(`EventHandler.__callEventHandler(): Calling event handler. name=${this.component.name}, eventName=${eventName}, index=${i}`);

					chain = chain.then(() => {
						return (this.callbacks[eventName][i]).call(this.component, this.component, e, options);
					});
				}
			}

			chain.then(() => {
				resolve();
			});
		});

	}

    // -------------------------------------------------------------------------

	/**
	 * Call event handlers for the HTML element.
	 * This function is called by native javascript, so "this" is bind to a caller element.
	 *
	 * @param	{object}		e						Event parameter.
	 */
	__callNativeEventHandler(e)
	{

		this.detail["handler"].call(this.detail["origin"], this, e, this.detail.options);

		if (!this.detail["propagate"])
		{
			e.stopPropagation();
		}

	}


}
