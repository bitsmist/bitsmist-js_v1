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
	//  Setter/Getter
	// -------------------------------------------------------------------------

	/**
	 * Organizer name.
	 *
	 * @type	{Object}
	 */
	static get name()
	{

		return "Organizer";

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static getInfo()
	{

		return {};

	}

	// -------------------------------------------------------------------------

	/**
	 *  Initialize an organizer and Component class when the organizer is registered.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object}		options				Options.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static globalInit()
	{
	}

	// -------------------------------------------------------------------------

	/**
	 *  Initialize an attached component when organizer is attached.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object}		options				Options.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static init(component, options)
	{
	}

	// -------------------------------------------------------------------------

	/**
	 * Deinitialize a component when organizer is detached.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object}		options				Options.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static deinit(component, options)
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
			"handler":	handler,
			"order":	this.getInfo()["order"],
		});

	}

}
