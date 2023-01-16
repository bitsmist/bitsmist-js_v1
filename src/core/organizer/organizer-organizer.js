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

	/**
	 * Global init.
	 */
	static globalInit(targetClass)
	{

		// Add properties
		Object.defineProperty(targetClass.prototype, "organizers", {
			get() { return this._organizers; },
		});

		// Add methods
		targetClass.prototype.addOrganizers = function(settings) { return OrganizerOrganizer._addOrganizers(this, settings); }
		targetClass.prototype.initOrganizers = function(settings) { return OrganizerOrganizer._initOrganizers(this, settings); }
		targetClass.prototype.callOrganizers = function(condition, settings) { return OrganizerOrganizer._callOrganizers(this, condition, settings); }
		targetClass.prototype.clearOrganizers = function(condition, settings) { return OrganizerOrganizer._clearOrganizers(this, condition, settings); }

		// Init vars
		OrganizerOrganizer._organizers = {};
		OrganizerOrganizer._targetWords = {};

		Object.defineProperty(OrganizerOrganizer, "organizers", {
			get() { return OrganizerOrganizer._organizers; },
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Organize.
	 *
	 * @param	{Object}		conditions			Conditions.
	 * @param	{Component}		component			Component.
	 * @param	{Object}		settings			Settings.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static organize(conditions, component, settings)
	{

		return OrganizerOrganizer._addOrganizers(component, settings);

	}

	// -------------------------------------------------------------------------

	/**
	 * Clear.
	 *
	 * @param	{Component}		component			Component.
	 */
	static clear(component)
	{

		component._organizers = {};

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

	// -------------------------------------------------------------------------

	/**
	 * Add target words/events to oragnizer's settings.
	 *
	 * @param	{String}		organizerName		Organizer name.
	 * @param	{String}		targetname			Target setting name. "words" or "events".
	 * @param	{Array/String}	targets				Values to add.
	 *
	 * @return 	{Promise}		Promise.
	 */
	/*
	static addTarget(organizerName, targetName, targets)
	{

		let organizer = OrganizerOrganizer._organizers[organizerName];

		let ret1 = Util.warn(organizer, `Organizer not found. organizerName=${organizerName}`);
		let ret2 = Util.warn(["targetEvents", "targetWords"].indexOf(targetName) > -1, `Target name is invalid. targetName=${targetName}`);

		if (ret1 && ret2)
		{
			if (Array.isArray(targets))
			{
				organizer[targetName] = organizer[targetName].concat(targets);
			}
			else
			{
				organizer[targetName].push(targets);
			}
		}

	}
	*/

	// ------------------------------------------------------------------------
	//  Protected
	// ------------------------------------------------------------------------

	static _addOrganizers(component, settings)
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
			if (organizerInfo)
			{
				if (!component._organizers[organizerInfo.name])
				{
					targets[organizerInfo.name] = organizerInfo.object;
				}
			}
		});

		// Add and init new organizers
		OrganizerOrganizer._sortItems(targets).forEach((key) => {
			chain = chain.then(() => {
				component._organizers[key] = Util.deepMerge(Util.deepClone(OrganizerOrganizer._organizers[key]), Util.safeGet(settings, "organizers." + key));
				return component._organizers[key].object.init(component, settings);
			});
		});

		return chain;

	}

	// ------------------------------------------------------------------------

	/**
	 * Init organizers.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object}		settings			Settings.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static _initOrganizers(component, settings)
	{

		// Init
		component._organizers = {};

		// Add organizers
		return OrganizerOrganizer.organize("*", component, settings);

	}

	// -------------------------------------------------------------------------

	/**
	 * Call organizers.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object}		conditions			Conditions.
	 * @param	{Object}		settings			Settings.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static _callOrganizers(component, conditions, settings)
	{

		let chain = Promise.resolve();

		OrganizerOrganizer._sortItems(component._organizers).forEach((key) => {
			if (component._organizers[key].object.isTarget(conditions, component._organizers[key], component))
			{
				chain = chain.then(() => {
					return component._organizers[key].object.organize(conditions, component, settings);
				});
			}
		});

		return chain;

	}

	// ------------------------------------------------------------------------

	/**
	 * Clear organizers.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object}		conditions			Conditions.
	 * @param	{Object}		settings			Settings.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static _clearOrganizers(component, conditions, settings)
	{

		let chain = Promise.resolve();

		OrganizerOrganizer._sortItems(component._organizers).forEach((key) => {
			if (component._organizers[key].object.isTarget(conditions, component._organizers[key], component))
			{
				chain = chain.then(() => {
					return component._organizers[key].object.unorganize(conditions, component, settings);
				});
			}
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
