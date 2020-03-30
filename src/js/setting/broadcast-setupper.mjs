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
//	Broadcast setupper class
// =============================================================================

export default class BroadcastSetupper
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
	 * Apply settings
	 *
	 * @param	{Object}		settings			Settings.
	 *
	 * @return  {Promise}		Promise.
	 */
	setup(settings)
	{

		return new Promise((resolve, reject) => {
			let promises = [];

			Object.keys(this.container["components"]).forEach((componentName) => {
				promises.push(this.container["components"][componentName].object.setup(settings));
			});

			Promise.all(promises).then(() => {
				resolve();
			});
		});

	}

}
