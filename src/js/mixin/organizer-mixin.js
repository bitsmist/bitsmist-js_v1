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
import Util from '../util/util';

// =============================================================================
//	Organizer mixin class
// =============================================================================

export default class OrganizerMixin
{

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
	 * Apply organizer synchronously.
	 *
	 * @param	{Object}		settings			Settings.
	 * @param	{String}		eventName			Event name.
	 */
	static organizeSync(settings, eventName)
	{

		Object.keys(settings).forEach((key) => {
			if (key in Globals["organizers"])
			{
				let organizer = OrganizerMixin.getOrganizer.call(this, key);

				if (organizer.isTarget(eventName))
				{
					organizer.init(this, settings[key]);
				}
			}
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Apply organizer asynchronously.
	 *
	 * @param	{Object}		settings			Settings.
	 * @param	{String}		eventName			Event name.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static organize(settings, eventName)
	{

		return new Promise((resolve, reject) => {
			let chain = Promise.resolve();

			Object.keys(settings).forEach((key) => {
				if (key in Globals["organizers"])
				{
					let organizer = OrganizerMixin.getOrganizer.call(this, key);

					if (organizer.isTarget(eventName))
					{
						chain = chain.then(() => {
							return organizer.init(this, settings[key]);
						});
					}
				}
			});

			chain.then(() => {
				resolve();
			});
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Clear organizers.
	 */
	static clearOrganizers()
	{

		Object.keys(Globals["organizers"]).forEach((key) => {
			if (typeof Globals["organizers"][key].clear == "function")
			{
				Globals["organizers"][key].clear(this);
			}
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Get an organizer. Throws an error if it is not a function.
	 *
	 * @param	{String}		type				Organizer type.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static getOrganizer(type)
	{

		let organizer = Globals["organizers"][type];

		if (typeof organizer != "function" || typeof organizer.init != "function")
		{
			throw TypeError(`Organizer is not a function. componentName=${this.name}, type=${type}`);
		}

		return organizer;

	}

}
