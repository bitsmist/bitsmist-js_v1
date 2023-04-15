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
//	Base Perk Class
// =============================================================================

export default class Perk
{

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	/**
	 * Perk name.
	 *
	 * @type	{Object}
	 */
	static get name()
	{

		return "Perk";

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
	 *  Initialize an perk and Component class when the perk is registered.
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
	 *  Initialize an attached component when perk is attached.
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
	 * Deinitialize the component when perk is detached.
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
	 * Get editor for the perk.
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
	 * Set event handler for perk.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{String}		eventName			Event name.
	 * @param	{Function}		handler				Event handler.
	 */
	static _addPerkHandler(component, eventName, handler)
	{

		component.skills.use("event.addEventHandler", eventName, {
			"handler":	handler,
			"order":	this.getInfo()["order"],
		});

	}

}
