// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import ClassUtil from './util/class-util';
import Component from './component';
import Util from './util/util';

// =============================================================================
//	Pad class
// =============================================================================

// -----------------------------------------------------------------------------
//  Constructor
// -----------------------------------------------------------------------------

/**
 * Constructor.
 *
 * @param	{Object}		settings			Settings.
 */
export default function Pad(settings)
{

	// super()
	let _this = Reflect.construct(Component, [], this.constructor);

	// Init settings
	_this._settings.set("templateName", Util.safeGet(settings, "templateName", _this.name));

	// Init vars
	_this._isModal = false;
	_this._modalOptions;
	_this._modalPromise;
	_this._modalResult;
	_this._shadowRoot;
	_this._templates = {};

	_this.trigger("initPad", _this);

	return _this;

}

// Inherit & Mixin
ClassUtil.inherit(Pad, Component);
customElements.define("bm-pad", Pad);

// -----------------------------------------------------------------------------
//  Methods
// -----------------------------------------------------------------------------

/**
 * Open pad.
 *
 * @param	{Object}		options				Options.
 *
 * @return  {Promise}		Promise.
 */
Pad.prototype.open = function(options)
{

	console.debug(`Pad.open(): Opening pad. name=${this.name}`);

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
			console.debug(`Pad.open(): Opened pad. name=${this.name}`);
			this.registerComponent(this, "opened");
			resolve();
		});
	});

}

// -----------------------------------------------------------------------------

/**
 * Open pad modally.
 *
 * @param	{array}			options				Options.
 *
 * @return  {Promise}		Promise.
 */
Pad.prototype.openModal = function(options)
{

	console.debug(`Pad.openModal(): Opening pad modally. name=${this.name}`);

	return new Promise((resolve, reject) => {
		options = Object.assign({}, options);
		this._settings.items = Object.assign(this._settings.items, options); //@@@fix
		this._isModal = true;
		this._modalResult = {"result":false};
		this._modalOptions = options;
		this._modalPromise = { "resolve": resolve, "reject": reject };
		this.open();
	});

}

// -----------------------------------------------------------------------------

/**
 * Change template html.
 *
 * @param	{String}		templateName		Template name.
 *
 * @return  {Promise}		Promise.
 */
Pad.prototype.switchTemplate = function(templateName)
{

	return new Promise((resolve, reject) => {
		let templateInfo = this.__getTemplateInfo(templateName);

		if (templateInfo["isAppended"])
		{
			resolve();
			return;
		}

		console.debug(`Pad.switchTemplate(): Switching template. name=${this.name}, templateName=${templateName}`);

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
 * Clone the component.
 *
 * @param	{String}		templateName		Template name.
 *
 * @return  {Object}		Cloned component.
 */
Pad.prototype.clone = function(templateName)
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
//  Protected
// -----------------------------------------------------------------------------

/**
 * Duplicate the component element.
 *
 * @param	{String}		templateName		Template name.
 *
 * @return  {Object}		Cloned component.
 */
Pad.prototype._dupElement = function(templateName)
{

	templateName = ( templateName ? templateName : this._settings.get("templateName") );

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
Pad.prototype.__getTemplateInfo = function(templateName)
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
Pad.prototype.__initOnAppendTemplate = function()
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
Pad.prototype.__appendToNode = function(root, templateName, rootNode)
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
Pad.prototype.__applyTemplate = function(rootNode, templateName, templateNode)
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
	if (templateNode)
	{
		this.__appendToNode(this._element, templateName, "this");
	}
	else
	{
		this._element.innerHTML = this._templates[templateName].html
	}

	console.debug(`Pad.__applyTemplate(): Applied template. name=${this.name}, rootNode=${rootNode}, templateName=${templateName}`);

}