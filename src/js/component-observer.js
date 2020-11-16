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
	 * @type	{String}
	 */
	get observers()
	{

		return this._observers;

	}

	// -------------------------------------------------------------------------

	/**
	 * Before setup event handler.
	 *
	 * @return  {Promise}		Promise.
	 */
	notify(conditions, ...args)
	{

		return new Promise((resolve, reject) => {
			let promises = [];

			Object.keys(this._observers).forEach((componentId) => {
				console.log("@@@observer checking target", conditions, this._observers[componentId].object.name);
				if (this._targeter(conditions, this._observers[componentId].targets))
				{
					console.log("@@@observer notifying", conditions, this._observers[componentId].object.name);
					promises.push(this._observers[componentId].callback.call(this._observers[componentId].object, ...args));
				}
			});

			Promise.all(promises).then(() => {
				resolve();
			});
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Register target component.
	 *
	 * @param	{Component}		component			Component to notify.
	 * @param	{Object}		targets				Targets.
	 * @param	{Function}		callback			Callback function.
	 *
	 * @return  {Promise}		Promise.
	 */
	register(component, targets, callback)
	{

		console.log("@@@observer registering", component.name, targets);
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
