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
		this._organizers = new Store({"filter": (condition, observerInfo, ...args) => {
			return observerInfo["object"].isTarget(condition, observerInfo, ...args);
		}});

		// Init organizer store
		this._organizers.setOrg = this._organizers.set;
		this._organizers.set = (key, value) => {
			this._organizers.setOrg(key, value);
			if (typeof value["object"].globalInit == "function")
			{
				value["object"].globalInit();
			}
		};

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
