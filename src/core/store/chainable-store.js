// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import Store from "./store.js";
import Util from "../util/util.js";

// =============================================================================
//	Chainable store class
// =============================================================================

export default class ChainableStore extends Store
{

	// -------------------------------------------------------------------------
	//  Constructor
	// -------------------------------------------------------------------------

	/**
     * Constructor.
     *
	 * @param	{Object}		options				Options.
	 * @param	{Store}			chain				Store Component to chain.
     */
	constructor(options)
	{

		super(options);

		// Init vars
		this.chain;

		// Chain
		let chain = Util.safeGet(options, "chain");
		if (chain)
		{
			this.chain(chain);
		}

	}

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	/**
	 * Items (Override).
	 *
	 * @type	{Object}
	 */
	get items()
	{

		let items;

		if (this._chain)
		{
			items = Util.deepClone(this._chain.clone(), this._items);
		}
		else
		{
			items = this.clone();
		}

		return items;

	}

	set items(value)
	{

		this._items = Object.assign({}, value);

	}

	// -------------------------------------------------------------------------

	/**
	 * Local items.
	 *
	 * @type	{Object}
	 */
	get localItems()
	{

		return this.clone();

	}

	// -------------------------------------------------------------------------
	//  Method
	// -------------------------------------------------------------------------

	/**
     * Clone contents as an object (Override).
     *
	 * @return  {Object}		Cloned items.
     */
	clone()
	{

		if (this._chain)
		{
			return Util.deepClone(this._chain.clone(), this._items);
		}
		else
		{
			return Store.prototype.clone.call(this);
		}

	}

	// -------------------------------------------------------------------------

	/**
     * Chain another store.
     *
	 * @param	{Object}		component			Component to attach.
	 * @param	{Object}		options				Plugin options.
     */
	chain(store)
	{

		Util.assert(store instanceof ChainableStore, "ChainableStore.chain(): Parameter must be a ChainableStore.", TypeError);

		this._chain = store;

	}

	// -----------------------------------------------------------------------------

	/**
	 * Get a value from store. Return default value when specified key is not available.
	 * If chained, chained store is also considiered (Override).
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

	// -------------------------------------------------------------------------

	/**
	 * Set a value to the store. If key is empty, it sets the value to the root.
	 *
	 * @param	{String}		key					Key to store.
	 * @param	{Object}		value				Value to store.
	 */
	set(key, value, options)
	{

		let holder = ( key ? this._getLocal(key) : this._items );

		if (typeof holder === "object")
		{
			Util.deepMerge(holder, value);
		}
		else
		{
			Util.safeSet(this._items, key, value);
		}

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
		else if (store1)
		{
			result = store1.get(key, defaultValue);
		}

		return result;

	}

}
