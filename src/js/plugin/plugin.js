// =============================================================================
/**
 * Bitsmist WebView - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

// =============================================================================
//	Plugin base class
// =============================================================================

// -----------------------------------------------------------------------------
//  Constructor
// -----------------------------------------------------------------------------

/**
 * Constructor.
 *
 * @param	{Object}		options				Options for the component.
 */
export default class Plugin
{

	/**
     * Constructor.
     *
	 * @param	{Object}		component			Component to attach.
	 * @param	{Object}		options				Options.
     */
	constructor(component, options)
	{

		this.init(component, options);

	}

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	/**
	* Component.
	*
	* @type	{String}
	*/
	get component()
	{

		return this._component;

	}

	set component(value)
	{

		this._component = value;

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

		this._options = Object.assign({}, this._options, options);
		this._component = component
		this._events = this.getOption("events", {});

	}

	// -----------------------------------------------------------------------------

	/**
	* Get option value. Return default value when specified key is not available.
	*
	* @param	{String}		key					Key to get.
	* @param	{Object}		defaultValue		Value returned when key is not found.
	*
	* @return  {*}				Value.
	*/
	getOption(key, defaultValue)
	{

		return this._safeGet(this._options, key, defaultValue);

	}

	// -------------------------------------------------------------------------
	//  Protected
	// -------------------------------------------------------------------------

	/**
	* Get an value from store. Return default value when specified key is not available.
	*
	* @param	{String}		key					Key to get.
	* @param	{Object}		defaultValue		Value returned when key is not found.
	*
	* @return  {*}				Value.
	*/
	_safeGet(store, key, defaultValue)
	{

		let result = defaultValue;

		let found = true;
		let items = key.split(".");
		for (let i = 0; i < items.length; i++)
		{
			if (items[i] in store)
			{
				store = store[items[i]];
			}
			else
			{
				found = false;
				break;
			}
		}

		if (found)
		{
			result = store;
		}

		return result;

	}

	// -----------------------------------------------------------------------------

	/**
	* Set an value to store.
	*
	* @param	{String}		key					Key to store.
	* @param	{Object}		value				Value to store.
	*/
	_safeSet(store, key, value)
	{

		let items = key.split(".");
		for (let i = 0; i < items.length - 1; i++)
		{
			if (!(items[i] in store))
			{
				store[items[i]] = {}
			}
			store = store[items[i]];
		}

		store[items[items.length - 1]] = value;

	}

	// -----------------------------------------------------------------------------

	/**
	* Check if the store has specified key.
	*
	* @param	{String}		key					Key to check.
	*
	* @return	{Boolean}		True:exists, False:not exists.
	*/
	_safeHas(store, key)
	{

		let found = true;
		let items = key.split(".");
		for (let i = 0; i < items.length; i++)
		{
			if (items[i] in store)
			{
				store = store[items[i]];
			}
			else
			{
				found = false;
				break;
			}
		}

		return found;

	}

}


