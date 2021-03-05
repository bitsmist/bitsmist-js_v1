// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import Organizer from './organizer';

// =============================================================================
//	Service organizer class
// =============================================================================

export default class ServiceOrganizer extends Organizer
{

	// -------------------------------------------------------------------------
	//  Methods
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

		let services = settings["services"];
		if (services)
		{
			Object.keys(services).forEach((serviceName) => {
				Object.keys(services[serviceName]["events"]).forEach((eventName) => {
					component.addEventHandler(component, eventName, this.onInitService, {"component":component, "settings":services[serviceName]});
				});
			});
		}

		return settings;

	}

	// -------------------------------------------------------------------------
	//	Event handlers
	// -------------------------------------------------------------------------

	/**
	* Init service event handler.
	*
	* @param	{Object}		sender				Sender.
	* @param	{Object}		e					Event info.
	* @param	{Object}		ex					Extra event info.
	*/
	static onInitService(sender, e, ex)
	{

		let settings = ex.options["settings"];
		let component = ex.options["component"];
		let handler = settings["events"][e.type]["handler"];
		let args = settings["events"][e.type]["args"];

		// Init wait info
		let waitInfo = {};
		if (settings["className"])
		{
			waitInfo["name"] = settings["className"];
		}
		else if (settings["rootNode"])
		{
			waitInfo["rootNode"] = settings["rootNode"];
		}
		waitInfo["state"] = "started";

		return component.waitFor([waitInfo]).then(() => {
			// Get component
			let service;
			if (settings["className"])
			{
				Object.keys(BITSMIST.v1.Globals.components.items).forEach((key) => {
					if (BITSMIST.v1.Globals.components.items[key].object.name == settings["className"])
					{
						service = BITSMIST.v1.Globals.components.items[key].object;
					}
				});
			}
			else
			{
				service = document.querySelector(services[serviceName]["rootNode"]);
			}

			// Call method
			service[handler].apply(service, args);
		});

	}


}
