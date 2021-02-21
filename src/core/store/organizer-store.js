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

		options = options || {};

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

		// Global init
		if (typeof value["object"].globalInit == "function")
		{
			value["object"].globalInit();
		}

		// Create target index
		if (value["targets"])
		{
			if (Array.isArray(value["targets"]))
			{
				for (let i = 0; i < value["targets"].length; i++)
				{
					this._targets[value["targets"][i]] = value;
				}
			}
			else
			{
				this._targets[value["targets"]] = value;
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
	getOrganizer(key)
	{

		return Util.safeGet(this._targets, key + ".object");

	};

}
