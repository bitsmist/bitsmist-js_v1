// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import Util from '../util/util';
import Store from './store';

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

		this._targets = {};

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

		super.set(key, value);

		if (!value["name"])
		{
			value["name"] = key;
		}

		// Global init
		if (typeof value["object"].globalInit == "function")
		{
			value["object"].globalInit(value["targetClass"]);
		}

		// Create target index
		if (value["targetWords"])
		{
			if (Array.isArray(value["targetWords"]))
			{
				for (let i = 0; i < value["targetWords"].length; i++)
				{
					this._targets[value["targetWords"][i]] = value;
				}
			}
			else
			{
				this._targets[value["targetWords"]] = value;
			}
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

		return Util.safeGet(this._targets, key + ".object.merger", Util.deepmerge);

	};

	// -------------------------------------------------------------------------

	/**
	 * Get an organizer.
	 *
	 * @param	{String}		key					Key.
	 *
	 * @return  {*}				Organizer.
	 */
	getOrganizerInfoByTarget(target)
	{

		return Util.safeGet(this._targets, target);

	};

}
