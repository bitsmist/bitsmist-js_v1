// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import Util from './util/util';

// =============================================================================
//	Observer class
// =============================================================================

export default class Observer
{

	// -------------------------------------------------------------------------
	//  Constructor
	// -------------------------------------------------------------------------

	/**
     * Constructor.
     *
	 * @param	{Object}		options				Options.
     */
	constructor(options)
	{

		// Init vars
		this._items = {};
		this._targeter = () => { return true; };

		// Init targeter
		if (options && options["targeter"])
		{
			if (typeof options["targeter"] != "function")
			{
				throw TypeError(`Targeter is not a function. targeter=${options["targeter"]}`);
			}

			this._targeter = options["targeter"];
		}

	}

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	/**
	 * observers.
	 *
	 * @type	{Object}
	 */
	get items()
	{

		return this._items;

	}

	// -------------------------------------------------------------------------
	//  Method
	// -------------------------------------------------------------------------

	/**
	 * Get an observer.
	 *
	 * @param	{String}		id					Id.
	 *
	 * @return  {Object}		ObserverInfo.
	 */
	get(id)
	{

		return Util.safeGet(this._items, id, {});

	}

	// -------------------------------------------------------------------------

	/**
	 * Register to the list.
	 *
	 * @param	{String}		id					Id.
	 * @param	{Object}		options				Options to store.
	 */
	register(id, options)
	{

		id = id || new Date().getTime().toString(16) + Math.floor(100*Math.random()).toString(16);

		if (!this._items[id])
		{
			this._items[id] = {};
		}

		// Store
		Object.assign(this._items[id], options);

	}

	// -------------------------------------------------------------------------

	/**
	 * Deregister from the list.
	 *
	 * @param	{String}		id					Id.
	 */
	deregister(id)
	{

		delete this._items[id];

	}

	// -------------------------------------------------------------------------

	/**
	 * Notify observers asynchronously.
	 *
	 * @param	{String}		type				Notification type(=methodname).
	 * @param	{Object}		conditions			Current conditions.
	 * @param	{Object}		...args				Arguments to callback function.
	 *
	 * @return  {Promise}		Promise.
	 */
	notify(type, conditions, ...args)
	{

		let chain = Promise.resolve();

		Object.keys(this._items).forEach((id) => {
			chain = chain.then(() => {
				return this.__callHandler(type, conditions, this._items[id], ...args);
			});
		});

		return chain;

	}

	// -------------------------------------------------------------------------

	/**
	 * Notify observers synchronously.
	 *
	 * @param	{String}		type				Notification type(=methodname).
	 * @param	{Object}		conditions			Current conditions.
	 * @param	{Object}		...args				Arguments to callback function.
	 */
	notifySync(type, conditions, ...args)
	{

		Object.keys(this._items).forEach((id) => {
			this.__callHandler(type, conditions, this._items[id], ...args);
		});

	}

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
	 * Call handler.
	 *
	 * @param	{String}		type				Notification type(=methodname).
	 * @param	{Object}		conditions			Current conditions.
	 * @param	{Object}		observerInfo		Observer info.
	 * @param	{Object}		...args				Arguments to callback function.
	 *
	 * @return  {Promise}		Promise.
	 */
	__callHandler(type, conditions, observerInfo, ...args)
	{

		if (this._targeter(conditions, observerInfo))
		{
			if (typeof observerInfo["object"][type] === "function")
			{
				return observerInfo["object"][type].call(observerInfo["object"], ...args);
			}
			else
			{
				throw TypeError(`Notification handler is not a function. name=${observerInfo["object"].name}, type=${type}`);
			}
		}

	}

}
