// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

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

		this._connectedHandler(this);

	}

	// -------------------------------------------------------------------------

	/**
	 * Disconnected callback.
	 */
	disconnectedCallback()
	{

		this._disconnectedHandler(this);

	}

	// -------------------------------------------------------------------------

	/**
	 * Adopted callback.
	 */
	adoptedCallback()
	{

		this._adoptedHandler(this);

	}

	// -------------------------------------------------------------------------

	/**
	 * Attribute changed callback.
	 */
	attributeChangedCallback()
	{

		this._attributeChangedHandler(this);

	}

}

customElements.define("bm-unit", Unit);
