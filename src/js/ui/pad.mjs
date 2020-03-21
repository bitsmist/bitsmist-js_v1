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
	 * @param	{string}		componentName		Component name.
	 * @param	{array}			options				Options for the component.
     */
	constructor(componentName, options)
	{

		super(componentName, options);

		this.components;
		this.parent;
		this.plugins = {};

		// Load pad specific options
		let extraOptions = this._getOptions();
		Object.assign(this.options, extraOptions);

		// Load pad specific components info
		this.components = this._getComponents();

		// Init system event handlers
		this.events.addEventHandler("_append", this.__initPadOnAppend);
		this.events.addEventHandler("_clone", this.__initPadOnClone);

		// Init plugins
		if (this.options.plugins)
		{
			this.events.addEventHandler("_initComponent", this.__initPlugins);
		}

		// Init user event handlers
		this.__addBitsmistEventHandlers(this, this.options["events"]);

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
	 * @param	{string}		componentName		Component name.
	 * @param	{array}			options				Options for the component.
	 *
	 * @return  {Promise}		Promise.
     */
	addComponent(componentName, options)
	{

		return new Promise((resolve, reject) => {
			let promise;
			options = Object.assign({}, options);

			this.container["loader"].createComponent(componentName, options).then((component) => {
				component.parent = this;
				if (!this.components[componentName])
				{
					this.components[componentName] = {};
				}
				this.components[componentName].object = component;

				// Merge options
				//Object.assign(component.options, this.components[componentName]);

				// Merge event handlers
				this.__addBitsmistEventHandlers(component, this.components[componentName]["events"]);

				// Auto open
				if ("autoOpen" in options && options["autoOpen"])
				{
					promise = component.open();
				}

				Promise.all([promise]).then(() => {
					resolve();
				});
			});
		});

	}

	// -------------------------------------------------------------------------

	/**
     * Init HTMLElement's event handler.
	 *
	 * @param	{String}		componentName		Component name.
	 * @param	{HTMLElement}	rootElement			Component top node.
	 * @param	{Options}		options				Options.
     */
	initHtmlEvents(componentName, rootElement, options)
	{

		let elements;

		if ("group" in this.components[componentName])
		{
			elements = rootElement.querySelectorAll("[data-bm-group='" + this.components[componentName]["group"] + "']");
		}
		else
		{
			elements = rootElement.querySelectorAll("#" + componentName);
		}

		for (let i = 0; i < elements.length; i++)
		{
			this.__addHtmlEventHandlers(elements[i], this.components[componentName]["events"], options);
		}

	}

	// -------------------------------------------------------------------------
	//  Protected
	// -------------------------------------------------------------------------

	/**
     * Get Pad options.  Need to override.
	 *
	 * @return  {array}			Options.
     */
	_getOptions()
	{

		return {};

	}

	// -------------------------------------------------------------------------

	/**
     * Get Pad subcomponent information.  Need to override.
	 *
	 * @return  {array}			Sub components information.
     */
	_getComponents(){

		return {};

	}

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
     * Init sub components.  Called when the pad appended to a node.
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
			let chain = Promise.resolve();

			Object.keys(this.components).forEach((componentName) => {
				if ("class" in this.components[componentName])
				{
					chain = chain.then(() => {
						// Add Bitsmist component
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
     * Init sub components.  Called when the pad cloned to a node.
	 *
	 * @param	{Object}		sender				Sender.
	 * @param	{Object}		e					Event info.
 	 * @param	{Object}		ex					Extra info.
	 *
	 * @return  {Promise}		Promise.
     */
	__initPadOnClone(sender, e, ex)
	{

		let options = {"clone":ex.clone};

		Object.keys(this.components).forEach((componentName) => {
			if (!("class" in this.components[componentName]))
			{
				// Init HTML elments' event handlers
				this.initHtmlEvents(componentName, ex.clone.element, options);
			}
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Init plugins.
	 *
	 * @param	{Object}		sender				Sender.
	 * @param	{Object}		e					Event info.
 	 * @param	{Object}		ex					Extra info.
	 *
	 * @return  {Promise}		Promise.
	 */
	__initPlugins(sender, e, ex)
	{

		// Init plugins

		let events = {};
		let pluginOptions = {};
		pluginOptions["container"] = this.container;
		pluginOptions["component"] = this;

		Object.keys(this.options["plugins"]).forEach((pluginName) => {
			pluginOptions["options"] = this.options["plugins"][pluginName];
			let className = this.options["plugins"][pluginName]["class"];
			this.plugins[className] = this.container["app"].createObject(className, pluginOptions);
			Object.keys(this.options["plugins"][pluginName]).forEach((featureName) => {
				if (this.plugins[className].features[featureName])
				{
					this.plugins[className].features[featureName].events.forEach((eventName) => {
						events[eventName] = true;
					});
				}
			});
		});

		Object.keys(events).forEach((eventName) => {
			this.events.addEventHandler("_" + eventName, this.__callPluginEvent);
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
				if (this.plugins[pluginName].options["enabled"])
				{
					this.plugins[pluginName]["element"] = ex.clone.element;
					promises.push(this.plugins[pluginName][eventName](sender, e, ex));
				}
			});

			Promise.all(promises).then(() => {
				resolve();
			});
		});

	}

	// -------------------------------------------------------------------------

	/**
     * Init HTML elements' event handler.
	 *
	 * @param	{HTMLElement}	element				HTMLElement.
	 * @param	{Object}		events				Events info array.
	 * @param	{Object}		options				Options to pass to html event.
     */
	__addHtmlEventHandlers(element, events, options)
	{

		if (events)
		{
			Object.keys(events).forEach((eventName) => {
				this.events.addHtmlEventHandler(element, eventName, this, events[eventName], options);
			});
		}

	}

	// -------------------------------------------------------------------------

	/**
     * Init BitsMist components' event handler.
	 *
	 * @param	{Object}		component			Component.
	 * @param	{Object}		events				Events info array.
     */
	__addBitsmistEventHandlers(component, events)
	{

		if (events)
		{
			Object.keys(events).forEach((eventName) => {
				component.events.addEventHandler(eventName, events[eventName]);
			});
		}

	}

}
