// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import ComponentObserver from './component-observer';
import Store from './store';
import Util from './util/util';

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
		this._organizers = new ComponentObserver({"targeter": (condition, target, organizer) => {
			return organizer.isTarget(condition);
		}});
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
	 * Organizers.
	 *
	 * @type	{Object}
	 */
	get organizers()
	{

		return this._organizers;

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

}

// Instantiate and export
let globals = new Globals();
export default globals;
