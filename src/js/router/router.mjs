// =============================================================================
/**
 * Bitsmist WebView - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import { pathToRegexp } from 'path-to-regexp';

// =============================================================================
//	Default router class
// =============================================================================

// -----------------------------------------------------------------------------
//  Constructor
// -----------------------------------------------------------------------------

/**
 * Constructor.
 *
 * @param	{Object}		options				Options.
 */
export default function Router(options)
{

	this._options = Object.assign({}, options);
	this._app = this._options["app"];
	this._routes;

	this.__initRoutes(this._options["routes"]);
	this.__initPopState();

}

// -----------------------------------------------------------------------------
//  Setter/Getter
// -----------------------------------------------------------------------------

/**
 * Route info.
 *
 * @type	{Object}
 */
Object.defineProperty(Router.prototype, 'routeInfo', {
	get()
	{
		return this._routeInfo;
	}
})

// -----------------------------------------------------------------------------
//  Methods
// -----------------------------------------------------------------------------

/**
 * Add a route.
 *
 * @param	{Object}		routeInfo			Route info.
 */
Router.prototype.addRoute = function(routeInfo)
{

	let keys = [];
	let route = {
		"name": routeInfo["name"],
		"path": routeInfo["path"],
		"keys": keys,
		"specName": routeInfo["specName"],
		"componentName": routeInfo["componentName"],
		"re": pathToRegexp(routeInfo["path"], keys)
	};

	this._routes.push(route);

}

// -----------------------------------------------------------------------------

/**
 * Build url from route info.
 *
 * @param	{Object}		routeInfo			Route information.
 * @param	{Object}		options				Query options.
 *
 * @return  {string}		Url.
 */
Router.prototype.buildUrl = function(routeInfo)
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

// -----------------------------------------------------------------------------

/**
 * Build query string from the options object.
 *
 * @param	{Object}		options				Query options.
 *
 * @return  {String}		Query string.
 */
Router.prototype.buildUrlQuery = function(options)
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

// -----------------------------------------------------------------------------

/**
 * Create options array from the current url.
 */
Router.prototype.loadParameters = function()
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

// -----------------------------------------------------------------------------

/**
 * Open route.
 *
 * @param	{Object}		routeInfo			Route information.
 * @param	{Object}		options				Query options.
 */
Router.prototype.openRoute = function(routeInfo, options)
{

	options = Object.assign({}, options);
	options["pushState"] = true;
	options["autoOpen"] = true;

	this._open(routeInfo, options);

}

// -----------------------------------------------------------------------------

/**
 * Refresh route.
 *
 * @param	{Object}		options				Query options.
 */
Router.prototype.refreshRoute = function(routeInfo, options)
{

	options = Object.assign({}, options);
	options["pushState"] = false;
	options["autoOpen"] = true;

	this._open(routeInfo, options);

}

// -----------------------------------------------------------------------------

/**
 * Update route.
 *
 * @param	{Object}		routeInfo			Route information.
 * @param	{Object}		options				Query options.
 */
Router.prototype.updateRoute = function(routeInfo, options)
{

	options = Object.assign({}, options);
	options["autoRefresh"] = true;

	if (routeInfo["routeParameters"])
	{
		routeInfo["routeParameters"] = Object.assign(this._routeInfo["routeParameters"], routeInfo["routeParameters"]);
	}

	if (routeInfo["queryParameters"])
	{
		routeInfo["queryParameters"] = Object.assign(this._routeInfo["queryParameters"], routeInfo["queryParameters"]);
	}

	this._open(routeInfo, options);

}

// -----------------------------------------------------------------------------

/**
 * Replace current url.
 *
 * @param	{Object}		routeInfo			Route information.
 *
 * @return  {string}		Url.
 */
Router.prototype.replace = function(routeInfo)
{

	history.replaceState(null, null, this.buildUrl(routeInfo));

}

// -----------------------------------------------------------------------------
//	Protected
// -----------------------------------------------------------------------------

/**
 * Open route.
 *
 * @param	{Object}		routeInfo			Route information.
 * @param	{Object}		options				Query options.
 */
Router.prototype._open = function(routeInfo, options)
{

	options = Object.assign({}, options);
	options["pushState"] = ( options["pushState"] !== undefined ? options["pushState"] : true );
	let url = this.buildUrl(routeInfo);

	if (options["jump"])
	{
		// Jump to another page
		location.href = url;
		return;
	}
	else
	{
		let newRouteInfo = this.__loadRouteInfo(url);

		if (this._routeInfo["name"] != newRouteInfo["name"])
		{
			location.href = url;
			return;
		}
		else if (this._routeInfo["componentName"] != newRouteInfo["componentName"])
		{
			location.href = url;
			return;
			/*
			history.pushState(null, null, newRouteInfo["url"]);
			this.container["loader"].loadApp(newRouteInfo["specName"]);
			return;
			*/
		}

		Promise.resolve().then(() => {
			if (options["pushState"])
			{
				history.pushState(null, null, url);
			}
			this._routeInfo = this.__loadRouteInfo(window.location.href);
		}).then(() => {
			if (options["autoOpen"])
			{
				let componentName = this._routeInfo["componentName"];
				if (this._app._components[componentName])
				{
					return this._app._components[componentName].object.open({"sender":this});
				}
			}
		}).then(() => {
			if (options["autoRefresh"])
			{
				let componentName = this._routeInfo["componentName"];
				if (this._app._components[componentName])
				{
					return this._app._components[componentName].object.refresh({"sender":this});
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

// -----------------------------------------------------------------------------
//	Private
// -----------------------------------------------------------------------------

/**
 * Init routes.
 *
 * @param	{Object}		routes				Routes.
 */
Router.prototype.__initRoutes = function(routes)
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

// -----------------------------------------------------------------------------

/**
 * Get route info from the url.
 *
 * @param	{String}		url					Url.
 *
 * @return  {Object}		Route info.
 */
Router.prototype.__loadRouteInfo = function(url)
{

	let routeInfo = {};
	let routeName;
	let parsedUrl = new URL(url, window.location.href);
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
	routeInfo["url"] = parsedUrl["href"];
	routeInfo["path"] = parsedUrl.pathname;
	routeInfo["query"] = parsedUrl.search;
	routeInfo["parsedUrl"] = parsedUrl;
	routeInfo["routeParameters"] = params;
	routeInfo["queryParameters"] = this.loadParameters();

	return routeInfo;

}

// -----------------------------------------------------------------------------

/**
 * Init pop state handling.
 */
Router.prototype.__initPopState = function()
{

	if (window.history && window.history.pushState){
		window.addEventListener("popstate", (event) => {
			let promises = [];

			Object.keys(this._app._components).forEach((componentName) => {
				promises.push(this._app._components[componentName].object.trigger("beforePopState", this));
			});

			Promise.all(promises).then(() => {
				this.refreshRoute(this.__loadRouteInfo(window.location.href));
			}).then(() => {
				Object.keys(this._app._components).forEach((componentName) => {
					this._app._components[componentName].object.trigger("popState", this);
				});
			});
		});
	}

}
