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
		this.parent;

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
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	open(options)
	{

		return this._callClones("open", [options]);

	}

	// -------------------------------------------------------------------------

	/**
     * Open modal.
	 *
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
     */
	openModal(options)
	{

		return this._callClones("openModal", [options]);

	}

	// -------------------------------------------------------------------------

	/**
	 * Close the component.
	 *
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	close(options)
	{

		return this._callClones("close", [options]);

	}

	// -------------------------------------------------------------------------

	/**
	 * Refresh the component.
	 *
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	refresh(options)
	{

		return this._callClones("refresh", [options]);

	}

	// -------------------------------------------------------------------------

	/**
	 * Fill form with data.
	 *
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	fill(options)
	{

		return this._callClones("fill", [options]);

	}

	// -------------------------------------------------------------------------

	/**
	 * Clear form.
	 *
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	clear(options)
	{

		return this._callClones("clear", [options]);

	}

	// -------------------------------------------------------------------------

	/**
	 * Apply settings
	 *
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	setup(options)
	{

		return this._callClones("setup", [options]);

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

	/**
     * Call clone method.
     *
	 * @param	{string}		methodName			Method name.
	 * @param	{array}			args				Arguments to method.
	 *
	 * @return  {Promise}		Promise.
     */
	_callClones(methodName, args)
	{

		return new Promise((resolve, reject) => {
			let templateName = this.getOption("templateName");

			console.debug(`Component._callClones(): templateName=${templateName}, methodName=${methodName}`);

			this._autoLoadTemplate(templateName).then(() => {
				let chain = Promise.resolve();

				Object.keys(this.clones).forEach((key) => {
					chain = chain.then(() => {
						return this.clones[key][methodName].apply(this.clones[key], args);
					});
				});

				chain.then((result) => {
					resolve(result);
				});
			});
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

			let roots = document.querySelectorAll(rootNode);
			if (roots.length == 0)
			{
				throw new NoNodeError(`Root node does not exist. name=${this.name}, rootNode=${rootNode}`);
			}

			this.__appendToRoots(roots, templateName).then(() => {
				resolve();
			});
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Append the template html to its root node. Bound to parent node.
	 *
	 * @param	{String}		rootNode			Root node to append.
	 * @param	{String}		templateName		Template name.
	 *
	 * @return  {Promise}		Promise.
	 */
	/*
	__appendTemplate(rootNode, templateName)
	{

		return new Promise((resolve, reject) => {
			if (!rootNode)
			{
				resolve();
				return;
			}

			console.debug(`Component.__appendTemplate(): Appending template. templateName=${templateName}, rootNode=${rootNode}`);

			let chain = Promise.resolve();

			if (this.parent)
			{
				// Has a parent.  Root node is parent's each clone.
				Object.keys(this.parent.clones).forEach((cloneId) => {
					let roots = this.parent.clones[cloneId].element.querySelectorAll(rootNode);
					if (roots.length == 0)
					{
						throw new NoNodeError(`Root node does not exist. name=${this.name}, rootNode=${rootNode}`);
					}
					chain = chain.then(() => {
						return this.__appendToRoots(roots, templateName);
					});
				});
			}
			else
			{
				// Doesn't have a parent.  Root node is document.
				let roots = document.querySelectorAll(rootNode);
				if (roots.length == 0)
				{
					throw new NoNodeError(`Root node does not exist. name=${this.name}, rootNode=${rootNode}`);
				}

				chain = this.__appendToRoots(roots, templateName);
			}

			chain.then(() => {
				resolve();
			});
		});

	}
	*/

	// -------------------------------------------------------------------------

	/**
	 * Append the template html to its root node.
	 *
	 * @param	{HTMLNodes}		roots				Root nodes.
	 * @param	{String}		templateName		Template name.
	 *
	 * @return  {Promise}		Promise.
	 */
	__appendToRoots(roots, templateName)
	{

		return new Promise((resolve, reject) => {
			let chain = Promise.resolve();

			roots.forEach((root) => {
				// Add template to root node
				root.insertAdjacentHTML("afterbegin", this.shadows[templateName].html);
				let newElement = root.children[0];
				console.debug(`Component.__appendTemplate(): Appended. templateName=${templateName}`);

				// Regist clone
				let id = "";
				chain = chain.then(() => {
					return this.__registClone(id, newElement, root);
				});
			});

			chain.then(() => {
				resolve();
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
				id =  "clone-" + no;
			}

			let clone = new Clone(id, element, rootNode, this);
			this.clones[id] = clone;

			this.listener.trigger("_append", this, {"clone":clone}).then(() => {
				return this.listener.trigger("append", this, {"clone":clone});
			}).then(() => {
				return clone.setup();
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

}
