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
import EventMixin from './mixin/event-mixin';
import Globals from './globals';
import LoaderMixin from './mixin/loader-mixin';
import WaitforMixin from './mixin/waitfor-mixin';

// =============================================================================
//	Component class
// =============================================================================

// -----------------------------------------------------------------------------
//  Constructor
// -----------------------------------------------------------------------------

/**
 * Constructor.
 *
 * @param	{Object}		options				Options for the component.
 */
export default function Component(options)
{

	// super()
	let _this = Reflect.construct(HTMLElement, [], this.constructor);

	// Init variables
	_this._components = {};
	_this._element = _this;
	_this._events = {};
	_this._isModal = false;
	_this._isOpen = false;
	_this._modalOptions;
	_this._modalPromise;
	_this._modalResult;
	_this._options = Object.assign({}, options, this._getOptions());
	_this._plugins = {};
	_this._services = {};
	_this._templates = {};
	_this._uniqueId = new Date().getTime().toString(16) + Math.floor(100*Math.random()).toString(16);

	// Init options
	_this._options["templateName"] = ( "templateName" in _this._options ? _this._options["templateName"] : _this.name );
	_this._options["components"] = ( _this._options["components"] ? _this._options["components"] : {} );
	_this._options["plugins"] = ( _this._options["plugins"] ? _this._options["plugins"] : {} );
	_this._options["events"] = ( _this._options["events"] ? _this._options["events"] : {} );
	_this._options["services"] = ( _this._options["services"] ? _this._options["services"] : {} );
	_this._options["elements"] = ( _this._options["elements"] ? _this._options["elements"] : {} );

	// Init plugins
	Object.keys(_this._options["plugins"]).forEach((pluginName) => {
		_this.addPlugin(pluginName, _this._options["plugins"][pluginName]);
	});

	// Init services
	Object.keys(_this._options["services"]).forEach((serviceName) => {
		let service = _this.app._plugins[serviceName];
		if (service && typeof service.register == "function")
		{
			service.register(_this, _this._options["services"][serviceName]);
		}
	});

	// Init event handlers
	Object.keys(_this._options["events"]).forEach((eventName) => {
		_this.addEventHandler(_this, eventName, _this._options["events"][eventName]);
	});

	_this.trigger("initComponent", _this);

	return _this;

}

// Inherit & Mixin
ClassUtil.inherit(Component, HTMLElement);
Object.assign(Component.prototype, EventMixin);
Object.assign(Component.prototype, LoaderMixin);
Object.assign(Component.prototype, WaitforMixin);

customElements.define("bm-component", Component);

// -----------------------------------------------------------------------------
//  Setter/Getter
// -----------------------------------------------------------------------------

/**
 * Component name.
 *
 * @type	{String}
 */
Object.defineProperty(Component.prototype, 'name', {
	get()
	{
		return this.getOption("name");
	}
})

// -----------------------------------------------------------------------------

/**
 * Element.
 *
 * @type	{String}
 */
Object.defineProperty(Component.prototype, 'element', {
	get()
	{
		return this._element;
	}
})

// -----------------------------------------------------------------------------

/**
 * Instance's unique id.
 *
 * @type	{String}
 */
Object.defineProperty(Component.prototype, 'uniqueId', {
	get()
	{
		return this._uniqueId;
	}
})

// -----------------------------------------------------------------------------

/**
 * App instance.
 *
 * @type	{String}
 */
Object.defineProperty(Component.prototype, 'app', {
	get()
	{
		return Globals["app"];
	}
})

// -----------------------------------------------------------------------------
//  Methods
// -----------------------------------------------------------------------------

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

// -----------------------------------------------------------------------------

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

// -----------------------------------------------------------------------------

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
			return this.trigger("beforeOpen", sender, {"options":options});
		}).then(() => {
			return this.trigger("open", sender, {"options":options});
		}).then(() => {
			this.__initOnOpen();
			console.debug(`Component.open(): Opened component. name=${this.name}`);
			this._isOpen = true;
			resolve();
		});
	});

}

// -----------------------------------------------------------------------------

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

// -----------------------------------------------------------------------------

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
			return this.trigger("beforeClose", sender);
		}).then(() => {
			return this.trigger("close", sender);
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

// -----------------------------------------------------------------------------

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
			return this.trigger("beforeRefresh", sender);
		}).then(() => {
			if (this.getOption("autoFill"))
			{
				return this.fill(options);
			}
		}).then(() => {
			return this.trigger("refresh", sender);
		}).then(() => {
			this.__autoFocus();
			resolve();
		});
	});

}

// -----------------------------------------------------------------------------

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
		options["currentPreferences"] = ( options["currentPreferences"] ? options["currentPreferences"] : this.app.preferences.items);
		options["newPreferences"] = ( options["newPreferences"] ? options["newPreferences"] : this.app.preferences.items);
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

// -----------------------------------------------------------------------------

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

// -----------------------------------------------------------------------------

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

// -----------------------------------------------------------------------------

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
			if (!this._components[componentName])
			{
				return new Promise((resolve, reject) => {
					this.createComponent(componentName, options, this.app.settings.items["system"]).then((component) => {
						component._parent = this;
						this._components[componentName] = component;
						resolve();
					});
				});
			}
		}).then(() => {
			// Open
			let component = this._components[componentName];
			if (component.getOption("autoOpen"))
			{
				return component.open();
			}
		}).then(() => {
			resolve();
		});
	});

}

// -----------------------------------------------------------------------------

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

		plugin = this.createObject(className, this, options);
		this._plugins[pluginName] = plugin;

		Object.keys(plugin["_events"]).forEach((eventName) => {
			this.addEventHandler(this, eventName, plugin["_events"][eventName], null, plugin);
		});

		if (options["expose"])
		{
			Object.defineProperty(Component.prototype, pluginName, {
				get()
				{
					return plugin;
				}
			});
		}

		resolve(plugin);
	});

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
		this.registerComponent(this);
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

// -----------------------------------------------------------------------------

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

// -----------------------------------------------------------------------------

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
	else if (this._options["elements"][elementName] && "rootNode" in this._options["elements"][elementName])
	{
		elements = this._element.querySelectorAll(this._options["elements"][elementName]["rootNode"]);
	}
	else
	{
		elements = this._element.querySelectorAll("#" + elementName);
	}

	// Set event handlers
	let events = (this._options["elements"][elementName]["events"] ? this._options["elements"][elementName]["events"] : {});
	for (let i = 0; i < elements.length; i++)
	{
		Object.keys(events).forEach((eventName) => {
			options = Object.assign({}, events[eventName], options);
			this.addEventHandler(elements[i], eventName, events[eventName], options);
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
		let chain = Promise.resolve();

		//  Add components
		Object.keys(this._options["components"]).forEach((componentName) => {
			if ("className" in this._options["components"][componentName])
			{
				chain = chain.then(() => {
					return this.addComponent(componentName, this._options["components"][componentName]);
				});
			}
		});

		// Init HTML event handlers
		chain.then(() => {
			Object.keys(this._options["elements"]).forEach((elementName) => {
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
	let css = (this._options["events"]["open"] && this._options["events"]["open"]["css"] ? this._options["events"]["open"]["css"] : undefined );
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
	let css = (this._options["events"] && this._options["events"]["close"] && this._options["events"]["close"]["css"] ? this._options["events"]["close"]["css"] : undefined );
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
 * Load the template html if not loaded yet.
 *
 * @param	{String}		templateName		Template name.
 *
 * @return  {Promise}		Promise.
 */
Component.prototype.__autoLoadTemplate = function(templateName)
{

	console.debug(`Component._autoLoadTemplate(): Auto loading template. name=${this.name}, templateName=${templateName}`);

	return new Promise((resolve, reject) => {
		let rootNode;

		if (this._isLoadedTemplate(templateName))
		{
			console.debug(`Component.__autoLoadTemplate(): Template Already exists. name=${this.name}, templateName=${templateName}`, );
			resolve();
		}
		else
		{
			Promise.resolve().then(() => {
				if (templateName)
				{
					return new Promise((resolve, reject) => {
						let base = ( this.app.settings.items["system"] && this.app.settings.items["system"]["templatePath"] ? this.app.settings.items["system"]["templatePath"] : "/components/");
						let path = ("path" in this._options ? this._options["path"] : "");

						this.loadTemplate(templateName, base + path).then((template) => {
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
				return this.trigger("append", this);
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
			throw new ReferenceError(`Root node does not exist. name=${this.name}, rootNode=${rootNode}`);
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

	console.debug(`Component.__appendTemplate(): Appended. name=${this.name}, templateName=${templateName}`);

}
