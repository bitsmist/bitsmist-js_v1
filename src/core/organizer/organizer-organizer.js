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
import OrganizerStore from "../store/organizer-store";
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

		// Init vars
		OrganizerOrganizer.__organizers = new OrganizerStore();
		Object.defineProperty(OrganizerOrganizer, "organizers", {
			get() { return OrganizerOrganizer.__organizers; },
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
					OrganizerOrganizer.__organizers.get(key)
				)
				{
					targets[key] = OrganizerOrganizer.__organizers.items[key];
				}
			});
		}

		// List new organizers from settings keyword
		Object.keys(settings).forEach((key) => {
			let organizerInfo = OrganizerOrganizer.__organizers.getOrganizerInfoByTargetWords(key);
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
				component._organizers[key] = Object.assign({}, OrganizerOrganizer.__organizers.items[key], Util.safeGet(settings, "organizers." + key));
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
