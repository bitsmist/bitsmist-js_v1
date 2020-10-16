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
import Util from './util/util';
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
	_this._shadowRoot;
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

	// Init settings
	_this._settings.set("templateName", _this._settings.get("templateName", _this.name));
	_this._settings.set("components", _this._settings.get("components", {}));
	_this._settings.set("plugins", _this._settings.get("plugins", {}));
	_this._settings.set("events", _this._settings.get("events", {}));
	_this._settings.set("services", _this._settings.get("services", {}));
	_this._settings.set("elements", _this._settings.get("elements", {}));
	_this.__applySettingsFromAttribute();
	_this._settings.set("name", _this._settings.get("name", _this.constructor.name));

	// Init templates
	let templates = _this._settings.get("templates");
	if (templates)
	{
		Object.keys(templates).forEach((templateName) => {
			let templateInfo = _this.__getTemplateInfo(templateName);
			templateInfo["html"] = templates[templateName];
		});
	}

	// Init shadow
	if (_this._settings.get("shadowMode"))
	{
		_this._shadowRoot = _this.attachShadow({"mode":_this._settings.get("shadowMode")});
		_this._element = _this._shadowRoot;
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

		this.registerComponent(this, "opening");
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
			this.registerComponent(this, "opened");
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

		this.registerComponent(this, "closing");
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
			this.registerComponent(this, "closed");
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
			return this.trigger("beforeRefresh", sender, {"options":options});
		}).then(() => {
			if (this.settings.get("autoFill"))
			{
				return this.fill(options);
			}
		}).then(() => {
			return this.trigger("refresh", sender, {"options":options});
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

	return new Promise((resolve, reject) => {
		let templateInfo = this.__getTemplateInfo(templateName);

		if (templateInfo["isAppended"])
		{
			resolve();
			return;
		}

		console.debug(`Component.switchTemplate(): Switching template. name=${this.name}, templateName=${templateName}`);

		Promise.resolve().then(() => {
			let path = Util.concatPath([this.getSetting("system.appBaseUrl", ""), this.getSetting("system.templatePath", ""), this._settings.get("path", "")]);
			return this.loadTemplate(templateInfo, path);
		}).then(() => {
			return this.__applyTemplate(this.settings.get("rootNode"), templateName, this.settings.get("templateNode"));
		}).then(() => {
			this.loadTags(this._element);
		}).then(() => {
			return this.__initOnAppendTemplate();
		}).then(() => {
			if (this.settings.get("waitFor"))
			{
				return this.waitFor(this.settings.get("waitFor"));
			}
		}).then(() => {
			return this.trigger("append", this);
		}).then(() => {
			this._templates[this.settings.get("templateName")]["isAppended"] = false;
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
					let path = Util.concatPath([this.getSetting("system.appBaseUrl", ""), this.getSetting("system.componentPath", ""), ( "path" in options ? options["path"] : "")]);
					let splitComponent = ( "splitComponent" in options ? options["splitComponent"] : this.getSetting("system.splitComponent", false));
					this.createComponent(componentName, options, path, {"splitComponent":splitComponent}).then((component) => {
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

/**
 * Clone the component.
 *
 * @param	{String}		templateName		Template name.
 *
 * @return  {Object}		Cloned component.
 */
Component.prototype.clone = function(templateName)
{

	let clone;

	templateName = ( templateName ? templateName : this.settings.get("templateName") );

	if (!this._templates[templateName])
	{
		throw new ReferenceError(`Template not loaded. name=${this.name}, templateName=${templateName}`);
	}

	if (this._templates[templateName].node)
	{
		clone = document.importNode(this._templates[templateName].node, true);
	}
	else
	{
		clone = this._dupElement(templateName);
	}

	return clone;

}

// -----------------------------------------------------------------------------
//  Callbacks
// -----------------------------------------------------------------------------

/**
 * Connected callback.
 */
Component.prototype.connectedCallback = function()
{

	this.__applySettingsFromAttribute();

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
				this.setHtmlEventHandlers(elementName);
			});

			resolve();
		});
	});

}

// -----------------------------------------------------------------------------

/**
 * Append the template to a root node.
 *
 * @param	{HTMLElement}	root				Root node to append.
 * @param	{String}		templateName		Template name.
 * @param	{String}		rootNode			Root node name to append (Just for debugging purpose).
 *
 * @return  {HTMLElement}	Appended element.
 */
Component.prototype.__appendToNode = function(root, templateName, rootNode)
{

	if (!root)
	{
		throw new ReferenceError(`Root node does not exist. name=${this.name}, rootNode=${rootNode}, templateName=${templateName}`);
	}

	if (this._templates[templateName].node)
	{
		let clone = this.clone(templateName);
		root.insertBefore(clone, root.firstChild);
	}
	else
	{
		root.insertAdjacentHTML("afterbegin", this._templates[templateName].html);
	}

	return root.children[0];

}

// -----------------------------------------------------------------------------

/**
 * Apply template.
 *
 * @param	{String}		rootNode			Root node to append.
 * @param	{String}		templateName		Template name.
 * @param	{String}		templateNode		Template node.
 *
 * @return  {Promise}		Promise.
 */
Component.prototype.__applyTemplate = function(rootNode, templateName, templateNode)
{

	if (!templateName)
	{
		return;
	}

	// Add template to template node
	if (templateNode && !this._templates[templateName].node)
	{
		let node = this.__appendToNode(document.querySelector(templateNode), templateName, templateNode);
		this._templates[templateName].node = ('content' in node ? node.content : node);
	}

	// Apply
	if (rootNode)
	{
		this._element = this.__appendToNode(document.querySelector(rootNode), templateName, rootNode);
	}
	else if (templateNode)
	{
		this.__appendToNode(this._element, templateName, "this");
	}
	else
	{
		this._element.innerHTML = this._templates[templateName].html
	}

	console.debug(`Component.__applyTemplate(): Applied template. name=${this.name}, rootNode=${rootNode}, templateName=${templateName}`);

}

// -----------------------------------------------------------------------------

/**
 * Apply settings from element's attribute.
 */
Component.prototype.__applySettingsFromAttribute = function()
{

	// Get options from the attribute
	let dataSettings = ( this.settings.get("rootNode") ?
		document.querySelector(this._settings.get("rootNode")).getAttribute("data-settings") :
		this.getAttribute("data-settings")
	);

	if (dataSettings) {
		let settings = JSON.parse(dataSettings);
		Object.keys(settings).forEach((key) => {
			this._settings.set(key, settings[key]);
		});
	}

}
