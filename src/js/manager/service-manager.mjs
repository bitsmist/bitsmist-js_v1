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
	 * @param	{String}		componentName		Component name.
	 * @param	{Object}		options				Options for the component.
     */
	constructor(componentName, options)
	{

		this.name = componentName;
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
		let className =  ("class" in options ? options["class"] : pluginName);
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
	 * @param	{string}		methodName			Method name.
	 * @param	{array}			args				Arguments to method.
     */
	_callMethod(methodName, args)
	{

		for (let i = 0; i < this.plugins.length; i++)
		{
			if (methodName in this.plugins[i])
			{
				this.plugins[i][methodName].apply(this.plugins[i], args);
			}
			else
			{
				throw new NoMethodError(`Method not found. methodName=${methodName}`);
			}
		}

	}

}
