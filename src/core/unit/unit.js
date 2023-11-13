// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import {v4 as uuidv4} from "uuid";

// =============================================================================
//	Unit Class
// =============================================================================

export default class Unit extends HTMLElement
{

	// -------------------------------------------------------------------------
	//  Private Variables
	// -------------------------------------------------------------------------

	static #__global_assets = {
		"callback": new Map(),
	};
	#__assets = {};
	#__initialized;
	#__ready;
	#__uniqueid = uuidv4();

	static {
		// Upgrade Unit
		Unit.#_upgrade(Unit, "method", "upgrade", (...args) => {Unit.#_upgrade(Unit, ...args)});
		Unit.upgrade("method", "get", Unit.#_get);
		Unit.upgrade("method", "set", Unit.#_set);
		Unit.upgrade("method", "has", Unit.#_has);
	}

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

	static get assets()
	{

		return Unit.#__global_assets;

	}

	// -------------------------------------------------------------------------

	get assets()
	{
		return this.#__assets;
	}

	// -------------------------------------------------------------------------

	get ready()
	{
		return this.#__ready;
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
			// Upgrade unit
			Unit.#_upgrade(this, "method", "upgrade", (...args) => {Unit.#_upgrade(this, ...args)});
			this.upgrade("method", "get", Unit.#_get);
			this.upgrade("method", "set", Unit.#_set);
			this.upgrade("method", "has", Unit.#_has);

			// Initialize unit
			this.#__ready = Unit.get("callback", "initializeCallback")(this);

			this.#__initialized = true;
			this.setAttribute("bm-powered", "");
		}

		this.#__ready = this.#__ready.then(() => {
			console.debug(`connectedCallback(): Unit is connected. name=${this.tagName}, id=${this.id}, uniqueId=${this.uniqueId}`);

			return Unit.get("callback", "connectedCallback")(this);
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Disconnected callback.
	 */
	disconnectedCallback()
	{

		this.#__ready = this.#__ready.then(() => {
			console.debug(`disconnectedCallback(): Unit is disconnected. name=${this.tagName}, id=${this.id}, uniqueId=${this.uniqueId}`);

			return Unit.get("callback", "disconnectedCallback")(this);
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Adopted callback.
	 */
	adoptedCallback()
	{

		this.#__ready = this.#__ready.then(() => {
			console.debug(`adoptedCallback(): Unit is adopted. name=${this.tagName}, id=${this.id}, uniqueId=${this.uniqueId}`);

			return Unit.get("callback", "adoptedCallback")(this);
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
	 *
	 * @return  {*}				Value.
	 */
	static #_get(assetName, key, defaultValue)
	{

		return this.assets[assetName].get(key, defaultValue);

	}

	// -------------------------------------------------------------------------

	/**
	 * Set the value to the asset.
	 *
	 * @param	{String}		assetName			Asset name.
	 * @param	{String}		key					Key.
	 * @param	{*}				value				Value.
	 */
	static #_set(assetName, key, value)
	{

		this.assets[assetName].set(key, value);

	}

	// -------------------------------------------------------------------------

	/**
	 * Return if the unit has the asset.
	 *
	 * @param	{String}		assetName			Asset name.
	 * @param	{String}		key					Key.
	 */
	static #_has(assetName, key)
	{

		this.assets[assetName].has(key);

	}

	// -------------------------------------------------------------------------

	/**
	 * Upgrade the unit.
	 *
	 * @param	{Unit}			unit				Target unit.
	 * @param	{String}		type				Upgrade type.
	 * @param	{String}		name				Section name.
	 * @param	{Function}		content				Upgrade content.
	 */
	static #_upgrade(unit, type, name, content)
	{

		switch (type)
		{
			case "asset":
				unit.assets[name] = content;
				break;
			case "method":
				unit[name] = content;
				break;
			case "property":
				Object.defineProperty(unit, name, content);
				break;
			default:
				unit.assets[type].set(name, content);
				break;
		}

	}

}

customElements.define("bm-unit", Unit);
