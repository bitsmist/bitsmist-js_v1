// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

// =============================================================================
//	Component observer class
// =============================================================================

export default class ComponentObserver
{

	// -------------------------------------------------------------------------
	//  Constructor
	// -------------------------------------------------------------------------

	/**
     * Constructor.
     *
	 * @param	{Object}		options				Options.
     */
	constructor(options)
	{

		this._observers = {};

		// Init targeter
		if (options && options["targeter"])
		{
			if (typeof options["targeter"] != "function")
			{
				throw TypeError(`Targeter is not a function. targeter=${options["targeter"]}`);
			}

			this._targeter = options["targeter"];
		}
		else
		{
			this._targeter = () => { return true; };
		}

	}

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	/**
	 * observers.
	 *
	 * @type	{Object}
	 */
	get observers()
	{

		return this._observers;

	}

	// -------------------------------------------------------------------------

	/**
	 * Notify to observers asynchronously.
	 *
	 * @param	{Object}		conditions			Current conditions.
	 * @param	{Object}		...args				Arguments to callback function.
	 *
	 * @return  {Promise}		Promise.
	 */
	notify(conditions, ...args)
	{

		return new Promise((resolve, reject) => {
			let chain = Promise.resolve();

			Object.keys(this._observers).forEach((componentId) => {
				chain = chain.then(() => {
					if (this._targeter(conditions, this._observers[componentId].targets))
					{
						return this._observers[componentId].callback.call(this._observers[componentId].object, ...args);
					}
				});
			});

			chain.then(() => {
				resolve();
			});
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Notify to observers synchronously.
	 *
	 * @param	{Object}		conditions			Current conditions.
	 * @param	{Object}		...args				Arguments to callback function.
	 */
	notifySync(conditions, ...args)
	{

		Object.keys(this._observers).forEach((componentId) => {
			if (this._targeter(conditions, this._observers[componentId].targets))
			{
				this._observers[componentId].callback.call(this._observers[componentId].object, ...args);
			}
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Register target component.
	 *
	 * @param	{Component}		component			Component to notify.
	 * @param	{Object}		targets				Target conditions.
	 * @param	{Function}		callback			Callback function.
	 *
	 * @return  {Promise}		Promise.
	 */
	register(component, targets, callback)
	{

		this._observers[component.uniqueId] = {"object":component, "targets":targets, "callback":callback};

	}

	// -------------------------------------------------------------------------

	/**
	 * Deregister target component.
	 *
	 * @param	{Component}		component			Component to notify.
	 *
	 * @return  {Promise}		Promise.
	 */
	deregister(component)
	{

		delete this._observers[component.uniqueId];

	}

}
