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
	//  Methods
	// -------------------------------------------------------------------------

	static globalInit()
	{

		// Add properties to Component
		Object.defineProperty(BITSMIST.v1.Component.prototype, "organizers", {
			get() { return this._organizers; },
		});

		// Add methods to Component
		BITSMIST.v1.Component.prototype.attachOrganizers = function(...args) { return OrganizerOrganizer._attachOrganizers(this, ...args); }

		// Init vars
		OrganizerOrganizer._organizers = {};
		OrganizerOrganizer._targetWords = {};

		Object.defineProperty(OrganizerOrganizer, "organizers", {
			get() { return OrganizerOrganizer._organizers; },
		});

	}

	// -------------------------------------------------------------------------

	static attach(component, options)
	{

		// Init component vars
		component._organizers = {};

		// Attach organizers to component
		return OrganizerOrganizer._attachOrganizers(component, component.settings.items);

	}

	// -------------------------------------------------------------------------

	/**
	 * Register an organizer.
	 *
	 * @param	{String}		key					Key to store.
	 * @param	{Object}		value				Value to store.
	 */
	static register(organizerName, organizerInfo)
	{

		let info = organizerInfo;
		info["name"] = ( organizerInfo["name"] ? organizerInfo["name"] : organizerName );
		info["targetWords"] = ( organizerInfo["targetWords"] ? organizerInfo["targetWords"] : [] );
		info["targetWords"] = ( Array.isArray(organizerInfo["targetWords"]) ? organizerInfo["targetWords"] : [organizerInfo["targetWords"]] );
		info["targetEvents"] = ( organizerInfo["targetEvents"] ? organizerInfo["targetEvents"] : [] );
		info["targetEvents"] = ( Array.isArray(organizerInfo["targetEvents"]) ? organizerInfo["targetEvents"] : [organizerInfo["targetEvents"]] );

		OrganizerOrganizer._organizers[organizerName] = info;

		// Global init
		info["object"].globalInit(info["targetClassName"]);

		// Create target index
		for (let i = 0; i < info["targetWords"].length; i++)
		{
			OrganizerOrganizer._targetWords[info["targetWords"][i]] = info;
		}

	}

	// ------------------------------------------------------------------------
	//  Protected
	// ------------------------------------------------------------------------

	/**
	 * Attach organizers to component according to settings.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object}		settings			Settings.
	 */
	static _attachOrganizers(component, settings)
	{

		let targets = {};
		let chain = Promise.resolve();

		// List new organizers
		let organizers = settings["organizers"];
		if (organizers)
		{
			Object.keys(organizers).forEach((key) => {
				if (
					Util.safeGet(organizers[key], "settings.attach") &&
					!component._organizers[key] &&
					OrganizerOrganizer._organizers[key]
				)
				{
					targets[key] = OrganizerOrganizer._organizers[key];
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

		// Attach new organizers
		OrganizerOrganizer._sortItems(targets).forEach((key) => {
			chain = chain.then(() => {
				component._organizers[key] = Util.deepMerge(Util.deepClone(OrganizerOrganizer._organizers[key]), Util.safeGet(settings, "organizers." + key));
				return component._organizers[key].object.attach(component, settings);
			});
		});

		return chain;

	}

	// ------------------------------------------------------------------------

	/**
	 * Sort item keys.
	 *
	 * @param	{Object}		observerInfo		Observer info.
	 *
	 * @return  {Array}			Sorted keys.
	 */
	static _sortItems(organizers)
	{

		return Object.keys(organizers).sort((a,b) => {
			return organizers[a]["order"] - organizers[b]["order"];
		})

	}

}
