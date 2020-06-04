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
import Component from './component';
import ResourceUtil from '../util/resource-util';
import { NoNodeError, NotValidFunctionError } from '../error/errors';

// =============================================================================
//	Pad class
// =============================================================================

export default class Pad extends Component
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

		this._modalOptions;
		this._modalResult;
		this._modalPromise;
		this._isModal = false;

		this.triggerHtmlEvent(window, "_bm_component_init", this);

		if (this.getOption("resource"))
		{
			if (this._options["resource"] in this._container["resources"])
			{
				this._resource = this._container["resources"][this._options["resource"]];
			}
			else
			{
				this._resource = new ResourceUtil(this.getOption("resource"), {"container":this._container});
			}
		}

	}

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	// -------------------------------------------------------------------------
	//  Callbacks
	// -------------------------------------------------------------------------

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	// -------------------------------------------------------------------------
	//  Protected
	// -------------------------------------------------------------------------

}

customElements.define("bm-pad", Pad);
