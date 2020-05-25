// =============================================================================
/**
 * Bitsmist WebView - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

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

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
	 * Get route info from the url.
	 *
	 * @return  {Object}		Route info.
 	 */
	loadRoute()
	{

		let routeInfo = {};

		let pos = window.location.href.indexOf("?");
		let url = (pos >= 0 ? window.location.href.substr(0, pos) : window.location.href);
		let p = url.split("/");

		if (p.length == 6)
		{
			routeInfo["appName"] = "";
			routeInfo["resourceName"] = p[3];
			routeInfo["commandName"] = p[4];
		}
		else
		{
			routeInfo["appName"] = p[3];
			routeInfo["resourceName"] = p[4];
			routeInfo["commandName"] = p[5];
		}

		routeInfo["parameters"] = this.container["loader"].loadParameters();

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
					return this.container["components"][padName].object.open({"sender":this});
				}
			}).then(() => {
				// Refresh
				if (options["autoRefresh"])
				{
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

		if (this.container["appInfo"]["spec"]["commands"][commandName])
		{
			padName = this.container["appInfo"]["spec"]["commands"][commandName]["startup"];
		}
		else if (this.container["appInfo"]["spec"]["commands"]["*"])
		{
			padName = this.container["appInfo"]["spec"]["commands"]["*"]["startup"];
		}

		return padName;

	}

}
