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
//	Form class
// =============================================================================

export default class Form extends Pad
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
		this._item = {};
		this.__isComposing = false;
		this.__cancelSubmit = false;

		// Init system event handlers
		this.addEventHandler(this, "_append", this.__initFormOnAppend);

	}

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	/**
	 * Data item.
	 *
	 * @type	{Object}
	 */
	set item(value)
	{

		this._item = value;

	}

	get item()
	{

		return this._item;

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
	 * Build form.
	 *
	 * @param	{Object}		items				Items to fill elements.
	 *
	 * @return  {Promise}		Promise.
	 */
	build(items)
	{

		Object.keys(items).forEach((key) => {
			FormUtil.buildFields(this._element, key, items[key]);
		});

	}

	// -------------------------------------------------------------------------

	/**
     * Fill the form.
	 *
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
     */
	fill(options)
	{

		return new Promise((resolve, reject) => {
			options = Object.assign({}, this._options, options);
			let sender = ( options["sender"] ? options["sender"] : this );

			// Clear fields
			if (options["autoClear"])
			{
				this.clear();
			}

			this.trigger("target", sender).then(() => {
				return this.trigger("beforeFetch", sender);
			}).then(() => {
				// Auto load data
				if (options["autoLoad"])
				{
					return this.__autoLoadData();
				}
			}).then(() => {
				return this.trigger("fetch", sender);
			}).then(() => {
				return this.trigger("format", sender);
			}).then(() => {
				return this.trigger("beforeFill", sender);
			}).then(() => {
				FormUtil.setFields(this._element, this.item, this.masters); //@@@fix
				return this.trigger("fill", sender);
			}).then(() => {
				resolve();
			});
		});

	}

	// -------------------------------------------------------------------------

	/**
     * Clear the form.
	 *
	 * @param	{Object}		options				Options.
	 *
	 * @param	{string}		target				Target.
     */
	clear(target)
	{

		return FormUtil.clearFields(this._element, target);

	}

	// -------------------------------------------------------------------------

	/**
     * Validate.
	 *
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
     */
	validate(options)
	{

		return new Promise((resolve, reject) => {
			options = Object.assign({}, options);
			let sender = ( options["sender"] ? options["sender"] : this );
			delete options["sender"];

			this.trigger("beforeValidate", sender).then(() => {
				let ret = true;
				let form = this._element.querySelector("form");

				if (this.getOption("autoValidate"))
				{
					if (form && form.reportValidity)
					{
						ret = form.reportValidity();
					}
					else
					{
						ret = FormUtil.reportValidity(this._element);
					}
				}

				if (!ret)
				{
					this.__cancelSubmit = true;
				}
				return this.trigger("validate", sender);
			}).then(() => {
				resolve();
			});
		});

	}

	// -------------------------------------------------------------------------

	/**
     * Submit the form.
	 *
	 * @return  {Promise}		Promise.
     */
	submit(options)
	{

		return new Promise((resolve, reject) => {
			options = Object.assign({}, options);
			let sender = ( options["sender"] ? options["sender"] : this );
			delete options["sender"];
			this.__cancelSubmit = false;
			this.item = this.getFields();

			this.trigger("formatSubmit", sender).then(() => {
				return this.validate();
			}).then(() => {
				return this.trigger("beforeSubmit", sender);
			}).then(() => {
				if (!this.__cancelSubmit)
				{
					return this.trigger("submit", sender);
				}
			}).then(() => {
				resolve();
			});
		});

	}

	// -------------------------------------------------------------------------

	/**
     * Get the form values.
	 *
	 * @return  {array}			Form values.
     */
	getFields()
	{

		return FormUtil.getFields(this._element);

	}

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
	 * Init after append completed.
	 *
	 * @param	{Object}		sender				Sender.
	 * @param	{Object}		e					Event info.
	 */
	__initFormOnAppend(sender, e)
	{

		// default keys
		let defaultKeys = this.getOption("defaultKeys");
		if (defaultKeys)
		{
			this.addEventHandler(this._element, "keydown", this.__defaultKey, {"options":defaultKeys});
			this.addEventHandler(this._element, "compositionstart", this.__compositionStart, {"options":defaultKeys});
			this.addEventHandler(this._element, "compositionend", this.__compositionEnd, {"options":defaultKeys});
		}

		// default buttons
		let defaultButtons = this.getOption("defaultButtons");
		if (defaultButtons)
		{
			let initElements = (options, handler) => {
				if (options)
				{
					let elements = this._element.querySelectorAll(options["rootNode"]);
					elements.forEach((element) => {
						this.addEventHandler(element, "click", handler, {"options":options});
					});
				}
			};

			initElements(defaultButtons["submit"], this.__defaultSubmit);
			initElements(defaultButtons["cancel"], this.__defaultCancel);
			initElements(defaultButtons["clear"], this.__defaultClear);
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Default key event handler.
	 *
	 * @param	{Object}		sender				Sender.
	 * @param	{Object}		e					Event info.
	 */
	__defaultKey(sender, e)
	{

		// Ignore all key input when composing.
		if (this.__isComposing || e.keyCode == 229)
		{
			return;
		}

		let key = e.key.toLowerCase()
		key = ( key == "esc" ? "escape" : key ); // For IE11

		if (e.extraDetail.options.submit && key == e.extraDetail.options.submit.key)
		{
			// Submit
			e.extraDetail = {"options":e.extraDetail.options.submit};
			this.__defaultSubmit(sender, e);
		}
		else if (e.extraDetail.options.cancel && key == e.extraDetail.options.cancel.key)
		{
			// Cancel
			e.extraDetail = {"options":e.extraDetail.options.cancel};
			this.__defaultCancel(sender, e);
		}
		else if (e.extraDetail.options.clear && key == e.extraDetail.options.clear.key)
		{
			// Clear
			e.extraDetail = {"options":e.extraDetail.options.clear};
			this.__defaultClear(sender, e);
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Composition start event handler.
	 *
	 * @param	{Object}		sender				Sender.
	 * @param	{Object}		e					Event info.
	 */
	__compositionStart(sender, e)
	{

		this.__isComposing = true;

	}

	// -------------------------------------------------------------------------

	/**
	 * Composition end event handler.
	 *
	 * @param	{Object}		sender				Sender.
	 * @param	{Object}		e					Event info.
	 */
	__compositionEnd(sender, e)
	{

		this.__isComposing = false;

	}

	// -------------------------------------------------------------------------

	/**
	 * Default submit.
	 *
	 * @param	{Object}		sender				Sender.
	 * @param	{Object}		e					Event info.
	 */
	__defaultSubmit(sender, e)
	{

		this.submit().then(() => {
			if (!this.__cancelSubmit)
			{
				// Modal result
				if (this._isModal)
				{
					this._modalResult["result"] = true;
				}

				// Auto close
				if (e.extraDetail["options"] && e.extraDetail["options"] && e.extraDetail["options"]["autoClose"])
				{
					this.close();
				}
			}
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Default cancel.
	 *
	 * @param	{Object}		sender				Sender.
	 * @param	{Object}		e					Event info.
	 */
	__defaultCancel(sender, e)
	{

		this.close();

	}

	// -------------------------------------------------------------------------

	/**
	 * Default clear.
	 *
	 * @param	{Object}		sender				Sender.
	 * @param	{Object}		e					Event info.
	 */
	__defaultClear(sender, e)
	{

		let target;

		if (e.extraDetail["options"] && e.extraDetail["options"] && e.extraDetail["options"]["target"])
		{
			target = sender.getAttribute(e.extraDetail["options"]["target"]);
		}

		this.clear(target);

	}

	// -------------------------------------------------------------------------

	/**
     * Load data via API.
	 *
	 * @return  {Promise}		Promise.
     */
	__autoLoadData()
	{

		return new Promise((resolve, reject) => {
			this._resource.getItem(this._target).then((data) => {
				this.item = data["data"][0];
				resolve();
			});
		});

	}

}
