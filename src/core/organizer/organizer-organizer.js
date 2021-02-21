// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import Component from '../component';

// =============================================================================
//	Organizer organizer class
// =============================================================================

export default class OrganizerOrganizer
{

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
	 * Global init.
	 */
	static globalInit()
	{

		// Add properties

		Object.defineProperty(Component.prototype, 'organizers', {
			get() {
				return this._organizers;
			},
			configurable: true
		});

		// Add methods

		Component.prototype.addOrganizer = function(organizerName) {
			OrganizerOrganizer.addOrganizer(this, organizername);
		}

		Component.prototype.removeOrganizer = function(organizerName) {
			OrganizerOrganizer.removeOrganizer(this, organizername);
		}

		Component.prototype.clearOrganizers = function() {
			OrganizerOrganizer.clear(this);
		}

		Component.prototype.callOrganizers = function(condition, settings) {
			return OrganizerOrganizer.callOrganizers(this, condition, settings);
		}

		Component.prototype.initOrganizers = function(settings) {
			return OrganizerOrganizer.initOrganizers(this, settings);
		}

		Component.prototype.clearOrganizers = function() {
			return OrganizerOrganizer.clear(this);
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Init.
	 *
	 * @param	{Object}		conditions			Conditions.
	 * @param	{Component}		component			Component.
	 * @param	{Object}		settings			Settings.
	 */
	static init2(conditions, component, settings)
	{

		component._organizers = {};
//		component._organizers = [];

		/*
		let organizers = component._settings.items["organizers"];
		if (organizers)
		{
			Object.keys(organizers).forEach((key) => {
				component._organizers[key] = BITSMIST.v1.Globals["organizers"]["items"][key];
			});
		}
		*/
		OrganizerOrganizer.organize("*", component, component._settings.items);

	}

	// -------------------------------------------------------------------------

	/**
	 * Organize.
	 *
	 * @param	{Object}		conditions			Conditions.
	 * @param	{Component}		component			Component.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static organize(conditions, component, settings)
	{

		let organizers = settings["organizers"];
	//	console.log("@@@organizer", component.name, organizers);
		if (organizers)
		{
			Object.keys(organizers).forEach((key) => {
//				console.log("@@@organizer adding", component.name, key);
				component._organizers[key] = BITSMIST.v1.Globals["organizers"]["items"][key];
			});
		}

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
//		component._organizers = [];

	}

	// -------------------------------------------------------------------------

	/**
	 * Check if event is target.
	 *
	 * @param	{String}		eventName			Event name.
	 *
	 * @return 	{Boolean}		True if it is target.
	 */
	static isTarget(eventName, observerInfo, ...args)
	{

		let ret = false;

		//if (eventName == "*" || eventName == "beforeStart" || eventName == "afterSpecLoad")
		if (eventName == "*")
		{
			ret = true;
		}

		return ret;

	}

	// -------------------------------------------------------------------------

	/**
	 * Clear organizers.
	 *
	 * @param	{Component}		component			Component.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static callOrganizers(component)
	{

		let chain = Promise.resolve();

		OrganizerOrganizer._sortItems(component._organizers).forEach((key) => {
			chain = chain.then(() => {
				return component._organizers[key].object.clear(component);
			});
		});

		return chain;

	}

	// -------------------------------------------------------------------------

	/**
	 * Call organizers.
	 *
	 * @param	{Component}		component			Component.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static initOrganizers(component, settings)
	{

		// Init
		component._organizers = {};
		//OrganizerOrganizer.organize("*", component, component._settings.items);
//		console.log("@@@initOrganizer", component.name, settings);
		if (settings)
		{
			OrganizerOrganizer.organize("*", component, settings);
		}

		/*
		// Auto adding from settings
		let organizers = {}
		let items = component._settings.items;
		Object.keys(items).forEach((key) => {
//			console.log("@@@1", component.name, key);
			if (BITSMIST.v1.Globals["organizers"].getOrganizer(key) && !component._organizers[BITSMIST.v1.Globals["organizers"].getOrganizer(key).name])
			{
				console.log("@@@adding auto", component.name, key, BITSMIST.v1.Globals["organizers"].getOrganizer(key).name);
				organizers[BITSMIST.v1.Globals["organizers"].getOrganizer(key).name] = "";
			}
		});
	//	console.log("@@@3", component.name, {"organizers":organizers});
		OrganizerOrganizer.organize("*", component, {"organizers":organizers});
		*/

		// Call organizers

		let chain = Promise.resolve();

		OrganizerOrganizer._sortItems(component._organizers).forEach((key) => {
			chain = chain.then(() => {
				if (typeof component._organizers[key].object.init === "function")
				{
					console.log("@@@init", component.name, key);
					return component._organizers[key].object.init("*", component, settings);
				}
			});
		});

		return chain;

	}

	// -------------------------------------------------------------------------

	/**
	 * Call organizers.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object}		conditions			Conditions.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static callOrganizers(component, conditions, settings)
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

	// -------------------------------------------------------------------------
	//  Protected
	// -------------------------------------------------------------------------

	/**
	 * Sort item keys.
	 *
	 * @param	{Object}		observerInfo		Observer info.
	 *
	 * @return  {Array}			Sorted keys.
	 */
	static _sortItems(organizers)
	{

		let globals = BITSMIST.v1.Globals["organizers"].items;

		return Object.keys(organizers).sort((a,b) => {
			return globals[a]["order"] - globals[b]["order"];
		})

	}

}
