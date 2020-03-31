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
import Clone from './clone';
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
		this.clones = {};
		this.shadows = {};

		// Options
		let defaults = { "templateName":componentName };
		this.options = Object.assign( {}, defaults, (options ? options : {}) );

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
	 * Open the component.
	 *
	 * @return  {Promise}		Promise.
	 */
	open()
	{

		return new Promise((resolve, reject) => {
			let templateName = this.getOption("templateName");

			console.debug(`Component.open(): Opening component. templateName=${templateName}`);

			this._autoLoadTemplate(templateName).then(() => {
				let chain = Promise.resolve();

				Object.keys(this.clones).forEach((key) => {
					chain = chain.then(() => {
						return this.clones[key].open();
					});
				});

				chain.then(() => {
					resolve();
				});
			});
		});

	}

	// -------------------------------------------------------------------------

	/**
     * Open modal.
	 *
	 * @param	{array}			options				Options.
	 *
	 * @return  {Promise}		Promise.
     */
	openModal(options)
	{

		return new Promise((resolve, reject) => {
			let templateName = this.getOption("templateName");

			console.debug(`Component.open(): Opening component. templateName=${templateName}`);

			this._autoLoadTemplate(templateName).then(() => {
				let chain = Promise.resolve();

				Object.keys(this.clones).forEach((key) => {
					chain = chain.then(() => {
						return this.clones[key].openModal(options);
					});
				});

				chain.then((modalResult) => {
					resolve(modalResult);
				});
			});
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Close the component.
	 *
	 * @return  {Promise}		Promise.
	 */
	close()
	{

		return new Promise((resolve, reject) => {

			let chain = Promise.resolve();

			Object.keys(this.clones).forEach((key) => {
				chain = chain.then(() => {
					return this.clones[key].close();
				});
			});

			Promise.all([chain]).then(() => {
				resolve();
			});
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Refresh the component.
	 *
	 * @return  {Promise}		Promise.
	 */
	refresh()
	{

		return new Promise((resolve, reject) => {
			let chain = Promise.resolve();

			Object.keys(this.clones).forEach((key) => {
				chain = chain.then(() => {
					return this.clones[key].refresh();
				});
			});

			chain.then(() => {
				resolve();
			});
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Fill form with data.
	 *
	 * @return  {Promise}		Promise.
	 */
	fill()
	{

		return new Promise((resolve, reject) => {
			let chain = Promise.resolve();

			Object.keys(this.clones).forEach((key) => {
				chain = chain.then(() => {
					return this.clones[key].fill();
				});
			});

			chain.then(() => {
				resolve();
			});
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Clear form.
	 *
	 * @return  {Promise}		Promise.
	 */
	clear()
	{

		return new Promise((resolve, reject) => {
			let chain = Promise.resolve();

			Object.keys(this.clones).forEach((key) => {
				chain = chain.then(() => {
					return this.clones[key].clear();
				});
			});

			chain.then(() => {
				resolve();
			});
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Apply settings
	 *
	 * @param	{Object}		settings			Settings.
	 *
	 * @return  {Promise}		Promise.
	 */
	setup(settings)
	{

		return new Promise((resolve, reject) => {
			let chain = Promise.resolve();

			Object.keys(this.clones).forEach((key) => {
				chain = chain.then(() => {
					return this.clones[key].setup(settings);
				});
			});

			chain.then(() => {
				resolve();
			});
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Change template html.
	 *
	 * @param	{String}		templateName		Template name to clone.
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
	 * @param	{string}		newId				Id for the cloned component.
	 *
	 * @return  {Object}		Cloned component.
	 */
	clone(newId, templateName)
	{

		let clone;
		let element = document.getElementById(this.shadows[templateName].id);

		if ( this.__isTemplate(templateName) )
		{
			clone = document.importNode(element.content, true);
			if (newId)
			{
				clone.firstElementChild.id = newId;
			}
		}
		else
		{
			clone = element.cloneNode(true);
			if (element.tagName.toLowerCase() == "template")
			{
				clone = clone.children[0];
			}
			if (newId)
			{
				clone.id = newId;
			}
		}

		return clone;

	}

	// -------------------------------------------------------------------------

	/**
	 * Clone the component to nodes.
	 *
	 * @param	{String}		newId				New id to set.
	 * @param	{String}		rootNode			Nodes to append to.
	 * @param	{String}		templateName		Template name to clone.
	 *
	 * @return  {Promise}		Promise.
	 */
	cloneTo(newId, rootNode, templateName)
	{

		return new Promise((resolve, reject) => {
			let elements = document.querySelectorAll(rootNode);
			if (elements.length == 0)
			{
				throw new NoNodeError(`rootNode does not exist. id=${newId}, rootNode=${node}, templateName=${templateName}`);
			}

			let chain = Promise.resolve();
			elements.forEach((element) => {
				let newElement;
				if (this.options["todo:decide option name"])
				{
					let shadowRoot = element.attachShadow({mode: 'open'});
					shadowRoot.innerHTML = this.shadows[templateName].html;
					newElement = shadowRoot.children[0];
				}
				else
				{
					element.appendChild(this.clone(newId, templateName));
					newElement = element.children[0];
				}

				chain = chain.then(() => {
					return this.__registClone(newId, newElement, rootNode);
				});
			});

			chain.then(() => {
				resolve();
			});
		});

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
			let isTemplate;

			if (this.__isLoaded(templateName))
			{
				resolve();
			}
			else
			{
				console.debug(`Component._autoLoadTemplate(): Auto loading template. templateName=${templateName}`);

				rootNode = ( this.options["templateNode"] ? this.options["templateNode"] : this.options["rootNode"] );
				isTemplate = ( this.options["templateNode"] ? true : false );

				this.__loadTemplate(templateName).then(() => {
					return this.__appendTemplate(rootNode, templateName);
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
	 * @return  {Promise}		Promise.
	 */
	__appendTemplate(rootNode, templateName)
	{

		return new Promise((resolve, reject) => {
			if (!rootNode)
			{
				throw new NoNodeError(`Root node not specified. name=${this.name}`);
			}

			let elements = document.querySelectorAll(rootNode);
			if (elements.length == 0)
			{
				throw new NoNodeError(`Root node does not exist. name=${this.name}, rootNode=${rootNode}`);
			}

			elements.forEach((element) => {
				// todo: do not insert html when using shadow dom.
				// if ()
				// {
				element.insertAdjacentHTML("afterbegin", this.shadows[templateName].html);
				this.shadows[templateName].id = element.children[0].id;
				this.shadows[templateName].element = element.children[0];
				// }
				console.debug(`Component.__appendTemplate(): Appended template. templateName=${templateName}, rootNode=${rootNode}`);

				this.listener.trigger("_append", this).then(() => {
					return this.listener.trigger("append", this);
				}).then(() => {
					if (this.options["rootNode"] && this.options["templateNode"])
					{
						return this.cloneTo("", this.options["rootNode"], templateName);
					}
					else if (this.options["rootNode"] && !this.options["templateNode"])
					{
						let newId = this.shadows[templateName].id.replace("template-", "");
						return this.__registClone(newId, this.shadows[templateName].element, element);
					}
				}).then(() => {
					resolve();
				});
			});
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Regist cloned element.
	 *
	 * @param	{String}		id					Element id.
	 * @param	{HTMLElement}	element				Element to register.
	 *
	 * @return  {Promise}		Promise.
	 */
	__registClone(id, element, rootNode)
	{

		return new Promise((resolve, reject) => {
			if (!id)
			{
				let no = Object.keys(this.clones).length + 1
				id =  "@@@" + no;
			}

			let clone = new Clone(id, element, rootNode, this);
			this.clones[id] = clone;

			this.listener.trigger("_clone", this, {"clone":clone}).then(() => {
				return this.listener.trigger("clone", this, {"clone":clone});
			}).then(() => {
				return clone.setup({"currentPreference":this.container["preferences"], "newPreference":this.container["preferences"]});
				//return clone.setup();
			}).then(() => {
				return this.listener.trigger("init", this, {"clone":clone});
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

	// -------------------------------------------------------------------------

	/**
	 * Check if the component is opened.
	 *
	 * @return  {bool}			True if opened.
	 */
	/*
	__isOpened()
	{

		let isOpened = true;
		let element = document.getElementById(this.);

		if (!this.__isLoaded() || window.getComputedStyle(element).getPropertyValue("display") == "none")
		{
			isOpened = false;
		}

		return isOpened;

	}
	*/

	// -------------------------------------------------------------------------

	/**
	 * Check if the component is a template.
	 *
	 * @return  {bool}			True if template.
	 */
	__isTemplate(templateName)
	{

		let ret = false;
		let element = document.getElementById(this.shadows[templateName].id);

		if (element)
		{
			if ("content" in document.createElement("template"))
			{
				if (element.tagName.toLowerCase() == "template")
				{
					ret = true;
				}
			}
		}
		else
		{
			let message = `Template element does not exist. name=${this.name}, templateName=${templateName}`;
			throw new NoNodeError(`Template element does not exist. name=${this.name}, templateName=${templateName}`);
		}

		return ret;

	}

}
