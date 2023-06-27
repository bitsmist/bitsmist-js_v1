// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import ChainableStore from "../store/chainable-store.js";
import Perk from "./perk";
import Util from "../util/util";

// =============================================================================
//	Perk Perk Class
// =============================================================================

export default class PerkPerk extends Perk
{

	// -------------------------------------------------------------------------
	//  Properties
	// -------------------------------------------------------------------------

	static get info()
	{

		return {
			"section":		"perk",
			"order":		0,
		};

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static
	{

		// Init vars
		this._perks = {}
		this._sections = {};

	}

	// -------------------------------------------------------------------------

	static globalInit()
	{

		// Upgrade Component
		this.upgrade(BITSMIST.v1.Component, "spell", "perk.attachPerks", function(...args) { return PerkPerk._attachPerks(...args); });
		this.upgrade(BITSMIST.v1.Component, "spell", "perk.attach", function(...args) { return PerkPerk._attach(...args); });

	}

	// -------------------------------------------------------------------------

	static init(component, options)
	{

		// Upgrade component
		this.upgrade(component, "inventory", "perk.perks.PerkPerk", {"object": this});

	}

	// -------------------------------------------------------------------------

	/**
	 * Register an perk.
	 *
	 * @param	{Perk}		perk			Perk to register.
	 */
	static register(perk)
	{

		let info = perk.info;
		info["section"] = info["section"];
		info["order"] = ("order" in info ? info["order"] : 500);
		info["depends"] = info["depends"] || [];
		info["depends"] = ( Array.isArray(info["depends"]) ? info["depends"] : [info["depends"]] );

		this._perks[perk.name] = {
			"name":			perk.name,
			"object":		perk,
			"section":		info["section"],
			"order":		info["order"],
			"depends":		info["depends"],
		};

		// Global init
		perk.globalInit();

		// Create target word index
		PerkPerk._sections[info["section"]] = this._perks[perk.name];

	}

	// -------------------------------------------------------------------------
	//  Skills
	// -------------------------------------------------------------------------

	/**
	 * Attach new perks to component according to settings.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object}		options				Options.
	 */
	static _attachPerks(component, options)
	{

		let settings = options["settings"];
		let chain = Promise.resolve();
		let targets = PerkPerk.__listNewPerks(component, settings);

		PerkPerk.__sortItems(targets).forEach((perkName) => {
			chain = chain.then(() => {
				return PerkPerk._attach(component, this._perks[perkName].object, options);
			});
		});

		return chain;

	}

	// -------------------------------------------------------------------------

	/**
	 * Attach a perk to the component.
	 *
	 * @param	{Component}		component			Component to be attached.
	 * @param	{Perk}			perk				Perk to attach.
	 * @param	{Object}		options				Options.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static _attach(component, perk, options)
	{

		if (!component.get("inventory", `perk.perks.${perk.name}`))
		{
			// Attach dependencies first
			let deps = this._perks[perk.name]["depends"];
			for (let i = 0; i < deps.length; i++)
			{
				PerkPerk._attach(component, this._perks[deps[i]].object, options);
			}

			component.set("inventory", `perk.perks.${perk.name}`, {
				"object":perk
			});

			return perk.init(component, options);
		}

	}

	// ------------------------------------------------------------------------
	//  Privates
	// ------------------------------------------------------------------------

	/**
	 * List not-attached perks according to settings.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object}		settings			Settings.
	 */
	static __listNewPerks(component, settings)
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
				Util.assert(this._perks[perkName], `PerkPerk.__listNewPerk(): Perk not found. name=${component.tagName}, perkName=${perkName}`);
				if (!component.get("inventory", `perk.perks.${perkName}`))
				{
					targets[perkName] = this._perks[perkName];
				}
			}
		}

		// List new perks from settings keyword
		Object.keys(settings).forEach((key) => {
			let perkInfo = PerkPerk._sections[key];

			if (perkInfo && !component.get("inventory", `perk.perks.${perkInfo.name}`))
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
	static __sortItems(perks)
	{

		return Object.keys(perks).sort((a,b) => {
			return perks[a]["order"] - perks[b]["order"];
		})

	}

}
