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
//	Form class
// =============================================================================

export default class Form extends Pad
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

		super(componentName, options);

		this._target;
		this._item = {};
		this.__isComposing = false;
		this.__cancelSubmit = false;

		// Init system event handlers
		this._listener.addEventHandler("_append", this.__initFormOnAppend);

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

			this._listener.trigger("target", sender).then(() => {
				return this._listener.trigger("beforeFetch", sender);
			}).then(() => {
				// Auto load data
				if (options["autoLoad"])
				{
					return this.__autoLoadData();
				}
			}).then(() => {
				return this._listener.trigger("fetch", sender);
			}).then(() => {
				return this._listener.trigger("format", sender);
			}).then(() => {
				return this._listener.trigger("beforeFill", sender);
			}).then(() => {
				FormUtil.setFields(this._element, this.item, this._container["masters"]);
				return this._listener.trigger("fill", sender);
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

			this._listener.trigger("beforeValidate", sender).then(() => {
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
				return this._listener.trigger("validate", sender);
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

			this._listener.trigger("formatSubmit", sender).then(() => {
				return this.validate();
			}).then(() => {
				return this._listener.trigger("beforeSubmit", sender);
			}).then(() => {
				if (!this.__cancelSubmit)
				{
					return this._listener.trigger("submit", sender);
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
 	 * @param	{Object}		ex					Extra info.
	 */
	__initFormOnAppend(sender, e, ex)
	{

		// default keys
		let defaultKeys = this.getOption("defaultKeys");
		if (defaultKeys)
		{
			this._listener.addHtmlEventHandler(this._element, "keydown", this.__defaultKey, {"options":defaultKeys});
			this._listener.addHtmlEventHandler(this._element, "compositionstart", this.__compositionStart, {"options":defaultKeys});
			this._listener.addHtmlEventHandler(this._element, "compositionend", this.__compositionEnd, {"options":defaultKeys});
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
						this._listener.addHtmlEventHandler(element, "click", handler, {"options":options});
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
 	 * @param	{Object}		ex					Extra info.
	 */
	__defaultKey(sender, e, ex)
	{

		// Ignore all key input when composing.
		if (this.__isComposing || e.keyCode == 229)
		{
			return;
		}

		let key = e.key.toLowerCase()
		key = ( key == "esc" ? "escape" : key ); // For IE11

		if (ex.options.submit && key == ex.options.submit.key)
		{
			// Submit
			this.__defaultSubmit(sender, e, {"options":ex.options.submit});
		}
		else if (ex.options.cancel && key == ex.options.cancel.key)
		{
			// Cancel
			this.__defaultCancel(sender, e, {"options":ex.options.cancel});
		}
		else if (ex.options.clear && key == ex.options.clear.key)
		{
			// Clear
			this.__defaultClear(sender, e, {"options":ex.options.clear});
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Composition start event handler.
	 *
	 * @param	{Object}		sender				Sender.
	 * @param	{Object}		e					Event info.
 	 * @param	{Object}		ex					Extra info.
	 */
	__compositionStart(sender, e, ex)
	{

		this.__isComposing = true;

	}

	// -------------------------------------------------------------------------

	/**
	 * Composition end event handler.
	 *
	 * @param	{Object}		sender				Sender.
	 * @param	{Object}		e					Event info.
 	 * @param	{Object}		ex					Extra info.
	 */
	__compositionEnd(sender, e, ex)
	{

		this.__isComposing = false;

	}

	// -------------------------------------------------------------------------

	/**
	 * Default submit.
	 *
	 * @param	{Object}		sender				Sender.
	 * @param	{Object}		e					Event info.
 	 * @param	{Object}		ex					Extra info.
	 */
	__defaultSubmit(sender, e, ex)
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
				if (ex["options"]["autoClose"])
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
 	 * @param	{Object}		ex					Extra info.
	 */
	__defaultCancel(sender, e, ex)
	{

		this.close();

	}

	// -------------------------------------------------------------------------

	/**
	 * Default clear.
	 *
	 * @param	{Object}		sender				Sender.
	 * @param	{Object}		e					Event info.
 	 * @param	{Object}		ex					Extra info.
	 */
	__defaultClear(sender, e, ex)
	{

		let target;

		if (ex.options.target)
		{
			target = sender.getAttribute(ex.options.target);
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
