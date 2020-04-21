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
import {NoNodeError} from '../error/errors';
import EventHandler from './event-handler';

// =============================================================================
//	Component class
// =============================================================================

export default class Component
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

		this.container = options["container"];
		this.name = componentName;
		this.listener = new EventHandler(this);
		this.shadows = {};
		this.parent;
		this.element;
		this.modalOptions;
		this.modalResult;
		this.modalPromise;
		this.isModal = false;
		this.isOpen = false;

		// Options
		let defaults = { "templateName":componentName };
		this.options = Object.assign( {}, defaults, (options ? options : {}) );

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
	 * Open component.
	 *
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	open(options)
	{

		console.debug(`Component.open(): Opening component. name=${this.name}`);

		return new Promise((resolve, reject) => {
			options = Object.assign({}, options);
			let sender = ( options["sender"] ? options["sender"] : this );
			delete options["sender"];

			if (this.isOpen)
			{
				resolve();
				return;
			}

			this._autoLoadTemplate(this.getOption("templateName")).then(() => {
				if (this.getOption("autoRefresh"))
				{
					return this.refresh();
				}
			}).then(() => {
				return this.listener.trigger("_beforeOpen", sender);
			}).then(() => {
				return this.listener.trigger("beforeOpen", sender);
			}).then(() => {
				return this.listener.trigger("open", sender);
			}).then(() => {
				return this.listener.trigger("_open", sender);
			}).then(() => {
				this.__initOnOpen();
				console.debug(`Component.open(): Opened component. name=${this.name}`);
				this.isOpen = true;
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
	openModal(options)
	{

		console.debug(`Component.openModal(): Opening component. name=${this.name}`);

		return new Promise((resolve, reject) => {
			if (this.isOpen)
			{
				resolve();
				return;
			}

			options = Object.assign({}, options);
			this.options = Object.assign(this.options, options);
			this.isModal = true;
			this.modalResult = {"result":false};
			this.modalOptions = options;
			this.modalPromise = { "resolve": resolve, "reject": reject };
			this.open();
			this.isOpen = true;
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
	close(options)
	{

		console.debug(`Component.close(): Closing component. name=${this.name}`);

		return new Promise((resolve, reject) => {
			options = Object.assign({}, options);
			let sender = ( options["sender"] ? options["sender"] : this );
			delete options["sender"];

			if (!this.isOpen)
			{
				resolve();
				return;
			}

			Promise.resolve().then(() => {
				return this.listener.trigger("_beforeClose", sender);
			}).then(() => {
				return this.listener.trigger("beforeClose", sender);
			}).then(() => {
				return this.listener.trigger("close", sender);
			}).then(() => {
				return this.listener.trigger("_close", sender);
			}).then(() => {
				console.debug(`Component.close(): Closed component. name=${this.name}`);
				if (this.isModal)
				{
					this.modalPromise.resolve(this.modalResult);
				}
				this.__initOnClose();
				this.isOpen = false;
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
	refresh(options)
	{

		console.debug(`Component.refresh(): Refreshing component. name=${this.name}`);

		return new Promise((resolve, reject) => {
			options = Object.assign({}, options);
			let sender = ( options["sender"] ? options["sender"] : this );
			delete options["sender"];

			this.listener.trigger("_beforeRefresh", sender).then(() => {
				return this.listener.trigger("beforeRefresh", sender);
			}).then(() => {
				if (this.getOption("autoFill"))
				{
					return this.fill();
				}
			}).then(() => {
				return this.listener.trigger("refresh", sender);
			}).then(() => {
				return this.listener.trigger("_refresh", sender);
			}).then(() => {
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
	setup(options)
	{

		console.debug(`Component.setup(): Setting up component. name=${this.name}`);

		return new Promise((resolve, reject) => {
			options = Object.assign({}, options);
			options["currentPreferences"] = ( options["currentPreferences"] ? options["currentPreferences"] : this.container["preferences"] );
			options["newPreferences"] = ( options["newPreferences"] ? options["newPreferences"] : this.container["preferences"] );
			let sender = ( options["sender"] ? options["sender"] : this );
			delete options["sender"];

			this.listener.trigger("formatSettings", sender, options).then(() => {
				return this.listener.trigger("validateSettings", sender,  options);
			}).then(() => {
				return this.listener.trigger("beforeSetup", sender, options);
			}).then(() => {
				return this.listener.trigger("setup", sender, options);
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
	fill(options)
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
	switchTemplate(templateName)
	{

		return new Promise((resolve, reject) => {
			this._autoLoadTemplate(templateName).then(() => {
				this.options["templateName"] = templateName;
				return this.listener.trigger("templateChange", this);
			}).then(() => {
				resolve();
			});
		});

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
	clone(newId, templateName)
	{

		let clone;
		let template = this.shadows[templateName].template;

		if (!template)
		{
			template = document.createElement('template');
			template.innerHTML = this.shadows[templateName].html;

			this.shadows[templateName].template = template;
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

	// -------------------------------------------------------------------------

	/**
	 * Get option value. Return default value when specified key is not available.
	 *
	 * @param	{String}		key					Key to get.
	 * @param	{Object}		defaultValue		Value returned when key is not found.
	 *
	 * @return  {*}				Value.
	 */
	getOption(key, defaultValue)
	{

		let result = defaultValue;

		if (this.options && (key in this.options))
		{
			result = this.options[key];
		}

		return result;

	}

	// -------------------------------------------------------------------------
	//  Protected
	// -------------------------------------------------------------------------

	/**
	 * Load the template html if not loaded yet.
	 *
	 * @param	{String}		templateName		Template name.
	 *
	 * @return  {Promise}		Promise.
	 */
	_autoLoadTemplate(templateName)
	{

		let promise;

		return new Promise((resolve, reject) => {
			let rootNode;

			if (this.__isLoaded(templateName))
			{
				resolve();
			}
			else
			{
				console.debug(`Component._autoLoadTemplate(): Auto loading template. templateName=${templateName}`);

				this.__loadTemplate(templateName).then(() => {
					return this.listener.trigger("load", this);
				}).then(() => {
					return this.__appendTemplate(this.getOption("rootNode"), templateName);
				}).then(() => {
					resolve();
				});
			}
		});

	}

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
     * Initialization of component on open().
     */
	__initOnOpen()
	{

		// Auto focus
		if (this.getOption("autoFocus"))
		{
			let element = this.element.querySelector(this.getOption("autoFocus"));
			if (element)
			{
				element.focus();
			}

		}

		// Css
		let css = (this.events["open"] && this.events["open"]["css"] ? this.events["open"]["css"] : undefined );
		if (css)
		{
			Object.assign(this.element.style, css);
		}

	}

	// -------------------------------------------------------------------------

	/**
     * Initialization of clone on close().
     */
	__initOnClose()
	{

		// Css
		let css = (this.events && this.events["close"] && this.events["close"]["css"] ? this.events["close"]["css"] : undefined );
		if (css)
		{
			Object.assign(this.element.style, css);
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Load the template html.
	 *
	 * @param	{String}		templateName		Template name.
	 *
	 * @return  {Promise}		Promise.
	 */
	__loadTemplate(templateName)
	{

		let path = ("path" in this.options ? this.options["path"] : "");
		let url = this.container["loader"].buildTemplateUrl(templateName, path);
		console.debug(`Component.__loadTemplate(): Loading template. templateName=${templateName}, path=${path}`);

		return new Promise((resolve, reject) => {
			AjaxUtil.ajaxRequest({url:url, method:"GET"}).then((xhr) => {
				console.debug(`Component.__loadTemplate(): Loaded template. templateName=${templateName}`);
				this.shadows[templateName] = {};
				this.shadows[templateName]["html"] = xhr.responseText;
				resolve(xhr);
			});
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Append the template html to its root node.
	 *
	 * @param	{String}		rootNode			Root node to append.
	 * @param	{String}		templateName		Template name.
	 *
	 * @return  {Promise}		Promise.
	 */
	__appendTemplate(rootNode, templateName)
	{

		return new Promise((resolve, reject) => {
			if (!rootNode)
			{
				resolve();
				return;
			}

			let root = document.querySelector(rootNode);
			if (!root)
			{
				throw new NoNodeError(`Root node does not exist. name=${this.name}, rootNode=${rootNode}`);
			}

			// Add template to root node
			root.insertAdjacentHTML("afterbegin", this.shadows[templateName].html);
			this.element = root.children[0];

			console.debug(`Component.__appendTemplate(): Appended. templateName=${templateName}`);

			// Trigger events
			this.listener.trigger("_append", this).then(() => {
				return this.listener.trigger("append", this);
			}).then(() => {
				return this.setup();
			}).then(() => {
				return this.listener.trigger("init", this);
			}).then(() => {
				resolve();
			});
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Check if the component is loaded.
	 *
	 * @return  {bool}			True if loaded.
	 */
	__isLoaded(templateName)
	{

		let isLoaded = false;

		if (templateName in this.shadows && this.shadows[templateName].html)
		{
			isLoaded = true;
		}

		return isLoaded

	}

}
