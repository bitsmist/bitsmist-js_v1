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
	 * @param	{String}		eventName			Event name.
	 * @param	{Object}		settings			Settings.
	 */
	static organizeSync(eventName, settings)
	{

		Object.keys(settings).forEach((key) => {
			if (key in Globals["organizers"])
			{
				let organizer = BITSMIST.v1.Globals.getOrganizer(key);

				if (organizer.isTarget(eventName))
				{
					organizer.organize(this, settings[key]);
				}
			}
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Apply organizer asynchronously.
	 *
	 * @param	{String}		eventName			Event name.
	 * @param	{Object}		settings			Settings.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static organize(eventName, settings)
	{

		return new Promise((resolve, reject) => {
			let chain = Promise.resolve();

			Object.keys(settings).forEach((key) => {
				if (key in Globals["organizers"])
				{
					let organizer = BITSMIST.v1.Globals.getOrganizer(key);

					if (organizer.isTarget(eventName))
					{
						chain = chain.then(() => {
							return organizer.organize(this, settings[key]);
						});
					}
				}
			});

			chain.then(() => {
				resolve();
			});
		});

	}

}
