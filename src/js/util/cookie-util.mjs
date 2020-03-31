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
	//  Constructor
	// -------------------------------------------------------------------------

	/**
     * Constructor.
     *
	 * @param	{String}		componentName		Component name.
	 * @param	{Object}		options				Options for the component.
     */
	constructor(componentName, options)
	{

		this.name = componentName;
		this.options = ( options ? options : {} );
		this.container = options["container"];

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
	 * Get cookie.
	 *
	 * @param	{String}		key					Key.
	 */
	get(key)
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
	set(key, value, options)
	{

		let cookie = key + "=" + encodeURIComponent(JSON.stringify(value)) + "; ";

		options = ( options ? options : {} );
		if (this.container["settings"]["cookieUtil"]["options"])
		{
			options = Object.assign(this.container["settings"]["cookieUtil"]["options"], options);
		}

		cookie += Object.keys(options).reduce((result, current) => {
			result += current + "=" + options[current] + "; ";

			return result;
		}, "");

		console.log(cookie);

		document.cookie = cookie;

	}

}
