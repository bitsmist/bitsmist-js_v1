// =============================================================================
/**
 * Bitsmist WebView - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import Plugin from './plugin';

// =============================================================================
//	Store class
// =============================================================================

export default class Store extends Plugin
{

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

		return this._items;

	}

	set items(value)
	{

		this._items= value;

	}

	// -------------------------------------------------------------------------
	//  Method
	// -------------------------------------------------------------------------

	/**
     * Init class.
     *
	 * @param	{Object}		component			Component to attach.
	 * @param	{Object}		options				Plugin options.
     */
	init(component, options)
	{

		super.init(component, options);

		this._items = (this._options["items"] ? this._options["items"] : {});

	}

	// -------------------------------------------------------------------------

	/**
	 * Load items.
	 *
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	load(options)
	{

		let sender = ( options && options["sender"] ? options["sender"] : this );

		return this._component.trigger(this._options["loadEvent"], sender);

	}

	// -------------------------------------------------------------------------

	/**
	 * Save items.
	 *
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	save(options)
	{

		let sender = ( options && options["sender"] ? options["sender"] : this );

		return this._component.trigger(this._options["saveEvent"], sender, {"preferences":this._items});

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
				this.deepMerge(this._items, items[i]);
			}
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Deep merge.
	 *
	 * @param	{Object}		arr1					Array1.
	 * @param	{Object}		arr2					Array2.
	 *
	 * @return  {Object}		Merged array.
	 */
	deepMerge(arr1, arr2)
	{

		Object.keys(arr2).forEach((key) => {
			if (arr1.hasOwnProperty(key) && typeof arr1[key] === 'object' && !(arr1[key] instanceof Array))
			{
				this.deepMerge(arr1[key], arr2[key]);
			}
			else
			{
				arr1[key] = arr2[key];
			}
		});

		return arr1;

	}

}
