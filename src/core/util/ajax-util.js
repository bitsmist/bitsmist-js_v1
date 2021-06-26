// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import Util from "./util.js";

// =============================================================================
//	Ajax util class
// =============================================================================

export default class AjaxUtil
{

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
	 * Make an ajax request.
	 *
	 * @param	{Object}		options				Request options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static ajaxRequest(options)
	{

		return new Promise((resolve, reject) => {
			let url = Util.safeGet(options, "url");
			let method = Util.safeGet(options, "method");
			let data = Util.safeGet(options, "data", "");
			let headers = Util.safeGet(options, "headers");
			let xhrOptions = Util.safeGet(options, "options");

			let xhr = new XMLHttpRequest();
			xhr.open(method, url, true);

			// options
			if (xhrOptions)
			{
				Object.keys(xhrOptions).forEach((option) => {
					xhr[option] = xhrOptions[option];
				});
			}

			// extra headers
			if (headers)
			{
				Object.keys(headers).forEach((header) => {
					xhr.setRequestHeader(header, headers[header]);
				});
			}

			// callback (load)
			xhr.addEventListener("load", () => {
				if (xhr.status == 200 || xhr.status == 201)
				{
					resolve(xhr);
				}
				else
				{
					reject(xhr);
				}
			});

			// callback (error)
			xhr.addEventListener("error", () => {
				reject(xhr);
			});

			// send
			xhr.send(data);
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Load the javascript file.
	 *
	 * @param	{string}		url					Javascript url.
	 *
	 * @return  {Promise}		Promise.
	 */
	static loadScript(url) {

		return new Promise((resolve, reject) => {
			let source = url;
			let script = document.createElement('script');
			let prior = document.getElementsByTagName('script')[0];
			script.async = 1;
			script.onload = script.onreadystatechange = ( _, isAbort ) => {
				if(isAbort || !script.readyState || /loaded|complete/.test(script.readyState) ) {
					script.onload = script.onreadystatechange = null;
					script = undefined;

					if(!isAbort) {
						resolve();
					}
				}
			};

			script.src = source;
			prior.parentNode.insertBefore(script, prior);
		});

	}

}
