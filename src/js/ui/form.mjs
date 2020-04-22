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
		this.target;
		this.item = {};
		this.isComposing = false;
		this.cancelSubmit = false;

		// Init system event handlers
		this.listener.addEventHandler("_append", this.__initFormOnAppend);

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
			FormUtil.buildFields(this.element, key, items[key]);
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
			options = Object.assign({}, this.options, options);
			let sender = ( options["sender"] ? options["sender"] : this );

			// Clear fields
			if (options["autoClear"])
			{
				this.clear();
			}

			this.listener.trigger("target", sender).then(() => {
				return this.listener.trigger("beforeFetch", sender);
			}).then(() => {
				// Auto load data
				if (options["autoLoad"])
				{
					return this.__autoLoadData();
				}
			}).then(() => {
				return this.listener.trigger("fetch", sender);
			}).then(() => {
				return this.listener.trigger("format", sender);
			}).then(() => {
				return this.listener.trigger("beforeFill", sender);
			}).then(() => {
				FormUtil.setFields(this.element, this.item, this.container["masters"]);
				return this.listener.trigger("fill", sender);
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

		return FormUtil.clearFields(this.element, target);

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

			this.listener.trigger("beforeValidate", sender).then(() => {
				let ret = true;
				let form = this.element.querySelector("form");

				if (this.getOption("autoValidate"))
				{
					if (form && form.reportValidity)
					{
						ret = form.reportValidity();
					}
					else
					{
						ret = FormUtil.reportValidity(this.element);
					}
				}

				if (!ret)
				{
					this.cancelSubmit = true;
				}
				return this.listener.trigger("validate", sender);
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
			this.cancelSubmit = false;
			this.item = this.getFields();

			this.listener.trigger("formatSubmit", sender).then(() => {
				return this.validate();
			}).then(() => {
				return this.listener.trigger("beforeSubmit", sender);
			}).then(() => {
				if (!this.cancelSubmit)
				{
					return this.listener.trigger("submit", sender);
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

		return FormUtil.getFields(this.element);

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
			this.listener.addHtmlEventHandler(this.element, "keydown", this.__defaultKey, {"options":defaultKeys});
			this.listener.addHtmlEventHandler(this.element, "compositionstart", this.__compositionStart, {"options":defaultKeys});
			this.listener.addHtmlEventHandler(this.element, "compositionend", this.__compositionEnd, {"options":defaultKeys});
		}

		// default buttons
		let defaultButtons = this.getOption("defaultButtons");
		if (defaultButtons)
		{
			let initElements = (options, handler) => {
				if (options)
				{
					let elements = this.element.querySelectorAll(options["rootNode"]);
					elements.forEach((element) => {
						this.listener.addHtmlEventHandler(element, "click", handler, {"options":options});
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
		if (this.isComposing || e.keyCode == 229)
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

		this.isComposing = true;

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

		this.isComposing = false;

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
			if (!this.cancelSubmit)
			{
				// Modal result
				if (this.isModal)
				{
					this.modalResult["result"] = true;
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
			this.resource.getItem(this.target).then((data) => {
				this.item = data["data"][0];
				resolve();
			});
		});

	}

}
