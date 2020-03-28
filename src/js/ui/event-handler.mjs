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
		this.listeners = {};

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
	addEventHandler(events, handler)
	{

		if (typeof handler === "function")
		{
			let e = events.split(" ");
			for (let i = 0;  i < e.length; i++)
			{
				if (!this.listeners[e[i]])
				{
					this.listeners[e[i]] = [];
				}
				this.listeners[e[i]].push(handler);
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
	 * @param	{HTMLElement}	element					HTML element.
	 * @param	{String}		eventName				Event name.
	 * @param	{Function}		handler					Event handler.
	 * @param	{Object}		options					Options passed to elements.
     */
	addHtmlEventHandler(element, eventName, handler, options)
	{

		if (typeof handler === "function")
		{
			let listeners;

			if (!element.detail || !element.detail.listeners)
			{
				listeners = {};
				element.detail = { "origin": this.component, "listeners": listeners };
			}
			else
			{
				listeners = element.detail.listeners;
			}

			if (!listeners[eventName])
			{
				listeners[eventName] = [];
				element.addEventListener(eventName, this.__callHtmlEventHandler);
			}

			listeners[eventName].push({"handler":handler, "options":options});
		}
		else
		{
			throw new NotValidFunctionError(`Event handler is not a function. name=${this.component.name}, eventName=${eventName}, element=${element.id}`);
		}

	}

    // -------------------------------------------------------------------------

	/**
	 * Remove an event handlers for the event.
	 *
	 * @param	{String}		eventName				Event name.
	 * @param	{Function}		handler					Handler to remove.
	 */
	removeEventHandler(eventName, handler)
	{

		if (type in this.listeners)
		{
			for (let i = 0; i < this.listeners[type].length; i++)
			{
				if (this.listeners[type][i] === listener)
				{
					this.listeners[type].splice(i, 1);
					return;
				}
			}
		}

	}

    // -------------------------------------------------------------------------

	/**
	 * Trigger the event.
	 *
	 * @param	{String}		eventName				Event name to trigger.
	 * @param	{Object}		sender					Object which triggered the event.
	 * @param	{Object}		options					Event parameter options.
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
			e.initCustomEvent(eventName, false, false, null);
		}

		return this.__callEventHandler(eventName, e, options);

	}

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
	 * Call event handlers for the event.
	 *
	 * @param	{String}		eventName				Event name.
	 * @param	{Object}		e						Event parameter.
	 *
	 * @return  {Promise}		Promise.
	 */
	__callEventHandler(eventName, e, options)
	{

		return new Promise((resolve, reject) => {
			let chain = Promise.resolve();

			if (this.listeners[eventName])
			{
				for (let i = 0; i < this.listeners[eventName].length; i++)
				{
					console.debug(`EventHandler.__callEventHandler(): Calling event handler. name=${this.component.name}, eventName=${eventName}, index=${i}`);

					chain = chain.then(() => {
						return (this.listeners[eventName][i]).call(this.component, this.component, e, options);
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
	 * @param	{Object}		e						Event parameter.
	 */
	__callHtmlEventHandler(e)
	{

		let component = this.detail["origin"];
		let listeners = this.detail["listeners"][e.type];
		let stopPropagation = false;
		if (listeners)
		{
			for (let i = 0; i < listeners.length; i++)
			{
				listeners[i]["handler"].call(component, this, e, listeners[i]["options"]);
				if (listeners[i]["options"] && listeners[i]["options"]["stopPropagation"])
				{
					stopPropagation = true;
				}
			}
		}

		if (stopPropagation)
		{
			e.stopPropagation();
		}

	}

}
