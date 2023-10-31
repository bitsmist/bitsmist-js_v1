// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import Util from "../util/util.js";

// =============================================================================
//	Unit Class
// =============================================================================

export default class Unit extends HTMLElement
{

	// -------------------------------------------------------------------------
	//  Private Variables
	// -------------------------------------------------------------------------

	static #__global_assets = {};
	#__assets = {};
	#__initialized;
	#__ready;
	#__uniqueid = Util.getUUID();

	// -------------------------------------------------------------------------
	//  Properties
	// -------------------------------------------------------------------------

	static get uniqueId()
	{

		return "00000000-0000-0000-0000-000000000000";

	}

	// -------------------------------------------------------------------------

	get uniqueId()
	{

		return this.#__uniqueid;

	}

	// -------------------------------------------------------------------------

	static get tagName()
	{

		return "BODY";

	}

	// -------------------------------------------------------------------------
	//  Callbacks
	// -------------------------------------------------------------------------

	/**
	 * Connected callback.
	 */
	connectedCallback()
	{

		if (!this.#__initialized)
		{
			this.#__initialized = false;
			this.#__ready = Promise.resolve(); // A promise to prevent from starting/stopping while stopping/starting
			this.setAttribute("bm-powered", "");
		}

		this.#__ready = this.#__ready.then(() => {
			console.debug(`connectedCallback(): Unit is connected. name=${this.tagName}, id=${this.id}, uniqueId=${this.uniqueId}`);

			return Unit.get("callback", "connectedCallback")(this);
		}).then(() => {
			this.#__initialized = true;
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Disconnected callback.
	 */
	disconnectedCallback()
	{

		this.#__ready = this.#__ready.then(() => {
			return Unit.get("callback", "disconnectedCallback")(this);
		}).then(() => {
			console.debug(`disconnectedCallback(): Unit is disconnected. name=${this.tagName}, id=${this.id}, uniqueId=${this.uniqueId}`);
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Adopted callback.
	 */
	adoptedCallback()
	{

		this.#__ready = this.#__ready.then(() => {
			return Unit.get("callback", "adoptedCallback")(this);
		}).then(() => {
			console.debug(`adoptedCallback(): Unit is adopted. name=${this.tagName}, id=${this.id}, uniqueId=${this.uniqueId}`);
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Attribute changed callback.
	 */
	attributeChangedCallback(name, oldValue, newValue)
	{

		if (this.#__initialized)
		{
			return Unit.get("callback", "attributeChangedCallback")(this);
		}

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
	 * Get the value from the asset.
	 *
	 * @param	{String}		assetName			Asset name.
	 * @param	{String}		key					Key.
	 * @param	{Object}		defaultValue		Value returned when key is not found.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {*}				Value.
	 */
	static get(assetName, key, defaultValue, options)
	{

		if (key === undefined)
		{
			return Unit.#__global_assets[assetName].items;
		}
		else
		{
			return Unit.#__global_assets[assetName].get(key, defaultValue);
		}

	}

	get(assetName, key, defaultValue, options)
	{

		if (key === undefined)
		{
			return this.#__assets[assetName].items;
		}
		else
		{
			return this.#__assets[assetName].get(key, defaultValue);
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Set the value to the asset.
	 *
	 * @param	{String}		assetName			Asset name.
	 * @param	{String}		key					Key.
	 * @param	{*}				value				Value.
	 * @param	{Object}		options				Options.
	 */
	static set(assetName, key, value, options)
	{

		Unit.#__global_assets[assetName].set(key, value);

	}

	set(assetName, key, value, options)
	{

		this.#__assets[assetName].set(key, value);

	}

	// -------------------------------------------------------------------------

	/**
	 * Return if the unit has the asset.
	 *
	 * @param	{String}		assetName			Asset name.
	 * @param	{String}		key					Key.
	 * @param	{Object}		options				Options.
	 */
	static has(assetName, key, options)
	{

		Unit.#__global_assets[assetName].has(key);

	}

	has(assetName, key, options)
	{

		this.#__assets[assetName].has(key);

	}

	// -------------------------------------------------------------------------

	/**
	 * Call the function in the asset.
	 *
	 * @param	{String}		assetName			Asset name.
	 * @param	{String}		key					Key.
	 * @param	{*}				...args				Arguments.
	 */
	static use(assetName, key, ...args)
	{

		let func = Unit.#__global_assets[assetName].get(key);
		Util.assert(typeof(func) === "function", `${assetName} is not available. ${assetName}Name=${key}`);

		return func.call(this, this, ...args);

	}

	use(assetName, key, ...args)
	{

		let func = this.#__assets[assetName].get(key);
		Util.assert(typeof(func) === "function", `${assetName} is not available. ${assetName}Name=${key}`);

		return func.call(this, this, ...args);

	}

	// -------------------------------------------------------------------------

	/**
	 * Merge assets.
	 *
	 * @param	{String}		assetName			Asset name.
	 * @param	{String}		key					Key.
	 * @param	{*}				value				Value.
	 * @param	{Object}		options				Options.
	 */
	static merge(assetName, key, value, options)
	{

		return Unit.#__global_assets[assetName].merge(key, value);

	}

	merge(assetName, key, value, options)
	{

		return this.#__assets[assetName].merge(key, value);

	}

	// -------------------------------------------------------------------------

	/**
	 * Upgrade the unit.
	 *
	 * @param	{String}		type				Upgrade type.
	 * @param	{String}		name				Section name.
	 * @param	{Function}		content				Upgrade content.
	 * @param	{Object}		options				Options.
	 */
	static upgrade(type, name, content, options)
	{

		switch (type)
		{
			case "asset":
				Unit.#__global_assets[name] = content;
				break;
			case "method":
				Unit[name] = content;
				break;
			case "property":
				Object.defineProperty(Unit, name, content);
				break;
			case "event":
				Unit.use("skill", "event.add", name, {
					"handler":	content,
					"order":	options["order"],
				});
				break;
			default:
				Unit.#__global_assets[type].set(name, content);
				break;
		}

	}

	// -------------------------------------------------------------------------

	upgrade(type, name, content, options)
	{

		switch (type)
		{
			case "asset":
				if ((options && options["chain"]) && Unit.#__global_assets[name])
				{
					content.chain(Unit.#__global_assets[name]);
				}
				this.#__assets[name] = content;
				break;
			case "method":
				this[name] = content;
				break;
			case "property":
				Object.defineProperty(unit, name, content);
				break;
			case "event":
				this.use("skill", "event.add", name, {
					"handler":	content,
					"order":	options["order"],
				});
				break;
			default:
				this.#__assets[type].set(name, content);
				break;
		}

	}

}

customElements.define("bm-unit", Unit);
