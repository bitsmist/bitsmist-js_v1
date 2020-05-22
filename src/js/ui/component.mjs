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

		this._container = options["container"];
		this._name = componentName;
		this._className = (options["class"] ? options["class"] : componentName);
		this._listener = new EventHandler(this);
		this._shadows = {};
		this._parent;
		this._element;
		this._modalOptions;
		this._modalResult;
		this._modalPromise;
		this._isModal = false;
		this._isOpen = false;

		// Options
		let defaults = { "templateName":this._className };
		this._options = Object.assign( {}, defaults, (options ? options : {}) );

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

		return this._name;

	}

	// -------------------------------------------------------------------------

	/**
     * Class name.
     *
	 * @type	{String}
     */
	get className()
	{

		return this._className;

	}

	// -------------------------------------------------------------------------

	/**
     * HTML element.
     *
	 * @type	{HTMLElement}
     */
	get element()
	{

		return this._element;

	}

	// -------------------------------------------------------------------------

	/**
     * Event listener.
     *
	 * @type	{Object}
     */
	get listener()
	{

		return this._listener;

	}

	// -------------------------------------------------------------------------

	/**
     * Instance hash code.
     *
	 * @type	{String}
     */
	get hashCode()
	{

		return new Date().getTime().toString(16) + Math.floor(100*Math.random()).toString(16);

	}

	// -------------------------------------------------------------------------

	/**
	 * Set option value.
	 *
	 * @param	{String}		key					Key to get.
	 * @param	{Object}		value				Value  to set.
	 */
	setOption(key, value)
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
	getOption(key, defaultValue)
	{

		let result = defaultValue;

		if (this._options && (key in this._options))
		{
			result = this._options[key];
		}

		return result;

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

		console.debug(`Component.open(): Opening component. name=${this._name}`);

		return new Promise((resolve, reject) => {
			options = Object.assign({}, options);
			let sender = ( options["sender"] ? options["sender"] : this );
			delete options["sender"];

			if (this._isOpen)
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
				return this._listener.trigger("_beforeOpen", sender);
			}).then(() => {
				return this._listener.trigger("beforeOpen", sender);
			}).then(() => {
				return this._listener.trigger("open", sender);
			}).then(() => {
				return this._listener.trigger("_open", sender);
			}).then(() => {
				this._initOnOpen();
				console.debug(`Component.open(): Opened component. name=${this._name}`);
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
	openModal(options)
	{

		console.debug(`Component.openModal(): Opening component. name=${this._name}`);

		return new Promise((resolve, reject) => {
			if (this._isOpen)
			{
				resolve();
				return;
			}

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
	close(options)
	{

		console.debug(`Component.close(): Closing component. name=${this._name}`);

		return new Promise((resolve, reject) => {
			options = Object.assign({}, options);
			let sender = ( options["sender"] ? options["sender"] : this );
			delete options["sender"];

			if (!this._isOpen)
			{
				resolve();
				return;
			}

			Promise.resolve().then(() => {
				return this._listener.trigger("_beforeClose", sender);
			}).then(() => {
				return this._listener.trigger("beforeClose", sender);
			}).then(() => {
				return this._listener.trigger("close", sender);
			}).then(() => {
				return this._listener.trigger("_close", sender);
			}).then(() => {
				console.debug(`Component.close(): Closed component. name=${this._name}`);
				if (this._isModal)
				{
					this._modalPromise.resolve(this._modalResult);
				}
				this._initOnClose();
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
	refresh(options)
	{

		console.debug(`Component.refresh(): Refreshing component. name=${this._name}`);

		return new Promise((resolve, reject) => {
			options = Object.assign({}, options);
			let sender = ( options["sender"] ? options["sender"] : this );
			delete options["sender"];

			this._listener.trigger("_beforeRefresh", sender).then(() => {
				return this._listener.trigger("beforeRefresh", sender);
			}).then(() => {
				if (this.getOption("autoFill"))
				{
					return this.fill();
				}
			}).then(() => {
				return this._listener.trigger("refresh", sender);
			}).then(() => {
				return this._listener.trigger("_refresh", sender);
			}).then(() => {
				this.autoFocus();
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

		console.debug(`Component.setup(): Setting up component. name=${this._name}`);

		return new Promise((resolve, reject) => {
			options = Object.assign({}, options);
			options["currentPreferences"] = ( options["currentPreferences"] ? options["currentPreferences"] : this._container["preferences"] );
			options["newPreferences"] = ( options["newPreferences"] ? options["newPreferences"] : this._container["preferences"] );
			let sender = ( options["sender"] ? options["sender"] : this );
			delete options["sender"];

			this._listener.trigger("formatSettings", sender, options).then(() => {
				return this._listener.trigger("validateSettings", sender,  options);
			}).then(() => {
				return this._listener.trigger("beforeSetup", sender, options);
			}).then(() => {
				return this._listener.trigger("setup", sender, options);
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
				this._options["templateName"] = templateName;
				return this._listener.trigger("templateChange", this);
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
		let template = this._shadows[templateName].template;

		if (!template)
		{
			template = document.createElement('template');
			template.innerHTML = this._shadows[templateName].html;

			this._shadows[templateName].template = template;
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
	 * Trigger the event.
	 *
	 * @param	{String}		eventName				Event name to trigger.
	 * @param	{Object}		sender					Object which triggered the event.
	 * @param	{Object}		options					Event parameter options.
	 */
	trigger(eventName, sender, options)
	{

		return this._listener.trigger(eventName, sender, options);

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
					return this._listener.trigger("load", this);
				}).then(() => {
					return this.__appendTemplate(this.getOption("rootNode"), templateName);
				}).then(() => {
					resolve();
				});
			}
		});

	}

	// -------------------------------------------------------------------------

	/**
     * Initialization of component on open().  Need to override.
     */
	_initOnOpen()
	{
	}

	// -------------------------------------------------------------------------

	/**
     * Initialization of clone on close().  Need to override.
     */
	_initOnClose()
	{
	}

	// -------------------------------------------------------------------------
	//  Privates
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

		let path = ("path" in this._options ? this._options["path"] : "");
		let url = this._container["loader"].buildTemplateUrl(templateName, path);
		console.debug(`Component.__loadTemplate(): Loading template. templateName=${templateName}, path=${path}`);

		return new Promise((resolve, reject) => {
			AjaxUtil.ajaxRequest({url:url, method:"GET"}).then((xhr) => {
				console.debug(`Component.__loadTemplate(): Loaded template. templateName=${templateName}`);
				this._shadows[templateName] = {};
				this._shadows[templateName]["html"] = xhr.responseText;
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
				throw new NoNodeError(`Root node does not exist. name=${this._name}, rootNode=${rootNode}`);
			}

			// Add template to root node
			root.insertAdjacentHTML("afterbegin", this._shadows[templateName].html);
			this._element = root.children[0];

			console.debug(`Component.__appendTemplate(): Appended. templateName=${templateName}`);

			// Trigger events
			Promise.resolve().then(() => {
				return new Promise((resolve, reject) => {
					let promises = this._container["app"].waitFor(this.getOption("waitFor", []))
					Promise.all(promises).then(() => {
						resolve();
					});
				});
			}).then(() => {
				return this._listener.trigger("_append", this);
			}).then(() => {
				return this._listener.trigger("append", this);
			}).then(() => {
				return this.setup();
			}).then(() => {
				return this._listener.trigger("init", this);
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

		if (templateName in this._shadows && this._shadows[templateName].html)
		{
			isLoaded = true;
		}

		return isLoaded

	}

}
