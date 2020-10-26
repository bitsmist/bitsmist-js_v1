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
//	Store class
// =============================================================================

export default class Store
{

	// -------------------------------------------------------------------------
	//  Constructor
	// -------------------------------------------------------------------------

	/**
     * Constructor.
     *
	 * @param	{Object}		component			Component to attach.
	 * @param	{Object}		options				Options.
     */
	constructor(options, chain)
	{

		this._chain = Util.safeGet(options, "chain");
		this._items = Util.safeGet(options, "items", {});

	}

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	/**
	 * Items.
	 *
	 * @type	{String}
	 */
	get items()
	{

		let items;

		if (this._chain)
		{
			items = Object.assign({}, this._chain._items, this._items);
		}
		else
		{
			items = Object.assign({}, this._items);
		}

		return items;

	}

	set items(value)
	{

		this._items= value;

	}

	// -------------------------------------------------------------------------
	//  Method
	// -------------------------------------------------------------------------

	/**
     * Chain another store.
     *
	 * @param	{Object}		component			Component to attach.
	 * @param	{Object}		options				Plugin options.
     */
	chain(store)
	{

		this._chain = store;

	}

	// -------------------------------------------------------------------------

	/**
	 * Merge items.
	 *
	 * @param	{Object}		newItems			Items to merge.
	 *
	 * @return	{Promise}		Promise.
	 */
	merge(newItems)
	{

		if (newItems)
		{
			let items = (Array.isArray(newItems) ? newItems: [newItems]);

			for (let i = 0; i < items.length; i++)
			{
				Util.deepMerge(this._items, items[i]);
			}
		}

	}

	// -----------------------------------------------------------------------------

	/**
	* Get an value from store. Return default value when specified key is not available.
	* If chained, chained store is also considiered.
	*
	* @param	{String}		key					Key to get.
	* @param	{Object}		defaultValue		Value returned when key is not found.
	*
	* @return  {*}				Value.
	*/
	get(key, defaultValue)
	{

		return this._getChainedItem(this._chain, this, key, defaultValue);

	}

	// -----------------------------------------------------------------------------

	/**
	* Set an value to store.
	*
	* @param	{String}		key					Key to store.
	* @param	{Object}		value				Value to store.
	*/
	set(key, value)
	{

		Util.safeSet(this._items, key, value);

	}

	// -----------------------------------------------------------------------------

	/**
	* Check if the store has specified key.
	*
	* @param	{String}		key					Key to check.
	*
	* @return	{Boolean}		True:exists, False:not exists.
	*/
	has(key)
	{

		return Util.safeHas(this._items, key);

	}

	// -------------------------------------------------------------------------
	// 	Protected
	// -------------------------------------------------------------------------

	/**
	* Get an value from store. Return default value when specified key is not available.
	* Ignore chain.
	*
	* @param	{String}		key					Key to get.
	* @param	{Object}		defaultValue		Value returned when key is not found.
	*
	* @return  {*}				Value.
	*/
	_getLocal(key, defaultValue)
	{

		return Util.safeGet(this._items, key, defaultValue);

	}

	// -----------------------------------------------------------------------------

	/**
	* Get an value from stores. Return default value when specified key is not available.
	* If both store1 and store2 has the key, store2 precedes store1.
	*
	* @param	{String}		key					Key to get.
	* @param	{Object}		defaultValue		Value returned when key is not found.
	*
	* @return  {*}				Value.
	*/
	_getChainedItem(store1, store2, key, defaultValue)
	{

		let result = defaultValue;

		if (store2 && store2.has(key))
		{
			result = store2._getLocal(key);
		}
		else if (store1 && store1.has(key))
		{
			result = store1._getLocal(key);
		}

		return result;

	}

}
