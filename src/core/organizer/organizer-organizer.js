// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import Organizer from "./organizer";
import Util from "../util/util";

// =============================================================================
//	Organizer organizer class
// =============================================================================

export default class OrganizerOrganizer extends Organizer
{

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	static get name()
	{

		return "OrganizerOrganizer";

	}

	// -------------------------------------------------------------------------

	/**
	 * Registered Organizers.
	 *
	 * @type	{Object}
	 */
	static get organizers()
	{

		return OrganizerOrganizer._organizers;

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static getInfo()
	{

		return {
			"sections":		"organizers",
			"order":		0,
		};

	}

	// -------------------------------------------------------------------------

	static globalInit()
	{

		// Add properties to Component
		Object.defineProperty(BITSMIST.v1.Component.prototype, "organizers", {
			get() { return this._organizers; },
		});

	}

	// -------------------------------------------------------------------------

	static init(component, options)
	{

		// Init component vars
	//	component._organizers = {};

		// Add methods to Component
		BITSMIST.v1.Component.prototype.attachOrganizers = function(...args) { return OrganizerOrganizer._attachOrganizers(this, ...args); }

	}

	// -------------------------------------------------------------------------

	/**
	 * Attach an organizer to the component.
	 *
	 * @param	{Component}		component			Component to be attached.
	 * @param	{Organizer}		organizer			Organizer to attach.
	 * @param	{Object}		options				Options.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static attach(component, organizer, options)
	{

		component._organizers = component._organizers || {};

		if (!component._organizers[organizer.name])
		{
			// Attach dependencies first
			let deps = OrganizerOrganizer._organizers[organizer.name]["depends"];
			for (let i = 0; i < deps.length; i++)
			{
				OrganizerOrganizer.attach(component, OrganizerOrganizer._organizers[deps[i]].object, options);
			}

			component._organizers[organizer.name] = {
				"object":organizer
			};

			return organizer.init(component, options);
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Register an organizer.
	 *
	 * @param	{Organizer}		organizer			Organizer to register.
	 */
	static register(organizer)
	{

		let info = organizer.getInfo();
		info["sections"] = info["sections"] || [];
		info["sections"] = ( Array.isArray(info["sections"]) ? info["sections"] : [info["sections"]] );
		info["order"] = ("order" in info ? info["order"] : 500);
		info["depends"] = info["depends"] || [];
		info["depends"] = ( Array.isArray(info["depends"]) ? info["depends"] : [info["depends"]] );

		OrganizerOrganizer._organizers[organizer.name] = {
			"name":			organizer.name,
			"object":		organizer,
			"sections":		info["sections"],
			"order":		info["order"],
			"depends":		info["depends"],
		};

		// Global init
		organizer.globalInit();

		// Create target word index
		for (let i = 0; i < info["sections"].length; i++)
		{
			OrganizerOrganizer._sections[info["sections"][i]] = OrganizerOrganizer._organizers[organizer.name];
		}

	}

	// -------------------------------------------------------------------------
	//  Protected
	// -------------------------------------------------------------------------

	/**
	 * Attach new organizers to component according to settings.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object}		options				Options.
	 */
	static _attachOrganizers(component, options)
	{

		let settings = options["settings"];
		let chain = Promise.resolve();
		let targets = OrganizerOrganizer.__listNewOrganizers(component, settings);

		OrganizerOrganizer.__sortItems(targets).forEach((organizerName) => {
			chain = chain.then(() => {
				return OrganizerOrganizer.attach(component, OrganizerOrganizer._organizers[organizerName].object, options);
			});
		});

		return chain;

	}

	// ------------------------------------------------------------------------
	//  Privates
	// ------------------------------------------------------------------------

	/**
	 * List not-attached organizers according to settings.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object}		settings			Settings.
	 */
	static __listNewOrganizers(component, settings)
	{

		let targets = {};
		let chain = Promise.resolve();

		// List new organizers
		let organizers = settings["organizers"];
		if (organizers)
		{
			Object.keys(organizers).forEach((organizerName) => {
				Util.assert(OrganizerOrganizer._organizers[organizerName], `OrganizerOrganizer.__listNewOrganizer(): Organizer not found. name=${component.name}, organizerName=${organizerName}`);
				if (Util.safeGet(organizers[organizerName], "settings.attach") && !component._organizers[organizerName])
				{
					targets[organizerName] = OrganizerOrganizer._organizers[organizerName];
				}
			});
		}

		// List new organizers from settings keyword
		Object.keys(settings).forEach((key) => {
			let organizerInfo = OrganizerOrganizer._sections[key];
			if (organizerInfo && !component._organizers[organizerInfo.name])
			{
				targets[organizerInfo.name] = organizerInfo
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
	static __sortItems(organizers)
	{

		return Object.keys(organizers).sort((a,b) => {
			return organizers[a]["order"] - organizers[b]["order"];
		})

	}

}

// Init vars
OrganizerOrganizer._organizers = {};
OrganizerOrganizer._sections = {};
