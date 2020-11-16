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
	 * @param	{String}		type				Notification type(=methodname).
	 * @param	{Object}		conditions			Current conditions.
	 * @param	{Object}		...args				Arguments to callback function.
	 *
	 * @return  {Promise}		Promise.
	 */
	notify(type, conditions, ...args)
	{

		let chain = Promise.resolve();

		Object.keys(this._observers).forEach((componentId) => {
			chain = chain.then(() => {
				if (this._targeter(conditions, this._observers[componentId].targets, this._observers[componentId].component))
				{
					if (typeof this._observers[componentId].component[type] === "function")
					{
						return this._observers[componentId].component[type].call(this._observers[componentId].component, ...args);
					}
					else
					{
						throw TypeError(`Notification handler is not a function. componentName=${this._observers[componentId].component.name}, type=${type}`);
					}
				}
			});
		});

		return chain;

	}

	// -------------------------------------------------------------------------

	/**
	 * Notify to observers synchronously.
	 *
	 * @param	{String}		type				Notification type(=methodname).
	 * @param	{Object}		conditions			Current conditions.
	 * @param	{Object}		...args				Arguments to callback function.
	 */
	notifySync(type, conditions, ...args)
	{

		Object.keys(this._observers).forEach((componentId) => {
			if (this._targeter(conditions, this._observers[componentId].targets, this._observers[componentId].component))
			{
				if (typeof this._observers[componentId].component[type] === "function")
				{
					this._observers[componentId].component[type].call(this._observers[componentId].component, ...args);
				}
				else
				{
					throw TypeError(`Notification handler is not a function. componentName=${this._observers[componentId].component.name}, type=${type}`);
				}
			}
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Register target component.
	 *
	 * @param	{Component}		component			Component to notify.
	 * @param	{Object}		targets				Target conditions.
	 *
	 * @return  {Promise}		Promise.
	 */
	register(component, targets)
	{

		let id = component.uniqueId || component.name || new Date().getTime().toString(16) + Math.floor(100*Math.random()).toString(16);
		this._observers[id] = {"component":component, "targets":targets};

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
