// =============================================================================
/**
 * Bitsmist WebView - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import CookieUtil from '../util/cookie-util';

// =============================================================================
//	Cookie preference handler class
// =============================================================================

export default class CookiePreferenceHandler
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
		this.cookie = new CookieUtil("CookieUtil", {"container": this.container});

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
	 * Load settings
	 *
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	load(options)
	{

		return new Promise((resolve, reject) => {
			let settings= this.cookie.get("settings");

			resolve(settings);
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Save settings
	 *
	 * @param	{Object}		settings			Settings.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	save(settings, options)
	{

		this.cookie.set("settings", settings, options);

	}

}
