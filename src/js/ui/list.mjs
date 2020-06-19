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
//import Component from './component';
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
     */
	constructor()
	{

		super();

		this._target;
		this._items;
		this._data;
		this._row;
		this._rows;

		// Init system event handlers
		this.addEventHandler(this, "_append", this.__initListOnAppend);
		this.addEventHandler(this, "_fill", this.__initListOnFill);

	}

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	/**
	 * Data items.
	 *
	 * @type	{Object}
	 */
	set items(value)
	{

		this._items = value;

	}

	get items()
	{

		return this._items;

	}

	// -------------------------------------------------------------------------

	/**
	 * Raw data retrieved via api.
	 *
	 * @type	{Object}
	 */
	set data(value)
	{

		this._data = value;

	}

	get data()
	{

		return this._data;

	}

	// -------------------------------------------------------------------------

	/**
	 * Target.
	 *
	 * @type	{Object}
	 */
	set target(value)
	{

		this._target = value;

	}

	get target()
	{

		return this._target;

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
	 * Clear list.
	 */
	clear()
	{

		while (this.row._element.firstChild)
		{
			this.row._element.removeChild(this.row._element.firstChild);
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Fill list with data.
	 *
	 * @return  {Promise}		Promise.
	 */
	fill(options)
	{

		console.debug(`List.fill(): Filling list. name=${this.name}`);

		return new Promise((resolve, reject) => {
			this.rows = [];
			options = Object.assign({}, this._options, options);

			Promise.resolve().then(() => {
				return this.trigger("target", this);
			}).then(() => {
				if (options["target"])
				{
					this._target = options["target"];
				}
				return this.trigger("beforeFetch", this);
			}).then(() => {
				// Auto load data
				if (options["autoLoad"])
				{
					return this.__autoLoadData();
				}
			}).then(() => {
				return this.trigger("fetch", this);
			}).then(() => {
				return this.trigger("beforeFill", this);
			}).then(() => {
				let chain = Promise.resolve();
				if (this.items)
				{
					let fragment = document.createDocumentFragment();
					for (let i = 0; i < this.items.length; i++)
					{
						chain = chain.then(() => {
							return this.__appendRow(fragment);
						});
					}
					chain.then(() => {
						if (options["autoClear"])
						{
							this.clear();
						}
						this.row._element.appendChild(fragment, options["masters"]);
					});
				}
				return chain;
			}).then(() => {
				return this.trigger("_fill", this);
			}).then(() => {
				return this.trigger("fill", this);
			}).then(() => {
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
	 */
	__initListOnAppend(sender, e)
	{

		this.row = this._components[this.getOption("row")].object;
		this.row._element = this._element.querySelector(this.row.getOption("listRootNode"));

	}

	// -------------------------------------------------------------------------

	/**
	 * Init after filling completed.
	 *
	 * @param	{Object}		sender				Sender.
	 * @param	{Object}		e					Event info.
	 */
	__initListOnFill(sender, e)
	{

		// Set HTML elements' event handlers after filling completed
		Object.keys(this.row._elements).forEach((elementName) => {
			this.row._initHtmlEvents(elementName);
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Append a new row.
	 *
	 * @param	{HTMLElement}	rootNode				Root node to append a row.
	 *
	 * @return  {Promise}		Promise.
	 */
	__appendRow(rootNode, masters)
	{

		return new Promise((resolve, reject) => {
			// Append row
			let element = this.row._dupElement();
			rootNode.appendChild(element);
			this.rows.push(element);
			let i = this.rows.length - 1;

			// Set click event handler
			if (this.row._events["click"])
			{
				this.row.addEventHandler(element, "click", this.row._events["click"]["handler"], {"element":element});
			}

			// Call event handlers
			let chain = Promise.resolve();
			chain = chain.then(() => {
				return this.row.trigger("formatRow", this, {"item":this.items[i], "no":i, "element":element});
			}).then(() => {
				return this.row.trigger("beforeFillRow", this, {"item":this.items[i], "no":i, "element":element});
			}).then(() => {
				// Fill fields
				FormUtil.setFields(element, this.items[i], this.masters);
				//FormUtil.setFields(element, this.items[i], masters);
				return this.row.trigger("fillRow", this, {"item":this.items[i], "no":i, "element":element});
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
			this._resource.getList(this.target).then((data) => {
				this.data = data;
				this.items = data["data"];
				resolve();
			});
		});

	}

}
