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
	//  Private Variables
	// -------------------------------------------------------------------------

	#__chain;

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

		// Chain
		let chain = Util.safeGet(this.options, "chain");
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

		return super.clone();

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

		if (this.#__chain)
		{
			return Util.deepMerge(this.#__chain.clone(), super.clone());
		}
		else
		{
			return super.clone();
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

		this.#__chain = store;

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

		if (super.has(key) && this.#__chain && super.has.call(this.#__chain, key))
		{
			// Both has key then deep merge
			result = Util.deepMerge(super.get.call(this.#__chain, key), super.get(key));
		}
		else if (super.has(key))
		{
			// Only this has key
			result = super.get(key, defaultValue);
		}
		else if (this.#__chain)
		{
			// Try chain
			result = this.#__chain.get(key, defaultValue);
		}

		return result;

	}

	// -------------------------------------------------------------------------

	/**
	 * Merge items.
	 *
	 * @param	{Array/Object}	newItems			Array/Object of Items to merge.
	 * @param	{Object}		options				Options.
	 */
	merge(newItems, options)
	{

		if (Util.safeGet(options, "writeThrough", this.options["writeThrough"]))
		{
			this.#__chain.merge(newItems, options);
		}
		else
		{
			super.merge(newItems, options);
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

		if (Util.safeGet(options, "writeThrough", this.options["writeThrough"]))
		{
			this.#__chain.set(key, value, options);
		}
		else
		{
			super.set(key, value, options);
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

		let result = super.has(key);

		if (result === false && this.#__chain)
		{
			result = this.#__chain.has(key);
		}

		return result;

	}

}
