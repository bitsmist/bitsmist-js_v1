// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import Globals from '../globals';

// =============================================================================
//	Service organizer class
// =============================================================================

export default class ServiceOrganizer
{

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
	 * Organize.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object}		settings			Settings.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static organize(component, settings)
	{

		let services = settings["services"];
		if (services)
		{
			Object.keys(services).forEach((serviceName) => {
				Object.keys(services[serviceName]["events"]).forEach((eventName) => {
					let feature = services[serviceName]["events"][eventName]["handler"];
					let args = services[serviceName]["events"][eventName]["args"];
					let func = function(){
						let waitInfo = {};
						if (services[serviceName]["className"]) waitInfo["name"] = services[serviceName]["className"];
						if (services[serviceName]["rootNode"]) waitInfo["rootNode"] = services[serviceName]["rootNode"];
						waitInfo["status"] = "opened";
						component.waitFor([waitInfo]).then(() => {
							let service;
							if (services[serviceName]["className"])
							{
								Object.keys(Globals["components"]).forEach((key) => {
									if (Globals["components"][key].component.name == services[serviceName]["className"])
									{
										service = Globals["components"][key].component;
									}
								});
							}
							else
							{
								service = document.querySelector(services[serviceName]["rootNode"]);
							}
							service[feature].apply(service, args);
						});
					};
					component.addEventHandler(component, eventName, func);
				});
			});
		}

		return Promise.resolve();

	}

	// -------------------------------------------------------------------------

	/**
	 * Check if event is target.
	 *
	 * @param	{String}		eventName			Event name.
	 *
	 * @return 	{Boolean}		True if it is target.
	 */
	static isTarget(eventName)
	{

		let ret = false;

		if (eventName == "*" || eventName == "afterInitComponent" || eventName == "afterConnect")
		{
			ret = true;
		}

		return ret;

	}

}
