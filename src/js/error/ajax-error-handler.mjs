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
//	Ajax error handler class
// =============================================================================

export default class AjaxErrorHandler extends BaseErrorHandler
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

		super(options);

		this.target.push("AjaxError");

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

		let statusCode = e.object.status;

		Object.keys(this.options["handlers"]["statusCode"]).forEach((code) => {
			if (statusCode == code)
			{
				Object.keys(this.options["handlers"]["statusCode"][code]).forEach((command) => {
					let options = this.options["handlers"]["statusCode"][code][command];
					switch (command)
					{
						case "route":
							if (!("appName" in options))
							{
								options["appName"] = "";
							}
							let routeInfo = options["routeInfo"];
							Object.keys(routeInfo["queryParameters"]).forEach((key) => {
								routeInfo["queryParameters"][key] = routeInfo["queryParameters"][key].replace("@url@", location.href);
							});
							this._app.router.openRoute(routeInfo, {"jump":true});
							break;
							/*
						case "transfer":
							let urlToTransfer = this.options["handlers"]["statusCode"][code][command];
							urlToTransfer = urlToTransfer.replace("@url@", location.href);
							location.href = urlToTransfer;
							break;
						case "custom":
							break;
							*/
					}
				});
			}
		});

	}

	load()
	{
		console.error("@@@@@@@@@@@@");
	}

}
