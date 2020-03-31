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
//	Cookie util class
// =============================================================================

export default class CookieUtil
{

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
	 * Get cookie.
	 *
	 * @param	{String}		key					Key.
	 */
	static get(key)
	{

		let decoded = document.cookie.split(';').reduce((result, current) => {
			const [key, value] = current.split('=');
			if (key)
			{
				result[key.trim()] = ( value ? decodeURIComponent(value.trim()) : undefined );
			}

			return result;
		}, {});

		return ( decoded[key] ? JSON.parse(decoded[key]) : {});

	}

	// -------------------------------------------------------------------------

	/**
	 * Set cookie.
	 *
	 * @param	{String}		key					Key.
	 * @param	{Object}		value				Value.
	 * @param	{Object}		options				Options.
	 */
	static set(key, value, options)
	{

		let cookie;

		cookie = key + "=" + encodeURIComponent(JSON.stringify(value));

		if (options)
		{
			Object.key(options).reduce((result, current) => {
				cookie += current + "=" + options[current] + "; ";
			});
		}
		console.log("@@@", cookie);

		document.cookie = cookie;

	}

}
