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
	//  Private Variables
	// -------------------------------------------------------------------------

	#__options;
	#__merger;
	#__items;

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
		this.#__options = options || {};
		this.#__items = Util.safeGet(options, "items", {});
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

		return this.#__options;

	}

	set options(value)
	{

		this.#__options = value;

	}

	// -------------------------------------------------------------------------

	/**
	 * Items.
	 *
	 * @type	{String}
	 */
	get items()
	{

		return this.#__items;

	}

	set items(value)
	{

		this.#__items = value;

	}

	// -------------------------------------------------------------------------

	/**
	 * Merge function.
	 *
	 * @type	{Function}
	 */
	get merger()
	{

		return this.#__merger;

	}

	set merger(value)
	{

		Util.assert(typeof value === "function", `Store.merger(setter): Merger is not a function. merger=${value}`, TypeError);

		this.#__merger = value;

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

		this.#__items = {};

	}

	// -------------------------------------------------------------------------

	/**
     * Clone contents as an object.
     *
	 * @return  {Object}		Cloned items.
     */
	clone()
	{

		return Util.deepMerge({}, this.#__items);

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

		merger = merger || this.#__merger;
		let items = (Array.isArray(newItems) ? newItems: [newItems]);

		for (let i = 0; i < items.length; i++)
		{
			this.#__items = merger(this.#__items, items[i]);
		}

	}

	// -----------------------------------------------------------------------------

	/**
	 * Get the value from store. Return default value when specified key is not available.
	 *
	 * @param	{String}		key					Key to get.
	 * @param	{Object}		defaultValue		Value returned when key is not found.
	 *
	 * @return  {*}				Value.
	 */
	get(key, defaultValue)
	{

		return Util.safeGet(this.#__items, key, defaultValue);

	}

	// -----------------------------------------------------------------------------

	/**
	 * Set the value to the store. If key is empty, it sets the value to the root.
	 *
	 * @param	{String}		key					Key to store.
	 * @param	{Object}		value				Value to store.
	 */
	set(key, value, options)
	{

		Util.safeSet(this.#__items, key, value);

	}

	// -------------------------------------------------------------------------

	/**
	 * Remove from the list.
	 *
	 * @param	{String}		key					Key to store.
	 */
	remove(key)
	{

		Util.safeRemove(this.#__items, key);

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

		return Util.safeHas(this.#__items, key);

	}

}
