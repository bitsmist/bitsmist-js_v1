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
//	Base organizer class
// =============================================================================

export default class Organizer
{

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
	 * Global init.
	 */
	static globalInit()
	{
	}

	// -------------------------------------------------------------------------

	/**
	 * Attach the organizer to the component.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object}		options				Options.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static attach(component, options)
	{
	}

	// -------------------------------------------------------------------------

	/**
	 * Detach the organizer from the component.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object}		options				Options.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static detach(component, options)
	{
	}

	// -------------------------------------------------------------------------

	/**
	 * Get editor for the organizer.
	 *
	 * @return 	{String}		Editor.
	 */
	static getEditor()
	{

		return "";

	}

	// -------------------------------------------------------------------------
	//  Protected
	// -------------------------------------------------------------------------

	/**
	 * Set event handler for organizer.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{String}		eventName			Event name.
	 * @param	{Function}		handler				Event handler.
	 */
	static _addOrganizerHandler(component, eventName, handler)
	{

		component.addEventHandler(eventName, {
			"handler":handler,
			"order":BITSMIST.v1.OrganizerOrganizer.organizers[this.name].order
		});

	}

}
