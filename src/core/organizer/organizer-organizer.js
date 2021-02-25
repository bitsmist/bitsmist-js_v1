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

		settings = settings || component._settings.items;
		let chain = Promise.resolve();

		let organizers = settings["organizers"];
		if (organizers)
		{
			Object.keys(organizers).forEach((key) => {
				chain = chain.then(() => {
					return OrganizerOrganizer.__addOrganizer(component, key, settings);
				});
			});
		}

		return chain;

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
	 * Check if event is target.
	 *
	 * @param	{String}		eventName			Event name.
	 *
	 * @return 	{Boolean}		True if it is target.
	 */
	static isTarget(eventName, observerInfo, ...args)
	{

		let ret = false;

		if (eventName == "*" || eventName == "beforeStart" || eventName == "afterSpecLoad")
		{
			ret = true;
		}

		return ret;

	}

	// -------------------------------------------------------------------------

	/**
	 * Call organizers.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object}		settings			Settings.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static initOrganizers(component, settings)
	{

		let chain = Promise.resolve();

		// Init
		component._organizers = {};
		chain = OrganizerOrganizer.organize("*", component, settings);

		// Auto adding organizers from settings
		return chain.then(() => {
			return OrganizerOrganizer.__autoInsertOrganizers(component, component._settings.items)
		});

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

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
	 * Automatically add organizers from settings.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object}		settings			Settings.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static __autoInsertOrganizers(component, settings)
	{

		let chain = Promise.resolve();

		Object.keys(settings).forEach((key) => {
			let organizer = BITSMIST.v1.Globals["organizers"].getOrganizer(key);
			if (organizer)
			{
				chain = chain.then(() => {
					return OrganizerOrganizer.__addOrganizer(component, organizer.name, settings);
				});
			}
		});

		return chain;

	}

	// -------------------------------------------------------------------------

	/**
	 * Add an organizer to a component.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{String}		organizerName		Organizer name to add.
	 * @param	{Object}		settings			Settings.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static __addOrganizer(component, organizerName, settings)
	{

		if (!component._organizers[organizerName])
		{
			component._organizers[organizerName] = BITSMIST.v1.Globals["organizers"]["items"][organizerName];
			if (typeof component._organizers[organizerName].object.init === "function")
			{
				return component._organizers[organizerName].object.init("*", component, settings);
			}
		}

	}

}