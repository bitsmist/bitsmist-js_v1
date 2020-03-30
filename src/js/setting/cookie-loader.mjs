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
//	Cookie saver class
// =============================================================================

export default class CookieLoader
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
	 * Load settings
	 *
	 * @return  {Promise}		Promise.
	 */
	load()
	{

		return new Promise((resolve, reject) => {

			let settings = {};

		    $.cookie.json = true;
			let tmp = $.cookie("settings");
			if (tmp)
			{
				Object.keys(tmp).forEach(function(key){
					settings[key] = tmp[key];
				});
			}

			resolve(settings);
		});

	}

}
