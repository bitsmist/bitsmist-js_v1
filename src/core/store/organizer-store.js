// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import Store from "./store.js";
import Util from "../util/util.js";

// =============================================================================
//	Organizer store class
// =============================================================================

export default class OrganizerStore extends Store
{

	// -------------------------------------------------------------------------
	//  Constructor
	// -------------------------------------------------------------------------

	/**
     * Constructor.
     *
	 * @param	{Object}		options				Options.
	 * @param	{Store}			chain				Store Component to chain.
     */
	constructor(options, chain)
	{

		super(options, chain);

		this._targetWords = {};

	}

	// -------------------------------------------------------------------------
	//  Method
	// -------------------------------------------------------------------------

	/**
	 * Set a value to store.
	 *
	 * @param	{String}		key					Key to store.
	 * @param	{Object}		value				Value to store.
	 */
	set(key, value)
	{

		// Assert
		value = Object.assign({}, value);
		value["name"] = ( value["name"] ? value["name"] : key );
		value["targetWords"] = ( value["targetWords"] ? value["targetWords"] : [] );
		value["targetWords"] = ( Array.isArray(value["targetWords"]) ? value["targetWords"] : [value["targetWords"]] );
		value["targetEvents"] = ( value["targetEvents"] ? value["targetEvents"] : [] );
		value["targetEvents"] = ( Array.isArray(value["targetEvents"]) ? value["targetEvents"] : [value["targetEvents"]] );

		super.set(key, value);

		// Global init
		value["object"].globalInit(value["targetClass"]);

		// Create target index
		for (let i = 0; i < value["targetWords"].length; i++)
		{
			this._targetWords[value["targetWords"][i]] = value;
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Get a merge function for the key.
	 *
	 * @param	{String}		key					Key.
	 *
	 * @return  {*}				Merge function.
	 */
	getMerger(key)
	{

		return Util.safeGet(this._targetWords, key + ".object.merger", Util.deepmerge);

	};

	// -------------------------------------------------------------------------

	/**
	 * Get an organizer by target words.
	 *
	 * @param	{String}		key					Key.
	 *
	 * @return  {*}				Organizer.
	 */
	getOrganizerInfoByTargetWords(target)
	{

		return Util.safeGet(this._targetWords, target);

	};

}
