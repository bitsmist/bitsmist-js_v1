// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import Util from "../util/util.js";

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
	 * @param	{Object}		options				Options.
     */
	constructor(options)
	{

		// Init
		this.options = options || {};
		this.items = Util.safeGet(options, "items", {});
		this.merger = Util.safeGet(options, "merger", Util.deepMerge);

	}

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	/**
	 * Options.
	 *
	 * @type	{Object}
	 */
	get options()
	{

		return this._options;

	}

	set options(value)
	{

		this._options = Util.deepMerge({}, value);

	}

	// -------------------------------------------------------------------------

	/**
	 * Items.
	 *
	 * @type	{String}
	 */
	get items()
	{

		return this.clone();

	}

	set items(value)
	{

		this._items = Util.deepMerge({}, value);

	}

	// -------------------------------------------------------------------------

	/**
	 * Merge function.
	 *
	 * @type	{Function}
	 */
	get merger()
	{

		this._merger;

	}

	set merger(value)
	{

		Util.assert(typeof value === "function", `Store.merger(setter): Merger is not a function. merger=${value}`, TypeError);

		this._merger = value;

	}

	// -------------------------------------------------------------------------
	//  Method
	// -------------------------------------------------------------------------

	/**
     * Clear.
     *
	 * @param	{Object}		component			Component to attach.
	 * @param	{Object}		options				Plugin options.
     */
	clear()
	{

		this._items = {};

	}

	// -------------------------------------------------------------------------

	/**
     * Clone contents as an object.
     *
	 * @return  {Object}		Cloned items.
     */
	clone()
	{

		return Util.deepMerge({}, this._items);

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

		merger = merger || this._merger;
		let items = (Array.isArray(newItems) ? newItems: [newItems]);

		for (let i = 0; i < items.length; i++)
		{
			this._items = merger(this._items, items[i]);
		}

	}

	// -----------------------------------------------------------------------------

	/**
	 * Get a value from store. Return default value when specified key is not available.
	 *
	 * @param	{String}		key					Key to get.
	 * @param	{Object}		defaultValue		Value returned when key is not found.
	 *
	 * @return  {*}				Value.
	 */
	get(key, defaultValue)
	{

		return Util.safeGet(this._items, key, defaultValue);

	}

	// -----------------------------------------------------------------------------

	/**
	 * Set a value to the store. If key is empty, it sets the value to the root.
	 *
	 * @param	{String}		key					Key to store.
	 * @param	{Object}		value				Value to store.
	 */
	set(key, value, options)
	{

		if (options && options["merge"])
		{
			return Util.safeMerge(this._items, key, defaultValue);
		}
		else
		{
			Util.safeSet(this._items, key, value);
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Remove from the list.
	 *
	 * @param	{String}		key					Key to store.
	 */
	remove(key)
	{

		Util.safeRemove(this._items, key);

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

}
