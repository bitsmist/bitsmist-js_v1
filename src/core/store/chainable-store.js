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
		this._chain;

		// Chain
		let chain = Util.safeGet(this._options, "chain");
		if (chain)
		{
			this.chain(chain);
		}

	}

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	/**
	 * Local items.
	 *
	 * @type	{Object}
	 */
	get localItems()
	{

		return Store.prototype.clone.call(this);

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
			return Util.deepMerge(this._chain.clone(), this._items);
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
	 * @param	{Store}			store				Store to chain.
     */
	chain(store)
	{

		this._chain = store;

	}

	// -----------------------------------------------------------------------------

	/**
	 * Get the value from store. If chained, return from chained store when not available.
	 * Return default value when not available in both stores.
	 * When both has keys, then they are deep merged. Note that they are merged only when
	 * chain has mergeable value, an object or an array.
	 *
	 * @param	{String}		key					Key to get.
	 * @param	{Object}		defaultValue		Value returned when key is not found.
	 *
	 * @return  {*}				Value.
	 */
	get(key, defaultValue)
	{

		let result = defaultValue;

		if (Store.prototype.has.call(this, key) && this._chain && Store.prototype.has.call(this._chain, key))
		{
			// Both has key then deep merge
			result = Util.deepMerge(Store.prototype.get.call(this._chain, key), Store.prototype.get.call(this, key));
		}
		else if (Store.prototype.has.call(this, key))
		{
			// Only this has key
			result = Store.prototype.get.call(this, key, defaultValue);
		}
		else if (this._chain)
		{
			// Only chain has key
			result = this._chain.get(key, defaultValue);
		}

		return result;

	}

	// -------------------------------------------------------------------------

	/**
	 * Merge items.
	 *
	 * @param	{Array/Object}	newItems			Array/Object of Items to merge.
	 * @param	{Function}		merger				Merge function.
	 * @param	{Object}		options				Options.
	 */
	merge(newItems, merger, options)
	{

		if (Util.safeGet(options, "writeThrough", this._options["writeThrough"]))
		{
			this._chain.merge(newItems, merger);
		}
		else
		{
			Store.prototype.merge.call(this, newItems, merger);
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Set the value to the store. If key is empty, it sets the value to the root.
	 *
	 * @param	{String}		key					Key to store.
	 * @param	{Object}		value				Value to store.
	 * @param	{Object}		options				Options.
	 */
	set(key, value, options)
	{

		if (Util.safeGet(options, "writeThrough", this._options["writeThrough"]))
		{
			this._chain.set(key, value, options);
		}
		else
		{
			Store.prototype.set.call(this, key, value, options);
		}

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

		let result = Util.safeHas(this._items, key);

		if (result === false && this._chain)
		{
			result = this._chain.has(key);
		}

		return result;

	}

}
