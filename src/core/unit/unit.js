// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import Util from "../util/util.js";

// =============================================================================
//	Unit Class
// =============================================================================

export default class Unit extends HTMLElement
{

	// -------------------------------------------------------------------------
	//  Callbacks
	// -------------------------------------------------------------------------

	/**
	 * Connected callback.
	 */
	connectedCallback()
	{

		if (!this.__bm_initialized)
		{
			this.__bm_initialized = false;
			this.__bm_ready = Promise.resolve(); // A promise to prevent from starting/stopping while stopping/starting
			this.setAttribute("bm-powered", "");
		}

		this.__bm_ready = this.__bm_ready.then(() => {
			console.debug(`connectedCallback(): Unit is connected. name=${this.tagName}, id=${this.id}, uniqueId=${this.uniqueId}`);

			return this.__bm_connectedHandler(this);
		}).then(() => {
			this.__bm_initialized = true;
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Disconnected callback.
	 */
	disconnectedCallback()
	{

		this.__bm_ready = this.__bm_ready.then(() => {
			console.debug(`disconnectedCallback(): Unit is disconnected. name=${this.tagName}, id=${this.id}, uniqueId=${this.uniqueId}`);

			return this.__bm_disconnectedHandler(this);
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Adopted callback.
	 */
	adoptedCallback()
	{

		this.__bm_ready = this.__bm_ready.then(() => {
			console.debug(`adoptedCallback(): Unit is adopted. name=${this.tagName}, id=${this.id}, uniqueId=${this.uniqueId}`);

			return this.__bm_adoptedHandler(this);
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Attribute changed callback.
	 */
	attributeChangedCallback(name, oldValue, newValue)
	{

		if (this.__bm_initialized)
		{
			return this.__bm_attributeChangedHandler(this, name, oldValue, newValue);
		}

	}

}

customElements.define("bm-unit", Unit);
