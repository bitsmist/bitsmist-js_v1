// =============================================================================
/**
 * Bitsmist WebView - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import Util from '../util/util';

// =============================================================================
//	Plugin base class
// =============================================================================

export default class Plugin
{

	// -------------------------------------------------------------------------
	//  Constructor
	// -------------------------------------------------------------------------

	/**
     * Constructor.
     *
	 * @param	{Object}		component			Component to attach.
	 * @param	{Object}		options				Options.
     */
	constructor(component, options)
	{

		this.init(component, options);

	}

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	/**
	* Component.
	*
	* @type	{String}
	*/
	get component()
	{

		return this._component;

	}

	set component(value)
	{

		this._component = value;

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
     * Init class.
     *
	 * @param	{Object}		component			Component to attach.
	 * @param	{Object}		options				Plugin options.
     */
	init(component, options)
	{

		this._options = Object.assign({}, this._options, options);
		this._component = component
		this._events = this.getOption("events", {});

	}

	// -----------------------------------------------------------------------------

	/**
	* Get option value. Return default value when specified key is not available.
	*
	* @param	{String}		key					Key to get.
	* @param	{Object}		defaultValue		Value returned when key is not found.
	*
	* @return  {*}				Value.
	*/
	getOption(key, defaultValue)
	{

		return Util.safeGet(this._options, key, defaultValue);

	}

}
