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
//	Observer preference handler class
// =============================================================================

export default class ObserverPreferenceHandler
{

	// -------------------------------------------------------------------------
	//  Constructor
	// -------------------------------------------------------------------------

	/**
     * Constructor.
     *
	 * @param	{Object}		options				Options for the component.
     */
	constructor(options)
	{

		this.options = ( options ? options : {} );
		this.container = options["container"];
		this.targets = {};

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
	 * Register target component.
	 *
	 * @param	{Component}		component			Component to notify.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	register(component, options)
	{

		this.targets[component.hashCode] = {"object":component, "options":options};

	}

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

			Object.keys(this.targets).forEach((componentName) => {
				if (this.__isTarget(settings, this.targets[componentName].options))
				{
					promises.push(this.targets[componentName].object.setup(settings));
				}
			});

			Promise.all(promises).then(() => {
				resolve();
			});
		});

	}

	// -------------------------------------------------------------------------
	//	Private
	// -------------------------------------------------------------------------

	__isTarget(settings, target)
	{

		let result = false;

		/*
		if (target == "*")
		{
			return true;
		}
		*/

		for (let i = 0; i < target.length; i++)
		{
			if (settings["newPreferences"].hasOwnProperty(target[i]))
			{
				result = true;
				break;
			}
		}

		return result;

	}

}
