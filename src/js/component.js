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
import Store from './plugin/store';
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
export default function Component(settings)
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
	_this._plugins = {};
	_this._services = {};
	_this._templates = {};
	_this._uniqueId = new Date().getTime().toString(16) + Math.floor(100*Math.random()).toString(16);

	// Init stores
	let defaults = {
		"autoSetup":true
	};
	settings = Object.assign({}, defaults, settings, _this._getSettings());
	_this._settings = new Store(_this, {"items":settings});
	_this._preferences = new Store(_this, {"loadEvent":"loadPreferences", "saveEvent":"savePreferences", "items":settings["preferences"]});
	_this._store = new Store(_this);

	// Init options
	_this._settings.set("templateName", _this.settings.get("templateName", _this.name));
	_this._settings.set("components", _this.settings.get("components", {}));
	_this._settings.set("plugins", _this.settings.get("plugins", {}));
	_this._settings.set("events", _this.settings.get("events", {}));
	_this._settings.set("services", _this.settings.get("services", {}));
	_this._settings.set("elements", _this.settings.get("elements", {}));

	// Init templates
	let templates = _this._settings.get("templates");
	if (templates)
	{
		Object.keys(templates).forEach((templateName) => {
			let templateInfo = _this.__getTemplateInfo(templateName);
			templateInfo["html"] = templates[templateName];
		});
	}

	// Init plugins
	let plugins = _this.settings.items["plugins"];
	Object.keys(plugins).forEach((pluginName) => {
		_this.addPlugin(pluginName, plugins[pluginName]);
	});

	// Init services
	let services = _this.settings.items["services"];
	Object.keys(services).forEach((serviceName) => {
		Object.keys(services[serviceName]["events"]).forEach((eventName) => {
			let feature = services[serviceName]["events"][eventName]["handler"];
			let args = services[serviceName]["events"][eventName]["args"];
			let service = _this.services[serviceName];
			let func = function(){
				service[feature].apply(service, args);
			};
			_this.addEventHandler(_this, eventName, func);
		});
	});

	// Init event handlers
	let events = _this.settings.items["events"];
	Object.keys(events).forEach((eventName) => {
		_this.addEventHandler(_this, eventName, events[eventName]);
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
		return this._settings.get("name");
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
		return ( this.id ? this.id : this._uniqueId );
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
		return ( Globals["app"] ? Globals["app"] : this );
	}
})

// -----------------------------------------------------------------------------

/**
 * Services (App's plugins).
 *
 * @type	{String}
 */
Object.defineProperty(Component.prototype, 'services', {
	get()
	{
		return this.app._plugins;
	}
})

// -----------------------------------------------------------------------------

/**
 * Settings.
 *
 * @type	{String}
 */
Object.defineProperty(Component.prototype, 'settings', {
	get() {
		return this._settings;
	},
	configurable: true
})

// -----------------------------------------------------------------------------

/**
 * Preferences.
 *
 * @type	{String}
 */
Object.defineProperty(Component.prototype, 'preferences', {
	get()
	{
		return this._preferences;
	},
	configurable: true
})

// -----------------------------------------------------------------------------

/**
 * Store.
 *
 * @type	{String}
 */
Object.defineProperty(Component.prototype, 'store', {
	get()
	{
		return this._store;
	},
	configurable: true
})

// -----------------------------------------------------------------------------
//  Methods
// -----------------------------------------------------------------------------

/**
 * Get a setting value. Return default value when specified key is not available.
 *
 * @param	{String}		key					Key to get.
 * @param	{Object}		defaultValue		Value returned when key is not found.
 *
 * @return  {*}				Value.
 */
Component.prototype.getSetting = function(key, defaultValue)
{

	return this._getStoreItem(this.app.settings, this.settings, key, defaultValue);

}

// -----------------------------------------------------------------------------

/**
 * Get a preference value. Return default value when specified key is not available.
 *
 * @param	{String}		key					Key to get.
 * @param	{Object}		defaultValue		Value returned when key is not found.
 *
 * @return  {*}				Value.
 */
Component.prototype.getPreference = function(key, defaultValue)
{

	return this._getStoreItem(this.app.preferences, this._preferences, key, defaultValue);

}

// -----------------------------------------------------------------------------

/**
 * Get a store value. Return default value when specified key is not available.
 *
 * @param	{String}		key					Key to get.
 * @param	{Object}		defaultValue		Value returned when key is not found.
 *
 * @return  {*}				Value.
 */
Component.prototype.getStore = function(key, defaultValue)
{

	return this._getStoreItem(this.app.store, this._store, key, defaultValue);

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
			return this.switchTemplate(this.settings.get("templateName"));
		}).then(() => {
			if (this.settings.get("autoSetup"))
			{
				return this.setup();
			}
		}).then(() => {
			if (this.settings.get("autoRefresh"))
			{
				return this.refresh();
			}
		}).then(() => {
			return this.trigger("beforeOpen", sender, {"options":options});
		}).then(() => {
			return this.trigger("open", sender, {"options":options});
		}).then(() => {
			console.debug(`Component.open(): Opened component. name=${this.name}`);
			this.registerComponent(this);
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
		this.settings.items = Object.assign(this.settings.items, options); //@@@fix
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
			if (this.settings.get("autoFill"))
			{
				return this.fill(options);
			}
		}).then(() => {
			return this.trigger("refresh", sender);
		}).then(() => {
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
		let defaultPreferences = Object.assign({}, this.app.preferences.items, this.preferences.items);
		options["currentPreferences"] = ( options["currentPreferences"] ? options["currentPreferences"] : defaultPreferences);
		options["newPreferences"] = ( options["newPreferences"] ? options["newPreferences"] : defaultPreferences);
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
		let templateInfo = this.__getTemplateInfo(templateName);
		let oldTemplateName = this.settings.get("templateName");

		this.__autoLoadTemplate(templateInfo).then(() => {
			// Append template to the node
			if (!templateInfo["isAppended"])
			{
				return this.__appendTemplate(this.settings.get("rootNode"), templateName);
			}
		}).then(() => {
			if (!templateInfo["isAppended"])
			{
				return this.__initOnAppendTemplate();
			}
		}).then(() => {
			return this.waitFor(this.settings.get("waitFor"));
		}).then(() => {
			return this.trigger("append", this);
		}).then(() => {
			this._templates[oldTemplateName]["isAppended"] = false;
			this._templates[templateName]["isAppended"] = true;
			this.settings.set("templateName", templateName);
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
					let path = this.getSetting("system.appBaseUrl", "") + this.getSetting("system.componentPath", "/components/");
					this.createComponent(componentName, options, path, this.getSetting("system")).then((component) => {
						component._parent = this;
						this._components[componentName] = component;
						resolve();
					});
				});
			}
		}).then(() => {
			// Open
			let component = this._components[componentName];
			if (component.settings.get("autoOpen"))
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
 * Add a plugin to the component.
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

		// CreatePlugin
		plugin = ClassUtil.createObject(className, this, options);
		this._plugins[pluginName] = plugin;

		// Add event handlers
		let events = plugin.getOption("events", {});
		Object.keys(events).forEach((eventName) => {
			this.addEventHandler(this, eventName, events[eventName], null, plugin);
		});

		// Expose plugin
		if (options["expose"])
		{
			Object.defineProperty(this.__proto__, pluginName, {
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

	this.open();

}

// -----------------------------------------------------------------------------
//  Protected
// -----------------------------------------------------------------------------

/**
 * Get component options.  Need to override.
 *
 * @return  {Object}		Options.
 */
Component.prototype._getSettings = function()
{

	return {};

}

// -----------------------------------------------------------------------------

/**
 * Get an value from stores. Return default value when specified key is not available.
 * If both store1 and store2 has the key, store2 precedes store1.
 *
 * @param	{String}		key					Key to get.
 * @param	{Object}		defaultValue		Value returned when key is not found.
 *
 * @return  {*}				Value.
 */
Component.prototype._getStoreItem = function(store1, store2, key, defaultValue)
{

	let result = defaultValue;

	if (store2 && store2.has(key))
	{
		result = store2.get(key);
	}
	else if (store1 && store1.has(key))
	{
		result = store1.get(key);
	}

	return result;

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

	templateName = ( templateName ? templateName : this.settings.get("templateName") );

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
	else if (this.settings.has("elements." + elementName + ".rootNode"))
	{
		elements = this._element.querySelectorAll(this.settings.get("elements." + elementName + ".rootNode"));
	}
	else
	{
		elements = this._element.querySelectorAll("#" + elementName);
	}

	// Set event handlers
	let events = this.settings.get("elements." + elementName + ".events", {});
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
 * Returns templateInfo for the specified templateName. Create one if not exists.
 *
 * @param	{String}		templateName		Template name.
 *
 * @return  {Object}		Template info.
 */
Component.prototype.__getTemplateInfo = function(templateName)
{

	if (!this._templates[templateName])
	{
		this._templates[templateName] = {};
		this._templates[templateName]["name"] = templateName;
		this._templates[templateName]["html"] = "";
		this._templates[templateName]["isAppended"] = false;
		this._templates[templateName]["isLoaded"] = false;
	}

	return this._templates[templateName];

}

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

		// Get options from the attribute
		let dataSettings = this.getAttribute("data-settings");
		if (dataSettings) {
			let settings = JSON.parse(dataSettings);
			Object.keys(settings).forEach((key) => {
				this._settings.set(key, settings[key]);
			});
		}

		//  Add components
		let components = this._settings.items["components"];
		Object.keys(components).forEach((componentName) => {
			chain = chain.then(() => {
				return this.addComponent(componentName, components[componentName]);
			});
		});

		// Init HTML event handlers
		chain.then(() => {
			Object.keys(this.settings.items["elements"]).forEach((elementName) => {
				this._initHtmlEvents(elementName);
			});

			resolve();
		});
	});

}

// -----------------------------------------------------------------------------

/**
 * Load the template html if not loaded yet.
 *
 * @param	{Object}		templateInfo		Template info.
 *
 * @return  {Promise}		Promise.
 */
Component.prototype.__autoLoadTemplate = function(templateInfo)
{

	console.debug(`Component._autoLoadTemplate(): Auto loading template. name=${this.name}, templateName=${templateInfo["name"]}`);

	return new Promise((resolve, reject) => {
		let promise;

		if (!templateInfo["name"] || templateInfo["html"])
		{
			console.debug(`Component.__autoLoadTemplate(): Template Already exists. name=${this.name}, templateName=${templateInfo["name"]}`, );
		}
		else
		{
			let base = this.getSetting("system.appBaseUrl", "") + this.getSetting("system.templatePath", "/components/");
			let path = this.settings.get("path", "");

			promise = new Promise((resolve, reject) => {
				this.loadTemplate(templateInfo["name"], base + path).then((template) => {
					templateInfo["html"] = template;
					resolve();
				});
			});
		}

		Promise.all([promise]).then(() => {
			if (!templateInfo["isLoaded"])
			{
				return this.trigger("load", this);
			}
		}).then(() => {
			templateInfo["isLoaded"] = true;
			resolve();
		});
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
		if (this._templates[templateName]["html"])
		{
			this.innerHTML = this._templates[templateName].html
		}
	}

	console.debug(`Component.__appendTemplate(): Appended. name=${this.name}, templateName=${templateName}`);

}


