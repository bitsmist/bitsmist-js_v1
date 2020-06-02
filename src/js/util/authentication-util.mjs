// =============================================================================
/**
 * Bitsmist WebView - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import ResourceUtil from './resource-util';

// =============================================================================
//	Authentication util class
// =============================================================================

export default class AuthenticationUtil extends ResourceUtil
{

	// -------------------------------------------------------------------------
	//  Constructor
	// -------------------------------------------------------------------------

	/**
     * Constructor.
     *
     * @param	{string}		resourceName		Resource name.
     * @param	{array}			options				Options.
     */
	constructor(resourceName, options)
	{

		super("authentications", options);

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
	 * Authenticate.
	 *
	 * @param	{string}		user				User.
	 * @param	{string}		password			Password.
	 * @param	{array}			options				Options.
	 */
	authenticate(user, password, options)
	{

		return new Promise((resolve, reject) => {
			this.getList({"user":user, "password":password}).then((json) => {
				if (json.result.resultCount > 0)
				{
					if (options && "redirect" in options)
					{
						location.href = decodeURI(options["redirect"]);
					}
				}
				else
				{
					reject("login failed");
				}
			});
		});

	}

}
