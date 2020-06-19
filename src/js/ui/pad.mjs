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

		if (this.getOption("resource"))
		{
			/*
			if (this._options["resource"] in this._container["resources"])
			{
				this._resource = this._container["resources"][this._options["resource"]];
			}
			else
			*/
			{
				let defaults = this._app.getSettings("defaults");
				this._resource = new ResourceUtil(this.getOption("resource"), {"router":this._app.router, "baseUrl":defaults["apiBaseUrl"], "version":defaults["apiVersion"] + "-" + defaults["appVersion"], "settings":this._app.getSettings("ajaxUtil")});
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
