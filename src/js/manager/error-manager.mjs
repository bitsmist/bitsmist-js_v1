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
	 * @param	{String}		componentName		Component name.
	 * @param	{Object}		options				Options for the component.
     */
	constructor(componentName, options)
	{

		/*
		let proxy = super(componentName, options);
		this.listeners = new EventHandler(proxy);

		return proxy;
		*/

		super(componentName, options);
		this.listener = new EventHandler(this);

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	handle(e)
	{

		for (let i = 0; i < this.plugins.length; i++)
		{
			if (this.plugins[i].target == "*" || this.plugins[i].target.indexOf(e.name) > -1)
			{
				this.plugins[i].handle.call(this.plugins[i], e);
			}
		}

	}

}
