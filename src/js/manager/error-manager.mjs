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
//	Error manager class
// =============================================================================

export default class ErrorManager extends ServiceManager
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
		this.listener = new EventHandler(this);

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
	 * Handle error.
	 *
	 * @param	{Error}			e					Error object.
	 *
	 * @return  {Promise}		Promise.
	 */
	handle(e)
	{

		return this._callMethod("handle", [e], (plugin) => {
			return ( plugin.target == "*" || plugin.target.indexOf(e.name) > -1 ? true : false );
		});

	}

}
