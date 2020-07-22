// =============================================================================
/**
 * Bitsmist WebView - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import LoaderUtil from './util/loader-util';

// =============================================================================
//	Store class
// =============================================================================

//export default class Store extends BITSMIST.v1.Plugin
export default class Store
{

	// -------------------------------------------------------------------------
	//  Constructor
	// -------------------------------------------------------------------------

	/**
     * Constructor.
     *
	 * @param	{Object}		component			Component which the plugin
	 * 												is attached to.
	 * @param	{Object}		options				Options for the component.
     */
	constructor(component, options)
	{

//		super(component, options);

		this._component = component;
		this._options = Object.assign({}, options);
		this._items= (this._options["items"] ? this._options["items"] : {});

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
				LoaderUtil.deepMerge(this._items, items[i]);
			}
		}

	}

}
