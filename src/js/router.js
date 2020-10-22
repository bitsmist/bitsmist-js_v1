// =============================================================================
/**
 * Bitsmist WebView - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import ClassUtil from './util/class-util';
import Component from './component';
import { pathToRegexp } from 'path-to-regexp';

// =============================================================================
//	Router class
// =============================================================================

// -----------------------------------------------------------------------------
//  Constructor
// -----------------------------------------------------------------------------

/**
 * Constructor.
 *
 * @param	{Object}		settings			Options for the component.
 */
export default function Router(settings)
{

	// super()
	settings = Object.assign({}, {"name":"Router", "templateName":"", "autoSetup":false}, settings);
	let _this = Reflect.construct(Component, [settings], this.constructor);

	// Init vars
	this._spec;

	// Init when connected
	_this.addEventHandler(_this, "connected", _this.onConnected);

	return _this;

}

ClassUtil.inherit(Router, Component);
customElements.define("bm-router", Router);

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
//	Event handlers
// -----------------------------------------------------------------------------

/**
 * Connected event handler.
 *
 * @param	{Object}		sender				Sender.
 * @param	{Object}		e					Event info.
 */
Router.prototype.onConnected = function(sender, e)
{

	return new Promise((resolve, reject) => {
		this._settings.set("routes", this._settings.get("routes", []));
		this.__initRoutes(this._settings.get("routes"));
		this._routeInfo = this.__loadRouteInfo(window.location.href);
		this.__initPopState();

		this.__initSpec().then(() => {
			return this.trigger("specLoad", this, {"spec":this._spec});
		}).then(() => {
			resolve();
		});
	});

}

// -----------------------------------------------------------------------------
//  Methods
// -----------------------------------------------------------------------------

/**
 * Add a route.
 *
 * @param	{Object}		routeInfo			Route info.
 * @param	{Boolean}		first				Add to top when true.
 */
Router.prototype.addRoute = function(routeInfo, first)
{

	let keys = [];
	let route = {
		"origin": routeInfo["origin"],
		"name": routeInfo["name"],
		"path": routeInfo["path"],
		"keys": keys,
		"specName": routeInfo["specName"],
		"componentName": routeInfo["componentName"],
		"re": pathToRegexp(routeInfo["path"], keys)
	};

	if (first)
	{
		this._routes.unshift(route);
	}
	else
	{
		this._routes.push(route);
	}

	this._routeInfo = this.__loadRouteInfo(window.location.href);

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
	this._routeInfo = this.__loadRouteInfo(window.location.href);

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
				if (this._components[componentName])
				{
					return this._components[componentName].open({"sender":this});
				}
			}
		}).then(() => {
			if (options["autoRefresh"])
			{
				let componentName = this._routeInfo["componentName"];
				if (this._components[componentName])
				{
					return this._components[componentName].refresh({"sender":this});
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
		this.addRoute(routes[i]);
	}

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

	for (let i = this._routes.length - 1; i >= 0; i--)
	{
		// Check origin
		if ( !this._routes[i]["origin"] || (this._routes[i]["origin"] && parsedUrl.origin == this._routes[i]["origin"]))
		{
			// Check path
			let result = ( !this._routes[i]["path"] ? [] : this._routes[i].re.exec(parsedUrl.pathname));
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

			Object.keys(this._components).forEach((componentName) => {
				promises.push(this._components[componentName].trigger("beforePopState", this));
			});

			Promise.all(promises).then(() => {
				this.refreshRoute(this.__loadRouteInfo(window.location.href));
			}).then(() => {
				Object.keys(this._components).forEach((componentName) => {
					this._components[componentName].trigger("popState", this);
				});
			});
		});
	}

}

// -----------------------------------------------------------------------------

/**
 * Load a spec and init.
 */
Router.prototype.__initSpec = function()
{

	return new Promise((resolve, reject) => {
		let specName = this._routeInfo["specName"];
		if (specName)
		{
			let path = this._element.getAttribute("data-specpath") || "";

			this.loadSpec(specName, path).then((spec) => {
				this._spec = spec;

				// Add new routes
				if (spec["routes"])
				{
					for(let i = 0; i < spec["routes"].length; i++)
					{
						this.addRoute(spec["routes"][i]);
					}
				}

				// Add new Plugins
				if (spec["plugins"])
				{
					Object.keys(spec["plugins"]).forEach((pluginName) => {
						this.addPlugin(pluginName, spec["plugins"][pluginName]);
					});
				}

				// Add new Components
				let chain = Promise.resolve();
				if (spec["components"])
				{
					Object.keys(spec["components"]).forEach((componentName) => {
						chain = chain.then(() => {
							return this.addComponent(componentName, spec["components"][componentName]);
						});
					});
				}

				chain.then(() => {
					resolve();
				});
			});
		}
		else
		{
			resolve();
		}
	});

}
