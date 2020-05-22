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

		this._components = ( this._options["components"] ? this._options["components"] : {} );
		this._elements = ( this._options["elements"] ? this._options["elements"] : {} );
		this._plugins = ( this._options["plugins"] ? this._options["plugins"] : {} );
		this._events = ( this._options["events"] ? this._options["events"] : {} );
		this._preferences = ( this._options["preferences"] ? this._options["preferences"] : {} );
		this._resource;

		// Init system event handlers
		this._listener.addEventHandler("_initComponent", this.__initPadOnInitComponent);
		this._listener.addEventHandler("_append", this.__initPadOnAppend);

		// Init user event handlers
		Object.keys(this._events).forEach((eventName) => {
			this._listener.addEventHandler(eventName, this._events[eventName]["handler"]);
		});

		// Init resource
		if ("resource" in this._options && this._options["resource"])
		{
			if (this._options["resource"] in this._container["resources"])
			{
				this._resource = this._container["resources"][this._options["resource"]];
			}
			else
			{
				throw new NoResourceError(`Resource not found. name=${this._name}, resource=${this._options["resource"]}`);
			}
		}

		// Register preferences
		this._container["preferenceManager"].register(this, this._preferences);

	}

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

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
				if (!this._components[componentName] || !this._components[componentName].object)
				{
					return new Promise((resolve, reject) => {
						this._container["loader"].createComponent(componentName, options).then((component) => {
							component.parent = this;
							this._components[componentName] = ( this._components[componentName] ? this._components[componentName] : {} );
							this._components[componentName].object = component;
							resolve();
						});
					});
				}
			}).then(() => {
				// Auto open
				let component = this._components[componentName].object;
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
			this._plugins[pluginName] = ( this._options["plugins"][pluginName] ? this._options["plugins"][pluginName] : {} );
			this._plugins[pluginName].object = plugin;

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
		else if (this._elements && this._elements[elementName] && "rootNode" in this._elements[elementName])
		{
			elements = this._element.querySelectorAll(this._elements[elementName]["rootNode"]);
		}
		else
		{
			elements = this._element.querySelectorAll("#" + elementName);
		}

		// Set event handlers
		let events = (this._elements[elementName]["events"] ? this._elements[elementName]["events"] : {});
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

	/**
     * Initialization of component on open().
     */
	_initOnOpen()
	{

		this.autoFocus();

		// Css
		let css = (this._events["open"] && this._events["open"]["css"] ? this._events["open"]["css"] : undefined );
		if (css)
		{
			Object.assign(this._element.style, css);
		}

	}

	autoFocus()
	{

		if (this.getOption("autoFocus"))
		{
			let element = document.querySelector(this.getOption("autoFocus")).focus({preventScroll:true});
			if (element)
			{
				let scrollTop = ( document.scrollingElement ? document.scrollingElement.scrollTop : undefined );
				/*
				if (document.scrollingElement)
				{
					scrollTop = document.scrollingElement.scrollTop;
				}
				*/

				element.focus({preventScroll:true});

				if (scrollTop)
				{
					window.scrollTo(0, scrollTop); // workaround for safari
				}
			}

		}

	}

	// -------------------------------------------------------------------------

	/**
     * Initialization of clone on close().
     */
	_initOnClose()
	{

		// Css
		let css = (this._events && this._events["close"] && this._events["close"]["css"] ? this._events["close"]["css"] : undefined );
		if (css)
		{
			Object.assign(this._element.style, css);
		}

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
			Object.keys(this._components).forEach((componentName) => {
				if ("class" in this._components[componentName])
				{
					chain = chain.then(() => {
						return this.addComponent(componentName, this._components[componentName]);
					});
				}
			});

			chain.then(() => {
				// Init HTML elments' event handlers
				Object.keys(this._elements).forEach((elementName) => {
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

			Object.keys(this._plugins).forEach((pluginName) => {
				if (this._plugins[pluginName]["enabled"])
				{
					promises.push(this._plugins[pluginName].object[eventName](sender, e, ex));
				}
			});

			Promise.all(promises).then(() => {
				resolve();
			});
		});

	}

}
