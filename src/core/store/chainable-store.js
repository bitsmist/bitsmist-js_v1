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

		Util.assert(store instanceof ChainableStore, `ChainableStore.chain(): "store" parameter must be a ChainableStore.`, TypeError);

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

		let result = defaultValue;

		if (this.has(key))
		{
			result = Store.prototype.get.call(this, key, defaultValue);
		}
		else if (this._chain)
		{
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
	 */
	merge(newItems, merger)
	{

		if (this._options["writeThrough"])
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
	 * Set a value to the store. If key is empty, it sets the value to the root.
	 *
	 * @param	{String}		key					Key to store.
	 * @param	{Object}		value				Value to store.
	 */
	set(key, value, options)
	{

		if (Util.safeGet(options, "writeThrough", this._options["writeThrough"]))
		{
			this._chain.set(key, value, options);
		}
		else
		{
			Store.prototype.set.call(this, key, value);
		}

	}

}
