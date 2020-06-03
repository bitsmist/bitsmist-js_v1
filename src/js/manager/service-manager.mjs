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
//	Service manager class
// =============================================================================

export default class ServiceManager
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

		this.container = options["container"];
		this.plugins = [];

		/*
		return new Proxy(this, {
			get: (target, property) => {
				if (property in target)
				{
					return target[property];
				}
				else
				{
					return (...args) => {
						return this._callMethod(property, args);
					};
				}
			}
		});
		*/

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
     * Add a plugin.
     *
	 * @param	{String}		pluginName			Plugin name.
	 * @param	{Object}		options				Options for the plugin.
     */
	add(pluginName, options)
	{

		let newOptions = Object.assign({}, options);
		let className =  ("className" in options ? options["className"] : pluginName);
		if (!("container" in options))
		{
			newOptions["container"] = this.container;
		}

		let component = this.container["app"].createObject(className, newOptions);
		this.plugins.push(component);

	}

	// -------------------------------------------------------------------------
	//  Protected
	// -------------------------------------------------------------------------

	/**
     * Call plugin method.
     *
	 * @param	{String}		methodName			Method name.
	 * @param	{Array}			args				Arguments to method.
	 * @param	{Function}		filter				Filter function.
	 *
	 * @return  {Promise}		Promise.
     */
	_callMethod(methodName, args, filter)
	{

		return new Promise((resolve, reject) => {
			let promises = [];
			for (let i = 0; i < this.plugins.length; i++)
			{
				if (typeof this.plugins[i][methodName] == "function")
				{
					if (!filter || (typeof filter == "function" && filter(this.plugins[i])))
					{
						promises.push(this.plugins[i][methodName].apply(this.plugins[i], args));
					}
				}
			}

			Promise.all(promises).then((results) => {
				resolve(results);
			});
		});

	}

}
