// =============================================================================
/**
 * Bitsmist WebView - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import Clone from './clone';
import FormUtil from '../util/form-util';
import Pad from './pad';

// =============================================================================
//	List class
// =============================================================================

export default class List extends Pad
{

	// -------------------------------------------------------------------------
	//  Constructor
	// -------------------------------------------------------------------------

	/**
     * Constructor.
     *
	 * @param	{String}		componentName		Component name.
	 * @param	{Object}		options				Options.
     */
	constructor(componentName, options)
	{

		super(componentName, options);

		this.target;
		this.items;
		this.data;
		this.rows;
		this.parameters = {};

		// Init system event handlers
		this.listener.addEventHandler("_fill", this.__initListOnFill);
		this.listener.addEventHandler("_clone", this.__initListOnClone);

	}

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
	 * Init after clone completed.
	 *
	 * @param	{Object}		sender				Sender.
	 * @param	{Object}		e					Event info.
 	 * @param	{Object}		ex					Extra info.
	 */
	__initListOnClone(sender, e, ex)
	{

		// extend clone
		ex.clone.fill = this.__fill.bind(ex.clone);
		ex.clone.clear= this.__clear.bind(ex.clone);
		ex.clone.__appendRow = this.__appendRow.bind(ex.clone);
		ex.clone.__autoLoadData = this.__autoLoadData.bind(ex.clone);

		let row = this.components[this.getOption("row")].object;
		let listRoot = ex.clone.element.querySelector(row.getOption("listRootNode"));
		ex.clone.list = new Clone((listRoot.id ? listRoot.id : this.name + "-list"), listRoot, listRoot, row);

	}

	// -------------------------------------------------------------------------

	/**
	 * Init after filling completed.
	 *
	 * @param	{Object}		sender				Sender.
	 * @param	{Object}		e					Event info.
 	 * @param	{Object}		ex					Extra info.
	 */
	__initListOnFill(sender, e, ex)
	{

		let row = this.components[this.getOption("row")].object;

		// Set HTML elements' event handlers after filling completed
		Object.keys(row.elements).forEach((elementName) => {
			ex.clone.list.initHtmlEvents(elementName, ex.clone.listRootNode);
		});

	}

	// -------------------------------------------------------------------------
	//  Privates (Bind to clone)
	// -------------------------------------------------------------------------

	/**
	 * Fill list with data.
	 *
	 * @return  {Promise}		Promise.
	 */
	__fill()
	{

		return new Promise((resolve, reject) => {
			this.rows = [];

			this.parent.listener.trigger("target", this, {"clone":this}).then(() => {;
				return this.parent.listener.trigger("beforeFetch", this, {"clone":this});
			}).then(() => {
				// Auto load data
				if (this.parent.getOption("autoLoad"))
				{
					return this.__autoLoadData();
				}
			}).then(() => {
				return this.parent.listener.trigger("fetch", this, {"clone":this});
			}).then(() => {
				return this.parent.listener.trigger("beforeFill", this);
			}).then(() => {
				let chain = Promise.resolve();
				if (this.parent.items)
				{
					let fragment = document.createDocumentFragment();
					for (let i = 0; i < this.parent.items.length; i++)
					{
						chain = chain.then(() => {
							return this.__appendRow(fragment);
						});
					}
					chain.then(() => {
						if (this.parent.getOption("autoClear"))
						{
							let newNode = this.list.element.cloneNode();
							newNode.appendChild(fragment);
							this.list.element.parentNode.replaceChild(newNode, this.list.element);
							this.list.element = newNode;
						}
						else
						{
							this.list.element.appendChild(fragment);
						}
					});
				}
				return chain;
			}).then(() => {
				return this.parent.listener.trigger("_fill", this, {"clone":this});
			}).then(() => {
				return this.parent.listener.trigger("fill", this, {"clone":this});
			}).then(() => {
				resolve();
			});
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Clear list.
	 */
	__clear()
	{

		this.list.element.innerHTML = "";

	}

	// -------------------------------------------------------------------------

	/**
	 * Append a new row.
	 *
	 * @param	{HTMLElement}	rootNode				Root node to append a row.
	 *
	 * @return  {Promise}		Promise.
	 */
	__appendRow(rootNode)
	{

		return new Promise((resolve, reject) => {
			let templateName = this.list.parent.options["templateName"];
			rootNode.appendChild(this.list.parent.clone("", templateName));
			let element = rootNode.lastElementChild;
			if (!element)
			{
				let elements = rootNode.querySelectorAll("li");
				element = elements[elements.length - 1];
			}
			let chain = Promise.resolve();

			this.rows.push(element);

			// click event handler
			if (this.list.parent.events["click"])
			{
				this.list.parent.listener.addHtmlEventHandler(element, "click", this.list.parent.events["click"]["handler"], {"clone":this, "element":element});
			}

			let i = this.rows.length - 1;
			// call event handlers
			chain = chain.then(() => {
				return this.list.parent.listener.trigger("formatRow", this, {"clone":this, "item": this.parent.items[i], "no": i, "element": element});
			}).then(() => {
				return this.list.parent.listener.trigger("beforeFillRow", this, {"clone":this, "item": this.parent.items[i], "no": i, "element": element});
			}).then(() => {
				// fill fields
				FormUtil.setFields(element, this.parent.items[i], this.parent.container["masters"]);
				return this.list.parent.listener.trigger("fillRow", this, {"item": this.parent.items[i], "no": i, "element": element});
			}).then(() => {
				resolve();
			});
		});

	}

	// -------------------------------------------------------------------------

	/**
     * Load data via API when item is not specified in the options.
	 *
	 * @return  {Promise}		Promise.
     */
	__autoLoadData()
	{

		return new Promise((resolve, reject) => {
			this.parent.resource.getList(this.parent.target).then((data) => {
				this.parent.data = data;
				this.parent.items = data["data"];
				resolve();
			});
		});

	}

}
