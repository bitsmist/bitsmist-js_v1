// =============================================================================
/**
 * Bitsmist WebView - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import Component from './component';

// =============================================================================
//	Pad class
// =============================================================================

export default class Pad extends Component
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

		super(componentName, options);

		this.parent;

		// Load pad specific options and merge
		this.options = Object.assign(this._getOptions(), this.options);

		this.components = ( this.options["components"] ? this.options["components"] : {} );
		this.elements = ( this.options["elements"] ? this.options["elements"] : {} );
		this.plugins = ( this.options["plugins"] ? this.options["plugins"] : {} );
		this.events = ( this.options["events"] ? this.options["events"] : {} );

		// Init system event handlers
		this.listener.addEventHandler("_initComponent", this.__initPadOnInitComponent);
		this.listener.addEventHandler("_append", this.__initPadOnAppend);

		// Init user event handlers
		Object.keys(this.events).forEach((eventName) => {
			if (this.events[eventName]["handler"])
			{
				this.listener.addEventHandler(eventName, this.events[eventName]["handler"]);
			}
		});

		// Init resource
		if ("resource" in this.options && this.options["resource"])
		{
			if (this.options["resource"] in this.container["resources"])
			{
				this.resource = this.container["resources"][this.options["resource"]];
			}
			else
			{
				throw new NoResourceError(`Resource not found. name=${this.name}, resource=${this.options["resource"]}`);
			}
		}

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
     * Add a component to the pad.
     *
	 * @param	{String}		componentName		Component name.
	 * @param	{Object}		options				Options for the component.
	 *
	 * @return  {Promise}		Promise.
     */
	addComponent(componentName, options)
	{

		return new Promise((resolve, reject) => {
			let promise;
			options = Object.assign({}, options);

			if (!this.components[componentName] || !this.components[componentName].object)
			{
				this.container["loader"].createComponent(componentName, options).then((component) => {
					component.parent = this;
					this.components[componentName] = ( this.components[componentName] ? this.components[componentName] : {} );
					this.components[componentName].object = component;

					// Auto open
					if (component.getOption("autoOpen"))
					{
						promise = component.open();
					}

					Promise.all([promise]).then(() => {
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

	// -------------------------------------------------------------------------

	/**
     * Add a plugin to the pad.
     *
	 * @param	{String}		componentName		Component name.
	 * @param	{Object}		options				Options for the component.
	 *
	 * @return  {Promise}		Promise.
     */
	addPlugin(pluginName, options)
	{

		return new Promise((resolve, reject) => {
			options = ( options ? options : {} );
			let className = ( "class" in options ? options["class"] : pluginName );
			let plugin = null;

			options["container"] = this.container;
			options["component"] = this;
			plugin = this.container["app"].createObject(className, options);
			this.plugins[pluginName] = ( this.options["plugins"][pluginName] ? this.options["plugins"][pluginName] : {} );
			this.plugins[pluginName].object = plugin;

			plugin["events"].forEach((eventName) => {
				this.listener.addEventHandler("_" + eventName, this.__callPluginEvent);
			});

			resolve(plugin);
		});

	}

	// -------------------------------------------------------------------------
	//  Protected
	// -------------------------------------------------------------------------

	/**
     * Get Pad options.  Need to override.
	 *
	 * @return  {Object}		Options.
     */
	_getOptions()
	{

		return {};

	}

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
     * Init on append.
	 *
	 * @param	{Object}		sender				Sender.
	 * @param	{Object}		e					Event info.
 	 * @param	{Object}		ex					Extra info.
	 *
	 * @return  {Promise}		Promise.
     */
	__initPadOnAppend(sender, e, ex)
	{

		return new Promise((resolve, reject) => {
			// Add Bitsmist component
			let chain = Promise.resolve();
			Object.keys(this.components).forEach((componentName) => {
				if ("class" in this.components[componentName])
				{
					chain = chain.then(() => {
						return this.addComponent(componentName, this.components[componentName]);
					});
				}
			});

			chain.then(() => {
				resolve();
			});
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Init on initComponent.
	 *
	 * @param	{Object}		sender				Sender.
	 * @param	{Object}		e					Event info.
 	 * @param	{Object}		ex					Extra info.
	 *
	 * @return  {Promise}		Promise.
	 */
	__initPadOnInitComponent(sender, e, ex)
	{

		// Init plugins
		if (this.options["plugins"])
		{
			Object.keys(this.options["plugins"]).forEach((pluginName) => {
				this.addPlugin(pluginName, this.options["plugins"][pluginName]);
			});
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Call plugin's event handler.
	 *
	 * @param	{Object}		sender				Sender.
	 * @param	{Object}		e					Event info.
 	 * @param	{Object}		ex					Extra info.
	 *
	 * @return  {Promise}		Promise.
	 */
	__callPluginEvent(sender, e, ex)
	{

		return new Promise((resolve, rejfect) => {
			let promises = [];
			let eventName = ex.eventName.substr(1);

			Object.keys(this.plugins).forEach((pluginName) => {
				if (this.plugins[pluginName]["enabled"])
				{
					promises.push(this.plugins[pluginName].object[eventName](sender, e, ex));
				}
			});

			Promise.all(promises).then(() => {
				resolve();
			});
		});

	}

}
