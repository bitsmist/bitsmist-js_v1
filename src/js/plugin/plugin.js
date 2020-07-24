// =============================================================================
/**
 * Bitsmist WebView - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

// =============================================================================
//	Plugin base class
// =============================================================================

// -----------------------------------------------------------------------------
//  Constructor
// -----------------------------------------------------------------------------

/**
 * Constructor.
 *
 * @param	{Object}		options				Options for the component.
 */
export default class Plugin
{

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
	//  Method
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
		this._events = ( this._options["events"] ? this._options["events"] : {} );

	}

}


