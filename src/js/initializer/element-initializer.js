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
//	Element initializer class
// =============================================================================

export default class ElementInitializer
{

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static init(component, settings)
	{

		if (settings)
		{
			Object.keys(settings).forEach((elementName) => {
				component.setHtmlEventHandlers(elementName);
			});
		}

		return Promise.resolve();

	}

}
