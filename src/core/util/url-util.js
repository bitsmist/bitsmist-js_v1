// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

// =============================================================================
//	URL Util Class
// =============================================================================

export default class URLUtil
{
	// -------------------------------------------------------------------------

	/**
	 * Create options array from the current url.
	 *
	 * @param	{String}		url					URL.
	 *
	 * @return  {Array}			Parameters array.
	 */
	static loadParameters(url)
	{

		url = url || window.location.href;
		let vars = {}
		let hash;
		let value;

		if (window.location.href.indexOf("?") > -1)
		{
			let hashes = url.slice(url.indexOf('?') + 1).split('&');

			for(let i = 0; i < hashes.length; i++) {
				hash = hashes[i].split('=');
				if (hash[1]){
					value = hash[1].split('#')[0];
				} else {
					value = hash[1];
				}
				vars[hash[0]] = decodeURIComponent(value);
			}
		}

		return vars;

	}

	// -------------------------------------------------------------------------

	/**
	 * Build url from route info.
	 *
	 * @param	{Object}		routeInfo			Route information.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {String}		URL.
	 */
	static buildURL(routeInfo, options)
	{

		let url = "";

		url += ( routeInfo["url"] ? routeInfo["url"] : "" );
		url += ( routeInfo["path"] ? routeInfo["path"] : "" );
		url += ( routeInfo["query"] ? `?{routeInfo["query"]}` : "" );

		if (routeInfo["queryParameters"])
		{
			let params = {};
			if (options && options["mergeParameters"])
			{
				params = Object.assign(params, URLUtil.loadParameters());
			}
			params = Object.assign(params, routeInfo["queryParameters"]);
			url += URLUtil.buildQuery(params);
		}

		return ( url ? url : "/" );

	}

	// -------------------------------------------------------------------------

	/**
	 * Build query string from the options object.
	 *
	 * @param	{Object}		options				Query options.
	 *
	 * @return	{String}		Query string.
	 */
	static buildQuery(options)
	{

		let query = "";

		if (options)
		{
			query = Object.keys(options).reduce((result, current) => {
				if (Array.isArray(options[current]))
				{
					result += `${encodeURIComponent(current)}=${encodeURIComponent(options[current].join())}&`;
				}
				else if (options[current])
				{
					result += `${encodeURIComponent(current)}=${encodeURIComponent(options[current])}&`;
				}

				return result;
			}, "");
		}

		return ( query ? `?${query.slice(0, -1)}` : "");

	}

	// -------------------------------------------------------------------------

	/**
	 * Get route info from the url.
	 *
	 * @param	{String}		url					URL.
	 *
	 * @return  {Object}		Route info.
	 */
	static loadRouteInfo(url)
	{

		let parsedURL = new URL(url, window.location.href);
		let routeInfo = {
			"URL":				url,
			"path":				parsedURL.pathname,
			"query":			parsedURL.search,
			"parsedURL":		parsedURL,
			"queryParameters":	URLUtil.loadParameters(url),
		};

		return routeInfo;

	}

	// -------------------------------------------------------------------------

	/**
	 * Parse URL.
	 *
	 * @param	{String}		url					URL to parse.
	 *
	 * @return 	{Object}		Object contains each URL part.
	 */
	static parseURL(url)
	{

		let parsed = new URL(url, window.location.href);
		let ret = {
			"protocol": parsed.protocol,
			"hostname": parsed.hostname,
			"pathname": parsed.pathname,
			"query": 	parsed.search,
			"hash": 	parsed.hash,
			"path":		parsed.pathname.substring(0, parsed.pathname.lastIndexOf("/")),
			"filename":	parsed.pathname.split("/").pop(),
		};
		ret["filenameWithoutExtension"] = ret["filename"].split(".")[0];
		ret["extension"] = ret["filename"].split(".").pop();

		return ret;

	}

}
