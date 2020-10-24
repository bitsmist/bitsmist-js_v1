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
 * @param	{Object}		settings			Settings.
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
	_this._status = "";
	_this._templates = {};
	_this._uniqueId = new Date().getTime().toString(16) + Math.floor(100*Math.random()).toString(16);

	// Init stores
	let defaults = {
		"autoOpen": true,
		"autoSetup":true
	};
	settings = Object.assign({}, defaults, settings, _this._getSettings());
	_this._settings = new Store(_this, {"items":settings});
	_this._settings.chain(Globals["settings"]);
	let preferences = Object.assign({}, settings["preferences"]);
	_this._preferences = new Store(_this, {"loadEvent":"loadPreferences", "saveEvent":"savePreferences", "items":preferences});
	_this._preferences.chain(Globals["preferences"]);
	_this._store = new Store(_this);

	// Init settings
	_this._settings.set("name", Util.safeGet(settings, "name", _this.constructor.name));
	_this._settings.set("templateName", Util.safeGet(settings, "templateName", _this.name));
	_this._settings.set("components", Util.safeGet(settings, "components", {}));
	_this._settings.set("plugins", Util.safeGet(settings, "plugins", {}));
	_this._settings.set("events", Util.safeGet(settings, "events", {}));
	_this._settings.set("services", Util.safeGet(settings, "services", {}));
	_this._settings.set("elements", Util.safeGet(settings, "elements", {}));

	_this._init(_this._settings.items);

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
 * Status.
 *
 * @type	{String}
 */
Object.defineProperty(Component.prototype, 'status', {
	get()
	{
		return this._status;
	},
	set(value)
	{
		this._status = value;
	}
})

// -----------------------------------------------------------------------------

/**
 * App instance.
 *
 * @type	{String}
 */
/*
Object.defineProperty(Component.prototype, 'app', {
	get()
	{
		return ( Globals["app"] ? Globals["app"] : this );
	}
})
*/

// -----------------------------------------------------------------------------

/**
 * Services (App's plugins).
 *
 * @type	{String}
 */
/*
Object.defineProperty(Component.prototype, 'services', {
	get()
	{
		return this.app._plugins;
	}
})
*/

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
			return this.switchTemplate(this._settings.get("templateName"));
		}).then(() => {
			if (this._settings.get("autoSetup"))
			{
				return this.setup();
			}
		}).then(() => {
			if (this._settings.get("autoRefresh"))
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
		this._settings.items = Object.assign(this._settings.items, options); //@@@fix
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
			if (this._settings.get("autoFill"))
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
		let defaultPreferences = Object.assign({}, this._preferences.items);
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
			let path = Util.concatPath([this._settings.get("system.appBaseUrl", ""), this._settings.get("system.templatePath", ""), this._settings.get("path", "")]);
			return this.loadTemplate(templateInfo, path);
		}).then(() => {
			return this.__applyTemplate(this._settings.get("rootNode"), templateName, this._settings.get("templateNode"));
		}).then(() => {
			let path = Util.concatPath([this._settings.get("system.appBaseUrl", ""), this._settings.get("system.componentPath", "")]);
			let splitComponent = this._settings.get("system.splitComponent", false);
			this.loadTags(this._element, path, {"splitComponent":splitComponent});
		}).then(() => {
			return this.__initOnAppendTemplate();
		}).then(() => {
			if (this._settings.get("waitFor"))
			{
				return this.waitFor(this._settings.get("waitFor"));
			}
		}).then(() => {
			return this.trigger("append", this);
		}).then(() => {
			this._templates[this._settings.get("templateName")]["isAppended"] = false;
			this._templates[templateName]["isAppended"] = true;
			this._settings.set("templateName", templateName);

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
		let path = Util.concatPath([this._settings.get("system.appBaseUrl", ""), this._settings.get("system.componentPath", ""), ( "path" in options ? options["path"] : "")]);
		let splitComponent = ( "splitComponent" in options ? options["splitComponent"] : this._settings.get("system.splitComponent", false) );
		let className = ( "className" in options ? options["className"] : componentName );

		Promise.resolve().then(() => {
			// Load component
			return this.loadComponent(className, path, {"splitComponent":splitComponent});
		}).then(() => {
			// Insert tag
			if (options["rootNode"] && !this._components[componentName])
			{
				let root = document.querySelector(options["rootNode"]);
				if (!root)
				{
					throw new ReferenceError(`Root node does not exist when adding component ${componentName} to ${options["rootNode"]}. name=${this.name}`);
				}
				root.insertAdjacentHTML("afterbegin", options["tag"]);
				this._components[componentName] = root.children[0];
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

	templateName = ( templateName ? templateName : this._settings.get("templateName") );

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

	Promise.resolve().then(() => {
		// Load settings
		if (this._element.getAttribute("data-settingsname") || this._element.getAttribute("data-settingspath"))
		{
			let settingsName = ( this._element.getAttribute("data-settingsname") ? this._element.getAttribute("data-settingsname") : "settings" );
			let settingsPath = ( this._element.getAttribute("data-settingspath") ? this._element.getAttribute("data-settingspath") : "" );
			return this.loadSettings(settingsName, settingsPath);
		}
	}).then((newSettings) => {
		if (newSettings)
		{
			this._init(newSettings);
			this._settings.merge(newSettings);
		}
	}).then(() => {
		// Get settings from attributes
		let attrSettings = this.__getSettingsFromAttribute();
		if (attrSettings)
		{
			this._init(attrSettings);
			this._settings.merge(attrSettings);
		}
	}).then(() => {
		// Trigger an event
		return this.trigger("connected", this);
	}).then(() => {
		// Register as connected
		this.registerComponent(this, "connected");
	}).then(() => {
		// Open
		if (this._settings.get("autoOpen"))
		{
			this.open();
		}
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
Component.prototype._getSettings = function()
{

	return {};

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

	templateName = ( templateName ? templateName : this._settings.get("templateName") );

	let ele = document.createElement("div");
	ele.innerHTML = this._templates[templateName].html;

	return ele.firstElementChild;

}

// -----------------------------------------------------------------------------

/**
 * Init.
 *
 * @param	{Object}		settings			Settings.
 */
Component.prototype._init = function(settings)
{

	// Init templates
	let templates = settings["templates"];
	if (templates)
	{
		Object.keys(templates).forEach((templateName) => {
			let templateInfo = this.__getTemplateInfo(templateName);
			templateInfo["html"] = templates[templateName];
		});
	}

	// Init shadow
	if (settings["shadowMode"])
	{
		this._shadowRoot = this.attachShadow({"mode":settings["shadowMode"]});
		this._element = this._shadowRoot;
	}

	// Init plugins
	let plugins = settings["plugins"];
	if (plugins)
	{
		Object.keys(plugins).forEach((pluginName) => {
			this.addPlugin(pluginName, plugins[pluginName]);
		});
	}

	// Init services
	let services = settings["services"];
	if (services)
	{
		Object.keys(services).forEach((serviceName) => {
			Object.keys(services[serviceName]["events"]).forEach((eventName) => {
				let feature = services[serviceName]["events"][eventName]["handler"];
				let args = services[serviceName]["events"][eventName]["args"];
				//let service = this.services[serviceName];
				let func = function(){
					let service = document.querySelector(services[serviceName]["rootNode"]);
					service[feature].apply(service, args);
				};
				this.addEventHandler(this, eventName, func);
			});
		});
	}

	// Init event handlers
	let events = settings["events"];
	if (events)
	{
		Object.keys(events).forEach((eventName) => {
			this.addEventHandler(this, eventName, events[eventName]);
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

		//  Add components
		let components = this._settings.items["components"];
		Object.keys(components).forEach((componentName) => {
			chain = chain.then(() => {
				return this.addComponent(componentName, components[componentName]);
			});
		});

		// Init HTML event handlers
		chain.then(() => {
			Object.keys(this._settings.items["elements"]).forEach((elementName) => {
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
 * Get settings from element's attribute.
 */
Component.prototype.__getSettingsFromAttribute = function()
{

	// Get options from the attribute
	let dataSettings = ( this._settings.get("rootNode") ?
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
