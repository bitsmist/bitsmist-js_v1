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
//	Preference manager class
// =============================================================================

export default class PreferenceManager extends ServiceManager
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
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	load(options)
	{

		return new Promise((resolve, reject) => {
			let promises = [];

			for (let i = 0; i < this.plugins.length; i++)
			{
				if (typeof this.plugins[i].load == "function")
				{
					promises.push(this.plugins[i].load.call(this.plugins[i], options));
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
	 * @param	{Object}		settings			Settings.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	save(settings, options)
	{

		return new Promise((resolve, reject) => {
			let promises = [];

			for (let i = 0; i < this.plugins.length; i++)
			{
				if (typeof this.plugins[i].save == "function")
				{
					promises.push(this.plugins[i].save.call(this.plugins[i], settings, options));
				}
			}

			Promise.all(promises).then(() => {
				resolve();
			});
		});

	}

}