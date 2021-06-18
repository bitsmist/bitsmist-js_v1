// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import Util from '../util/util';

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

		// Init vars
		this._filter;
		this._options = Object.assign({}, options);

		// Init
		this.items = Util.safeGet(options, "items");
		this.filter = Util.safeGet(options, "filter", () => { return true; } );
		this.merger = Util.safeGet(options, "merger", Util.deepMerge );

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

		return Object.assign({}, this._items);

	}

	set items(value)
	{

		this._items = Object.assign({}, value);

	}

	// -------------------------------------------------------------------------

	/**
	 * Filter function.
	 *
	 * @type	{Function}
	 */
	get filter()
	{

		this._filter;

	}

	set filter(value)
	{

		if (typeof value != "function")
		{
			throw TypeError(`Filter is not a function. filter=${value}`);
		}

		this._filter = value;

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

		if (typeof value != "function")
		{
			throw TypeError(`Merger is not a function. filter=${value}`);
		}

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
	 * Merge items.
	 *
	 * @param	{Array/Object}	newItems			Array/Object of Items to merge.
	 * @param	{Function}		merger				Merge function.
	 */
	merge(newItems, merger)
	{


		if (newItems)
		{
			merger = merger || this._merger;
			let items = (Array.isArray(newItems) ? newItems: [newItems]);

			for (let i = 0; i < items.length; i++)
			{
				merger(this._items, items[i]);
			}
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
	 * Set a value to store.
	 *
	 * @param	{String}		key					Key to store.
	 * @param	{Object}		value				Value to store.
	 */
	set(key, value)
	{

		Util.safeSet(this._items, key, value);

	}

	// -------------------------------------------------------------------------

	/**
	 * Set a value to store. Unlike set(), this merges with an existing value
	 * if the existing value is object, otherwise overwrites.
	 *
	 * @param	{String}		key					Key to store.
	 * @param	{Object}		value				Value to store.
	 */
	mergeSet(key, value)
	{

		let holder = this.get(key);

		if (typeof holder == "object")
		{
			Object.assign(holder, value);
		}
		else
		{
			this.set(key, value);
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

		delete this._items[key];

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
