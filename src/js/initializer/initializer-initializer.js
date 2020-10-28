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

	static init(component, settings)
	{

		// Init event handlers
		if (settings)
		{
			Object.keys(settings).forEach((key) => {
				Component.addInitializer(settings[key], key);
			});
		}

		return Promise.resolve();

	}

}
