// =============================================================================
/**
 * Bitsmist WebView - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import BaseErrorHandler from './base-error-handler';

// =============================================================================
//	Logging exception handler class
// =============================================================================

export default class NoRouteErrorHandler extends BaseErrorHandler
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

		super(componentName, options);

		this.target.push("NoRouteError");

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
     * Handle an exception.
     *
	 * @param	{object}		e					Exception.
     */
	handle(e)
	{

		// Check to prevent loop
		let parameters = this.container["loader"].loadParameters();
		if (parameters["_redirected_by_norouteerrorhandler"])
		{
			throw new Error("Page not found");
		}

		// Load default page
		let routeInfo = {
			"resourceName":	this.options["route"]["resourceName"],
			"commandName":	this.options["route"]["commandName"],
			"parameters":	this.options["route"]["parameters"],
		};
		routeInfo["parameters"]["_redirected_by_norouteerrorhandler"] = true;
		this.container["router"].openRoute(routeInfo, {});

	}

}
