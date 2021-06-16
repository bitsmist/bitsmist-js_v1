// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import Store from './store.js';
import Util from '../util/util';

// =============================================================================
//	Observer store class
// =============================================================================

export default class ObserverStore extends Store
{

	// -------------------------------------------------------------------------
	//  Method
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

		this._sortItems().forEach((id) => {
			chain = chain.then(() => {
				return this._callHandler(type, conditions, this._items[id], ...args);
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

		this._sortItems().forEach((id) => {
			this._callHandler(type, conditions, this._items[id], ...args);
		});

	}

	// -------------------------------------------------------------------------
	// 	Protected
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
	_callHandler(type, conditions, observerInfo, ...args)
	{

		if (this._filter(conditions, observerInfo, ...args))
		{
			if (typeof observerInfo["object"][type] === "function")
			{
				return observerInfo["object"][type].call(observerInfo["object"], conditions, ...args);
			}
			else
			{
				//throw TypeError(`Notification handler is not a function. name=${observerInfo["object"].name}, type=${type}`);
				//console.debug(`Notification handler is not a function. name=${observerInfo["object"].name}, type=${type}`);
			}
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Sort item keys.
	 *
	 * @param	{Object}		observerInfo		Observer info.
	 *
	 * @return  {Array}			Sorted keys.
	 */
	_sortItems()
	{

		return Object.keys(this._items).sort((a,b) => {
			return this._items[a]["order"] - this.items[b]["order"];
		})

	}

}
