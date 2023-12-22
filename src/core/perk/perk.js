// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/main/LICENSE
 */
// =============================================================================

import ChainableStore from "../store/chainable-store.js";
import Unit from "../unit/unit.js";
import Util from "../util/util.js";

// =============================================================================
//	Base Perk Class
// =============================================================================

export default class Perk
{

	// -------------------------------------------------------------------------
	//  Private Variables
	// -------------------------------------------------------------------------

	static #__perks = {}
	static #__sections = {};
	static #__handlers = {"common": {}};
	static #__info = {
		"sectionName":		"perk",
		"order":			0,
	};

	// -------------------------------------------------------------------------
	//  Properties
	// -------------------------------------------------------------------------

	/**
	 * Perk info.
	 *
	 * @type	{Object}
	 */
	static get info()
	{

		return Perk.#__info;

	}

	// -------------------------------------------------------------------------

	/**
	 * Promise that is resolved when Perk is ready.
	 *
	 * @type	{Object}
	 */
	static get ready()
	{

		return Promise.resolve();

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
	 *  Initialize an perk and Unit class when the perk is registered.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{Object}		options				Options.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static globalInit()
	{

		if (this === Perk)
		{
			Unit.upgrade("spell", "perk.attachPerks", Perk.#_attachPerks);
			Unit.upgrade("spell", "perk.attach", Perk.#_attach);
		}

	}

	// -------------------------------------------------------------------------

	/**
	 *  Initialize an attached unit when perk is attached.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{Object}		options				Options.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static init(unit, options)
	{
	}

	// -------------------------------------------------------------------------

	/**
	 * Deinitialize the unit when perk is detached.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{Object}		options				Options.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static deinit(unit, options)
	{
	}

	// -------------------------------------------------------------------------

	/**
	 * Register the perk.
	 *
	 * @param	{Perk}		perk			Perk to register.
	 */
	static registerPerk(perk)
	{

		let info = perk.info;
		info["sectionName"] = info["sectionName"];
		info["order"] = ("order" in info ? info["order"] : 500);
		info["depends"] = info["depends"] || [];
		info["depends"] = ( Array.isArray(info["depends"]) ? info["depends"] : [info["depends"]] );

		Perk.#__perks[perk.name] = {
			"name":			perk.name,
			"object":		perk,
			"sectionName":	info["sectionName"],
			"order":		info["order"],
			"depends":		info["depends"],
		};

		// Create target word index
		Perk.#__sections[info["sectionName"]] = Perk.#__perks[perk.name];

		// Global init
		return perk.globalInit();

	}

	// -------------------------------------------------------------------------

	/**
	 * Get the perk.
	 *
	 * @param	{String}	perkName		Perk name.
	 */
	static getPerk(perkName)
	{

		Util.assert(perkName in Perk.#__perks, () => `Perk "${perkName}" doesn't exist.`);

		return Perk.#__perks[perkName].object;

	}

	// -------------------------------------------------------------------------

	/**
	 * Get the perk from the section name.
	 *
	 * @param	{String}	sectionName		Section name.
	 */
	static getPerkFromSectionName(sectionName)
	{

		Util.assert(sectionName in Perk.#__sections, () => `Perk for section "${sectionName}" doesn't exist.`);

		return Perk.#__sections[sectionName].object;

	}

	// -------------------------------------------------------------------------

	/**
	 * Register the handler.
	 *
	 * @param	{Function}	handler			Handler to register.
	 */
	static registerHandler(handler, perkName)
	{

		perkName = perkName || "common";

		if (!Perk.#__handlers[perkName])
		{
			Perk.#__handlers[perkName] = {};
		}

		Perk.#__handlers[perkName][handler.name] = handler;

	}

	// -------------------------------------------------------------------------

	/**
	 * Create the handler.
	 *
	 * @param	{String}	handlerName		Handler name.
	 * @param	{*}			...args			Arguments to the handler constructor.
	 */
	static createHandler(handlerName, ...args)
	{

		let handler = (Perk.#__handlers[this.name] && Perk.#__handlers[this.name][handlerName]) || Perk.#__handlers["common"][handlerName];

		Util.assert(handler, () => `Perk.createHandler(): Handler '${handlerName}' is not registered.`, ReferenceError);

		return new handler(...args);

	}

	// -------------------------------------------------------------------------
	//  Spells (Unit)
	// -------------------------------------------------------------------------

	/**
	 * Attach new perks to unit according to settings.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{Object}		options				Options.
	 */
	static #_attachPerks(unit, options)
	{

		let settings = options["settings"];
		let chain = Promise.resolve();
		let targets = Perk.#__listNewPerks(unit, settings);

		Perk.#__sortItems(targets).forEach((perkName) => {
			chain = chain.then(() => {
				return Perk.#_attach(unit, Perk.#__perks[perkName].object, options);
			});
		});

		return chain;

	}

	// -------------------------------------------------------------------------

	/**
	 * Attach a perk to the unit.
	 *
	 * @param	{Unit}			unit				Unit to be attached.
	 * @param	{Perk}			perk				Perk to attach.
	 * @param	{Object}		options				Options.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static #_attach(unit, perk, options)
	{

		if (!unit.assets["perk"][perk.name])
		{
			// Attach dependencies first
			let deps = Perk.#__perks[perk.name]["depends"];
			for (let i = 0; i < deps.length; i++)
			{
				Perk.#_attach(unit, Perk.#__perks[deps[i]].object, options);
			}
			unit.assets["perk"][perk.name] = perk;

			return perk.init(unit, options);
		}

	}

	// ------------------------------------------------------------------------
	//  Privates
	// ------------------------------------------------------------------------

	/**
	 * List not-attached perks according to settings.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{Object}		settings			Settings.
	 */
	static #__listNewPerks(unit, settings)
	{

		let targets = {};
		let chain = Promise.resolve();

		// List new perks from "perk" section
		let perks = Util.safeGet(settings, "perk.options.apply");
		if (perks)
		{
			for (let i = 0; i < perks.length; i++)
			{
				let perkName = perks[i];
				Util.assert(Perk.#__perks[perkName], `Perk.#__listNewPerk(): Perk not found. name=${unit.tagName}, perkName=${perkName}`);
				if (!unit.assets["perk"][perkName])
				{
					targets[perkName] = Perk.#__perks[perkName];
				}
			}
		}

		// List new perks from settings keyword
		Object.keys(settings).forEach((key) => {
			let perkInfo = Perk.#__sections[key];

			if (perkInfo && !unit.assets["perk"][perkInfo.name])
			{
				targets[perkInfo.name] = perkInfo
			}
		});

		return targets;

	}

	// ------------------------------------------------------------------------

	/**
	 * Sort item keys.
	 *
	 * @param	{Object}		observerInfo		Observer info.
	 *
	 * @return  {Array}			Sorted keys.
	 */
	static #__sortItems(perks)
	{

		return Object.keys(perks).sort((a,b) => {
			return perks[a]["order"] - perks[b]["order"];
		})

	}

}
