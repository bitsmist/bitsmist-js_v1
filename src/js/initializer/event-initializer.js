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
//	Event initializer class
// =============================================================================

export default class EventInitializer
{

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static init(component, settings)
	{

		// Init event handlers
		if (settings)
		{
			Object.keys(settings).forEach((eventName) => {
				component.addEventHandler(component, eventName, settings[eventName]);
			});
		}

		return Promise.resolve();

	}

}
