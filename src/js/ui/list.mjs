// =============================================================================
/**
 * Bitsmist WebView - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

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
		this.events.addEventHandler("_fill", this.__initListOnFill);
		this.events.addEventHandler("_clone", this.__initListOnClone);

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
	 * Fill list with data.
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
	 * Clear list.
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
		ex.clone.clear= this.__clear.bind(ex.clone);;
		ex.clone.__appendRow = this.__appendRow.bind(ex.clone);
		ex.clone.__autoLoadData = this.__autoLoadData.bind(ex.clone);
		ex.clone.row = this.components[this.getOption("row")].object;
		if (ex.clone.row.getOption("listRootNode"))
		{
			ex.clone.listRootNode = document.querySelector(ex.clone.row.getOption("listRootNode"));
		}

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
		Object.keys(row.components).forEach((componentName) => {
			if (!("class" in row.components[componentName]))
			{
				row.initHtmlEvents(componentName, ex.clone.listRootNode);
			}
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

			this.parent.events.trigger("target", this, {"clone":this}).then(() => {;
				let promise;

				// Auto load data
				if (this.parent.getOption("autoLoad"))
				{
					promise = this.__autoLoadData();
				}
				else
				{
					promise = this.parent.events.trigger("fetch", this, {"clone":this});
				}

				Promise.all([promise]).then(() => {
					return this.parent.events.trigger("beforeFill", this);
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
								let newNode = this.listRootNode.cloneNode();
								newNode.appendChild(fragment);
								this.listRootNode.parentNode.replaceChild(newNode, this.listRootNode);
								this.listRootNode = newNode;
							}
							else
							{
								this.listRootNode.appendChild(fragment);
							}
						});
					}

					chain.then(() => {
						return this.parent.events.trigger("_fill", this, {"clone":this});
					}).then(() => {
						return this.parent.events.trigger("fill", this, {"clone":this});
					}).then(() => {
						resolve();
					});
				});
			});
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Clear list.
	 */
	__clear()
	{

		this.listRootNode.innerHTML = "";

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
			let templateName = this.row.options["templateName"];
			rootNode.appendChild(this.row.clone("", templateName));
			let element = rootNode.lastElementChild;
			let chain = Promise.resolve();

			this.rows.push(element);

			// click event handler
			if (this.row.options.events && "click" in this.row.options.events)
			{
				this.row.events.addHtmlEventHandler(element, "click", this.row, this.row.options.events["click"], {"clone":this, "element":element});
			}

			let i = this.rows.length - 1;
			// call event handlers
			chain = chain.then(() => {
				return this.row.events.trigger("formatRow", this, {"clone":this, "item": this.parent.items[i], "no": i, "element": element});
			}).then(() => {
				return this.row.events.trigger("beforeFillRow", this, {"clone":this, "item": this.parent.items[i], "no": i, "element": element});
			}).then(() => {
				// fill fields
				FormUtil.setFields(element, this.parent.items[i], this.parent.container["masters"]);
				return this.row.events.trigger("fillRow", this, {"item": this.parent.items[i], "no": i, "element": element});
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
