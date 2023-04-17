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
				return PerkPerk._attach(component, PerkPerk._perks[perkName].object, options);
			});
		});

		return chain;

	}

	// -------------------------------------------------------------------------

	/**
	 * Attach a perk to the component.
	 *
	 * @param	{Component}		component			Component to be attached.
	 * @param	{Perk}		perk			Perk to attach.
	 * @param	{Object}		options				Options.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static _attach(component, perk, options)
	{

		if (!component.inventory.get(`perk.perks.${perk.name}`))
		{
			// Attach dependencies first
			let deps = PerkPerk._perks[perk.name]["depends"];
			for (let i = 0; i < deps.length; i++)
			{
				PerkPerk._attach(component, PerkPerk._perks[deps[i]].object, options);
			}

			component.inventory.set(`perk.perks.${perk.name}`, {
				"object":perk
			});

			return perk.init(component, options);
		}

	}

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	static get name()
	{

		return "PerkPerk";

	}

	// -------------------------------------------------------------------------

	/**
	 * Registered Perks.
	 *
	 * @type	{Object}
	 */
	static get Perks()
	{

		return PerkPerk._perks;

	}

	// -------------------------------------------------------------------------

	static get info()
	{

		return {
			"sections":		"perks",
			"order":		0,
		};

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static globalInit()
	{

		/*
		// Init vars
		PerkPerk._perks = {};
		PerkPerk._sections = {};
		*/

		// Add properties to Component (static)
		Object.defineProperty(BITSMIST.v1.Component, "stats", {
			get() { return BITSMIST.v1.Component._stats; },
		});
		Object.defineProperty(BITSMIST.v1.Component, "inventory", {
			get() { return BITSMIST.v1.Component._inventory; },
		});
		Object.defineProperty(BITSMIST.v1.Component, "skills", {
			get() { return BITSMIST.v1.Component._skills; },
		});

		// Init Component vars (static)
		BITSMIST.v1.Component._stats = new ChainableStore();
		BITSMIST.v1.Component._inventory = new ChainableStore();
		BITSMIST.v1.Component._skills = new ChainableStore();

		// Add properties to Component
		Object.defineProperty(BITSMIST.v1.Component.prototype, "stats", {
			get() { return this._stats; },
		});
		Object.defineProperty(BITSMIST.v1.Component.prototype, "inventory", {
			get() { return this._inventory; },
		});
		Object.defineProperty(BITSMIST.v1.Component.prototype, "skills", {
			get() { return this._skills; },
		});

		// Add skills to Component
		BITSMIST.v1.Component.skills.set("perk.attachPerks", function(...args) { return PerkPerk._attachPerks(...args); });
		BITSMIST.v1.Component.skills.set("perk.attach", function(...args) { return PerkPerk._attach(...args); });

	}

	// -------------------------------------------------------------------------

	static init(component, options)
	{

		// Init component vars
		component._stats = new ChainableStore({"chain":BITSMIST.v1.Component._stats});
		component._inventory= new ChainableStore({"chain":BITSMIST.v1.Component._inventory});
		component._skills = new ChainableStore({"chain":BITSMIST.v1.Component._skills});
		component._skills.use = function(perkName, ...args) {
			let func = this.skills.get(perkName);
			Util.assert(func, `Skill is not available. name=${this.name}, skillName=${perkName}`);

			return this.skills.get(perkName)(this, ...args);
		}.bind(component);

		// Add inventory items to component
		component.inventory.set("perk.perks", {
			"PerkPerk": {
				"object": this,
			}
		});

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
		info["sections"] = info["sections"] || [];
		info["sections"] = ( Array.isArray(info["sections"]) ? info["sections"] : [info["sections"]] );
		info["order"] = ("order" in info ? info["order"] : 500);
		info["depends"] = info["depends"] || [];
		info["depends"] = ( Array.isArray(info["depends"]) ? info["depends"] : [info["depends"]] );

		PerkPerk._perks[perk.name] = {
			"name":			perk.name,
			"object":		perk,
			"sections":		info["sections"],
			"order":		info["order"],
			"depends":		info["depends"],
		};

		// Global init
		perk.globalInit();

		// Create target word index
		for (let i = 0; i < info["sections"].length; i++)
		{
			PerkPerk._sections[info["sections"][i]] = PerkPerk._perks[perk.name];
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

		// List new perks
		let perks = settings["perks"];
		if (perks)
		{
			Object.keys(perks).forEach((perkName) => {
				Util.assert(PerkPerk._perks[perkName], `PerkPerk.__listNewPerk(): Perk not found. name=${component.name}, perkName=${perkName}`);
				if (Util.safeGet(perks[perkName], "settings.attach") && !component.inventory.get(`perk.perks.${perkName}`))
				{
					targets[perkName] = PerkPerk._perks[perkName];
				}
			});
		}

		// List new perks from settings keyword
		Object.keys(settings).forEach((key) => {
			let perkInfo = PerkPerk._sections[key];
			if (perkInfo && !component.inventory.get(`perk.perks.${perkInfo.name}`))
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

// Init vars
PerkPerk._perks = {};
PerkPerk._sections = {};
