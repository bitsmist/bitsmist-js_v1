// =============================================================================
/**
 * Bitsmist WebView - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import EventHandler from '../ui/event-handler';
import ServiceManager from './service-manager';

// =============================================================================
//	Preference manager class
// =============================================================================

export default class PreferenceManager extends ServiceManager
{

	// -------------------------------------------------------------------------
	//  Constructor
	// -------------------------------------------------------------------------

	/**
     * Constructor.
     *
	 * @param	{Object}		options				Options for the component.
     */
	constructor(options)
	{

		/*
		let proxy = super(componentName, options);
		this.listeners = new EventHandler(proxy);

		return proxy;
		*/

		super(options);

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
	 * Register target component.
	 *
	 * @param	{Component}		component			Component to notify.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	register(component, options)
	{

		return this._callMethod("register", [component, options]);

	}

	// -------------------------------------------------------------------------

	/**
	 * Apply preferences.
	 *
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	setup(options)
	{

		return this._callMethod("setup", [options]);

	}

	// -------------------------------------------------------------------------

	/**
	 * Load settings
	 *
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	load(options)
	{

		return this._callMethod("load", [options]);

	}

	// -------------------------------------------------------------------------

	/**
	 * Save settings
	 *
	 * @param	{Object}		settings			Settings.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	save(settings, options)
	{

		return this._callMethod("save", [settings, options]);

	}

}
