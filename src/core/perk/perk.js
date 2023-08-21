// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/main/LICENSE
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
	 *  Initialize an perk and Unit class when the perk is registered.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{Object}		options				Options.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static globalInit()
	{
	}

	// -------------------------------------------------------------------------

	/**
	 *  Initialize an attached unit when perk is attached.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{Object}		options				Options.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static init(unit, options)
	{
	}

	// -------------------------------------------------------------------------

	/**
	 * Deinitialize the unit when perk is detached.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{Object}		options				Options.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static deinit(unit, options)
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
	 * @param	{Unit}			unit				Unit.
	 * @param	{String}		type				Upgrade type.
	 * @param	{String}		name				Section name.
	 * @param	{Function}		content				Upgrade content.
	 */
	static upgrade(unit, type, name, content)
	{

		switch (type)
		{
			case "asset":
				unit.__bm_assets[name] = content;
				break;
			case "method":
				unit[name] = content;
				break;
			case "property":
				Object.defineProperty(unit, name, content);
				break;
			case "event":
				unit.use("skill", "event.add", name, {
					"handler":	content,
					"order":	this.info["order"],
				});
				break;
			default:
				unit.__bm_assets[type].set(name, content);
				break;
		}

	}

}
