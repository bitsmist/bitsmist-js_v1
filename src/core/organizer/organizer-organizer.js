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

		return false;

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

		// Init
		component._organizers = {};

		// Add organizers
		return Promise.resolve().then(() => {
			return OrganizerOrganizer.organize("*", component, settings);
		}).then(() => {
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

//		console.log("@@@calling", component.name, conditions, settings);
		// Add organizers
		return Promise.resolve().then(() => {
			return OrganizerOrganizer.organize("*", component, settings);
		}).then(() => {
			//return OrganizerOrganizer.__autoInsertOrganizers(component, component._settings.items)
			return OrganizerOrganizer.__autoInsertOrganizers(component, settings)
		}).then(() => {
			// Call organizers
			let chain = Promise.resolve();
			OrganizerOrganizer._sortItems(component._organizers).forEach((key) => {
				if (component._organizers[key].object.isTarget(conditions, component._organizers[key], component))
				{
					chain = chain.then(() => {
//						console.log("@@@calling an organizer", component.name, conditions, key);
						return component._organizers[key].object.organize(conditions, component, settings);
					});
				}
			});

			return chain;
		});

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
			let organizerInfo = BITSMIST.v1.Globals["organizers"].getOrganizerInfoByTarget(key);
			if (organizerInfo)
			{
				chain = chain.then(() => {
					return OrganizerOrganizer.__addOrganizer(component, organizerInfo.name, settings);
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

		if (!component._organizers[organizerName] && BITSMIST.v1.Globals["organizers"]["items"][organizerName])
		{
//			console.log("@@@adding an organizer", component.name, organizerName);
			component._organizers[organizerName] = BITSMIST.v1.Globals["organizers"]["items"][organizerName];
			if (component._organizers[organizerName] && typeof component._organizers[organizerName].object.init === "function")
			{
				return component._organizers[organizerName].object.init("*", component, settings);
			}
		}

	}

}
