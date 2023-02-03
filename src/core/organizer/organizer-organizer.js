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
			"name":			"OrganizerOrganizer",
			"targetWords":	"organizers",
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
	 * Attach an organizer to a component.
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
		let organizerName = organizer.getInfo()["name"];

		if (!component._organizers[organizerName])
		{
			component._organizers[organizerName] = organizer;
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
		info["targetWords"] = info["targetWords"] || [];
		info["targetWords"] = ( Array.isArray(info["targetWords"]) ? info["targetWords"] : [info["targetWords"]] );

		OrganizerOrganizer._organizers[info["name"]] = {
			"name":			info["name"],
			"object":		organizer,
			"targetWords":	info["targetWords"],
			"order":		info["order"],
		};

		// Global init
		organizer.globalInit();

		// Create target word index
		for (let i = 0; i < info["targetWords"].length; i++)
		{
			OrganizerOrganizer._targetWords[info["targetWords"][i]] = OrganizerOrganizer._organizers[info["name"]];
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
				Util.assert(OrganizerOrganizer._organizers[organizerName], `Organizer not found. name=${component.name}, organizerName=${organizerName}`);
				if (Util.safeGet(organizers[organizerName], "settings.attach") && !component._organizers[organizerName])
				{
					targets[organizerName] = OrganizerOrganizer._organizers[organizerName];
				}
			});
		}

		// List new organizers from settings keyword
		Object.keys(settings).forEach((key) => {
			let organizerInfo = OrganizerOrganizer._targetWords[key];
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
OrganizerOrganizer._targetWords = {};
