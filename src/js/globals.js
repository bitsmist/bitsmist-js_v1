// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import Store from './store';

// =============================================================================
//	Global class
// =============================================================================

class Globals
{

	// -------------------------------------------------------------------------
	//  Constructor
	// -------------------------------------------------------------------------

	/**
     * Constructor.
     *
	 * @param	{Object}		options				Options.
	 * @param	{Store}			chain				Store Component to chain.
     */
	constructor()
	{

		this._components = {};
		this._classes = {};
		this._initializers = {};
		this._settings = new Store();
		this._preferences = new Store();

	}

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	/**
	 * Components.
	 *
	 * @type	{Object}
	 */
	get components()
	{

		return this._components;

	}

	// -------------------------------------------------------------------------

	/**
	 * Classes.
	 *
	 * @type	{Object}
	 */
	get classes()
	{

		return this._classes;

	}

	// -------------------------------------------------------------------------

	/**
	 * Initializers.
	 *
	 * @type	{Object}
	 */
	get initializers()
	{

		return this._initializers;

	}

	// -------------------------------------------------------------------------

	/**
	 * Settings.
	 *
	 * @type	{Object}
	 */
	get settings()
	{

		return this._settings;

	}

	set settings(value)
	{

		this._settings = value;

	}

	// -------------------------------------------------------------------------

	/**
	 * Preferences.
	 *
	 * @type	{Object}
	 */
	get preferences()
	{

		return this._preferences;

	}

	set preferences(value)
	{

		this._preferences = value;

	}

	// -------------------------------------------------------------------------
	//  Method
	// -------------------------------------------------------------------------

	/**
     * Add an initializer.
     *
	 * @param	{Object}		initializerClass	Initializer class.
	 * @param	{Object}		target				Target.
     */
	addInitializer(initializerClass, target)
	{

		this._initializers[target] = initializerClass;

	}

}

let globals = new Globals();
export default globals;
