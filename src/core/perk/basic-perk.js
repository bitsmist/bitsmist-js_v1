// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import ChainableStore from "../store/chainable-store.js";
import ComponentPerk from "./component-perk.js";
import Perk from "./perk.js";
import Store from "../store/store.js";
import Util from "../util/util.js";

// =============================================================================
//	Basic Perk Class
// =============================================================================

export default class BasicPerk extends Perk
{

	// -------------------------------------------------------------------------
	//  Skills
	// -------------------------------------------------------------------------

	/**
	 * Transform component (Load HTML and attach to node).
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _transform(component, options)
	{

		options = options || {};

		return Promise.resolve().then(() => {
			console.debug(`BasicPerk._transform(): Transforming. name=${component.tagName}, id=${component.id}, uniqueId=${component.uniqueId}`);
			return component.skills.use("event.trigger", "beforeTransform", options);
		}).then(() => {
			return component.skills.use("event.trigger", "doTransform", options);
		}).then(() => {
			// Setup
			let autoSetup = component.settings.get("setting.autoSetup");
			if (autoSetup)
			{
				return component.skills.use("basic.setup", options);
			}
		}).then(() => {
			return component.skills.use("component.materializeAll", component);
		}).then(() => {
			console.debug(`BasicPerk._transform(): Transformed. name=${component.tagName}, id=${component.id}, uniqueId=${component.uniqueId}`);
			return component.skills.use("event.trigger", "afterTransform", options);
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Setup component.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _setup(component, options)
	{

		options = options || {};

		return Promise.resolve().then(() => {
			console.debug(`BasicPerk._setup(): Setting up component. name=${component.tagName}, state=${component.state}, id=${component.id}, uniqueId=${component.uniqueId}`);
			return component.skills.use("event.trigger", "beforeSetup", options);
		}).then(() => {
			return component.skills.use("event.trigger", "doSetup", options);
		}).then(() => {
			console.debug(`BasicPerk._setup(): Set up component. name=${component.tagName}, state=${component.state}, id=${component.id}, uniqueId=${component.uniqueId}`);
			return component.skills.use("event.trigger", "afterSetup", options);
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Refresh component.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _refresh(component, options)
	{

		options = options || {};

		return Promise.resolve().then(() => {
			console.debug(`BasicPerk._refresh(): Refreshing component. name=${component.tagName}, id=${component.id}, uniqueId=${component.uniqueId}`);
			return component.skills.use("event.trigger", "beforeRefresh", options);
		}).then(() => {
			let autoClear = Util.safeGet(options, "autoClear", component.settings.get("setting.autoClear"));
			if (autoClear)
			{
				return component.skills.use("basic.clear", options);
			}
		}).then(() => {
			return component.skills.use("event.trigger", "doTarget", options);
		}).then(() => {
			// Fetch
			if (Util.safeGet(options, "autoFetch", component.settings.get("setting.autoFetch")))
			{
				return component.skills.use("basic.fetch", options);
			}
		}).then(() => {
			// Fill
			if (Util.safeGet(options, "autoFill", component.settings.get("setting.autoFill")))
			{
				return component.skills.use("basic.fill", options);
			}
		}).then(() => {
			return component.skills.use("event.trigger", "doRefresh", options);
		}).then(() => {
			console.debug(`BasicPerk._refresh(): Refreshed component. name=${component.tagName}, id=${component.id}, uniqueId=${component.uniqueId}`);
			return component.skills.use("event.trigger", "afterRefresh", options);
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Fetch data.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _fetch(component, options)
	{

		options = options || {};

		return Promise.resolve().then(() => {
			console.debug(`BasicPerk._fetch(): Fetching data. name=${component.tagName}, uniqueId=${component.uniqueId}`);
			return component.skills.use("event.trigger", "beforeFetch", options);
		}).then(() => {
			return component.skills.use("event.trigger", "doFetch", options);
		}).then(() => {
			return component.skills.use("event.trigger", "afterFetch", options);
		}).then(() => {
			console.debug(`BasicPerk._fetch(): Fetched data. name=${component.tagName}, uniqueId=${component.uniqueId}`);
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Fill component.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _fill(component, options)
	{

		options = options || {};

		return Promise.resolve().then(() => {
			console.debug(`BasicPerk._fill(): Filling with data. name=${component.tagName}, uniqueId=${component.uniqueId}`);
			return component.skills.use("event.trigger", "beforeFill", options);
		}).then(() => {
			return component.skills.use("event.trigger", "doFill", options);
		}).then(() => {
			console.debug(`BasicPerk._fill(): Filled with data. name=${component.tagName}, uniqueId=${component.uniqueId}`);
			return component.skills.use("event.trigger", "afterFill", options);
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Clear component.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _clear(component, options)
	{

		options = options || {};

		return Promise.resolve().then(() => {
			console.debug(`BasicPerk._clear(): Clearing the component. name=${component.tagName}, uniqueId=${component.uniqueId}`);
			return component.skills.use("event.trigger", "beforeClear", options);
		}).then(() => {
			return component.skills.use("event.trigger", "doClear", options);
		}).then(() => {
			console.debug(`BasicPerk._clear(): Cleared the component. name=${component.tagName}, uniqueId=${component.uniqueId}`);
			return component.skills.use("event.trigger", "afterClear", options);
		});

	}

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	static get info()
	{

		return {
			"section":		"origin",
			"order":		0,
		};

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static globalInit()
	{

		// Add skills to Component (static)
		BITSMIST.v1.Component.skills.set("basic.transform", function(...args) { return BasicPerk._transform(...args); });
		BITSMIST.v1.Component.skills.set("basic.setup", function(...args) { return BasicPerk._setup(...args); });
		BITSMIST.v1.Component.skills.set("basic.refresh", function(...args) { return BasicPerk._refresh(...args); });
		BITSMIST.v1.Component.skills.set("basic.fetch", function(...args) { return BasicPerk._fetch(...args); });
		BITSMIST.v1.Component.skills.set("basic.fill", function(...args) { return BasicPerk._fill(...args); });
		BITSMIST.v1.Component.skills.set("basic.clear", function(...args) { return BasicPerk._clear(...args); });

		// Add properties to Component
		Object.defineProperty(BITSMIST.v1.Component.prototype, "stats", {
			get() { return this._stats; },
		});
		Object.defineProperty(BITSMIST.v1.Component.prototype, "vault", {
			get() { return this._vault; },
		});
		Object.defineProperty(BITSMIST.v1.Component.prototype, "inventory", {
			get() { return this._inventory; },
		});
		Object.defineProperty(BITSMIST.v1.Component.prototype, "skills", {
			get() { return this._skills; },
		});



	}

	// -------------------------------------------------------------------------

	static init(component, options)
	{

		// Init component vars
		component._stats = new ChainableStore();
		component._vault = new ChainableStore();
		component._inventory= new ChainableStore();
		component._skills = new ChainableStore({"chain":BITSMIST.v1.Component.skills});
		component._skills.use = function(perkName, ...args) {
			let func = this.skills.get(perkName);
			Util.assert(func, `Skill is not available. name=${component.tagName}, skillName=${perkName}`);

			return this.skills.get(perkName)(this, ...args);
		}.bind(component);

	}

}
