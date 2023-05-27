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
				if (xhr.status === 200 || xhr.status === 201)
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
	 * Load a Javascript file.
	 *
	 * @param	{String}		url					Javascript url.
	 * @param	{Object}		options				Load Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static loadScript(url) {

		return new Promise((resolve, reject) => {
			let script = document.createElement('script');
			script.src = url;
			script.async = true;

			script.onload = () => {
				resolve();
			};

			script.onerror = (e) => {
				reject(e);
			};

			let head = document.getElementsByTagName('head')[0];
			head.appendChild(script);
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Load a JSON or Javascript Object file.
	 *
	 * @param	{String}		url					JSON URL.
	 * @param	{Object}		options				Load Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static loadJSON(url, options)
	{

		let format = Util.safeGet(options, "format", url.split('?')[0].split('.').pop());

		console.debug(`Ajax.loadJSON(): Loading a JSON file. url=${url}, format=${format}`);

		return AjaxUtil.ajaxRequest({url:url, method:"GET"}).then((xhr) => {
			console.debug(`Ajax.loadJSON(): Loaded the JSON file. url=${url}, format=${format}`);

			return Util.getObject(xhr.responseText, {"format":format});
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Load a Text file.
	 *
	 * @param	{String}		url					HTML URL without extension.
	 * @param	{Object}		options				Load Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static loadText(url, options)
	{

		console.debug(`AjaxUtil.loadText(): Loading a Text file. url=${url}`);

		return AjaxUtil.ajaxRequest({url:url, method:"GET"}).then((xhr) => {
			console.debug(`AjaxUtil.loadText(): Loaded the Text file. url=${url}`);

			return xhr.responseText;
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Load an HTML file.
	 *
	 * @param	{String}		url					HTML URL.
	 * @param	{Object}		options				Load Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static loadHTML(url, options)
	{

		console.debug(`AjaxUtil.loadHTML(): Loading an HTML file. url=${url}`);

		return AjaxUtil.ajaxRequest({url:url, method:"GET"}).then((xhr) => {
			console.debug(`AjaxUtil.loadHTML(): Loaded the HTML file. url=${url}`);

			return xhr.responseText;
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Load a CSS file.
	 *
	 * @param	{String}		url					CSS URL.
	 * @param	{Object}		options				Load Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static loadCSS(url, options)
	{

		console.debug(`AjaxUtil.loadCSS(): Loading an CSS file. url=${url}`);

		return AjaxUtil.ajaxRequest({url:url, method:"GET"}).then((xhr) => {
			console.debug(`AjaxUtil.loadCSS(): Loaded the CSS file. url=${url}`);

			return xhr.responseText;
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Load class files.
	 *
	 * @param	{String}		url					Class URL without extension.
	 * @param	{Object}		options				Load Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static loadClass(url, options)
	{

		console.debug(`AjaxUtil.loadClass(): Loading class files. url=${url}`);

		let url1 = url + ".js";
		console.debug(`AjaxUtil.loadClass(): Loading the first file. url1=${url1}`);

		return Promise.resolve().then(() => {
			return AjaxUtil.loadScript(url1);
		}).then(() => {
			if (options["splitClass"])
			{
				let url2 = url + ".settings.js";
				console.debug(`AjaxUtil.loadClass(): Loading the second file. url2=${url2}`);
				return AjaxUtil.loadScript(url2);
			}
		}).then(() => {
			console.debug(`AjaxUtil.loadClass(): Loaded the class files. url=${url}`);
		});

	}

}
