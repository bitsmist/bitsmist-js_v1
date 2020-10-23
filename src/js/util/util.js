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
//	Util class
// =============================================================================

export default class Util
{

	/**
	* Get an value from store. Return default value when specified key is not available.
	*
	* @param	{Object}		store				Object which holds keys/values.
	* @param	{String}		key					Key to get.
	* @param	{Object}		defaultValue		Value returned when key is not found.
	*
	* @return  {*}				Value.
	*/
	static safeGet(store, key, defaultValue)
	{

		let result = defaultValue;

		let current = store;
		let found = true;
		let items = key.split(".");
		for (let i = 0; i < items.length; i++)
		{
			if (typeof current === "object" && items[i] in current)
			{
				current = current[items[i]];
			}
			else
			{
				found = false;
				break;
			}
		}

		if (found)
		{
			result = current;
		}

		return result;

	}

	// -----------------------------------------------------------------------------

	/**
	* Set an value to store.
	*
	* @param	{Object}		store				Object which holds keys/values.
	* @param	{String}		key					Key to store.
	* @param	{Object}		value				Value to store.
	*/
	static safeSet(store, key, value)
	{

		let prevKey;
		let current = store;
		let items = key.split(".");
		for (let i = 0; i < items.length - 1; i++)
		{
			if (typeof current === "object" && !(items[i] in current))
			{
				current[items[i]] = {}
			}
			else if (typeof current !== "object")
			{
				throw new TypeError(`Key already exists. key=${key}, existingKey=${prevKey}, existingValue=${current}`);
			}

			prevKey = items[i];
			current = current[items[i]];
		}

		if (typeof current !== "object")
		{
			throw new TypeError(`Key already exists. key=${key}, existingKey=${prevKey}, existingValue=${current}`);
		}

		current[items[items.length - 1]] = value;

		return store;

	}

	// -----------------------------------------------------------------------------

	/**
	* Check if the store has specified key.
	*
	* @param	{Object}		store				Store.
	* @param	{String}		key					Key to check.
	*
	* @return	{Boolean}		True:exists, False:not exists.
	*/
	static safeHas(store, key)
	{

		let current = store;
		let found = true;
		let items = key.split(".");
		for (let i = 0; i < items.length; i++)
		{
			if (typeof current === "object" && items[i] in current)
			{
				current = current[items[i]];
			}
			else
			{
				found = false;
				break;
			}
		}

		return found;

	}

	// -----------------------------------------------------------------------------

	/**
	* Concatenat path strings appending trainling "/" when needed.
	*
	* @param	{Array}			paths				Paths.
	*
	* @return	{String}		Concatenated paths
	*/
	static concatPath(paths)
	{

		let path = paths[0];

		for (let i = 1; i < paths.length; i++)
		{
			if (paths[i])
			{
				if (path.slice(path.length - 1) == "/" && paths[i].slice(0, 1) == "/")
				{
					path += paths[i].slice(1);
				}
				else if (path.slice(path.length - 1) == "/" || paths[i].slice(0, 1) == "/")
				{
					path += paths[i];
				}
				else
				{
					path += "/" + paths[i];
				}
			}
		}

		return path;

	}

	// -------------------------------------------------------------------------

	/**
	 * Deep merge two arrays.
	 *
	 * @param	{Object}		arr1					Array1.
	 * @param	{Object}		arr2					Array2.
	 *
	 * @return  {Object}		Merged array.
	 */
	static deepMerge(arr1, arr2)
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
