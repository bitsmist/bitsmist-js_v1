// =============================================================================
/**
 * Bitsmist WebView - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import PathToRegexp from 'path-to-regexp';

// =============================================================================
//	Default router class
// =============================================================================

export default class DefaultRouter
{

	// -------------------------------------------------------------------------
	//  Constructor
	// -------------------------------------------------------------------------

	/**
     * Constructor.
     *
	 * @param	{Object}		options				Options for the loader.
     */
	constructor(options)
	{

		this.options = options;
		this.container = options["container"];
		this._routes = [];

		this.__initRoutes(options["routes"]);

		this._routeInfo = this.__loadRouteInfo(window.location.href);

	}

	// -------------------------------------------------------------------------

	__initRoutes(routes)
	{

		for (let i = 0; i < routes.length; i++)
		{
			this.addRoute({
				"name": routes[i]["name"],
				"path": routes[i]["path"],
				"specName": routes[i]["specName"]
			});
		}

	}

	// -------------------------------------------------------------------------

	addRoute(routeInfo)
	{

		let keys = [];
		let route = {
			"name": routeInfo["name"],
			"path": routeInfo["path"],
			"keys": keys,
			"specName": routeInfo["specName"],
			"re": PathToRegexp.pathToRegexp(routeInfo["path"], keys)
		};

		this._routes.push(route);

	}

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	/**
     * Route info.
     *
	 * @type	{Object}
     */
	get routeInfo()
	{

		return this._routeInfo;

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
	 * Build query string from the options object.
	 *
	 * @param	{Object}		options				Query options.
	 *
	 * @return  {String}		Query string.
	 */
	buildUrlQuery(options)
	{

		let query = "";

		if (options)
		{
			query = Object.keys(options).reduce((result, current) => {
				if (Array.isArray(options[current]))
				{
					result += encodeURIComponent(current) + "=" + encodeURIComponent(options[current].join()) + "&";
				}
				else if (options[current])
				{
					result += encodeURIComponent(current) + "=" + encodeURIComponent(options[current]) + "&";
				}

				return result;
			}, "");
		}

		return ( query ? "?" + query.slice(0, -1) : "");

	}

    // -------------------------------------------------------------------------

	/**
	 * Create options array from the current url.
	 */
	loadParameters()
	{

		let vars = {}
		let hash;
		let value;

		if (window.location.href.indexOf("?") > -1)
		{
			let hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');

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
	 * Get route info from the url.
	 *
	 * @param	{String}		url					Url.
	 *
	 * @return  {Object}		Route info.
 	 */
	__loadRouteInfo(url)
	{

		let routeInfo = {};
		let parsedUrl = new URL(url);
		let specName;
		let params = {};
		for (let i = 0; i < this._routes.length ; i++)
		{
			let result = this._routes[i].re.exec(parsedUrl.pathname);
			if (result)
			{
				specName = this._routes[i].specName;
				for (let j = 0; j < result.length - 1; j++)
				{
					params[this._routes[i].keys[j].name] = result[j + 1];
				}

				for (let j = 0; j < result.length - 1; j++)
				{

					let keyName = this._routes[i].keys[j].name;
					let value = result[j + 1];
					specName = specName.replace("{{:" + keyName + "}}", value);
				}

				break;
			}
		}

		routeInfo["url"] = url;
		routeInfo["path"] = parsedUrl.pathname;
		routeInfo["query"] = parsedUrl.search;
		routeInfo["parsedUrl"] = parsedUrl;
		routeInfo["params"] = params;
		routeInfo["specName"] = specName;

		routeInfo["parameters"] = this.loadParameters();

		return routeInfo;

	}

   	// -------------------------------------------------------------------------

	/**
	 * Open route.
	 *
	 * @param	{Object}		routeInfo			Route information.
 	 * @param	{Object}		options				Options.
	 *
	 * @return  {string}		Url.
	 */
	open(routeInfo, options)
	{

		let newRouteInfo = this.__loadRoute(routeInfo["path"]);

		if (this._routeInfo["specName"] != newRouteInfo["specName"])
		{
			// Jump to another page
			location.href = newRouteInfo["url"];
		}
		else
		{
			Promise.resolve().then(() => {
				history.pushState(null, null, newRouteInfo["url"]);
			}).then(() => {
				return this.refresh();
			}).then(() => {
				if (newRouteInfo["dispUrl"])
				{
					// Replace url
					history.replaceState(null, null, newRouteInfo["dispUrl"]);
				}
			});
		}

	}

   	// -------------------------------------------------------------------------

	refresh()
	{

		/*
		return new Promise((resolve, reject) => {
			this._routeInfo = this.__loadRouteInfo(window.location.href);
			let componentName = ;

			Promise.resolve().then(() => {
				if (this.container["components"][componentName])
				{
					this.container["components"][componentName].object.open({"sender":this}).then(() => {
					};
				}
			}).then(() => {
				resolve();
			});
		}
		*/

	}

   	// -------------------------------------------------------------------------

	/**
	 * Replace current url.
	 *
	 * @param	{Object}		routeInfo			Route information.
 	 * @param	{Object}		options				Options.
	 *
	 * @return  {string}		Url.
	 */
	replace(routeInfo, options)
	{

		history.replaceState(null, null, routeInfo["url"]);

	}


	openRoute(routeInfo, options)
	{

		let currentRouteInfo = this.__loadRouteInfo(window.location.href);
		routeInfo = (routeInfo ? routeInfo : currentRouteInfo);

		if (currentRouteInfo.params["resource"] != routeInfo.params["resource"])
		{
			// Load resource
			location.href = this.__buildUrl(routeInfo, routeInfo["parameters"]);
		}
		else
		{
			let urlOrg = this.__buildUrl(this._routeInfo, routeInfo["parameters"]);
			let url;
			if (routeInfo["parameters"]["_url"])
			{
				url = routeInfo["parameters"]["_url"];
			}

			// Get startup pad name
			let padName = this.__getTargetPadName(routeInfo.params["command"]);

			Promise.resolve().then(() => {
				if (options["pushState"])
				{
					// Push state
					history.pushState(null, null, urlOrg);
				}
				else if (options["replaceState"])
				{
					// Replace state
					history.replaceState(null, null, urlOrg);
				}
			}).then(() => {
				// Open
				if (options["autoOpen"])
				{
					if (padName)
					return this.container["components"][padName].object.open({"sender":this});
				}
			}).then(() => {
				// Refresh
				if (options["autoRefresh"])
				{
					if (padName)
					return this.container["components"][padName].object.refresh({"sender":this});
				}
			}).then(() => {
				if (url)
				{
					// Replace state
					history.replaceState(null, null, url);
				}
			});

		}

	}

   	// -------------------------------------------------------------------------

	/**
	 * Build url for the app.
	 *
	 * @param	{Object}		routeInfo			Route information.
	 * @param	{Object}		options				Query options.
	 *
	 * @return  {string}		Url.
	 */
	__buildUrl(routeInfo, options)
	{

		/*
		if (!routeInfo)
		{
			routeInfo = this.container["router"].loadRoute();
		}
		*/

		let url
		/*
		if (routeInfo["resourceName"] && routeInfo["commandName"])
		{
			url = this.container["appInfo"]["baseUrl"] + "/" + routeInfo["resourceName"] + "/" + routeInfo["commandName"] + "/" + this.buildUrlQuery(options);
		}
		else
		*/
		{
			url = routeInfo["path"] + this.buildUrlQuery(options);
		}

		return url;

	}

	/*
	openRoute(routeInfo, options)
	{

		let currentRouteInfo = this.loadRoute();
		routeInfo = (routeInfo ? routeInfo : currentRouteInfo);

		if (currentRouteInfo["resourceName"] != routeInfo["resourceName"])
		{
			// Load resource
			location.href = this.container["loader"].buildUrl(routeInfo, routeInfo["parameters"]);
		}
		else
		{
			let urlOrg = this.container["loader"].buildUrl(null, routeInfo["parameters"]);
			let url;
			if (routeInfo["parameters"]["_url"])
			{
				url = routeInfo["parameters"]["_url"];
			}

			// Get startup pad name
			let padName = this.__getTargetPadName(routeInfo["commandName"]);

			Promise.resolve().then(() => {
				if (options["pushState"])
				{
					// Push state
					history.pushState(null, null, urlOrg);
				}
				else if (options["replaceState"])
				{
					// Replace state
					history.replaceState(null, null, urlOrg);
				}
			}).then(() => {
				// Open
				if (options["autoOpen"])
				{
					if (padName)
					return this.container["components"][padName].object.open({"sender":this});
				}
			}).then(() => {
				// Refresh
				if (options["autoRefresh"])
				{
					if (padName)
					return this.container["components"][padName].object.refresh({"sender":this});
				}
			}).then(() => {
				if (url)
				{
					// Replace state
					history.replaceState(null, null, url);
				}
			});

		}

	}
	*/

	// -------------------------------------------------------------------------
	//	Private
	// -------------------------------------------------------------------------

	/**
	 * Get target pad name.
	 *
	 * @param	{String}		commandName			Command name.
	 *
	 * @return  {String}		Pad name.
	 */
	__getTargetPadName(commandName)
	{

		let padName;

		if (this.container["appInfo"]["spec"] && this.container["appInfo"]["spec"]["commands"] && this.container["appInfo"]["spec"]["commands"][commandName])
		{
			padName = this.container["appInfo"]["spec"]["commands"][commandName]["startup"];
		}
		else if (this.container["appInfo"]["spec"] && this.container["appInfo"]["spec"]["commands"] && this.container["appInfo"]["spec"]["commands"]["*"])
		{
			padName = this.container["appInfo"]["spec"]["commands"]["*"]["startup"];
		}

		return padName;

	}

}
