// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import OrganizerStore from './store/organizer-store';
import Store from './store/store';
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
     */
	constructor()
	{

		// Init vars
		this._classes = new Store();
		this._components = new Store();
		this._preferences = new Store();
		this._settings = new Store();
		this._organizers = new OrganizerStore();

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
