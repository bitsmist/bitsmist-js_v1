// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

// =============================================================================
//	Initializer initializer class
// =============================================================================

export default class InitializerInitializer
{

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
	 * Init.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object}		settings			Settings.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static init(component, settings)
	{

		if (settings)
		{
			Object.keys(settings).forEach((key) => {
				InitializerInitializer.addInitializer(settings[key], key);
			});
		}

		return Promise.resolve();

	}

	// -------------------------------------------------------------------------

	/**
	 * Add a initializer to Globals.
	 *
	 * @param	{Object}		initializerClass	Initializer class.
	 * @param	{Object}		target				Setting key name.
	 */
	static addInitializer(initializerClass, target)
	{

		Globals["initializers"][target] = initializerClass;

	}

}
