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

		/*
		let proxy = super(componentName, options);
		this.listeners = new EventHandler(proxy);

		return proxy;
		*/

		super(componentName, options);

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
	 * Register target component.
	 *
	 * @param	{Component}		component			Component to notify.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	register(component, options)
	{

		return new Promise((resolve, reject) => {
			let promises = [];

			for (let i = 0; i < this.plugins.length; i++)
			{
				if (typeof this.plugins[i].register == "function")
				{
					promises.push(this.plugins[i].register.call(this.plugins[i], component, options));
				}
			}

			Promise.all(promises).then(() => {
				resolve();
			});
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Apply preferences.
	 *
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	setup(options)
	{

		return new Promise((resolve, reject) => {
			let promises = [];

			for (let i = 0; i < this.plugins.length; i++)
			{
				if (typeof this.plugins[i].setup == "function")
				{
					promises.push(this.plugins[i].setup.call(this.plugins[i], options));
				}
			}

			Promise.all(promises).then(() => {
				resolve();
			});
		});

	}

	/*
	setup(options)
	{

		this._callMethod(setup, options, () => {
			let result = false;

			if (target == "*")
			{
				return true;
			}

			for (let i = 0; i < target.length; i++)
			{
				if (settings["newPreferences"].hasOwnProperty(target[i]))
				{
					result = true;
					break;
				}
			}

			return result;
		});

	}
	*/

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
