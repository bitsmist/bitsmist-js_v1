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

		if (settings)
		{
			Object.keys(settings).forEach((serviceName) => {
				Object.keys(settings[serviceName]["events"]).forEach((eventName) => {
					let feature = settings[serviceName]["events"][eventName]["handler"];
					let args = settings[serviceName]["events"][eventName]["args"];
					let func = function(){
						let waitInfo = {};
						if (settings[serviceName]["className"]) waitInfo["name"] = settings[serviceName]["className"];
						if (settings[serviceName]["rootNode"]) waitInfo["rootNode"] = settings[serviceName]["rootNode"];
						waitInfo["status"] = "opened";
						component.waitFor([waitInfo]).then(() => {
							let service;
							if (settings[serviceName]["className"])
							{
								Object.keys(Globals["components"]).forEach((key) => {
									if (Globals["components"][key].component.name == settings[serviceName]["className"])
									{
										service = Globals["components"][key].component;
									}
								});
							}
							else
							{
								service = document.querySelector(settings[serviceName]["rootNode"]);
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

		if (eventName == "afterInitComponent" || eventName == "afterConnect")
		{
			ret = true;
		}

		return ret;

	}

}
