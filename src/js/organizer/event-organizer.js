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
//	Event organizer class
// =============================================================================

export default class EventOrganizer
{

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
	 * Organize.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object}		settings			Settings.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static organize(component, settings)
	{

		if (settings)
		{
			Object.keys(settings).forEach((eventName) => {
				component.addEventHandler(component, eventName, settings[eventName]);
			});
		}

		return Promise.resolve();

	}

	// -------------------------------------------------------------------------

	/**
	 * Check if event is target.
	 *
	 * @param	{String}		eventName			Event name.
	 *
	 * @return 	{Boolean}		True if it is target.
	 */
	static isTarget(eventName)
	{

		let ret = false;

		if (eventName == "afterInitComponent" || eventName == "afterConnect")
		{
			ret = true;
		}

		return ret;

	}

}
