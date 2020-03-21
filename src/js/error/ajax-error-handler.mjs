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
	 * @param	{String}		componentName		Component name.
	 * @param	{Object}		options				Options for the component.
     */
	constructor(componentName, options)
	{

		super(componentName, options);

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
							let urlToRoute = this.container["loader"].buildUrl(options, null);
							let parameter = options["parameter"].replace("@url@", encodeURIComponent(location.href));
							location.href = urlToRoute + "?" + parameter;
							break;
						case "transfer":
							let urlToTransfer = this.options["handlers"]["statusCode"][code][command];
							urlToTransfer = urlToTransfer.replace("@url@", location.href);
							location.href = urlToTransfer;
							break;
						case "custom":
							break;
					}
				});
			}
		});

	}

}
