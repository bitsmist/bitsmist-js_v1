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
		this._routes;

		this.__initRoutes(options["routes"]);

//		this._routeInfo = this.__loadRouteInfo(window.location.href);

	}

	// -------------------------------------------------------------------------

	__initRoutes(routes)
	{

		this._routes = [];

		for (let i = 0; i < routes.length; i++)
		{
			this.addRoute({
				"name": routes[i]["name"],
				"path": routes[i]["path"],
				"specName": routes[i]["specName"],
				"componentName": (routes[i]["componentName"] ? routes[i]["componentName"] : "" )
			});
		}

		this._routeInfo = this.__loadRouteInfo(window.location.href);

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
			"componentName": routeInfo["componentName"],
			"re": PathToRegexp.pathToRegexp(routeInfo["path"], keys)
		};

		this._routes.push(route);

	}

	/*
	addRoutes(routeInfo)
	{

		for ()
		{
		}

	}
	*/

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

		//console.log("###", options);
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
		let routeName;
		let parsedUrl = new URL(url);
		let specName;
		let componentName;
		let params = {};
		for (let i = 0; i < this._routes.length ; i++)
		{
			let result = this._routes[i].re.exec(parsedUrl.pathname);
			if (result)
			{
				routeName = this._routes[i].name;
				specName = ( this._routes[i].specName ? this._routes[i].specName : "" );
				componentName = this._routes[i].componentName;
				for (let j = 0; j < result.length - 1; j++)
				{
					params[this._routes[i].keys[j].name] = result[j + 1];
					let keyName = this._routes[i].keys[j].name;
					let value = result[j + 1];
					specName = specName.replace("{{:" + keyName + "}}", value);
				}

				break;
			}
		}

		routeInfo["name"] = routeName;
		routeInfo["specName"] = specName;
		routeInfo["componentName"] = componentName;
		routeInfo["url"] = url;
		routeInfo["path"] = parsedUrl.pathname;
		routeInfo["query"] = parsedUrl.search;
		routeInfo["parsedUrl"] = parsedUrl;
		routeInfo["routeParameters"] = params;
		routeInfo["queryParameters"] = this.loadParameters();

		return routeInfo;

	}

   	// -------------------------------------------------------------------------

	/**
	 * Open route.
	 *
	 * @param	{Object}		routeInfo			Route information.
	 * @param	{Object}		options				Query options.
	 *
	 * @return  {string}		Url.
	 */
	open(routeInfo, options)
	{

		let url = this.__buildUrl(routeInfo);
		options = ( options ? options : {} );
		options["pushState"] = ( options["pushState"] ? options["pushState"] : true );

		console.log("@@@",url);

		if (options["jump"])
		{
			// Jump to another page
			location.href = url;
		}
		else
		{
			Promise.resolve().then(() => {
				if (options["pushState"])
				{
					history.pushState(null, null, url);
				}
				this._routeInfo = this.__loadRouteInfo(window.location.href);
			}).then(() => {
				//if (options["autoOpen"])
				{
					let componentName = this._routeInfo["componentName"];
					if (this.container["components"][componentName])
					{
						return this.container["components"][componentName].object.open({"sender":this});
					}
				}
			}).then(() => {
				if (options["autoRefresh"])
				{
					let componentName = this._routeInfo["componentName"];
					if (this.container["components"][componentName])
					{
						return this.container["components"][componentName].object.refresh({"sender":this});
					}
				}
			}).then(() => {
				if (routeInfo["dispUrl"])
				{
					// Replace url
					history.replaceState(null, null, routeInfo["dispUrl"]);
				}
			});
		}

	}

	/*
	openRoute(routeInfo)
	{

		open(routeInfo, { "pushState":true });

	}

	refreshRoute(routeInfo)
	{

		open(routeInfo, { "replaceState":true });

	}
	*/

   	// -------------------------------------------------------------------------

	/*
	refresh(routeInfo)
	{

		return new Promise((resolve, reject) => {
			let componentName = this._routeInfo["componentName"];

			Promise.resolve().then(() => {
				let url = this.__buildUrl(routeInfo);
				this.replace(url);
				if (this.container["components"][componentName])
				{
					return this.container["components"][componentName].object.refresh({"sender":this});
					// return this.container["components"][componentName].object.open({"sender":this});
					// return this.container["components"][componentName].object.open({"sender":this}).then(() => {
					// 	return this.container["components"][componentName].object.refresh({"sender":this});
					// });
				}
			}).then(() => {
				//this._routeInfo = this.__loadRouteInfo(window.location.href);
				resolve();
			});
		});

	}
	*/

   	// -------------------------------------------------------------------------

	/**
	 * Replace current url.
	 *
	 * @param	{Object}		routeInfo			Route information.
	 *
	 * @return  {string}		Url.
	 */
	replace(routeInfo)
	{

		history.replaceState(null, null, this.__buildUrl(routeInfo));

	}


	openRoute(routeInfo, options)
	{

		/*
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
		*/

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
	__buildUrl(routeInfo)
	{

		let url;

		// Path
		if (routeInfo["url"])
		{
			url = routeInfo["url"];
		}
		else
		{
			/*
			else if (routeInfo["name"])
			{
				url = this.__routes[]["path"];
			}
			*/
			if (routeInfo["path"])
			{
				url = routeInfo["path"];
			}
			else
			{
				url = this._routeInfo["path"];
			}

			// Route parameters
			/*
			if (routeInfo["routeParamters"])
			{
				url = 
			}
			*/

			// Query parameters
			if (routeInfo["query"])
			{
				url = url + "?" + routeInfo["query"];
			}
			else if (routeInfo["queryParameters"])
			{
				url = url + this.buildUrlQuery(routeInfo["queryParameters"]);
			}
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
