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
	//  Properties
	// -------------------------------------------------------------------------

	/**
	 * Perk info.
	 *
	 * @type	{Object}
	 */
	static get info()
	{

		return {};

	}

	// -------------------------------------------------------------------------
	//  Methods
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

	/**
	 * Set event handler for perk.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{String}		type				Upgrade type.
	 * @param	{String}		name				Section name.
	 * @param	{Function}		content				Upgrade content.
	 */
	static upgrade(component, type, name, content)
	{

		switch (type)
		{
			case "asset":
				component._assets[name] = content;
				break;
			case "method":
				component[name] = content;
				break;
			case "property":
				Object.defineProperty(component, name, content);
				break;
			case "event":
				component.use("skill", "event.add", name, {
					"handler":	content,
					"order":	this.info["order"],
				});
				break;
			default:
				component._assets[type].set(name, content);
				break;
		}

	}

}
