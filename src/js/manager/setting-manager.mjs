// =============================================================================
/**
 * Bitsmist WebView - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import EventHandler from '../ui/event-handler';
import ServiceManager from './service-manager';

// =============================================================================
//	Setting manager class
// =============================================================================

export default class SettingManager extends ServiceManager
{

	// -------------------------------------------------------------------------
	//  Constructor
	// -------------------------------------------------------------------------

	/**
     * Constructor.
     *
	 * @param	{String}		componentName		Component name.
	 * @param	{Object}		options				Options for the component.
     */
	constructor(componentName, options)
	{

		super(componentName, options);

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
	 * Apply settings
	 *
	 * @param	{Object}		settings			Settings.
	 *
	 * @return  {Promise}		Promise.
	 */
	setup(settings)
	{

		return new Promise((resolve, reject) => {
			let promises = [];

			for (let i = 0; i < this.plugins.length; i++)
			{
				if (typeof this.plugins[i].setup == "function")
				{
					promises.push(this.plugins[i].setup.call(this.plugins[i], settings));
				}
			}

			Promise.all(promises).then(() => {
				resolve();
			});
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Load settings
	 *
	 * @return  {Promise}		Promise.
	 */
	load()
	{

		return new Promise((resolve, reject) => {
			let promises = [];

			for (let i = 0; i < this.plugins.length; i++)
			{
				if (typeof this.plugins[i].load == "function")
				{
					promises.push(this.plugins[i].load.call(this.plugins[i]));
				}
			}

			Promise.all(promises).then((results) => {
				resolve(results);
			});
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Save settings
	 *
	 * @return  {Promise}		Promise.
	 */
	save(settings)
	{

		return new Promise((resolve, reject) => {
			let promises = [];

			for (let i = 0; i < this.plugins.length; i++)
			{
				if (typeof this.plugins[i].save == "function")
				{
					promises.push(this.plugins[i].save.call(this.plugins[i], settings));
				}
			}

			Promise.all(promises).then(() => {
				resolve();
			});
		});

	}

}
