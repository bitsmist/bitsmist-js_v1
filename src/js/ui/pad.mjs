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

		// Load pad specific options and merge
		this._options = Object.assign(this._getOptions(), this._options);

		this.components = ( this._options["components"] ? this._options["components"] : {} );
		this.elements = ( this._options["elements"] ? this._options["elements"] : {} );
		this.plugins = ( this._options["plugins"] ? this._options["plugins"] : {} );
		this.events = ( this._options["events"] ? this._options["events"] : {} );
		this.preferences = ( this._options["preferences"] ? this._options["preferences"] : {} );

		// Init system event handlers
		this._listener.addEventHandler("_initComponent", this.__initPadOnInitComponent);
		this._listener.addEventHandler("_append", this.__initPadOnAppend);

		// Init user event handlers
		Object.keys(this.events).forEach((eventName) => {
			this._listener.addEventHandler(eventName, this.events[eventName]["handler"]);
		});

		// Init resource
		if ("resource" in this._options && this._options["resource"])
		{
			if (this._options["resource"] in this._container["resources"])
			{
				this.resource = this._container["resources"][this._options["resource"]];
			}
			else
			{
				throw new NoResourceError(`Resource not found. name=${this._name}, resource=${this._options["resource"]}`);
			}
		}

		// Register preferences
		this._container["preferenceManager"].register(this, this.preferences);

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
			options = Object.assign({}, options);

			Promise.resolve().then(() => {
				// Create component
				if (!this.components[componentName] || !this.components[componentName].object)
				{
					return new Promise((resolve, reject) => {
						this._container["loader"].createComponent(componentName, options).then((component) => {
							component.parent = this;
							this.components[componentName] = ( this.components[componentName] ? this.components[componentName] : {} );
							this.components[componentName].object = component;
							resolve();
						});
					});
				}
			}).then(() => {
				// Auto open
				let component = this.components[componentName].object;
				if (component.getOption("autoOpen"))
				{
					return component.open();
				}
			}).then(() => {
				resolve();
			});
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

			options["container"] = this._container;
			options["component"] = this;
			plugin = this._container["app"].createObject(className, pluginName, options);
			this.plugins[pluginName] = ( this._options["plugins"][pluginName] ? this._options["plugins"][pluginName] : {} );
			this.plugins[pluginName].object = plugin;

			plugin["events"].forEach((eventName) => {
				this._listener.addEventHandler("_" + eventName, this.__callPluginEvent);
			});

			resolve(plugin);
		});

	}

	// -------------------------------------------------------------------------

	/**
     * Init component's html element's event handler.
	 *
	 * @param	{String}		elementName			Element name.
	 * @param	{Options}		options				Options.
     */
	initHtmlEvents(elementName, options)
	{

		// Get target elements
		let elements;
		if (elementName == "_self")
		{
			elements = [this._element];
		}
		else if (this.elements && this.elements[elementName] && "rootNode" in this.elements[elementName])
		{
			elements = this._element.querySelectorAll(this.elements[elementName]["rootNode"]);
		}
		else
		{
			elements = this._element.querySelectorAll("#" + elementName);
		}

		// Set event handlers
		let events = (this.elements[elementName]["events"] ? this.elements[elementName]["events"] : {});
		for (let i = 0; i < elements.length; i++)
		{
			Object.keys(events).forEach((eventName) => {
				// Merge options
				options = Object.assign({}, events[eventName], options);

				this._listener.addHtmlEventHandler(elements[i], eventName, events[eventName]["handler"], options);
			});
		}

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
		if (this._options["plugins"])
		{
			Object.keys(this._options["plugins"]).forEach((pluginName) => {
				this.addPlugin(pluginName, this._options["plugins"][pluginName]);
			});
		}

	}

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
				// Init HTML elments' event handlers
				Object.keys(this.elements).forEach((elementName) => {
						this.initHtmlEvents(elementName);
				});

				resolve();
			});
		});

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
