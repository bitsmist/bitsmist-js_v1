// =============================================================================
/**
 * Bitsmist WebView - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import AjaxUtil from '../util/ajax-util';
//import { NoClassError, NoNodeError, NotValidFunctionError } from '../error/errors';
import LoaderUtil from '../util/loader-util';

// =============================================================================
//	Component class
// =============================================================================

export default class Component extends HTMLElement
{

	// -------------------------------------------------------------------------
	//  Constructor
	// -------------------------------------------------------------------------

	/**
     * Constructor.
     */
	constructor()
	{

		super();

		this._app = this;
		this._templates = {};
		this._isOpen = false;
		this._element = this;
		this._options = Object.assign({}, this._getOptions());
		this._options["templateName"] = ( "templateName" in this._options ? this._options["templateName"] : this.name );
		this._uniqueId = new Date().getTime().toString(16) + Math.floor(100*Math.random()).toString(16);
		this._modalOptions;
		this._modalResult;
		this._modalPromise;
		this._isModal = false;

		this._components = ( this._options["components"] ? this._options["components"] : {} );
		this._elements = ( this._options["elements"] ? this._options["elements"] : {} );
		this._plugins = ( this._options["plugins"] ? this._options["plugins"] : {} );
		this._events = ( this._options["events"] ? this._options["events"] : {} );
		this._services = ( this._options["services"] ? this._options["services"] : {} );

		// Init event handlers
		Object.keys(this._events).forEach((eventName) => {
			this.addEventHandler(this, eventName, this._events[eventName]["handler"]);
		});

		this.trigger("_initComponent", this).then(() => {
			return this.trigger("initComponent", this);
		});

	}

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	/**
     * Component name.
     *
	 * @type	{String}
     */
	get name()
	{

		return this.getOption("name");

	}

	// -------------------------------------------------------------------------

	/**
     * Element.
     *
	 * @type	{String}
     */
	get element()
	{

		return this._element;

	}

	// -------------------------------------------------------------------------

	/**
     * Instance's unique id.
     *
	 * @type	{String}
     */
	get uniqueId()
	{

		return this._uniqueId;

	}

	// -------------------------------------------------------------------------

	/**
     * App instance.
     *
	 * @type	{String}
     */
	get app()
	{

		return BITSMIST.v1._app;

	}

	// -------------------------------------------------------------------------

	/**
     * Router instance.
     *
	 * @type	{String}
     */
	get router()
	{

		return BITSMIST.v1._router;

	}

}

// -------------------------------------------------------------------------
//  Methods
// -------------------------------------------------------------------------

/**
 * Set option value.
 *
 * @param	{String}		key					Key to get.
 * @param	{Object}		value				Value  to set.
 */
Component.prototype.setOption = function(key, value)
{

	this._options[key] = value;

}

// -------------------------------------------------------------------------

/**
 * Get option value. Return default value when specified key is not available.
 *
 * @param	{String}		key					Key to get.
 * @param	{Object}		defaultValue		Value returned when key is not found.
 *
 * @return  {*}				Value.
 */
Component.prototype.getOption = function(key, defaultValue)
{

	let result = defaultValue;

	if (this._options && (key in this._options))
	{
		result = this._options[key];
	}

	return result;

}

// -------------------------------------------------------------------------

/**
 * Open component.
 *
 * @param	{Object}		options				Options.
 *
 * @return  {Promise}		Promise.
 */
Component.prototype.open = function(options)
{

	console.debug(`Component.open(): Opening component. name=${this.name}`);

	return new Promise((resolve, reject) => {
		options = Object.assign({}, options);
		let sender = ( options["sender"] ? options["sender"] : this );

		Promise.resolve().then(() => {
			return this.__autoLoadTemplate(this.getOption("templateName"));
		}).then(() => {
			return this.setup();
		}).then(() => {
			if (this.getOption("autoRefresh"))
			{
				return this.refresh();
			}
		}).then(() => {
			return this.trigger("_beforeOpen", sender, {"options":options});
		}).then(() => {
			return this.trigger("beforeOpen", sender, {"options":options});
		}).then(() => {
			return this.trigger("open", sender, {"options":options});
		}).then(() => {
			return this.trigger("_open", sender, {"options":options});
		}).then(() => {
			this.__initOnOpen();
			console.debug(`Component.open(): Opened component. name=${this.name}`);
			this._isOpen = true;
			resolve();
		});
	});

}

// -------------------------------------------------------------------------

/**
 * Open component modally.
 *
 * @param	{array}			options				Options.
 *
 * @return  {Promise}		Promise.
 */
Component.prototype.openModal = function(options)
{

	console.debug(`Component.openModal(): Opening modally component. name=${this.name}`);

	return new Promise((resolve, reject) => {
		options = Object.assign({}, options);
		this._options = Object.assign(this._options, options);
		this._isModal = true;
		this._modalResult = {"result":false};
		this._modalOptions = options;
		this._modalPromise = { "resolve": resolve, "reject": reject };
		this.open();
		this._isOpen = true;
	});

}

// -------------------------------------------------------------------------

/**
 * Close component.
 *
 * @param	{Object}		options				Options.
 *
 * @return  {Promise}		Promise.
 */
Component.prototype.close = function(options)
{

	console.debug(`Component.close(): Closing component. name=${this.name}`);

	return new Promise((resolve, reject) => {
		options = Object.assign({}, options);
		let sender = ( options["sender"] ? options["sender"] : this );

		Promise.resolve().then(() => {
			return this.trigger("_beforeClose", sender);
		}).then(() => {
			return this.trigger("beforeClose", sender);
		}).then(() => {
			return this.trigger("close", sender);
		}).then(() => {
			return this.trigger("_close", sender);
		}).then(() => {
			console.debug(`Component.close(): Closed component. name=${this.name}`);
			if (this._isModal)
			{
				this._modalPromise.resolve(this._modalResult);
			}
			this.__initOnClose();
			this._isOpen = false;
			resolve();
		});
	});

}

// -------------------------------------------------------------------------

/**
 * Refresh component.
 *
 * @return  {Promise}		Promise.
 */
Component.prototype.refresh = function(options)
{

	console.debug(`Component.refresh(): Refreshing component. name=${this.name}`);

	return new Promise((resolve, reject) => {
		options = Object.assign({}, options);
		let sender = ( options["sender"] ? options["sender"] : this );

		Promise.resolve().then(() => {
			return this.trigger("_beforeRefresh", sender);
		}).then(() => {
			return this.trigger("beforeRefresh", sender);
		}).then(() => {
			if (this.getOption("autoFill"))
			{
				return this.fill(options);
			}
		}).then(() => {
			return this.trigger("refresh", sender);
		}).then(() => {
			return this.trigger("_refresh", sender);
		}).then(() => {
			this.__autoFocus();
			resolve();
		});
	});

}

// -------------------------------------------------------------------------

/**
 * Apply settings.
 *
 * @param	{Object}		options				Options.
 *
 * @return  {Promise}		Promise.
 */
Component.prototype.setup = function(options)
{

	console.debug(`Component.setup(): Setting up component. name=${this.name}`);

	return new Promise((resolve, reject) => {
		options = Object.assign({}, options);
		let preferences = BITSMIST.v1.Settings["preferences"];
		options["currentPreferences"] = ( options["currentPreferences"] ? options["currentPreferences"] : preferences);
		options["newPreferences"] = ( options["newPreferences"] ? options["newPreferences"] : preferences );
		let sender = ( options["sender"] ? options["sender"] : this );

		Promise.resolve().then(() => {
			return this.trigger("formatSettings", sender, options);
		}).then(() => {
			return this.trigger("validateSettings", sender,  options);
		}).then(() => {
			return this.trigger("beforeSetup", sender, options);
		}).then(() => {
			return this.trigger("setup", sender, options);
		}).then(() => {
			resolve();
		});
	});

}

// -------------------------------------------------------------------------

/**
 * Fill.
 *
 * @param	{Object}		options				Options.
 *
 * @return  {Promise}		Promise.
 */
Component.prototype.fill = function(options)
{
}

// -------------------------------------------------------------------------

/**
 * Change template html.
 *
 * @param	{String}		templateName		Template name.
 *
 * @return  {Promise}		Promise.
 */
Component.prototype.switchTemplate = function(templateName)
{

	console.debug(`Component.switchTemplate(): Switching template. name=${this.name}, templateName=${templateName}`);

	return new Promise((resolve, reject) => {
		this.__autoLoadTemplate(templateName).then(() => {
			this._options["templateName"] = templateName;
			return this.trigger("templateChange", this);
		}).then(() => {
			resolve();
		});
	});

}

// -------------------------------------------------------------------------

/**
 * Add a component to the pad.
 *
 * @param	{String}		componentName		Component name.
 * @param	{Object}		options				Options for the component.
 *
 * @return  {Promise}		Promise.
 */
Component.prototype.addComponent = function(componentName, options)
{

	return new Promise((resolve, reject) => {
		options = Object.assign({}, options);

		Promise.resolve().then(() => {
			// Create component
			if (!this._components[componentName] || !this._components[componentName].object)
			{
				return new Promise((resolve, reject) => {
					LoaderUtil.createComponent(componentName, options).then((component) => {
						component._parent = this;
						this._components[componentName] = ( this._components[componentName] ? this._components[componentName] : {} );
						this._components[componentName].object = component;
						resolve();
					});
				});
			}
		}).then(() => {
			// Open
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
Component.prototype.addPlugin = function(pluginName, options)
{

	return new Promise((resolve, reject) => {
		options = Object.assign({}, options);
		let className = ( "className" in options ? options["className"] : pluginName );
		let plugin = null;

		options["component"] = this;
		plugin = LoaderUtil.createObject(className, pluginName, options);
		this._plugins[pluginName] = ( this._options["plugins"][pluginName] ? this._options["plugins"][pluginName] : {} );
		this._plugins[pluginName].object = plugin;

		plugin["events"].forEach((eventName) => {
			this.addEventHandler(this, "_" + eventName, this.__callPluginEventHandler);
		});

		resolve(plugin);
	});

}

// -------------------------------------------------------------------------

/**
 * Add an event handler.
 *
 * @param	{HTMLElement}	element					HTML element.
 * @param	{String}		eventName				Event name.
 * @param	{Function}		handler					Event handler.
 * @param	{Object}		options					Options passed to elements.
 */
Component.prototype.addEventHandler = function(element, eventName, handler, options)
{

	if (typeof handler === "function")
	{
		let listeners = ( element._bm_detail && element._bm_detail.listeners ? element._bm_detail.listeners : {} );

		if (!element._bm_detail)
		{
			element._bm_detail = { "component": this, "listeners": listeners };
		}

		if (!listeners[eventName])
		{
			listeners[eventName] = [];
			element.addEventListener(eventName, this.__callEventHandler);
		}

		listeners[eventName].push({"handler":handler, "options":options});
	}
	else
	{
		//throw new NotValidFunctionError(`Event handler is not a function. name=${this.name}, eventName=${eventName}`);
		throw new Error(`Event handler is not a function. name=${this.name}, eventName=${eventName}`);
	}

}

// -------------------------------------------------------------------------

/**
 * Clone the component.
 *
 * @param	{String}		newId				Id for the cloned component.
 * @param	{String}		templateName		Template name.
 *
 * @return  {Object}		Cloned component.
 */
/*
Component.prototype.clone(newId, templateName)
{

	let clone;
	let template = this._templates[templateName].template;

	if (!template)
	{
		template = document.createElement('template');
		template.innerHTML = this._templates[templateName].html;

		this._templates[templateName].template = template;
	}

	if ( "content" in template )
	{
		clone = document.importNode(template.content, true);
		if (newId)
		{
			clone.firstElementChild.id = newId;
		}
	}
	else
	{
		clone = template.cloneNode(true).children[0];
		if (newId)
		{
			clone.id = newId;
		}
	}

	return clone;

}
*/

// -------------------------------------------------------------------------

/**
 * Trigger the event.
 *
 * @param	{String}		eventName				Event name to trigger.
 * @param	{Object}		sender					Object which triggered the event.
 * @param	{Object}		options					Event parameter options.
 */
Component.prototype.trigger = function(eventName, sender, options)
{

	options = Object.assign({}, options);
	options["eventName"] = eventName;
	options["sender"] = sender;
	let e = null;

	try
	{
		e = new CustomEvent(eventName, { detail: options });
	}
	catch(error)
	{
		e  = document.createEvent('CustomEvent');
		e.initCustomEvent(eventName, false, false, options);
	}

	return this.__callEventHandler(e);

}

// -------------------------------------------------------------------------

/**
 * Trigger the HTML event.
 *
 * @param	{HTMLElement}	element					Html element.
 * @param	{String}		eventName				Event name to trigger.
 * @param	{Object}		sender					Object which triggered the event.
 * @param	{Object}		options					Event parameter options.
 */
Component.prototype.triggerHtmlEvent = function(element, eventName, sender, options)
{

	options = Object.assign({}, options);
	options["eventName"] = eventName;
	options["sender"] = sender;
	let e = null;

	try
	{
		e = new CustomEvent(eventName, { detail: options });
	}
	catch(error)
	{
		e  = document.createEvent('CustomEvent');
		e.initCustomEvent(eventName, false, false, options);
	}

	element.dispatchEvent(e);

}

// -------------------------------------------------------------------------

/**
 * Wait for components to be loaded.
 *
 * @param	{Array}			waitlist			Components to wait.
 *
 * @return  {Array}			Promises.
 */
Component.prototype.waitFor = function(waitlist)
{

	let promise;

	if (!waitlist || this._isLoadedComponent(waitlist))
	{
		promise = Promise.resolve();
	}
	else
	{
		let waitInfo = {};
		waitInfo["waitlist"] = waitlist;

		promise = new Promise((resolve, reject) => {
			waitInfo["resolve"] = resolve;
			waitInfo["reject"] = reject;
		});
		waitInfo["promise"] = promise;

		BITSMIST.v1._waiting.push(waitInfo);
	}

	return promise;

}

// -----------------------------------------------------------------------------
//  Callbacks
// -----------------------------------------------------------------------------

/**
 * Connected callback.
 */
Component.prototype.connectedCallback = function()
{

	this.open().then(() => {
		this.__registerComponent();
	});

}

// -----------------------------------------------------------------------------
//  Protected
// -----------------------------------------------------------------------------

/**
 * Get component options.  Need to override.
 *
 * @return  {Object}		Options.
 */
Component.prototype._getOptions = function()
{

	return {};

}

// -------------------------------------------------------------------------

/**
 * Check if components are loaded.
 *
 * @param	{Array}			waitlist			Components to wait.
 *
 * @return  {Array}			Promises.
 */
Component.prototype._isLoadedComponent = function(waitlist)
{

	let result = true;

	for (let i = 0; i < waitlist.length; i++)
	{
		let match = false;

		for (let j = 0; j < BITSMIST.v1._loaded.length; j++)
		{
			if (BITSMIST.v1._loaded[j].name == waitlist[i]["componentName"])
			{
				match = true;
				break;
			}
		}

		if (!match)
		{
			result = false;
			break;
		}
	}

	return result;

}

// -----------------------------------------------------------------------------

/**
* Check if the template is loaded.
*
* @return  {bool}			True if loaded.
*/
Component.prototype._isLoadedTemplate = function(templateName)
{

	let isLoaded = false;

	if (templateName in this._templates && this._templates[templateName].html)
	{
		isLoaded = true;
	}

	return isLoaded

}

// -------------------------------------------------------------------------

/**
 * Duplicate the component element.
 *
 * @param	{String}		newId				Id for the cloned component.
 * @param	{String}		templateName		Template name.
 *
 * @return  {Object}		Cloned component.
 */
Component.prototype._dupElement = function(templateName)
{

	templateName = ( templateName ? templateName : this.getOption("templateName") );

	let ele = document.createElement("div");
	ele.innerHTML = this._templates[templateName].html;

	return ele.firstElementChild;

}

// -------------------------------------------------------------------------

/**
 * Init html element's event handler.
 *
 * @param	{String}		elementName			Element name.
 * @param	{Options}		options				Options.
 */
Component.prototype._initHtmlEvents = function(elementName, options)
{

	// Get target elements
	let elements;
	if (elementName == "_self")
	{
		elements = [this];
	}
	else if (this._elements[elementName] && "rootNode" in this._elements[elementName])
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

			this.addEventHandler(elements[i], eventName, events[eventName]["handler"], options);
		});
	}

}

// -----------------------------------------------------------------------------
//  Privates
// -----------------------------------------------------------------------------

/**
 * Init on append template.
 *
 * @return  {Promise}		Promise.
 */
Component.prototype.__initOnAppendTemplate = function()
{

	return new Promise((resolve, reject) => {
		// Init services
		Object.keys(this._services).forEach((serviceName) => {
			let service = this.app.serviceManager.getService(serviceName); //@@@fix
			this._services[serviceName].object = service;
			if (service && typeof service.register == "function")
			{
				service.register(this, this._services[serviceName]);
			}
		});

		// Init plugins
		Object.keys(this._plugins).forEach((pluginName) => {
			this.addPlugin(pluginName, this._options["plugins"][pluginName]);
		});

		let chain = Promise.resolve();

		//  Add components
		Object.keys(this._components).forEach((componentName) => {
			if ("className" in this._components[componentName])
			{
				chain = chain.then(() => {
					return this.addComponent(componentName, this._components[componentName]);
				});
			}
		});

		// Init HTML event handlers
		chain.then(() => {
			Object.keys(this._elements).forEach((elementName) => {
				this._initHtmlEvents(elementName);
			});

			resolve();
		});
	});

}

// -----------------------------------------------------------------------------

/**
 * Initialization of component on open().
 */
Component.prototype.__initOnOpen = function()
{

	// Auto focus
	if (this.getOption("autoFocus"))
	{
		let element = this._element.querySelector(this.getOption("autoFocus"));
		if (element)
		{
			element.focus();
		}

	}

	// Css
	let css = (this._events["open"] && this._events["open"]["css"] ? this._events["open"]["css"] : undefined );
	if (css)
	{
		Object.assign(this.style, css);
	}

}

// -----------------------------------------------------------------------------

/**
 * Initialization of clone on close().
 */
Component.prototype.__initOnClose = function()
{

	// Css
	let css = (this._events && this._events["close"] && this._events["close"]["css"] ? this._events["close"]["css"] : undefined );
	if (css)
	{
		Object.assign(this.style, css);
	}

}

// -----------------------------------------------------------------------------

/**
* Focus to a element.
*/
Component.prototype.__autoFocus = function()
{

	if (this.getOption("autoFocus"))
	{
		let element = document.querySelector(this.getOption("autoFocus"));
		if (element)
		{
			let scrollTop = ( document.scrollingElement ? document.scrollingElement.scrollTop : undefined );

			element.focus({preventScroll:true});

			if (scrollTop)
			{
				window.scrollTo(0, scrollTop); // workaround for safari
			}
		}
	}

}

// -----------------------------------------------------------------------------

/**
 * Call event handler.
 *
 * @param	{Object}		e						Event parameter.
 */
Component.prototype.__callEventHandler = function(e)
{

	return new Promise((resolve, reject) => {
		let listeners = ( this._bm_detail && this._bm_detail["listeners"] ? this._bm_detail["listeners"][e.type] : undefined );
		let stopPropagation = false;
		let chain = Promise.resolve();

		if (listeners)
		{
			let component = this._bm_detail["component"];

			for (let i = 0; i < listeners.length; i++)
			{
				chain = chain.then(() => {
					e.extraDetail = ( listeners[i]["options"] ? listeners[i]["options"] : {} );
					return (listeners[i]["handler"]).call(component, this, e, listeners[i]["options"]);
				});

				if (listeners[i]["options"] && listeners[i]["options"]["stopPropagation"])
				{
					stopPropagation = true;
				}
			}
		}

		if (stopPropagation)
		{
			e.stopPropagation();
		}

		chain.then(() => {
			resolve();
		});
	});

}

// -----------------------------------------------------------------------------

/**
 * Call plugin's event handler.
 *
 * @param	{Object}		sender				Sender.
 * @param	{Object}		e					Event info.
 *
 * @return  {Promise}		Promise.
 */
Component.prototype.__callPluginEventHandler = function(sender, e)
{

	return new Promise((resolve, rejfect) => {
		let promises = [];
		let eventName = e.detail.eventName.substr(1);

		Object.keys(this._plugins).forEach((pluginName) => {
			if (this._plugins[pluginName]["enabled"])
			{
				promises.push(this._plugins[pluginName].object[eventName](sender, e));
			}
		});

		Promise.all(promises).then(() => {
			resolve();
		});
	});

}

// -----------------------------------------------------------------------------

/**
 * Load the template html if not loaded yet.
 *
 * @param	{String}		templateName		Template name.
 *
 * @return  {Promise}		Promise.
 */
Component.prototype.__autoLoadTemplate = function(templateName)
{

	console.debug(`Component._autoLoadTemplate(): Auto loading template. templateName=${templateName}`);

	return new Promise((resolve, reject) => {
		let rootNode;

		if (this._isLoadedTemplate(templateName))
		{
			console.debug(`Component.__autoLoadTemplate(): Template Already exists. templateName=${templateName}`, );
			resolve();
		}
		else
		{
			Promise.resolve().then(() => {
				if (templateName)
				{
					return new Promise((resolve, reject) => {
						let base = ( BITSMIST.v1.Settings["system"]["templatePath"] ? BITSMIST.v1.Settings["system"]["templatePath"] : "/components/");
						let path = ("path" in this._options ? this._options["path"] : "");

						LoaderUtil.loadTemplate(templateName, base + path).then((template) => {
							this._templates[templateName] = {};
							this._templates[templateName]["html"] = template;
							resolve();
						});
					});
				}
			}).then(() => {
				return this.trigger("load", this);
			}).then(() => {
				return this.__appendTemplate(this.getOption("rootNode"), templateName);
			}).then(() => {
				return this.__initOnAppendTemplate();
			}).then(() => {
				return this.waitFor(this.getOption("waitFor"));
			}).then(() => {
				return this.trigger("_append", this);
			}).then(() => {
				return this.trigger("append", this);
			}).then(() => {
				return this.trigger("init", this);
			}).then(() => {
				resolve();
			});
		}
	});

}

// -----------------------------------------------------------------------------

/**
 * Append the template html to its root node.
 *
 * @param	{String}		rootNode			Root node to append.
 * @param	{String}		templateName		Template name.
 *
 * @return  {Promise}		Promise.
 */
Component.prototype.__appendTemplate = function(rootNode, templateName)
{

	if (rootNode)
	{
		let root = document.querySelector(rootNode);
		if (!root)
		{
			//throw new NoNodeError(`Root node does not exist. name=${this.name}, rootNode=${rootNode}`);
			throw new Error(`Root node does not exist. name=${this.name}, rootNode=${rootNode}`);
		}

		// Add template to root node
		root.insertAdjacentHTML("afterbegin", this._templates[templateName].html);
		this._element = root.children[0];
	}
	else
	{
		if (this._templates[this.getOption("templateName")])
		{
			this.innerHTML = this._templates[this.getOption("templateName")].html
		}
	}

	console.debug(`Component.__appendTemplate(): Appended. templateName=${templateName}`);

}

// -------------------------------------------------------------------------

/**
 * Register component to loaded list.
 */
Component.prototype.__registerComponent = function()
{

	BITSMIST.v1._loaded.push(this);

	for (let i = 0; i < BITSMIST.v1._waiting.length; i++)
	{
		if (this._isLoadedComponent(BITSMIST.v1._waiting[i]["waitlist"]))
		{
			BITSMIST.v1._waiting[i].resolve();
		}
	}

}

// -----------------------------------------------------------------------------

customElements.define("bm-component", Component);
