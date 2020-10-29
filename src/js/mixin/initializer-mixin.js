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
//	Initializer mixin class
// =============================================================================

export default class InitializerMixin
{

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
	 * Apply initializer synchronously.
	 *
	 * @param	{Object}		settings			Settings.
	 * @param	{String}		eventName			Event name.
	 */
	static applyInitializerSync(settings, eventName)
	{

		Object.keys(settings).forEach((key) => {
			if (key in Globals["initializers"])
			{
				let initializer = InitializerMixin.getInitializer.call(this, key);

				if (initializer.isTarget(eventName))
				{
					initializer.init(this, settings[key]);
				}
			}
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Apply initializer asynchronously.
	 *
	 * @param	{Object}		settings			Settings.
	 * @param	{String}		eventName			Event name.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static applyInitializer(settings, eventName)
	{

		return new Promise((resolve, reject) => {
			let chain = Promise.resolve();

			Object.keys(settings).forEach((key) => {
				if (key in Globals["initializers"])
				{
					let initializer = InitializerMixin.getInitializer.call(this, key);

					if (initializer.isTarget(eventName))
					{
						chain = chain.then(() => {
							return initializer.init(this, settings[key]);
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
	 * Get an initializer. Throws an error if it is not a function.
	 *
	 * @param	{String}		type				Initializer type.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static getInitializer(type)
	{

		let initializer = Globals["initializers"][type];

		if (typeof initializer != "function" || typeof initializer.init != "function")
		{
			throw TypeError(`Initializer is not a function. componentName=${this.name}, type=${type}`);
		}

		return initializer;

	}

}
