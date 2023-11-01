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
import Util from "../util/util.js";

// =============================================================================
//	Base Perk Class
// =============================================================================

export default class Perk
{

	// -------------------------------------------------------------------------
	//  Private Variables
	// -------------------------------------------------------------------------

	static #__info = {
		"privateId":	Util.getUUID(),
		"section":		"perk",
		"order":		0,
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

		// Upgrade Unit
		BITSMIST.v1.Unit.upgrade("spell", "perk.attachPerks", function(...args) { return Perk.#_attachPerks(...args); });
		BITSMIST.v1.Unit.upgrade("spell", "perk.attach", function(...args) { return Perk.#_attach(...args); });

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

		// Upgrade unit
		unit.upgrade("inventory", "perk.perks.Perk", {"object": Perk});

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
		info["section"] = info["section"];
		info["order"] = ("order" in info ? info["order"] : 500);
		info["depends"] = info["depends"] || [];
		info["depends"] = ( Array.isArray(info["depends"]) ? info["depends"] : [info["depends"]] );

		Perk._perks[perk.name] = {
			"name":			perk.name,
			"object":		perk,
			"section":		info["section"],
			"order":		info["order"],
			"depends":		info["depends"],
		};

		// Global init
		if (Object.hasOwn(perk, "globalInit"))
		{
			perk.globalInit();
		}

		// Create target word index
		Perk._sections[info["section"]] = Perk._perks[perk.name];

	}

	// -------------------------------------------------------------------------

	/**
	 * Get the perk.
	 *
	 * @param	{String}	perkName		Perk name.
	 */
	static getPerk(perkName)
	{

		return Perk._perks[perkName].object;

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

		if (!Perk._handlers[perkName])
		{
			Perk._handlers[perkName] = {};
		}

		Perk._handlers[perkName][handler.name] = handler;

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

		handlerName = handlerName.replace("BITSMIST.v1.", "");
		let handler = (Perk._handlers[this.name] && this._handlers[this.name][handlerName]) || Perk._handlers["common"][handlerName];

		Util.assert(handler, `Perk.createHandler(): Handler '${handlerName}' is not registered.`, ReferenceError);

		return new handler(...args);

	}

	// -------------------------------------------------------------------------
	//  Skills
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
				return Perk.#_attach(unit, Perk._perks[perkName].object, options);
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

		if (!unit.get("inventory", `perk.perks.${perk.name}`))
		{
			// Attach dependencies first
			let deps = Perk._perks[perk.name]["depends"];
			for (let i = 0; i < deps.length; i++)
			{
				Perk.#_attach(unit, Perk._perks[deps[i]].object, options);
			}

			unit.set("inventory", `perk.perks.${perk.name}`, {
				"object":perk
			});

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
				Util.assert(Perk._perks[perkName], `Perk.__listNewPerk(): Perk not found. name=${unit.tagName}, perkName=${perkName}`);
				if (!unit.get("inventory", `perk.perks.${perkName}`))
				{
					targets[perkName] = Perk._perks[perkName];
				}
			}
		}

		// List new perks from settings keyword
		Object.keys(settings).forEach((key) => {
			let perkInfo = Perk._sections[key];

			if (perkInfo && !unit.get("inventory", `perk.perks.${perkInfo.name}`))
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

// Init
Perk._perks = {}
Perk._sections = {};
Perk._handlers = {"common": {}};
