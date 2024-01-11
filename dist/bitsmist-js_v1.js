(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.BITSMIST = global.BITSMIST || {}, global.BITSMIST.V1 = global.BITSMIST.V1 || {}, global.BITSMIST.V1.$CORE = {})));
})(this, (function (exports) { 'use strict';

  // Unique ID creation requires a high quality random # generator. In the browser we therefore
  // require the crypto API and do not support built-in fallback to lower quality random number
  // generators (like Math.random()).
  let getRandomValues;
  const rnds8 = new Uint8Array(16);
  function rng() {
    // lazy load so that environments that need to polyfill have a chance to do so
    if (!getRandomValues) {
      // getRandomValues needs to be invoked in a context where "this" is a Crypto implementation.
      getRandomValues = typeof crypto !== 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto);

      if (!getRandomValues) {
        throw new Error('crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported');
      }
    }

    return getRandomValues(rnds8);
  }

  /**
   * Convert array of 16 byte values to UUID string format of the form:
   * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
   */

  const byteToHex = [];

  for (let i = 0; i < 256; ++i) {
    byteToHex.push((i + 0x100).toString(16).slice(1));
  }

  function unsafeStringify(arr, offset = 0) {
    // Note: Be careful editing this code!  It's been tuned for performance
    // and works in ways you may not expect. See https://github.com/uuidjs/uuid/pull/434
    return byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + '-' + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + '-' + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + '-' + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + '-' + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]];
  }

  const randomUUID = typeof crypto !== 'undefined' && crypto.randomUUID && crypto.randomUUID.bind(crypto);
  var native = {
    randomUUID
  };

  function v4(options, buf, offset) {
    if (native.randomUUID && !buf && !options) {
      return native.randomUUID();
    }

    options = options || {};
    const rnds = options.random || (options.rng || rng)(); // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`

    rnds[6] = rnds[6] & 0x0f | 0x40;
    rnds[8] = rnds[8] & 0x3f | 0x80; // Copy bytes to buffer, if provided

    if (buf) {
      offset = offset || 0;

      for (let i = 0; i < 16; ++i) {
        buf[offset + i] = rnds[i];
      }

      return buf;
    }

    return unsafeStringify(rnds);
  }

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
  //	Unit Class
  // =============================================================================

  class Unit extends HTMLElement
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
  	#__uniqueid = v4();

  	static {
  		// Upgrade Unit
  		Unit.#_upgrade(Unit, "method", "upgrade", (...args) => {Unit.#_upgrade(Unit, ...args);});
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

  		console.debug(`connectedCallback(): Unit is connected. name=${this.tagName}, id=${this.id}, uniqueId=${this.uniqueId}`);

  		if (!this.#__initialized)
  		{
  			// Upgrade unit
  			Unit.#_upgrade(this, "method", "upgrade", (...args) => {Unit.#_upgrade(this, ...args);});
  			this.upgrade("method", "get", Unit.#_get);
  			this.upgrade("method", "set", Unit.#_set);
  			this.upgrade("method", "has", Unit.#_has);

  			// Initialize unit
  			this.#__ready = Unit.get("callback", "initializeCallback")(this);

  			this.#__initialized = true;
  			this.setAttribute("bm-powered", "");
  		}

  		this.#__ready = this.#__ready.then(() => {
  			return Unit.get("callback", "connectedCallback")(this);
  		});

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Disconnected callback.
  	 */
  	disconnectedCallback()
  	{

  		console.debug(`disconnectedCallback(): Unit is disconnected. name=${this.tagName}, id=${this.id}, uniqueId=${this.uniqueId}`);

  		this.#__ready = this.#__ready.then(() => {
  			return Unit.get("callback", "disconnectedCallback")(this);
  		});

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Adopted callback.
  	 */
  	adoptedCallback()
  	{

  		console.debug(`adoptedCallback(): Unit is adopted. name=${this.tagName}, id=${this.id}, uniqueId=${this.uniqueId}`);

  		this.#__ready = this.#__ready.then(() => {
  			return Unit.get("callback", "adoptedCallback")(this);
  		});

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Attribute changed callback.
  	 */
  	attributeChangedCallback(name, oldValue, newValue)
  	{

  		console.debug(`attributeChangedCallback(): Attribute is changed. name=${this.tagName}, id=${this.id}, uniqueId=${this.uniqueId}, name=${name}, oldValue=${oldValue}, newValue=${newValue}`);

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
  //	Util class
  // =============================================================================

  class Util
  {

  	// -------------------------------------------------------------------------
  	//  Methods
  	// -------------------------------------------------------------------------

  	/**
  	 * Get an value from object. Return default value when specified key is not available.
  	 *
  	 * @param	{Object}		store				Object that holds keys/values.
  	 * @param	{String}		key					Key to get.
  	 * @param	{Object}		defaultValue		Value returned when key is not found.
  	 *
  	 * @return  {*}				Value.
  	 */
  	static safeGet(store, key, defaultValue)
  	{

  		let current = store;
  		let found = true;

  		let keys = key.split(".");
  		for (let i = 0; i < keys.length; i++)
  		{
  			if (current !== null && typeof current === "object" && keys[i] in current)
  			{
  				current = current[keys[i]];
  			}
  			else
  			{
  				found = false;
  				break;
  			}
  		}

  		return ( found ? current : defaultValue);

  	}

  	// -----------------------------------------------------------------------------

  	/**
  	 * Set the value to object.
  	 *
  	 * @param	{Object}		store				Object that holds keys/values.
  	 * @param	{String}		key					Key to store.
  	 * @param	{Object}		value				Value to store.
  	 *
  	 * @return	{Object}		Modified object.
  	 */
  	static safeSet(store, key, value)
  	{

  		let keys = key.split(".");
  		let current = Util.#__createIntermediateObject(store, keys);

  		Util.assert(current !== null && typeof current === "object",
  			() => `Util.safeSet(): Can't create an intermediate object. Non-object value already exists. key=${key}, existingKey=${( keys.length > 1 ? keys[keys.length-2] : "" )}, existingValue=${current}`, TypeError);

  		current[keys[keys.length - 1]] = value;

  		return store;

  	}

  	// -----------------------------------------------------------------------------

  	/**
  	 * Remove the value from object.
  	 *
  	 * @param	{Object}		store				Object that holds keys/values.
  	 * @param	{String}		key					Key to store.
  	 *
  	 * @return	{Object}		Modified object.
  	 */
  	static safeRemove(store, key)
  	{

  		let isFound = true;
  		let current = store;

  		let keys = key.split(".");
  		for (let i = 0; i < keys.length - 1; i++)
  		{
  			if (!(keys[i] in current))
  			{
  				isFound = false;
  				break;
  			}

  			current = current[keys[i]];
  		}

  		if (isFound)
  		{
  			delete current[keys[keys.length - 1]];
  		}

  		return store;

  	}

  	// -----------------------------------------------------------------------------

  	/**
  	 * Merge the value to store.
  	 *
  	 * @param	{Object}		store				Object that holds keys/values.
  	 * @param	{String}		key					Key to store.
  	 * @param	{Object}		value				Value to store.
  	 *
  	 * @return	{Object}		Modified object.
  	 */
  	static safeMerge(store, key, value)
  	{

  		let keys = key.split(".");
  		let current = Util.#__createIntermediateObject(store, keys);

  		Util.assert(current && typeof current === "object",
  			() => `Util.safeSet(): Can't create an intermediate object. Non-object value already exists. key=${key}, existingKey=${( keys.length > 1 ? keys[keys.length-2] : "" )}, existingValue=${current}`, TypeError);

  		let lastKey = keys[keys.length - 1];
  		current[lastKey] = Util.deepMerge(current[lastKey], value);

  		return store;

  	}

  	// -----------------------------------------------------------------------------

  	/**
  	 * Check if the store has specified key.
  	 *
  	 * @param	{Object}		store				Store.
  	 * @param	{String}		key					Key to check.
  	 *
  	 * @return	{Boolean}		True:exists, False:not exists.
  	 */
  	static safeHas(store, key)
  	{

  		let current = store;
  		let found = true;
  		let items = key.split(".");
  		for (let i = 0; i < items.length; i++)
  		{
  			if (current && typeof current === "object" && items[i] in current)
  			{
  				current = current[items[i]];
  			}
  			else
  			{
  				found = false;
  				break;
  			}
  		}

  		return found;

  	}

  	// -----------------------------------------------------------------------------

  	/**
   	 * Execute Javascript code from string.
  	 *
  	 * @param	{String}		code				Code to execute.
  	 * @param	{Object}		parameters			Parameters passed to the code.
  	 *
  	 * @return	{*}				Result of eval.
  	 */
  	static safeEval(code, parameters)
  	{

  		let ret = false;

  		try
  		{
  			ret = Function(`"use strict";return (${code})`).apply(parameters);
  		}
  		catch(e)
  		{
  			console.error(`Util.safeEval(): Exception occurred. code=${code}, error=${e}`);
  		}

  		return ret;

  	}

  	// -----------------------------------------------------------------------------

  	/**
  	 * Concatenat path strings appending trainling "/" when needed.
  	 *
  	 * @param	{Array}			paths				Paths.
  	 *
  	 * @return	{String}		Concatenated paths
  	 */
  	static concatPath(paths)
  	{

  		let path = paths[0] || "";

  		for (let i = 1; i < paths.length; i++)
  		{
  			if (paths[i])
  			{
  				if (path.slice(path.length - 1) === "/" && paths[i].slice(0, 1) === "/")
  				{
  					// "---/" and "/---"
  					// Remove an extra slash
  					path += paths[i].slice(1);
  				}
  				else if (path.slice(path.length - 1) === "/" || paths[i].slice(0, 1) === "/")
  				{
  					// "---/" or "/---"
  					// Just concat
  					path += paths[i];
  				}
  				else if (path)
  				{
  					// "---" + "---"
  					// Add an slash between
  					path += "/" + paths[i];
  				}
  				else
  				{
  					// "" + "---"
  					// First word, just accept
  					path = paths[i];
  				}
  			}
  		}

  		return path;

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Deep merge obj2 into obj1. obj1 will be modified. If you want obj1 to be
  	 * immutable, deep copy it before passing it:
  	 * e.g.) Util.deepMerge(Util.deepClone(obj1), obj2).
  	 * obj2 will be always deep copied.
  	 *
  	 * @param	{*}				obj1					Object1.
  	 * @param	{*}				obj2					Object2.
  	 *
  	 * @return  {Object}		Merged object.
  	 */
  	static deepMerge(obj1, obj2)
  	{

  		let result = obj1;

  		if (Array.isArray(obj1))
  		{
  			// obj1 is an array
  			if (Array.isArray(obj2))
  			{
  				// if obj2 is an array, concat them
  				Array.prototype.push.apply(result, Util.#__cloneArr(obj2));
  			}
  			else
  			{
  				// if obj2 is not an array, push it
  				result.push(Util.deepClone(obj2));
  			}
  		}
  		else if (Util.#__isObject(obj1) && Util.#__isMergeable(obj2))
  		{
  			// obj1 is an Object and obj2 is an Object/Array
  			Object.keys(obj2).forEach((key) => {
  				result[key] = Util.deepMerge(obj1[key], obj2[key]);
  			});
  		}
  		else if (obj2 === undefined)
  		;
  		else
  		{
  			result = Util.deepClone(obj2);
  		}

  		return result;

  	}

  	// -----------------------------------------------------------------------------

  	/**
  	 * Clone an item.
  	 *
  	 * @param	{Object}		target					Target item.
  	 *
  	 * @return  {Object}		Cloned item.
  	 */
  	static deepClone(target)
  	{

  		if (Array.isArray(target))
  		{
  			return Util.#__cloneArr(target);
  		}
  		else if (Util.#__isObject(target))
  		{
  			return Util.#__cloneObj(target);
  		}
  		else
  		{
  			return target;
  		}

  	}

  	// -----------------------------------------------------------------------------

  	/**
  	 * Get the class name from tag name.
  	 *
  	 * @param	{String}		tagName				Tag name.
  	 *
  	 * @return  {String}		Class name.
  	 */
  	static getClassNameFromTagName(tagName)
  	{

  		let className;

  		if (tagName === "bm-unit")
  		{
  			className = "Unit";
  		}
  		else
  		{
  			let tag = tagName.split("-");
  			className = tag[0].charAt(0).toUpperCase() + tag[0].slice(1).toLowerCase() + tag[1].charAt(0).toUpperCase() + tag[1].slice(1).toLowerCase();
  		}

  		return className;

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Get tag name from class name.
  	 *
  	 * @param	{String}		className			Class name.
  	 *
  	 * @return 	{String}		Tag name.
  	 */
  	static getTagNameFromClassName(className)
  	{

  		let pos;
  		let result = className;
  		let c = className.split(".");
  		let cName = c[c.length - 1];

  		for (pos = 1; pos < cName.length; pos++)
  		{
  			if ( Util.#__isUpper(cName.substring(pos, pos + 1)) )
  			{
  				break;
  			}
  		}

  		if ( pos < cName.length )
  		{
  			result = cName.substring(0, pos).toLowerCase() + "-" + cName.substring(pos).toLowerCase();
  		}

  		return result;

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Assert conditions. Throws an error when assertion failed.
  	 *
  	 * @param	{Boolean}		conditions			Conditions.
  	 * @param	{String/Function}	Message			Error message or Function that return the message.
  	 * @param	{Error}			error				Error to throw.
  	 * @param	{Options}		options				Options.
  	 *
  	 * @return 	{Boolean}		True if it is upper case.
  	 */
  	static assert(conditions, msg, error, options)
  	{

  		if (!conditions)
  		{
  			error = error || Error;
  			msg = (typeof(msg) === "function" ? msg() : msg);
  			let e = new error(msg);

  			// Remove last stack (assert() itself)
  			let stacks = e.stack.split("\n");
  			stacks.splice(1, 1);
  			e.stack = stacks.join("\n");

  			throw e;
  		}

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Warns when condition failed.
  	 *
  	 * @param	{Boolean}		conditions			Conditions.
  	 * @param	{String/Function}	Message			Error message or Function that return the message.
  	 * @param	{String}		level				Warn level.
  	 * @param	{Options}		options				Options.
  	 *
  	 * @return 	{Boolean}		True if it is upper case.
  	 */
  	static warn(conditions, msg, level, options)
  	{

  		let ret = true;
  		msg = (typeof(msg) === "function" ? msg() : msg);

  		if (!conditions)
  		{
  			level = level || "warn";
  			console[level](msg);

  			ret = false;
  		}

  		return ret;

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Return a promise that resolved after random milliseconds.
  	 *
  	 * @param	{Integer}		max					Maximum time in milliseconds.
  	 *
  	 * @return 	{Promise}		Promise.
  	 */
  	static randomWait(max, fixed)
  	{

  		let timeout = ( fixed ? max : Math.floor(Math.random() * max ) );

  		return new Promise((resolve, reject) => {
  			setTimeout(() => {
  				resolve();
  			}, timeout);
  		});

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Execute query on root node excluding nested components inside.
  	 *
  	 * @param	{HTMLElement}	rootNode			Root node.
  	 * @param	{String}		query				Query.
  	 *
  	 * @return  {Array}			Array of matched elements.
  	 */
      static scopedSelectorAll(rootNode, query, options)
      {

  		let targetNode = ( rootNode === Unit || rootNode instanceof Unit ? rootNode.get("inventory", "basic.unitRoot") : rootNode );
          let newQuery = ( targetNode instanceof DocumentFragment ? query : ":scope " + query.replace(",", ",:scope "));
          let allElements = targetNode.querySelectorAll(newQuery);
  		let allSet = new Set(allElements);
  		/*
  		if (rootNode.matches(query))
  		{
  			allSet.add(rootNode);
  		}
  		*/

  		if (!options || !options["penetrate"])
  		{
  			// Remove elements descendant of other components unless penetrate option is set
  			let removeQuery = ( targetNode instanceof DocumentFragment  ?  "[bm-powered] " + query.replace(",", ", [bm-powered] ") : ":scope [bm-powered] " + query.replace(",", ", :scope [bm-powered] " ));
  			let removeElements = targetNode.querySelectorAll(removeQuery);

  			let removeSet = new Set(removeElements);
  			removeSet.forEach((item) => {
  				allSet.delete(item);
  			});
  		}

          return Array.from(allSet);

      }

  	// -------------------------------------------------------------------------

  	/**
  	 * Convert given target to Javascript object if possible.
  	 *
  	 * @param	{*}				target					Target to convert to an object.
  	 * @param	{Object}		options					Options.
  	 *
  	 * @return  {Object}		Object.
  	 */
  	static getObject(target, options)
  	{

  		let ret;

  		if (Util.#__isObject(target))
  		{
  			ret = target;
  		}
  		else if (typeof(target) === "string")
  		{
  			// String
  			if (options && options["format"] === "js")
  			{
  				// Javascript Object
  				ret = Util.safeEval(target, options && options["bindTo"]);
  			}
  			else
  			{
  				// JSON
  				ret = JSON.parse(target);
  			}
  		}

  		return ret;

  	}

  	// -------------------------------------------------------------------------
  	//  Privates
  	// -------------------------------------------------------------------------

  	/**
  	 * Check if character is upper case.
  	 *
  	 * @param	{String}		c					Character.
  	 *
  	 * @return 	{Boolean}		True if it is upper case.
  	 */
  	static #__isUpper(c)
  	{

  		return c === c.toUpperCase() && c !== c.toLowerCase();

  	}

  	// -----------------------------------------------------------------------------

  	/**
  	 * Follow keys and create missing intermediate objects.
  	 *
  	 * @param	{Object}		store				Object.
  	 * @param	{Array}			keys				Array of keys to follow.
  	 *
  	 * @return	{Object}		Object.
  	 */
  	static #__createIntermediateObject(store, keys)
  	{

  		let current = store;

  		for (let i = 0; i < keys.length - 1; i++)
  		{
  			Util.assert(current !== null && typeof current === "object",
  				() => `Util.safeSet(): Can't create an intermediate object. Non-object value already exists. existingKey=${( i > 0 ? keys[i-1] : "" )}, existingValue=${current}`, TypeError);

  			if (!(keys[i] in current))
  			{
  				current[keys[i]] = {};
  			}

  			current = current[keys[i]];
  		}

  		return current;

  	}

  	// -----------------------------------------------------------------------------

  	/**
  	 * Clone an object.
  	 *
  	 * @param	{Object}		target					Target object.
  	 *
  	 * @return  {Object}		Cloned object.
  	 */
  	static #__cloneObj(target)
  	{

  		let result = {};

  		Object.keys(target).forEach((key) => {
  			result[key] = Util.deepClone(target[key]);
  		});

  		return result;

  	}

  	// -----------------------------------------------------------------------------

  	/**
  	 * Clone an array.
  	 *
  	 * @param	{Object}		target					Target array.
  	 *
  	 * @return  {Object}		Cloned array.
  	 */
  	static #__cloneArr(target)
  	{

  		let result = [];

  		for (let i = 0; i < target.length; i++)
  		{
  			result.push(Util.deepClone(target[i]));
  		}

  		return result;

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Check if the target is object or not.
  	 *
  	 * @param	{Object}		target					Target item.
  	 *
  	 * @return  {Boolean}		True if object.
  	 */
  	static #__isObject(target)
  	{

  		let type = typeof target;
  		let conName = (target && target.constructor && target.constructor.name);

  		return (target !== null && conName === "Object" && type !== "function");

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Check if the target is mergeable object or not.
  	 *
  	 * @param	{Object}		target					Target item.
  	 *
  	 * @return  {Boolean}		True if mergeable.
  	 */
  	static #__isMergeable(target)
  	{

  		return Util.#__isObject(target) || Array.isArray(target);

  	}

  }

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
  //	Loader util class
  // =============================================================================

  class ClassUtil
  {

  	// -------------------------------------------------------------------------
  	//  Methods
  	// -------------------------------------------------------------------------

  	/**
  	 * Define new unit in ES5 way.
  	 *
  	 * @param	{String}		className			Class name.
  	 * @param	{Object}		settings			Unit Settings.
  	 * @param	{Object}		superClass			Super class.
  	 * @param	{String}		tagName				Tag name.
  	 */
  	static newUnit(className, settings, superClass, tagName)
  	{

  		superClass = ( superClass ? superClass : Unit );

  		// Define class
  		let funcDef = "{ return Reflect.construct(superClass, [], this.constructor); }";
  		let classDef = Function("superClass", `return function ${ClassUtil.#__validateClassName(className)}()${funcDef}`)(superClass);
  		ClassUtil.inherit(classDef, superClass);

  		// Class settings
  		settings = settings || {};
  		settings.setting = ( settings.setting ? settings.setting : {} );
  		classDef.prototype._getSettings = function() {
  			return settings;
  		};

  		// Define tag
  		if (tagName)
  		{
  			customElements.define(tagName.toLowerCase(), classDef);
  		}

  		return classDef;

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Inherit the unit in ES5 way.
  	 *
  	 * @param	{Object}		subClass			Sub class.
  	 * @param	{Object}		superClass			Super class.
  	 */
  	static inherit(subClass, superClass)
  	{

  		subClass.prototype = Object.create(superClass.prototype);
  		subClass.prototype.constructor = subClass;
  //		Object.setPrototypeOf(subClass, superClass); // Disabled for performance sake

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Get the class.
  	 *
  	 * @param	{String}		className			Class name.
  	 *
  	 * @return  {Object}		Class object.
  	 */
  	static getClass(className)
  	{

  		let ret;

  		if (!ret)
  		{
  			try
  			{
  				ret = Function(`return (${ClassUtil.#__validateClassName(className)})`)();
  			}
  			catch(e)
  			{
  				if (!(e instanceof ReferenceError))
  				{
  					throw e;
  				}
  			}
  		}

  		return ret;

  	}

  	// -------------------------------------------------------------------------
  	//  Privates
  	// -------------------------------------------------------------------------

  	/**
  	 * Validate class name.
  	 *
  	 * @param	{String}		className			Class name.
  	 *
  	 * @return  {String}		Class name when valid. Throws an exception when not valid.
  	 */
  	static #__validateClassName(className)
  	{

  		let result = /^[a-zA-Z0-9\-\._]+$/.test(className);
  		Util.assert(result, () => `ClassUtil.#__validateClassName(): Class name '${className}' is not valid.`, TypeError);

  		return className;

  	}

  }

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
  //	Ajax util class
  // =============================================================================

  class AjaxUtil
  {

  	// -------------------------------------------------------------------------
  	//  Methods
  	// -------------------------------------------------------------------------

  	/**
  	 * Make an ajax request.
  	 *
  	 * @param	{Object}		options				Request options.
  	 *
  	 * @return  {Promise}		Promise.
  	 */
  	static ajaxRequest(options)
  	{

  		return new Promise((resolve, reject) => {
  			let url = Util.safeGet(options, "URL");
  			let method = Util.safeGet(options, "method");
  			let data = Util.safeGet(options, "data", "");
  			let headers = Util.safeGet(options, "headers");
  			let xhrOptions = Util.safeGet(options, "options");

  			let xhr = new XMLHttpRequest();
  			xhr.open(method, url, true);

  			// options
  			if (xhrOptions)
  			{
  				Object.keys(xhrOptions).forEach((option) => {
  					xhr[option] = xhrOptions[option];
  				});
  			}

  			// extra headers
  			if (headers)
  			{
  				Object.keys(headers).forEach((header) => {
  					xhr.setRequestHeader(header, headers[header]);
  				});
  			}

  			// callback (load)
  			xhr.addEventListener("load", () => {
  				if (xhr.status === 200 || xhr.status === 201)
  				{
  					resolve(xhr);
  				}
  				else
  				{
  					reject(xhr);
  				}
  			});

  			// callback (error)
  			xhr.addEventListener("error", () => {
  				reject(xhr);
  			});

  			// send
  			xhr.send(data);
  		});

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Load a Javascript file.
  	 *
  	 * @param	{String}		url					Javascript url.
  	 * @param	{Object}		options				Load Options.
  	 *
  	 * @return  {Promise}		Promise.
  	 */
  	static loadScript(url, options)
  	{

  		return new Promise((resolve, reject) => {
  			let script = document.createElement('script');
  			script.src = url;
  			script.async = true;
  			if (options && options["type"])
  			{
  				script.type = options["type"];
  			}

  			script.onload = () => {
  				resolve();
  			};

  			script.onerror = (e) => {
  				reject(e);
  			};

  			document.head.appendChild(script);
  		});

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Load a JSON or Javascript Object file.
  	 *
  	 * @param	{String}		url					JSON URL.
  	 * @param	{Object}		options				Load Options.
  	 *
  	 * @return  {Promise}		Promise.
  	 */
  	static loadJSON(url, options)
  	{

  		let format = Util.safeGet(options, "format", url.split('?')[0].split('.').pop());

  		console.debug(`AjaxUtil.loadJSON(): Loading a JSON file. URL=${url}, format=${format}`);

  		return AjaxUtil.ajaxRequest({URL:url, method:"GET"}).then((xhr) => {
  			console.debug(`AjaxUtil.loadJSON(): Loaded the JSON file. URL=${url}, format=${format}`);

  			return Util.getObject(xhr.responseText, Object.assign({"format":format}, options));
  		});

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Load a Text file.
  	 *
  	 * @param	{String}		url					HTML URL without extension.
  	 * @param	{Object}		options				Load Options.
  	 *
  	 * @return  {Promise}		Promise.
  	 */
  	static loadText(url, options)
  	{

  		console.debug(`AjaxUtil.loadText(): Loading a Text file. URL=${url}`);

  		return AjaxUtil.ajaxRequest({URL:url, method:"GET"}).then((xhr) => {
  			console.debug(`AjaxUtil.loadText(): Loaded the Text file. URL=${url}`);

  			return xhr.responseText;
  		});

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Load an HTML file.
  	 *
  	 * @param	{String}		url					HTML URL.
  	 * @param	{Object}		options				Load Options.
  	 *
  	 * @return  {Promise}		Promise.
  	 */
  	static loadHTML(url, options)
  	{

  		console.debug(`AjaxUtil.loadHTML(): Loading the HTML file. URL=${url}`);

  		return AjaxUtil.ajaxRequest({URL:url, method:"GET"}).then((xhr) => {
  			console.debug(`AjaxUtil.loadHTML(): Loaded the HTML file. URL=${url}`);

  			return xhr.responseText;
  		});

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Load a CSS file.
  	 *
  	 * @param	{String}		url					CSS URL.
  	 * @param	{Object}		options				Load Options.
  	 *
  	 * @return  {Promise}		Promise.
  	 */
  	static loadCSS(url, options)
  	{

  		console.debug(`AjaxUtil.loadCSS(): Loading the CSS file. URL=${url}`);

  		return AjaxUtil.ajaxRequest({URL:url, method:"GET"}).then((xhr) => {
  			console.debug(`AjaxUtil.loadCSS(): Loaded the CSS file. URL=${url}`);

  			return xhr.responseText;
  		});

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Load class files.
  	 *
  	 * @param	{String}		url					Class URL without extension.
  	 * @param	{Object}		options				Load Options.
  	 *
  	 * @return  {Promise}		Promise.
  	 */
  	static loadClass(url, options)
  	{

  		console.debug(`AjaxUtil.loadClass(): Loading class files. URL=${url}`);

  		let url1 = url + ".js";
  		console.debug(`AjaxUtil.loadClass(): Loading the first file. URL1=${url1}`);

  		return Promise.resolve().then(() => {
  			return AjaxUtil.loadScript(url1, options);
  			/*
  		}).then(() => {
  			if (options["splitClass"])
  			{
  				let url2 = url + ".settings.js";
  				console.debug(`AjaxUtil.loadClass(): Loading the second file. URL2=${url2}`);
  				return AjaxUtil.loadScript(url2, options);
  			}
  			*/
  		}).then(() => {
  			console.debug(`AjaxUtil.loadClass(): Loaded the class files. URL=${url}`);
  		});

  	}

  }

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
  //	URL Util Class
  // =============================================================================

  class URLUtil
  {

  	/**
  	 * Create options array from the current url.
  	 *
  	 * @param	{String}		url					URL.
  	 *
  	 * @return  {Array}			Parameters array.
  	 */
  	static loadParameters(url)
  	{

  		url = url || window.location.href;
  		let vars = {};
  		let hash;
  		let value;

  		if (window.location.href.indexOf("?") > -1)
  		{
  			let hashes = url.slice(url.indexOf('?') + 1).split('&');

  			for(let i = 0; i < hashes.length; i++) {
  				hash = hashes[i].split('=');
  				if (hash[1]){
  					value = hash[1].split('#')[0];
  				} else {
  					value = hash[1];
  				}
  				vars[hash[0]] = decodeURIComponent(value);
  			}
  		}

  		return vars;

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Build url from route info.
  	 *
  	 * @param	{Object}		routeInfo			Route information.
  	 * @param	{Object}		options				Options.
  	 *
  	 * @return  {String}		URL.
  	 */
  	static buildURL(routeInfo, options)
  	{

  		let newURLInfo = Object.assign({}, URLUtil.parseURL(), routeInfo);
  		let url = (routeInfo["URL"] ? routeInfo["URL"] : Util.concatPath([newURLInfo["protocol"] + "//", newURLInfo["host"], newURLInfo["pathname"]]));

  		if (newURLInfo["queryParameters"])
  		{
  			let params = {};
  			if (options && options["mergeParameters"])
  			{
  				params = Object.assign(params, URLUtil.loadParameters());
  			}
  			params = Object.assign(params, newURLInfo["queryParameters"]);
  			url += URLUtil.buildQuery(params);
  		}
  		else
  		{
  			url += newURLInfo["query"];
  		}

  		return ( url ? url : "/" );

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Build query string from the options object.
  	 *
  	 * @param	{Object}		options				Query options.
  	 *
  	 * @return	{String}		Query string.
  	 */
  	static buildQuery(options)
  	{

  		let query = "";

  		if (options)
  		{
  			query = Object.keys(options).reduce((result, current) => {
  				if (Array.isArray(options[current]))
  				{
  					result += `${encodeURIComponent(current)}=${encodeURIComponent(options[current].join())}&`;
  				}
  				else if (options[current])
  				{
  					result += `${encodeURIComponent(current)}=${encodeURIComponent(options[current])}&`;
  				}

  				return result;
  			}, "");
  		}

  		return ( query ? `?${query.slice(0, -1)}` : "");

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Parse URL.
  	 *
  	 * @param	{String}		url					URL to parse.
  	 *
  	 * @return 	{Object}		Object contains each URL part.
  	 */
  	static parseURL(url)
  	{

  		url = url || window.location.href;
  		let parsed = new URL(url, window.location.href);
  		let ret = {
  			"protocol": parsed.protocol,
  			"username":	parsed.username,
  			"password":	parsed.password,
  			"host":		parsed.host,
  			"hostname": parsed.hostname,
  			"port":		parsed.port,
  			"pathname":	parsed.pathname,
  			"path":		parsed.pathname.substring(0, parsed.pathname.lastIndexOf("/") + 1),
  			"search": 	parsed.search,
  			"query": 	parsed.search,
  			"hash": 	parsed.hash,
  			"filename":	parsed.pathname.split("/").pop(),
  			"queryParameters": URLUtil.loadParameters(url),
  		};
  		ret["filenameWithoutExtension"] = ret["filename"].split(".")[0];
  		ret["extension"] = ret["filename"].split(".").pop();

  		return ret;

  	}

  }

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
  //	Store class
  // =============================================================================

  class Store
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

  		// Init
  		this._options = options || {};
  		this._items = Util.safeGet(options, "items", {});
  		this.merger = Util.safeGet(options, "merger", Util.deepMerge);

  	}

  	// -------------------------------------------------------------------------
  	//  Setter/Getter
  	// -------------------------------------------------------------------------

  	/**
  	 * Options.
  	 *
  	 * @type	{Object}
  	 */
  	get options()
  	{

  		return this._options;

  	}

  	set options(value)
  	{

  		this._options = value;

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Items.
  	 *
  	 * @type	{String}
  	 */
  	get items()
  	{

  		return this.clone();

  	}

  	set items(value)
  	{

  		this._items = value;

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Merge function.
  	 *
  	 * @type	{Function}
  	 */
  	get merger()
  	{

  		this._merger;

  	}

  	set merger(value)
  	{

  		Util.assert(typeof value === "function", `Store.merger(setter): Merger is not a function. merger=${value}`, TypeError);

  		this._merger = value;

  	}

  	// -------------------------------------------------------------------------
  	//  Method
  	// -------------------------------------------------------------------------

  	/**
       * Clear.
       *
  	 * @param	{Object}		component			Component to attach.
  	 * @param	{Object}		options				Plugin options.
       */
  	clear()
  	{

  		this._items = {};

  	}

  	// -------------------------------------------------------------------------

  	/**
       * Clone contents as an object.
       *
  	 * @return  {Object}		Cloned items.
       */
  	clone()
  	{

  		return Util.deepMerge({}, this._items);

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Merge items.
  	 *
  	 * @param	{Array/Object}	newItems			Array/Object of Items to merge.
  	 * @param	{Function}		merger				Merge function.
  	 */
  	merge(newItems, merger)
  	{

  		merger = merger || this._merger;
  		let items = (Array.isArray(newItems) ? newItems: [newItems]);

  		for (let i = 0; i < items.length; i++)
  		{
  			this._items = merger(this._items, items[i]);
  		}

  	}

  	// -----------------------------------------------------------------------------

  	/**
  	 * Get the value from store. Return default value when specified key is not available.
  	 *
  	 * @param	{String}		key					Key to get.
  	 * @param	{Object}		defaultValue		Value returned when key is not found.
  	 *
  	 * @return  {*}				Value.
  	 */
  	get(key, defaultValue)
  	{

  		return Util.deepClone(Util.safeGet(this._items, key, defaultValue));

  	}

  	// -----------------------------------------------------------------------------

  	/**
  	 * Set the value to the store. If key is empty, it sets the value to the root.
  	 *
  	 * @param	{String}		key					Key to store.
  	 * @param	{Object}		value				Value to store.
  	 */
  	set(key, value, options)
  	{

  		Util.safeSet(this._items, key, value);

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Remove from the list.
  	 *
  	 * @param	{String}		key					Key to store.
  	 */
  	remove(key)
  	{

  		Util.safeRemove(this._items, key);

  	}

  	// -----------------------------------------------------------------------------

  	/**
  	 * Check if the store has specified key.
  	 *
  	 * @param	{String}		key					Key to check.
  	 *
  	 * @return	{Boolean}		True:exists, False:not exists.
  	 */
  	has(key)
  	{

  		return Util.safeHas(this._items, key);

  	}

  }

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
  //	Chainable store class
  // =============================================================================

  class ChainableStore extends Store
  {

  	// -------------------------------------------------------------------------
  	//  Constructor
  	// -------------------------------------------------------------------------

  	/**
       * Constructor.
       *
  	 * @param	{Object}		options				Options.
  	 * @param	{Store}			chain				Store Component to chain.
       */
  	constructor(options)
  	{

  		super(options);

  		// Init vars
  		this._chain;

  		// Chain
  		let chain = Util.safeGet(this._options, "chain");
  		if (chain)
  		{
  			this.chain(chain);
  		}

  	}

  	// -------------------------------------------------------------------------
  	//  Setter/Getter
  	// -------------------------------------------------------------------------

  	/**
  	 * Local items.
  	 *
  	 * @type	{Object}
  	 */
  	get localItems()
  	{

  		return Store.prototype.clone.call(this);

  	}

  	// -------------------------------------------------------------------------
  	//  Method
  	// -------------------------------------------------------------------------

  	/**
       * Clone contents as an object (Override).
       *
  	 * @return  {Object}		Cloned items.
       */
  	clone()
  	{

  		if (this._chain)
  		{
  			return Util.deepMerge(this._chain.clone(), this._items);
  		}
  		else
  		{
  			return Store.prototype.clone.call(this);
  		}

  	}

  	// -------------------------------------------------------------------------

  	/**
       * Chain another store.
       *
  	 * @param	{Store}			store				Store to chain.
       */
  	chain(store)
  	{

  		this._chain = store;

  	}

  	// -----------------------------------------------------------------------------

  	/**
  	 * Get the value from store. If chained, return from chained store when not available.
  	 * Return default value when not available in both stores.
  	 * When both has keys, then they are deep merged. Note that they are merged only when
  	 * chain has mergeable value, an object or an array.
  	 *
  	 * @param	{String}		key					Key to get.
  	 * @param	{Object}		defaultValue		Value returned when key is not found.
  	 *
  	 * @return  {*}				Value.
  	 */
  	get(key, defaultValue)
  	{

  		let result = defaultValue;

  		if (Store.prototype.has.call(this, key) && this._chain && Store.prototype.has.call(this._chain, key))
  		{
  			// Both has key then deep merge
  			result = Util.deepMerge(Store.prototype.get.call(this._chain, key), Store.prototype.get.call(this, key));
  		}
  		else if (Store.prototype.has.call(this, key))
  		{
  			// Only this has key
  			result = Store.prototype.get.call(this, key, defaultValue);
  		}
  		else if (this._chain)
  		{
  			// Only chain has key
  			result = this._chain.get(key, defaultValue);
  		}

  		return result;

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Merge items.
  	 *
  	 * @param	{Array/Object}	newItems			Array/Object of Items to merge.
  	 * @param	{Function}		merger				Merge function.
  	 * @param	{Object}		options				Options.
  	 */
  	merge(newItems, merger, options)
  	{

  		if (Util.safeGet(options, "writeThrough", this._options["writeThrough"]))
  		{
  			this._chain.merge(newItems, merger);
  		}
  		else
  		{
  			Store.prototype.merge.call(this, newItems, merger);
  		}

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Set the value to the store. If key is empty, it sets the value to the root.
  	 *
  	 * @param	{String}		key					Key to store.
  	 * @param	{Object}		value				Value to store.
  	 * @param	{Object}		options				Options.
  	 */
  	set(key, value, options)
  	{

  		if (Util.safeGet(options, "writeThrough", this._options["writeThrough"]))
  		{
  			this._chain.set(key, value, options);
  		}
  		else
  		{
  			Store.prototype.set.call(this, key, value, options);
  		}

  	}

  	// -----------------------------------------------------------------------------

  	/**
  	 * Check if the store has specified key.
  	 *
  	 * @param	{String}		key					Key to check.
  	 *
  	 * @return	{Boolean}		True:exists, False:not exists.
  	 */
  	has(key)
  	{

  		let result = Util.safeHas(this._items, key);

  		if (result === false && this._chain)
  		{
  			result = this._chain.has(key);
  		}

  		return result;

  	}

  }

  // =============================================================================
  /**
   * BitsmistJS - Javascript Web Client Framework
   *
   * @copyright		Masaki Yasutake
   * @link			https://bitsmist.com/
   * @license			https://github.com/bitsmist/bitsmist/blob/main/LICENSE
   */
  // =============================================================================


  // =============================================================================
  //	Base Perk Class
  // =============================================================================

  class Perk
  {

  	// -------------------------------------------------------------------------
  	//  Private Variables
  	// -------------------------------------------------------------------------

  	static #__perks = {}
  	static #__sections = {};
  	static #__handlers = {"common": {}};
  	static #__info = {
  		"sectionName":		"perk",
  		"order":			0,
  	};

  	// -------------------------------------------------------------------------
  	//  Properties
  	// -------------------------------------------------------------------------

  	/**
  	 * Perk info.
  	 *
  	 * @type	{Object}
  	 */
  	static get info()
  	{

  		return Perk.#__info;

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Promise that is resolved when Perk is ready.
  	 *
  	 * @type	{Object}
  	 */
  	static get ready()
  	{

  		return Promise.resolve();

  	}

  	// -------------------------------------------------------------------------
  	//  Methods
  	// -------------------------------------------------------------------------

  	/**
  	 *  Initialize an perk and Unit class when the perk is registered.
  	 *
  	 * @param	{Unit}			unit				Unit.
  	 * @param	{Object}		options				Options.
  	 *
  	 * @return 	{Promise}		Promise.
  	 */
  	static globalInit()
  	{

  		if (this === Perk)
  		{
  			Unit.upgrade("spell", "perk.attachPerks", Perk.#_attachPerks);
  			Unit.upgrade("spell", "perk.attach", Perk.#_attach);
  		}

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 *  Initialize an attached unit when perk is attached.
  	 *
  	 * @param	{Unit}			unit				Unit.
  	 * @param	{Object}		options				Options.
  	 *
  	 * @return 	{Promise}		Promise.
  	 */
  	static init(unit, options)
  	{
  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Deinitialize the unit when perk is detached.
  	 *
  	 * @param	{Unit}			unit				Unit.
  	 * @param	{Object}		options				Options.
  	 *
  	 * @return 	{Promise}		Promise.
  	 */
  	static deinit(unit, options)
  	{
  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Register the perk.
  	 *
  	 * @param	{Perk}		perk			Perk to register.
  	 */
  	static registerPerk(perk)
  	{

  		let info = perk.info;
  		info["sectionName"] = info["sectionName"];
  		info["order"] = ("order" in info ? info["order"] : 500);
  		info["depends"] = info["depends"] || [];
  		info["depends"] = ( Array.isArray(info["depends"]) ? info["depends"] : [info["depends"]] );

  		Perk.#__perks[perk.name] = {
  			"name":			perk.name,
  			"object":		perk,
  			"sectionName":	info["sectionName"],
  			"order":		info["order"],
  			"depends":		info["depends"],
  		};

  		// Create target word index
  		Perk.#__sections[info["sectionName"]] = Perk.#__perks[perk.name];

  		// Global init
  		return perk.globalInit();

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Get the perk.
  	 *
  	 * @param	{String}	perkName		Perk name.
  	 */
  	static getPerk(perkName)
  	{

  		Util.assert(perkName in Perk.#__perks, () => `Perk "${perkName}" doesn't exist.`);

  		return Perk.#__perks[perkName].object;

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Get the perk from the section name.
  	 *
  	 * @param	{String}	sectionName		Section name.
  	 */
  	static getPerkFromSectionName(sectionName)
  	{

  		Util.assert(sectionName in Perk.#__sections, () => `Perk for section "${sectionName}" doesn't exist.`);

  		return Perk.#__sections[sectionName].object;

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Register the handler.
  	 *
  	 * @param	{Function}	handler			Handler to register.
  	 */
  	static registerHandler(handler, perkName)
  	{

  		perkName = perkName || this.name;

  		if (!Perk.#__handlers[perkName])
  		{
  			Perk.#__handlers[perkName] = {};
  		}

  		Perk.#__handlers[perkName][handler.name] = handler;

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Create the handler.
  	 *
  	 * @param	{String}	handlerName		Handler name.
  	 * @param	{*}			...args			Arguments to the handler constructor.
  	 */
  	static createHandler(handlerName, ...args)
  	{

  		let handler = (Perk.#__handlers[this.name] && Perk.#__handlers[this.name][handlerName]) || Perk.#__handlers["common"][handlerName];

  		Util.assert(handler, () => `Perk.createHandler(): Handler '${handlerName}' is not registered.`, ReferenceError);

  		return new handler(...args);

  	}

  	// -------------------------------------------------------------------------
  	//  Spells (Unit)
  	// -------------------------------------------------------------------------

  	/**
  	 * Attach new perks to unit according to settings.
  	 *
  	 * @param	{Unit}			unit				Unit.
  	 * @param	{Object}		options				Options.
  	 */
  	static #_attachPerks(unit, options)
  	{

  		let settings = options["settings"];
  		let chain = Promise.resolve();
  		let targets = Perk.#__listNewPerks(unit, settings);

  		Perk.#__sortItems(targets).forEach((perkName) => {
  			chain = chain.then(() => {
  				return Perk.#_attach(unit, Perk.#__perks[perkName].object, options);
  			});
  		});

  		return chain;

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Attach a perk to the unit.
  	 *
  	 * @param	{Unit}			unit				Unit to be attached.
  	 * @param	{Perk}			perk				Perk to attach.
  	 * @param	{Object}		options				Options.
  	 *
  	 * @return 	{Promise}		Promise.
  	 */
  	static #_attach(unit, perk, options)
  	{

  		if (!unit.assets["perk"][perk.name])
  		{
  			// Attach dependencies first
  			let deps = Perk.#__perks[perk.name]["depends"];
  			for (let i = 0; i < deps.length; i++)
  			{
  				Perk.#_attach(unit, Perk.#__perks[deps[i]].object, options);
  			}
  			unit.assets["perk"][perk.name] = perk;

  			return perk.init(unit, options);
  		}

  	}

  	// ------------------------------------------------------------------------
  	//  Privates
  	// ------------------------------------------------------------------------

  	/**
  	 * List not-attached perks according to settings.
  	 *
  	 * @param	{Unit}			unit				Unit.
  	 * @param	{Object}		settings			Settings.
  	 */
  	static #__listNewPerks(unit, settings)
  	{

  		let targets = {};
  		Promise.resolve();

  		// List new perks from "perk" section
  		let perks = Util.safeGet(settings, "perk.options.apply");
  		if (perks)
  		{
  			for (let i = 0; i < perks.length; i++)
  			{
  				let perkName = perks[i];
  				Util.assert(Perk.#__perks[perkName], `Perk.#__listNewPerk(): Perk not found. name=${unit.tagName}, perkName=${perkName}`);
  				if (!unit.assets["perk"][perkName])
  				{
  					targets[perkName] = Perk.#__perks[perkName];
  				}
  			}
  		}

  		// List new perks from settings keyword
  		Object.keys(settings).forEach((key) => {
  			let perkInfo = Perk.#__sections[key];

  			if (perkInfo && !unit.assets["perk"][perkInfo.name])
  			{
  				targets[perkInfo.name] = perkInfo;
  			}
  		});

  		return targets;

  	}

  	// ------------------------------------------------------------------------

  	/**
  	 * Sort item keys.
  	 *
  	 * @param	{Object}		observerInfo		Observer info.
  	 *
  	 * @return  {Array}			Sorted keys.
  	 */
  	static #__sortItems(perks)
  	{

  		return Object.keys(perks).sort((a,b) => {
  			return perks[a]["order"] - perks[b]["order"];
  		})

  	}

  }

  // =============================================================================
  /**
   * BitsmistJS - Javascript Web Client Framework
   *
   * @copyright		Masaki Yasutake
   * @link			https://bitsmist.com/
   * @license			https://github.com/bitsmist/bitsmist/blob/main/LICENSE
   */
  // =============================================================================


  // =============================================================================
  //	Basic Perk Class
  // =============================================================================

  class BasicPerk extends Perk
  {

  	// -------------------------------------------------------------------------
  	//  Private Variables
  	// -------------------------------------------------------------------------

  	static #__ready;
  	static #__ready_resolve;
  	static #__unitInfo = {};
  	static #__indexes = {
  		"tagName":			{},
  		"className":		{},
  		"id":				{},
  	};
  	static #__info = {
  		"sectionName":		"basic",
  		"order":			0,
  	};

  	// -------------------------------------------------------------------------
  	//  Properties
  	// -------------------------------------------------------------------------

  	static get info()
  	{

  		return BasicPerk.#__info;

  	}

  	// -------------------------------------------------------------------------

  	static get ready()
  	{

  		return BasicPerk.#__ready;

  	}

  	// -------------------------------------------------------------------------
  	//  Methods
  	// -------------------------------------------------------------------------

  	static globalInit()
  	{

  		// Init Vars
  		BasicPerk.#__ready = new Promise((resolve, reject) => {
  			BasicPerk.#__ready_resolve = resolve;
  		});

  		// Upgrade Unit
  		Unit.upgrade("asset", "inventory", new ChainableStore());
  		Unit.upgrade("asset", "skill", new ChainableStore());
  		Unit.upgrade("asset", "spell", new ChainableStore());
  		Unit.upgrade("callback", "initializeCallback", BasicPerk.#_initializeHandler.bind(BasicPerk));
  		Unit.upgrade("callback", "connectedCallback", BasicPerk.#_connectedHandler.bind(BasicPerk));
  		Unit.upgrade("callback", "disconnectedCallback", BasicPerk.#_disconnectedHandler.bind(BasicPerk));
  		Unit.upgrade("callback", "adoptedCallback", BasicPerk.#_connectedHandler.bind(BasicPerk));
  		Unit.upgrade("callback", "attributeChangedCallback", BasicPerk.#_attributeChangedHandler.bind(BasicPerk));
  		Unit.upgrade("method", "use", BasicPerk.#_use);
  		Unit.upgrade("method", "cast", BasicPerk.#_cast);
  		Unit.upgrade("skill", "basic.scan", BasicPerk.#_scan);
  		Unit.upgrade("skill", "basic.scanAll", BasicPerk.#_scanAll);
  		Unit.upgrade("skill", "basic.locate", BasicPerk.#_locate);
  		Unit.upgrade("skill", "basic.locateAll", BasicPerk.#_locateAll);
  		Unit.upgrade("spell", "basic.start", BasicPerk.#_start);
  		Unit.upgrade("spell", "basic.stop", BasicPerk.#_stop);
  		Unit.upgrade("spell", "basic.transform", BasicPerk.#_transform);
  		Unit.upgrade("spell", "basic.setup", BasicPerk.#_setup);
  		Unit.upgrade("spell", "basic.refresh", BasicPerk.#_refresh);
  		Unit.upgrade("spell", "basic.fetch", BasicPerk.#_fetch);
  		Unit.upgrade("spell", "basic.fill", BasicPerk.#_fill);
  		Unit.upgrade("spell", "basic.clear", BasicPerk.#_clear);

  		// Set Unit's unitRoot to document.body when document is ready
  		if ((document.readyState === "interactive" || document.readyState === "complete"))
  		{
  			Unit.set("inventory", "basic.unitRoot", document.body);
  			BasicPerk.#__ready_resolve();
  			BasicPerk.#__ready_resolve = null;
  		}
  		else
  		{
  			document.addEventListener("DOMContentLoaded", () => {
  				Unit.set("inventory", "basic.unitRoot", document.body);
  				BasicPerk.#__ready_resolve();
  				BasicPerk.#__ready_resolve = null;
  			});
  		}

  	}

  	// -------------------------------------------------------------------------
  	//  Callbacks (Unit)
  	// -------------------------------------------------------------------------

  	/**
  	 * Initialize callback handler.
  	 */
  	static #_initializeHandler(unit)
  	{

  		// Register unit
  		BasicPerk.#__register(unit);

  		// Upgrade unit
  		unit.upgrade("asset", "perk", {});
  		unit.upgrade("asset", "inventory", new ChainableStore({"chain":Unit.assets["inventory"]}));
  		unit.upgrade("asset", "skill", new ChainableStore({"chain":Unit.assets["skill"]}));
  		unit.upgrade("asset", "spell", new ChainableStore({"chain":Unit.assets["spell"]}));
  		unit.upgrade("method", "use", BasicPerk.#_use);
  		unit.upgrade("method", "cast", BasicPerk.#_cast);
  		unit.upgrade("inventory", "basic.unitRoot", unit);

  		// Attach default perks
  		let chain = Promise.resolve();
  		["BasicPerk", "SettingPerk","UnitPerk","StatusPerk","EventPerk", "SkinPerk", "StylePerk"].forEach((perkName) => {
  			chain = chain.then(() => {
  				return unit.cast("perk.attach", Perk.getPerk(perkName));
  			});
  		});

  		return chain.then(() => {
  			return unit.cast("basic.start");
  		});

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Connected callback handler.
  	 */
  	static #_connectedHandler(unit)
  	{
  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Disconnected callback handler.
  	 */
  	static #_disconnectedHandler(unit)
  	{

  		return unit.cast("basic.stop");

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Adopted callback handler.
  	 */
  	static #_adoptedHandler(unit)
  	{

  		return unit.cast("event.trigger", "afterAdopt");

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Attribute changed callback handler.
  	 */
  	static #_attributeChangedHandler(unit, name, oldValue, newValue)
  	{

  		return unit.cast("event.trigger", "afterAttributeChange", {"name":name, "oldValue":oldValue, "newValue":newValue});

  	}

  	// -------------------------------------------------------------------------
  	//  Methods (Unit)
  	// -------------------------------------------------------------------------

  	/**
  	 * Call the aynchronous function.
  	 *
  	 * @param	{String}		assetName			Asset name.
  	 * @param	{String}		key					Key.
  	 * @param	{*}				...args				Arguments.
  	 */
  	static #_cast(key, ...args)
  	{

  		let func = this.assets["spell"].get(key);
  		Util.assert(typeof(func) === "function", () => `Spell is not available. spellName=${key}`);

  		return func.call(this, this, ...args);

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Call the synchronous function.
  	 *
  	 * @param	{String}		assetName			Asset name.
  	 * @param	{String}		key					Key.
  	 * @param	{*}				...args				Arguments.
  	 */
  	static #_use(key, ...args)
  	{

  		let func = this.assets["skill"].get(key);
  		Util.assert(typeof(func) === "function", () => `Skill is not available. skillName=${key}`);

  		return func.call(this, this, ...args);

  	}

  	// -------------------------------------------------------------------------
  	//  Skills (Unit)
  	// -------------------------------------------------------------------------

  	/**
  	 * Get elements inside the unit speicified by the query.
  	 *
  	 * @param	{Unit}			unit				Unit.
  	 * @param	{String}		query				Query.
  	 * @param	{Object}		options				Options.
  	 *
  	 * @return  {NodeList}		Elements.
  	 */
  	static #_scanAll(unit, query, options)
  	{

  		return Util.scopedSelectorAll(unit, query, options);

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Get the first element inside the unit speicified by the query.
  	 *
  	 * @param	{Unit}			unit				Unit.
  	 * @param	{String}		query				Query.
  	 * @param	{Object}		options				Options.
  	 *
  	 * @return  {HTMLElement}	Element.
  	 */
  	static #_scan(unit, query, options)
  	{

  		let nodes = Util.scopedSelectorAll(unit, query, options);

  		return ( nodes ? nodes[0] : null );

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Locate all the unit.
  	 *
  	 * @param	{Unit}			unit				Unit.
  	 * @param	{Object/String/Unit}	target		Target to locate.
  	 *
  	 * @return  {HTMLElement}	Target element.
  	 */
  	static #_locateAll(unit, target)
  	{

  		if (typeof(target) === "object")
  		{
  			if ("selector" in target)
  			{
  				return document.querySelectorAll(target["selector"]);
  			}
  			else if ("scan" in target)
  			{
  				unit.use("basic.scan", target["scan"]);
  				return unit.use("basic.scanAll", target["scan"]);
  			}
  			else if ("uniqueId" in target)
  			{
  				return [BasicPerk.#__unitInfo[target["uniqueId"]].object];
  			}
  			else if ("tagName" in target)
  			{
  				return BasicPerk.#__indexes["tagName"][target["tagName"].toUpperCase()];
  			}
  			else if ("object" in target)
  			{
  				return [target["object"]];
  			}
  			else if ("id" in target)
  			{
  				return BasicPerk.#__indexes["id"][target["id"]];
  			}
  			else if ("className" in target)
  			{
  				return BasicPerk.#__indexes["className"][target["className"]];
  			}
  		}
  		else if (typeof(target) === "string")
  		{
  			return BasicPerk.#__indexes["tagName"][target.toUpperCase()];
  		}
  		else
  		{
  			return [target];
  		}

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Locate the unit.
  	 *
  	 * @param	{Unit}			unit				Unit.
  	 * @param	{Object/String/Unit}	target		Target to locate.
  	 *
  	 * @return  {HTMLElement}	Target element.
  	 */
  	static #_locate(unit, target)
  	{

  		let units = BasicPerk.#_locateAll(unit, target);

  		if (units)
  		{
  			return units[0];
  		}

  	}

  	// -------------------------------------------------------------------------
  	//  Spells (Unit)
  	// -------------------------------------------------------------------------

  	/**
  	 * Start unit.
  	 *
  	 * @param	{Unit}			unit				Unit.
  	 * @param	{Object}		options				Options.
  	 *
  	 * @return  {Promise}		Promise.
  	 */
  	static async #_start(unit, options)
  	{

  		console.debug(`BasicPerk._start(): Starting unit. name=${unit.tagName}, id=${unit.id}, uniqueId=${unit.uniqueId}`);
  		await unit.cast("setting.apply", {"settings":unit.assets["setting"].items});
  		await unit.cast("event.trigger", "beforeStart");
  		unit.use("status.change", "starting");
  		if (unit.get("setting", "basic.options.autoTransform", true))
  		{
  			await unit.cast("basic.transform", {"skinName": "default", "styleName": "default"});
  		}
  		await unit.cast("event.trigger", "doStart");
  		if (unit.get("setting", "basic.options.autoRefresh", true))
  		{
  			await unit.cast("basic.refresh");
  		}
  		console.debug(`BasicPerk._start(): Started unit. name=${unit.tagName}, id=${unit.id}, uniqueId=${unit.uniqueId}`);
  		unit.use("status.change", "started");
  		await unit.cast("event.trigger", "afterStart");
  		console.debug(`BasicPerk._start(): Unit is ready. name=${unit.tagName}, id=${unit.id}, uniqueId=${unit.uniqueId}`);
  		unit.use("status.change", "ready");
  		await unit.cast("event.trigger", "afterReady");

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Stop unit.
  	 *
  	 * @param	{Unit}			unit				Unit.
  	 * @param	{Object}		options				Options for the unit.
  	 *
  	 * @return  {Promise}		Promise.
  	 */
  	static async #_stop(unit, options)
  	{

  		options = options || {};

  		console.debug(`BasicPerk._stop(): Stopping unit. name=${unit.tagName}, id=${unit.id}, uniqueId=${unit.uniqueId}`);
  		unit.use("status.change", "stopping");
  		await unit.cast("event.trigger", "beforeStop", options);
  		await unit.cast("event.trigger", "doStop", options);
  		console.debug(`BasicPerk._stop(): Stopped unit. name=${unit.tagName}, id=${unit.id}, uniqueId=${unit.uniqueId}`);
  		unit.use("status.change", "stopped");
  		await unit.cast("event.trigger", "afterStop", options);

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Transform unit (Load HTML and attach to node).
  	 *
  	 * @param	{Unit}			unit				Unit.
  	 * @param	{Object}		options				Options.
  	 *
  	 * @return  {Promise}		Promise.
  	 */
  	static async #_transform(unit, options)
  	{

  		options = options || {};

  		console.debug(`BasicPerk._transform(): Transforming. name=${unit.tagName}, id=${unit.id}, uniqueId=${unit.uniqueId}`);
  		await unit.cast("event.trigger", "beforeTransform", options);
  		if (unit.get("setting", "basic.options.autoSetup", true))
  		{
  			await unit.cast("basic.setup", options);
  		}
  		await unit.cast("event.trigger", "doTransform", options);
  		await unit.cast("unit.materializeAll", unit);
  		console.debug(`BasicPerk._transform(): Transformed. name=${unit.tagName}, id=${unit.id}, uniqueId=${unit.uniqueId}`);
  		await unit.cast("event.trigger", "afterTransform", options);

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Setup unit.
  	 *
  	 * @param	{Unit}			unit				Unit.
  	 * @param	{Object}		options				Options.
  	 *
  	 * @return  {Promise}		Promise.
  	 */
  	static async #_setup(unit, options)
  	{

  		options = options || {};

  		console.debug(`BasicPerk._setup(): Setting up unit. name=${unit.tagName}, id=${unit.id}, uniqueId=${unit.uniqueId}`);
  		await unit.cast("event.trigger", "beforeSetup", options);
  		await unit.cast("event.trigger", "doSetup", options);
  		console.debug(`BasicPerk._setup(): Set up unit. name=${unit.tagName}, id=${unit.id}, uniqueId=${unit.uniqueId}`);
  		await unit.cast("event.trigger", "afterSetup", options);

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Refresh unit.
  	 *
  	 * @param	{Unit}			unit				Unit.
  	 * @param	{Object}		options				Options.
  	 *
  	 * @return  {Promise}		Promise.
  	 */
  	static async #_refresh(unit, options)
  	{

  		options = options || {};

  		console.debug(`BasicPerk._refresh(): Refreshing unit. name=${unit.tagName}, id=${unit.id}, uniqueId=${unit.uniqueId}`);
  		await unit.cast("event.trigger", "beforeRefresh", options);
  		let autoClear = Util.safeGet(options, "autoClear", unit.get("setting", "basic.options.autoClear", true));
  		if (autoClear)
  		{
  			await unit.cast("basic.clear", options);
  		}
  		if (Util.safeGet(options, "autoFetch", unit.get("setting", "basic.options.autoFetch", true)))
  		{
  			await unit.cast("basic.fetch", options);
  		}
  		if (Util.safeGet(options, "autoFill", unit.get("setting", "basic.options.autoFill", true)))
  		{
  			await unit.cast("basic.fill", options);
  		}
  		await unit.cast("event.trigger", "doRefresh", options);
  		console.debug(`BasicPerk._refresh(): Refreshed unit. name=${unit.tagName}, id=${unit.id}, uniqueId=${unit.uniqueId}`);
  		await unit.cast("event.trigger", "afterRefresh", options);

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Fetch data.
  	 *
  	 * @param	{Unit}			unit				Unit.
  	 * @param	{Object}		options				Options.
  	 *
  	 * @return  {Promise}		Promise.
  	 */
  	static async #_fetch(unit, options)
  	{

  		options = options || {};

  		console.debug(`BasicPerk._fetch(): Fetching data. name=${unit.tagName}, uniqueId=${unit.uniqueId}`);
  		await unit.cast("event.trigger", "beforeFetch", options);
  		await unit.cast("event.trigger", "doFetch", options);
  		await unit.cast("event.trigger", "afterFetch", options);
  		console.debug(`BasicPerk._fetch(): Fetched data. name=${unit.tagName}, uniqueId=${unit.uniqueId}`);

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Fill unit.
  	 *
  	 * @param	{Unit}			unit				Unit.
  	 * @param	{Object}		options				Options.
  	 *
  	 * @return  {Promise}		Promise.
  	 */
  	static async #_fill(unit, options)
  	{

  		options = options || {};

  		console.debug(`BasicPerk._fill(): Filling with data. name=${unit.tagName}, uniqueId=${unit.uniqueId}`);
  		await unit.cast("event.trigger", "beforeFill", options);
  		await unit.cast("event.trigger", "doFill", options);
  		console.debug(`BasicPerk._fill(): Filled with data. name=${unit.tagName}, uniqueId=${unit.uniqueId}`);
  		await unit.cast("event.trigger", "afterFill", options);

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Clear unit.
  	 *
  	 * @param	{Unit}			unit				Unit.
  	 * @param	{Object}		options				Options.
  	 *
  	 * @return  {Promise}		Promise.
  	 */
  	static async #_clear(unit, options)
  	{

  		options = options || {};

  		console.debug(`BasicPerk._clear(): Clearing the unit. name=${unit.tagName}, uniqueId=${unit.uniqueId}`);
  		await unit.cast("event.trigger", "beforeClear", options);
  		await unit.cast("event.trigger", "doClear", options);
  		console.debug(`BasicPerk._clear(): Cleared the unit. name=${unit.tagName}, uniqueId=${unit.uniqueId}`);
  		await unit.cast("event.trigger", "afterClear", options);

  	}

  	// -------------------------------------------------------------------------
  	//  Privates
  	// -------------------------------------------------------------------------

  	/**
  	 * Register the unit.
  	 *
  	 * @param	{Unit}			unit				Unit.
  	 * @param	{Object}		options				Options.
  	 *
  	 * @return  {HTMLElement}	Element.
  	 */
  	static #__register(unit, options)
  	{

  		let c = customElements.get(unit.tagName.toLowerCase());

  		BasicPerk.#__unitInfo[unit.uniqueId] = {
  			"object":		unit,
  			"class":		c,
  		};

  		// Indexes
  		BasicPerk.#__indexes["tagName"][unit.tagName] = BasicPerk.#__indexes["tagName"][unit.tagName] || [];
  		BasicPerk.#__indexes["tagName"][unit.tagName].push(unit);
  		BasicPerk.#__indexes["className"][c.name] = BasicPerk.#__indexes["className"][c.name] || [];
  		BasicPerk.#__indexes["className"][c.name].push(unit);
  		if (unit.id)
  		{
  			BasicPerk.#__indexes["id"][unit.id] = BasicPerk.#__indexes["id"][unit.id] || [];
  			BasicPerk.#__indexes["id"][unit.id].push(unit);
  		}

  	}

  }

  // =============================================================================
  /**
   * BitsmistJS - Javascript Web Client Framework
   *
   * @copyright		Masaki Yasutake
   * @link			https://bitsmist.com/
   * @license			https://github.com/bitsmist/bitsmist/blob/main/LICENSE
   */
  // =============================================================================


  // =============================================================================
  //	Setting Perk Class
  // =============================================================================

  class SettingPerk extends Perk
  {

  	// -------------------------------------------------------------------------
  	//  Private Variables
  	// -------------------------------------------------------------------------

  	static #__ready;
  	static #__ready_resolve;
  	static #__info = {
  		"sectionName":		"setting",
  		"order":			10,
  	};

  	// -------------------------------------------------------------------------
  	//  Properties
  	// -------------------------------------------------------------------------

  	static get info()
  	{

  		return SettingPerk.#__info;

  	}

  	// -------------------------------------------------------------------------

  	static get ready()
  	{

  		return SettingPerk.#__ready;

  	}

  	// -------------------------------------------------------------------------
  	//  Methods
  	// -------------------------------------------------------------------------

  	static globalInit()
  	{

  		// Init Vars
  		SettingPerk.#__ready = new Promise((resolve, reject) => {
  			SettingPerk.#__ready_resolve = resolve;
  		});

  		// Upgrade Unit
  		Unit.upgrade("asset", "setting", new ChainableStore());
  		Unit.upgrade("skill", "setting.get", SettingPerk.#_getSettings);
  		Unit.upgrade("skill", "setting.set", SettingPerk.#_setSettings);
  		Unit.upgrade("skill", "setting.merge", SettingPerk.#_mergeSettings);
  		Unit.upgrade("spell", "setting.summon", SettingPerk.#_loadSettings);
  		Unit.upgrade("spell", "setting.apply", SettingPerk.#_applySettings);

  		return Perk.getPerk("BasicPerk").ready.then(() => {
  			if (SettingPerk.#__ready_resolve)
  			{
  				SettingPerk.#__ready_resolve();
  				SettingPerk.#__ready_resolve = null;
  			}
  		});

  	}

  	// -------------------------------------------------------------------------

  	static async init(unit, options)
  	{

  		// Get settings
  		let settings = (options && options["settings"]) || {};
  		settings = SettingPerk.#__injectSettings(unit, settings);
  		settings = SettingPerk.#__mergeSettings(unit, settings);

  		await SettingPerk.ready;

  		// Upgrade unit
  		unit.upgrade("asset", "setting", new ChainableStore({"items":settings, "chain":Unit.assets["setting"]}));

  		SettingPerk.#__loadAttrSettings(unit);
  		if (SettingPerk.#__hasExternalSettings(unit))
  		{
  			await SettingPerk.#_loadSettings(unit);
  		}
  		SettingPerk.#__loadAttrSettings(unit); // Do it again to overwrite since attribute settings have higher priority

  	}

  	// -------------------------------------------------------------------------
  	//  Skills (Unit)
  	// -------------------------------------------------------------------------

  	/**
  	 * Get settings.
  	 *
       * @param	{Unit}			unit				Unit.
  	 * @param	{String}		key					Key.
  	 * @param	{*}				defaultValue		Value returned when key is not found.
  	 */
  	static #_getSettings(unit, key, defaultValue)
  	{

  		return unit.get("setting", key, defaultValue);

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Set settings.
  	 *
       * @param	{Unit}			unit				Unit.
  	 * @param	{String}		key					Key.
  	 * @param	{*}				value				Value.
  	 */
  	static #_setSettings(unit, key, value)
  	{

  		return unit.set("setting", key, value);

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Set settings.
  	 *
       * @param	{Unit}			unit				Unit.
  	 * @param	{String}		key					Key.
  	 * @param	{*}				value				Value.
  	 */
  	static #_mergeSettings(unit, key, value)
  	{

  		unit.assets["setting"].merge(key, value);

  	}

  	// -------------------------------------------------------------------------
  	//  Spells (Unit)
  	// -------------------------------------------------------------------------

  	/**
  	 * Apply settings.
  	 *
       * @param	{Unit}			unit				Unit.
  	 * @param	{Object}		options				Options.
  	 */
  	static async #_applySettings(unit, options)
  	{

  		await unit.cast("event.trigger", "beforeApplySettings", options);
  		await unit.cast("perk.attachPerks", options);
  		await unit.cast("event.trigger", "doApplySettings", options);
  		await unit.cast("event.trigger", "afterApplySettings", options);

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Load the settings file and merge to unit's settings.
  	 *
  	 * @param	{Unit}			unit				Unit.
  	 * @param	{Object}		options				Load options.
  	 *
  	 * @return 	{Promise}		Promise.
  	 */
  	static async #_loadSettings(unit, options)
  	{

  		let settings = await AjaxUtil.loadJSON(SettingPerk.#__getSettingsURL(unit), Object.assign({"bindTo":unit}, options));
  		if (settings)
  		{
  			unit.use("setting.merge", settings);
  		}

  	}

  	// -------------------------------------------------------------------------
  	//  Privates
  	// -------------------------------------------------------------------------

  	/**
  	 * Get settings from element's attribute.
  	 *
  	 * @param	{Unit}			unit				Unit.
  	 */
  	static #__loadAttrSettings(unit)
  	{

  		if (unit.hasAttribute("bm-settingsref"))
  		{
  			let settingsRef = unit.getAttribute("bm-settingsref") || true;
  			if (settingsRef === "false")
  			{
  				settingsRef = false;
  			}
  			unit.set("setting", "setting.options.settingsRef", settingsRef);
  		}

  		if (unit.hasAttribute("bm-options"))
  		{
  			let options = {"options": JSON.parse(unit.getAttribute("bm-options"))};
  			unit.use("setting.merge", options);
  		}

  		// Path
  		if (unit.hasAttribute("bm-path"))
  		{
  			unit.set("setting", "setting.options.path", unit.getAttribute("bm-path"));
  		}

  		// File name
  		if (unit.hasAttribute("bm-filename"))
  		{
  			unit.set("setting", "setting.options.fileName", unit.getAttribute("bm-filename"));
  		}

  		// Auto loading
  		if (unit.hasAttribute("bm-autoload"))
  		{
  			let autoLoad = unit.getAttribute("bm-autoload");
  			if (autoLoad)
  			{
  				let url = URLUtil.parseURL(autoLoad);
  				unit.set("setting", "setting.options.path", url.path);
  				unit.set("setting", "setting.options.fileName", url.filenameWithoutExtension);
  			}
  		}

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Check if the unit has the external settings file.
  	 *
  	 * @param	{Unit}			unit				Unit.
  	 *
  	 * @return  {Boolean}		True if the unit has the external settings file.
  	 */
  	static #__hasExternalSettings(unit)
  	{

  		let ret = false;

  		if (unit.get("setting", "setting.options.settingsRef", unit.get("setting", "system.setting.options.settingsRef")))
  		{
  			ret = true;
  		}

  		return ret;

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Return URL to setting file.
  	 *
  	 * @param	{Unit}			unit				Unit.
  	 *
  	 * @return  {String}		URL.
  	 */
  	static #__getSettingsURL(unit)
  	{

  		let url;
  		let settingsRef = unit.get("setting", "setting.options.settingsRef");

  		if (settingsRef && settingsRef !== true)
  		{
  			// If URL is specified in ref, use it
  			url = settingsRef;
  		}
  		else
  		{
  			// Use default path and filename
  			let path = Util.concatPath([
  					unit.get("setting", "system.setting.options.path", unit.get("setting", "system.unit.options.path", "")),
  					unit.get("setting", "setting.options.path", unit.get("setting", "unit.options.path", "")),
  				]);
  			let ext = unit.get("setting", "setting.options.settingFormat",
  						unit.get("setting", "system.setting.options.settingFormat", "json"));
  			let fileName = unit.get("setting", "setting.options.fileName",
  							unit.get("setting", "unit.options.fileName",
  								unit.tagName.toLowerCase())) + ".settings." + ext;
  			let query = unit.get("setting", "unit.options.query");

  			url = Util.concatPath([path, fileName]) + (query ? `?${query}` : "");
  		}

  		return url;

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Inject settings.
  	 *
  	 * @param	{Unit}			unit				Unit.
  	 * @param	{Object}		settings			Settings.
  	 *
  	 * @return  {Object}		New settings.
  	 */
  	static #__injectSettings(unit, settings)
  	{

  		if (typeof(unit._injectSettings) === "function")
  		{
  			settings = unit._injectSettings.call(unit, settings);
  		}

  		return settings;

  	}

  	// -----------------------------------------------------------------------------

  	/**
   	 * Inject settings.
  	 *
  	 * @param	{Unit}			unit				Unit.
  	 * @param	{Object}		settings			Settings.
  	 *
  	 * @return  {Object}		New settings.
  	 */
  	static #__mergeSettings(unit, settings)
  	{

  		let curUnit = Object.getPrototypeOf(unit);
  		let curSettings = {};
  		let parentSettings;

  		// Merge superclass settings
  		while (typeof(Object.getPrototypeOf(curUnit)._getSettings) === "function")
  		{
  			parentSettings = Object.getPrototypeOf(curUnit)._getSettings.call(unit);
  			if (Object.keys(parentSettings).length > 0)
  			{
  				Util.deepMerge(parentSettings, curSettings);
  				curSettings = parentSettings;
  			}

  			curUnit= Object.getPrototypeOf(curUnit);
  		}
  		Util.deepMerge(settings, curSettings);

  		// Merge unit settings
  		if (typeof(unit._getSettings) === "function")
  		{
  			Util.deepMerge(settings, unit._getSettings.call(unit));
  		}

  		return settings;

  	}

  }

  // =============================================================================
  /**
   * BitsmistJS - Javascript Web Client Framework
   *
   * @copyright		Masaki Yasutake
   * @link			https://bitsmist.com/
   * @license			https://github.com/bitsmist/bitsmist/blob/main/LICENSE
   */
  // =============================================================================


  // =============================================================================
  //	Status Perk Class
  // =============================================================================

  class StatusPerk extends Perk
  {

  	// -------------------------------------------------------------------------
  	//  Private Variables
  	// -------------------------------------------------------------------------

  	static #__statusInfo = {};
  //	static #__suspends = {};
  	static #__waitingList = new Store();
  	static #__info = {
  		"sectionName":		"status",
  		"order":			100,
  	};

  	// -------------------------------------------------------------------------
  	//  Properties
  	// -------------------------------------------------------------------------

  	static get info()
  	{

  		return StatusPerk.#__info;

  	}

  	// -------------------------------------------------------------------------
  	//  Methods
  	// -------------------------------------------------------------------------

  	static globalInit()
  	{

  		// Init vars
  		StatusPerk.waitFor = function(waitlist, timeout) { return StatusPerk.#_waitFor(Unit, waitlist, timeout); };

  		// Upgrade Unit
  		Unit.upgrade("skill", "status.change", StatusPerk.#_changeStatus);
  		Unit.upgrade("spell", "status.wait", StatusPerk.#_waitFor);

  	}

  	// -------------------------------------------------------------------------

  	static init(unit, options)
  	{

  		// Upgrade unit;
  		unit.upgrade("inventory", "status.status", "connected");
  		//unit.upgrade("inventory", "status.suspends", {});

  		// Add event handlers
  		unit.use("event.add", "doApplySettings", {"handler":StatusPerk.#StatusPerk_onDoApplySettings, "order":StatusPerk.info["order"]});

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Suspend all units at the specified status.
  	 *
  	 * @param	{String}		status				Unit status.
  	 */
  	/*
  	static globalSuspend(status)
  	{

  		StatusPerk.#__suspends[status] = StatusPerk.#__createSuspendInfo(status);
  		StatusPerk.#__suspends[status].status = "pending";

  	}
  	*/

  	// -------------------------------------------------------------------------

  	/**
  	 * Resume all units at the specified status.
  	 *
  	 * @param	{String}		status				Unit status.
  	 */
  	/*
  	static globalResume(status)
  	{

  		StatusPerk.#__suspends[status].resolve();
  		StatusPerk.#__suspends[status].status = "resolved";

  	}
  	*/

  	// -------------------------------------------------------------------------
  	//  Event Handlers (Unit)
  	// -------------------------------------------------------------------------

  	static #StatusPerk_onDoApplySettings(sender, e, ex)
  	{

  		Object.entries(Util.safeGet(e.detail, "settings.status.waitFor", {})).forEach(([sectionName, sectionValue]) => {
  			StatusPerk.addEventHandler(sectionName, {"handler":StatusPerk.#StatusPerk_onDoProcess, "options":sectionValue});
  		});

  	}

  	// -------------------------------------------------------------------------

  	static #StatusPerk_onDoProcess(sender, e, ex)
  	{

  		return StatusPerk.#_waitFor(this, ex.options);

  	}

  	// -------------------------------------------------------------------------
  	//  Skills (Unit)
  	// -------------------------------------------------------------------------

  	/**
  	 * Change unit status and check waiting list.
  	 *
  	 * @param	{Unit}			unit				Unit to register.
  	 * @param	{String}		status				Unit status.
  	 *
  	 * @return  {Promise}		Promise.
  	 */
  	static #_changeStatus(unit, status)
  	{

  		Util.assert(StatusPerk.#__isTransitionable(unit.get("inventory", "status.status"), status), () => `StatusPerk.#_changeStatus(): Illegal transition. name=${unit.tagName}, fromStatus=${unit.get("inventory", "status.status")}, toStatus=${status}, id=${unit.id}`, Error);

  		unit.set("inventory", "status.status", status);
  		StatusPerk.#__statusInfo[unit.uniqueId] = {"status":status};

  		StatusPerk.#__processWaitingList();

  	}

  	// -------------------------------------------------------------------------
  	//  Spells (Unit)
  	// -------------------------------------------------------------------------

  	/**
  	 * Wait for units to become specific statuses.
  	 *
  	 * @param	{Unit}			unit				Unit.
  	 * @param	{Array}			waitlist			Units to wait.
  	 * @param	{Object}		options				Options.
  	 *
  	 * @return  {Promise}		Promise.
  	 */
  	static #_waitFor(unit, waitlist, options)
  	{

  		let promise;
  		let timeout =
  				(options && options["timeout"]) ||
  				unit.get("setting", "status.options.waitForTimeout", unit.get("setting", "system.status.options.waitForTimeout", 10000));
  		let waiter = ( options && options["waiter"] ? options["waiter"] : unit );
  		let waitInfo = {"waiter":waiter, "waitlist":Util.deepClone(waitlist)};

  		if (StatusPerk.#__isAllReady(waitInfo))
  		{
  			promise = Promise.resolve();
  		}
  		else
  		{
  			// Create a promise that is resolved when waiting is completed.
  			promise = new Promise((resolve, reject) => {
  				waitInfo["resolve"] = resolve;
  				waitInfo["reject"] = reject;
  				waitInfo["timer"] = setTimeout(() => {
  					let name = ( unit && unit.tagName ) || ( waitInfo["waiter"] && waitInfo["waiter"].tagName ) || "";
  					let uniqueId = (unit && unit.uniqueId) || "";
  					reject(`StatusPerk.#_waitFor(): Timed out after ${timeout} milliseconds waiting for ${StatusPerk.#__dumpWaitlist(waitlist)}, name=${name}, uniqueId=${uniqueId}.`);
  				}, timeout);
  			});
  			waitInfo["promise"] = promise;

  			// Add info to the waiting list.
  			StatusPerk.#__addToWaitingList(waitInfo);
  		}

  		return promise;

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Suspend the unit at the specified status.
  	 *
  	 * @param	{Unit}			unit				Unit.
  	 * @param	{String}		status				Unit status.
  	 */
  	/*
  	static #_suspend(unit, status)
  	{

  		unit.#_suspends[status] = StatusPerk.#__createSuspendInfo();
  	 	unit.#_suspends[status].status = "pending";

  	}
  	*/

  	// -------------------------------------------------------------------------

  	/**
  	 * Resume the unit at the specified status.
  	 *
  	 * @param	{Unit}			unit				Unit.
  	 * @param	{String}		status				Unit status.
  	 */
  	/*
  	static #_resume(unit, status)
  	{

  	 	unit.#_suspends[status].resolve();
  	 	unit.#_suspends[status].status = "resolved";

  	}
  	*/

  	// -------------------------------------------------------------------------

  	/**
  	 * Pause the unit if it is suspended.
  	 *
  	 * @param	{Unit}			unit				Unit.
  	 * @param	{String}		status				Unit status.
  	 *
  	 * @return  {Promise}		Promise.
  	 */
  	/*
  	static #_pause(unit, status)
  	{

  		let ret = [];

  		// Globally suspended?
  		if (StatusPerk.#__suspends[status] && StatusPerk.#__suspends[status].status === "pending" && !unit.get("setting", "setting.ignoreGlobalSuspend"))
  		{
  			ret.push(StatusPerk.#__suspends[status].promise);
  		}

  		// Unit suspended?
  		if (unit.#_suspends[status] && unit.#_suspends[status].status === "pending")
  		{
  			ret.push(unit.#_suspends[status].promise);
  		}

  		return Promise.all(ret);

  	}
  	*/

  	// -------------------------------------------------------------------------
  	//  Privates
  	// -------------------------------------------------------------------------

  	/**
  	 * Process waiting list.
  	 */
  	static #__processWaitingList()
  	{

  		let removeList = [];
  		Object.keys(StatusPerk.#__waitingList.items).forEach((id) => {
  			if (StatusPerk.#__isAllReady(StatusPerk.#__waitingList.get(id)))
  			{
  				clearTimeout(StatusPerk.#__waitingList.get(id)["timer"]);
  				StatusPerk.#__waitingList.get(id).resolve();
  				removeList.push(id);
  			}
  		});

  		// Remove from waiting list
  		for (let i = 0; i < removeList.length; i++)
  		{
  			StatusPerk.#__waitingList.remove(removeList[i]);
  		}

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Add wait info to the waiting list.
  	 *
  	 * @param	{Object}		waitInfo			Wait info.
  	 */
  	static #__addToWaitingList(waitInfo)
  	{

  		let id = v4();

  		/*
  		for (let i = 0; i < waitInfo["waitlist"].length; i++)
  		{
  			// Check if the node exists
  			if (waitInfo["waitlist"][i].rootNode)
  			{
  				let element = document.querySelector(waitInfo["waitlist"][i].rootNode);

  				Util.assert(element && element.uniqueId, () => `StatusPerk.#__addToWaitingList(): Root node does not exist. waiter=${waitInfo["waiter"]}, rootNode=${waitInfo["waitlist"][i].rootNode}`, ReferenceError);
  			}
  		}
  		*/

  		StatusPerk.#__waitingList.set(id, waitInfo);

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Check whether changing current status to new status is allowed.
  	 *
  	 * @param	{String}		currentStatus		Current status.
  	 * @param	{String}		newStatus			New status.
  	 *
  	 * @return  {Promise}		Promise.
  	 */
  	static #__isTransitionable(currentStatus, newStatus)
  	{

  		let ret = true;

  		if (currentStatus && currentStatus.slice(-3) === "ing")
  		{
  			if(
  				( currentStatus === "stopping" && newStatus !== "stopped") ||
  				( currentStatus === "starting" && newStatus !== "started")
  			)
  			{
  				ret = false;
  			}
  		}

  		return ret;

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Get unit info from wait list item.
  	 *
  	 * @param	{Object}		waitlistItem		Wait list item.
  	 *
  	 * @return  {Boolean}		True if ready.
  	 */
  	static #__getStatusInfo(unit, waitlistItem)
  	{

  		let statusInfo;
  		let target = unit.use("basic.locate", waitlistItem);
  		if (target)
  		{
  			statusInfo = StatusPerk.#__statusInfo[target.uniqueId];
  		}

  		return statusInfo;

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Check if all units are ready.
  	 *
  	 * @param	{Object}		waitInfo			Wait info.
  	 *
  	 * @return  {Boolean}		True if ready.
  	 */
  	static #__isAllReady(waitInfo)
  	{

  		let result = true;
  		let waitlist = waitInfo["waitlist"];

  		for (let i = 0; i < waitlist.length; i++)
  		{
  			let match = false;
  			let statusInfo = StatusPerk.#__getStatusInfo(waitInfo["waiter"], waitlist[i]);
  			if (statusInfo)
  			{
  				if (StatusPerk.#__isStatusMatch(statusInfo["status"], waitlist[i]["status"]))
  				{
  					match = true;
  				}
  			}

  			// If one fails all fail
  			if (!match)
  			{
  				result = false;
  				break;
  			}
  		}

  		return result;

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Check if status match.
  	 *
  	 * @param	{String}		currentStatus		Current status.
  	 * @param	{String}		expectedStatus		Expected status.
  	 *
  	 * @return  {Boolean}		True if match.
  	 */
  	static #__isStatusMatch(currentStatus, expectedStatus)
  	{

  		expectedStatus = expectedStatus || "ready";
  		let isMatch = false;

  		switch (currentStatus)
  		{
  			case "ready":
  				if (
  					expectedStatus === "ready" ||
  					expectedStatus === "started" ||
  					expectedStatus === "starting"
  				)
  				{
  					isMatch = true;
  				}
  				break;
  			case "started":
  				if (
  					expectedStatus === "started" ||
  					expectedStatus === "starting"
  				)
  				{
  					isMatch = true;
  				}
  				break;
  			case "stopped":
  				if (
  					expectedStatus === "stopped" ||
  					expectedStatus === "stopping"
  				)
  				{
  					isMatch = true;
  				}
  				break;
  			default:
  				if ( currentStatus === expectedStatus )
  				{
  					isMatch = true;
  				}
  				break;
  		}

  		return isMatch;

  	}

  	// -----------------------------------------------------------------------------

  	/**
  	 * Dump wait list as string.
  	 *
  	 * @param	{Array}			Wait list.
  	 *
  	 * @return  {String}		Wait list string.
  	 */
  	static #__dumpWaitlist(waitlist)
  	{

  		let result = "";

  		for (let i = 0; i < waitlist.length; i++)
  		{
  			if (typeof(waitlist[i]) === "string")
  			{
  				result += `\n\t{"${waitlist[i]}", status:ready},`;
  			}
  			else
  			{
  				let uniqueId = `uniqueId:${waitlist[i].uniqueId}, `;
  				let id = (waitlist[i].id ? `id:${waitlist[i].id}, ` : "");
  				let tagName = (waitlist[i].tagName ? `tagName:${waitlist[i].tagName}, ` : "");
  				let object = (waitlist[i].object ? `object:${waitlist[i].object.tagName}, ` : "");
  				let selector = (waitlist[i].selector ? `selector:${waitlist[i].selector}, ` : "");
  				let status = (waitlist[i].status ? `status:${waitlist[i].status}` : "status:ready");
  				result += `\n\t{${uniqueId}${id}${tagName}${object}${selector}${status}},`;
  			}
  		}

  		return `[${result}\n]`;

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Create the suspend info object.
  	 *
  	 * @return  {Object}		Suspend info.
  	 */
  	static #__createSuspendInfo()
  	{

  		let suspendInfo = {};

  		let promise = new Promise((resolve, reject) => {
  			suspendInfo["resolve"] = resolve;
  			suspendInfo["reject"] = reject;
  			suspendInfo["status"] = "pending";
  		});
  		suspendInfo["promise"] = promise;

  		return suspendInfo;

  	}

  }

  // =============================================================================
  /**
   * BitsmistJS - Javascript Web Client Framework
   *
   * @copyright		Masaki Yasutake
   * @link			https://bitsmist.com/
   * @license			https://github.com/bitsmist/bitsmist/blob/main/LICENSE
   */
  // =============================================================================


  // =============================================================================
  //	Skin Perk Class
  // =============================================================================

  class SkinPerk extends Perk
  {

  	// -------------------------------------------------------------------------
  	//  Private Variables
  	// -------------------------------------------------------------------------

  	static #__info = {
  		"sectionName":		"skin",
  		"order":			210,
  	};

  	// -------------------------------------------------------------------------
  	//  Properties
  	// -------------------------------------------------------------------------

  	static get info()
  	{

  		return SkinPerk.#__info;

  	}

  	// -------------------------------------------------------------------------
  	//  Methods
  	// -------------------------------------------------------------------------

  	static globalInit()
  	{

  		Unit.upgrade("skill", "skin.apply", SkinPerk.#_applySkin);
  		Unit.upgrade("spell", "skin.summon", SkinPerk.#_loadSkin);

  	}

  	// -------------------------------------------------------------------------

  	static init(unit, options)
  	{

  		// Upgrade unit
  		unit.upgrade("inventory", "skin.skins", {});
  		unit.upgrade("inventory", "skin.active.skinName", "");

  		// Add event handlers
  		unit.use("event.add", "beforeTransform", {"handler":SkinPerk.#SkinPerk_onBeforeTransform, "order":SkinPerk.info["order"]});
  		unit.use("event.add", "doTransform", {"handler":SkinPerk.#SkinPerk_onDoTransform, "order":SkinPerk.info["order"]});

  		SkinPerk.#__loadAttrSettings(unit);
  		SkinPerk.#__adjustSettings(unit);

  		// Shadow DOM
  		let shadowRoot;
  		switch (unit.get("setting", "skin.options.shadowDOM", unit.get("setting" ,"system.skin.options.shadowDOM")))
  		{
  		case "open":
  			shadowRoot = unit.attachShadow({mode:"open"});
  			unit.set("inventory", "skin.shadowRoot", shadowRoot);
  			unit.set("inventory", "basic.unitRoot", shadowRoot);
  			break;
  		case "closed":
  			shadowRoot = unit.attachShadow({mode:"closed"});
  			unit.set("inventory", "skin.shadowRoot", shadowRoot);
  			unit.set("inventory", "basic.unitRoot", shadowRoot);
  			break;
  		}

  	}

  	// -------------------------------------------------------------------------
  	//  Event Handlers (Unit)
  	// -------------------------------------------------------------------------

  	static async #SkinPerk_onBeforeTransform(sender, e, ex)
  	{

  		if (this.get("setting", "skin.options.hasSkin", true))
  		{
  			let skinInfo = await SkinPerk.#_loadSkin(this, e.detail.skinName, e.detail.skinOptions);
  			this.get("inventory", "basic.unitRoot").textContent = "";
  			this.set("inventory", "basic.unitRoot", skinInfo["template"].content.cloneNode(true));
  		}

  	}

  	// -------------------------------------------------------------------------

  	static #SkinPerk_onDoTransform(sender, e, ex)
  	{

  		if (this.get("setting", "skin.options.hasSkin", true))
  		{
  			return SkinPerk.#_applySkin(this, e.detail.skinName, this.get("inventory", "basic.unitRoot"));
  		}

  	}

  	// -------------------------------------------------------------------------
  	//  Skills (Unit)
  	// -------------------------------------------------------------------------

  	/**
  	 * Apply skin.
  	 *
  	 * @param	{Unit}			unit				Parent unit.
  	 * @param	{String}		skinName			Skin name.
  	 * @param	{Node}			clone				Template node.
  	 */
  	static #_applySkin(unit, skinName, clone)
  	{

  		let skinInfo = unit.get("inventory", `skin.skins.${skinName}`);

  		Util.assert(skinInfo,() => `SkinPerk.#_applySkin(): Skin not loaded. name=${unit.tagName}, skinName=${skinName}, id=${unit.id}, uniqueId=${unit.uniqueId}`, ReferenceError);

  		// Append the clone to the unit
  		clone = clone || this.get("inventory", "basic.unitRoot");
  		unit.set("inventory", "basic.unitRoot", unit.get("inventory", "skin.shadowRoot", unit));
  		unit.get("inventory", "basic.unitRoot").innerHTML = "";
  		unit.get("inventory", "basic.unitRoot").appendChild(clone);

  		// Change active skin
  		unit.set("inventory", "skin.active.skinName", skinName);

  		console.debug(`SkinPerk.#_applySkin(): Applied skin. name=${unit.tagName}, skinName=${skinName}, id=${unit.id}, uniqueId=${unit.uniqueId}`);

  	}

  	// -------------------------------------------------------------------------
  	//  Spells (Unit)
  	// -------------------------------------------------------------------------

  	/**
  	 * Load the skin HTML.
  	 *
  	 * @param	{Unit}			unit				Unit.
  	 * @param	{String}		skinName			Skin name.
  	 * @param	{Object}		options				Load options.
  	 *
  	 * @return 	{Promise}		Promise.
  	 */
  	static #_loadSkin(unit, skinName, options)
  	{

  		let promise = Promise.resolve();
  		let skinInfo = unit.get("inventory", `skin.skins.${skinName}`) || SkinPerk.#__createSkinInfo(unit, skinName);
  		let skinSettings = options || unit.get("setting", `skin.skins.${skinName}`, {});

  		if (skinInfo["status"] === "loaded")
  		{
  			console.debug(`SkinPerk.#_loadSkin(): Skin already loaded. name=${unit.tagName}, skinName=${skinName}`);
  			return Promise.resolve(skinInfo);
  		}

  		switch (skinSettings["type"]) {
  		case "HTML":
  			skinInfo["HTML"] = skinSettings["HTML"];
  			break;
  		case "node":
  			let rootNode = unit.use("basic.scan", skinSettings["selector"] || "");
  			Util.assert(rootNode, () => `SkinPerk.#_loadSkin(): Node does not exist. name=${unit.tagName}, skinName=${skinName}, selector=${skinSettings["selector"]}`);
  			skinInfo["HTML"] = rootNode.innerHTML;
  			break;
  		case "URL":
  		default:
  			let url = skinSettings["URL"] || SkinPerk.#__getDefaultURL(unit, skinName, skinSettings);
  			Util.assert(url, () => `SkinPerk.#_loadSkin(): Skin URL is not speicified. name=${unit.tagName}, skinName=${skinName}`);
  			promise = AjaxUtil.loadHTML(url).then((skin) => {
  				skinInfo["HTML"] = skin;
  			});
  			skinInfo["promise"] = promise;
  			skinInfo["status"] = "loading";
  			break;
  		case "inline":
  		//default:
  			promise = new Promise((resolve, reject) => {
  				// Need to set timeout to wait for innerHTML to be ready
  				setTimeout(() => {
  					skinInfo["HTML"] = (unit.firstElementChild && unit.firstElementChild.tagName === "TEMPLATE" ? unit.firstElementChild.innerHTML : unit.innerHTML);
  					unit.innerHTML = "";
  					resolve();
  				}, 1);
  			});
  			skinInfo["promise"] = promise;
  			skinInfo["status"] = "loading";
  			break;
  		}

  		return promise.then(() => {
  			skinInfo["template"] = document.createElement("template");
  			skinInfo["template"].innerHTML = skinInfo["HTML"];
  			skinInfo["status"] = "loaded";

  			return skinInfo;
  		});

  	}

  	// -------------------------------------------------------------------------
  	//  Privates
  	// -------------------------------------------------------------------------

  	/**
  	 * Get settings from element's attribute.
  	 *
  	 * @param	{Unit}			unit				Unit.
  	 */
  	static #__loadAttrSettings(unit)
  	{

  		if (unit.hasAttribute("bm-skinref"))
  		{
  			let skinRef = unit.getAttribute("bm-skinref") || true;
  			if (skinRef === "false")
  			{
  				skinRef = false;
  			}

  			unit.set("setting", "skin.options.skinRef", skinRef);
  		}

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Adjust unit settings.
  	 *
  	 * @param	{Unit}			unit				Unit.
  	 */
  	static #__adjustSettings(unit)
  	{

  		let url = unit.get("setting", "skin.options.skinRef");
  		if (url === false)
  		{
  			unit.set("setting", `skin.options.hasSkin`, false);
  		}
  		else
  		{
  			let skinSettings = unit.get("setting", "skin.skins.default", {});
  			skinSettings["type"] = skinSettings["type"] || "URL";
  			skinSettings["URL"] = skinSettings["URL"] || ( typeof(url) === "string" ? url : "" );
  			unit.set("setting", `skin.skins.default`, skinSettings);
  		}

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Returns a new skin info object.
  	 *
  	 * @param	{Unit}			unit				Parent unit.
  	 * @param	{String}		skinName			Skin name.
  	 *
  	 * @return  {Object}		Skin info.
  	 */
  	static #__createSkinInfo(unit, skinName)
  	{

  		let info = {
  			"name":		skinName,
  			"HTML":		"",
  			"template": null,
  			"status":	"",
  		};

  		unit.set("inventory", `skin.skins.${skinName}`, info);

  		return info;

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Return default URL to the skin file.
  	 *
  	 * @param	{Unit}			unit				Unit.
  	 * @param	{String}		skinName			Skin name.
  	 * @param	{Object}		options				Options.
  	 *
  	 * @return  {String}		URL.
  	 */
  	static #__getDefaultURL(unit, skinName, options)
  	{

  		let url;
  		let skinRef = unit.get("setting", "skin.options.skinRef");

  		if (skinRef && skinRef !== true)
  		{
  			// If URL is specified in ref, use it
  			url = skinRef;
  		}
  		else
  		{
  			// Use default path and filename
  			let path = Util.concatPath([
  					unit.get("setting", "system.skin.options.path",
  						unit.get("setting", "system.unit.options.path", "")),
  					Util.safeGet(options, "path",
  						unit.get("setting", "skin.options.path",
  							unit.get("setting", "unit.options.path", ""))),
  				]);
  			let fileName = SkinPerk.#__getDefaultFilename(unit, skinName, options) + ".html";
  			let query = unit.get("setting", "unit.options.query");

  			url = Util.concatPath([path, fileName]) + (query ? `?${query}` : "");
  		}

  		return url;

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Get the default skin name.
  	 *
  	 * @param	{Unit}			unit				Unit.
  	 * @param	{String}		skinName			Skin name.
  	 * @param	{Object}		options				Options.
  	 *
  	 * @return 	{String}		Skin name.
  	 */
  	static #__getDefaultFilename(unit, skinName, options)
  	{

  		return	Util.safeGet(options, "fileName",
  					unit.get("setting", "skin.options.fileName",
  						unit.get("setting", "unit.options.fileName",
  							unit.tagName.toLowerCase())));

  	}

  }

  // =============================================================================
  /**
   * BitsmistJS - Javascript Web Client Framework
   *
   * @copyright		Masaki Yasutake
   * @link			https://bitsmist.com/
   * @license			https://github.com/bitsmist/bitsmist/blob/main/LICENSE
   */
  // =============================================================================


  // =============================================================================
  //	Style Perk Class
  // =============================================================================

  class StylePerk extends Perk
  {

  	// -------------------------------------------------------------------------
  	//  Private Variables
  	// -------------------------------------------------------------------------

  	static #__ready;
  	static #__ready_resolve;
  	static #__vault = new WeakMap();
  	static #__applied = {};
  	static #__info = {
  		"sectionName":		"style",
  		"order":			200,
  	};

  	// -------------------------------------------------------------------------
  	//  Properties
  	// -------------------------------------------------------------------------

  	static get info()
  	{

  		return StylePerk.#__info;

  	}

  	// -------------------------------------------------------------------------

  	static get ready()
  	{

  		return StylePerk.#__ready;

  	}

  	// -------------------------------------------------------------------------
  	//  Methods
  	// -------------------------------------------------------------------------

  	static async globalInit()
  	{

  		// Init Vars
  		StylePerk.#__ready = new Promise((resolve, reject) => {
  			StylePerk.#__ready_resolve = resolve;
  		});
  		StylePerk.#__vault.set(Unit, {"applied": []});

  		// Upgrade Unit
  		Unit.upgrade("inventory", "style.styles", new ChainableStore());
  		Unit.upgrade("spell", "style.summon", StylePerk.#_loadCSS);
  		Unit.upgrade("spell", "style.apply", StylePerk.#_applyCSS);

  		await Perk.getPerk("SettingPerk").ready;

  		// Load and apply common CSS
  		let promises = [];
  		Object.entries(Unit.get("setting", "system.style.styles", {})).forEach(([sectionName, sectionValue]) => {
  			promises.push(StylePerk.#_loadCSS(Unit, sectionName, sectionValue, true));
  		});

  		await Promise.all(promises);
  		await Perk.getPerk("BasicPerk").ready; // === documentReady
  		await StylePerk.#__applyAllCSS(Unit, Unit.get("setting", "system.style.options.apply", []));

  		// Ready
  		StylePerk.#__ready_resolve();
  		StylePerk.#__ready_resolve = null;

  	}

  	// -------------------------------------------------------------------------

  	static init(unit, options)
  	{

  		// Upgrade unit
  		StylePerk.#__vault.set(unit, {"applied": []});
  		unit.upgrade("inventory", "style.styles", new ChainableStore({
  			"chain":	Unit.get("inventory", "style.styles"),
  		}));

  		// Add event handlers
  		unit.use("event.add", "beforeTransform", {"handler":StylePerk.#StylePerk_onBeforeTransform, "order":StylePerk.info["order"]});
  		unit.use("event.add", "doTransform", {"handler":StylePerk.#StylePerk_onDoTransform, "order":StylePerk.info["order"]});

  		StylePerk.#__loadAttrSettings(unit);
  		StylePerk.#__adjustSettings(unit);

  	}

  	// -------------------------------------------------------------------------
  	//  Event Handlers (Unit)
  	// -------------------------------------------------------------------------

  	static async #StylePerk_onBeforeTransform(sender, e, ex)
  	{

  		// Wait global CSS to be applied
  		await StylePerk.ready;

  		// Clear CSS
  		StylePerk.#_clearCSS(this);

  		// Load common CSS
  		let promises = [];
  		let css = this.get("setting", "style.options.apply", []);
  		for (let i = 0; i < css.length; i++)
  		{
  			promises.push(StylePerk.#_loadCSS(this, css[i]));
  		}

  		// Apply common CSS
  		await Promise.all(promises);
  		await StylePerk.#__applyAllCSS(this,css);

  	}

  	// -------------------------------------------------------------------------

  	static async #StylePerk_onDoTransform(sender, e, ex)
  	{

  		if (this.get("setting", "style.options.hasStyle", true))
  		{
  			// Load unit-specific CSS
  			let promises = [];
  			let css = this.get("setting", `style.styles.${e.detail.styleName}.apply`, []);
  			css.push(e.detail.styleName);
  			for (let i = 0; i < css.length; i++)
  			{
  				promises.push(StylePerk.#_loadCSS(this, css[i]));
  			}

  			// Apply unit-specific CSS
  			await Promise.all(promises);
  			await StylePerk.#__applyAllCSS(this, css);
  		}

  	}

  	// -------------------------------------------------------------------------
  	//  Spells (Unit)
  	// -------------------------------------------------------------------------

  	/**
  	 * Load the CSS.
  	 *
  	 * @param	{Unit}			unit				Unit.
  	 * @param	{String}		styleName			Style name.
  	 * @param	{Object}		options				Load options.
  	 *
  	 * @return 	{Promise}		Promise.
  	 */
  	static #_loadCSS(unit, styleName, options, shared)
  	{

  		let promise = Promise.resolve();
  		let styleInfo = unit.get("inventory", "style.styles").get(styleName) || StylePerk.#__createStyleInfo(unit, styleName);
  		let styleSettings = options || unit.get("setting", `style.styles.${styleName}`, {});

  		if (styleInfo["status"] === "loaded")
  		{
  			console.debug(`StylePerk.#_loadCSS(): Style already loaded. name=${unit.tagName}, styleName=${styleName}`);
  			return Promise.resolve(styleInfo);
  		}

  		Util.warn(styleName === "default" || Object.keys(styleSettings).length > 0, ()=>`Style settings not found. name=${unit.tagName}, styleName=${styleName}`);

  		switch (styleSettings["type"]) {
  		case "CSS":
  			styleInfo["CSS"] = styleSettings["CSS"];
  			break;
  		case "URL":
  		default:
  			if (styleInfo["status"] === "loading")
  			{
  				promise = styleInfo["promise"];
  			}
  			else
  			{
  				let url = styleSettings["URL"] || StylePerk.#__getDefaultURL(unit, styleName, styleSettings);
  				Util.assert(url, () => `StylePerk.#_loadCSS(): CSS URL is not speicified. name=${unit.tagName}, styleName=${styleName}`);
  				promise = AjaxUtil.loadCSS(url).then((css) => {
  					styleInfo["CSS"] = css;
  				});
  				styleInfo["promise"] = promise;
  				styleInfo["status"] = "loading";
  			}
  			break;
  		}

  		return promise.then(() => {
  			styleInfo["status"] = "loaded";
  			styleInfo["shared"] = shared;

  			return styleInfo;
  		});

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Apply style.
  	 *
  	 * @param	{Unit}			unit				Parent unit.
  	 * @param	{String}		styleName			Style name.
  	 */
  	static async #_applyCSS(unit, styleName)
  	{

  		let cssInfo = unit.get("inventory", "style.styles").get(styleName);
  		Util.assert(cssInfo, () => `StylePerk.#_applyCSS(): CSS not loaded. name=${unit.tagName || "Global"}, styleName=${styleName}, id=${unit.id}, uniqueId=${unit.uniqueId}`, ReferenceError);

  		let ss = new CSSStyleSheet();
  		await ss.replace(`${cssInfo["CSS"]}`);

  		let shadowRoot = unit.get("inventory", "skin.shadowRoot");
  		if (shadowRoot)
  		{
  			// Shadow DOM
  			shadowRoot.adoptedStyleSheets = [...shadowRoot.adoptedStyleSheets, ss];
  		}
  		else
  		{
  			// Light DOM
  			styleName = (cssInfo["shared"] ? styleName : `${unit.tagName}.${styleName}`);
  			if (!(styleName in StylePerk.#__applied) || StylePerk.#__applied[styleName]["count"] <= 0)
  			{
  				// Apply styles
  				StylePerk.#__applied[styleName] = StylePerk.#__applied[styleName] || {};
  				document.adoptedStyleSheets = [...document.adoptedStyleSheets, ss];
  				StylePerk.#__applied[styleName]["object"] = ss;
  				StylePerk.#__applied[styleName]["count"] = 1;
  			}
  			else
  			{
  				// Already applied
  				StylePerk.#__applied[styleName]["count"]++;
  			}

  			StylePerk.#__vault.get(unit)["applied"].push(styleName);
  		}

  		console.debug(`StylePerk.#_applyCSS(): Applied CSS. name=${unit.tagName}, styleName=${cssInfo["name"]}, id=${unit.id}, uniqueId=${unit.uniqueId}`);

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Clear styles. Works only in ShadowDOM.
  	 *
  	 * @param	{Unit}			unit				Parent unit.
  	 */
  	static #_clearCSS(unit)
  	{

  		let shadowRoot = unit.get("inventory", "skin.shadowRoot");
  		if (shadowRoot)
  		{
  			// Shadow DOM
  			shadowRoot.adoptedStyleSheets = [];
  		}
  		else
  		{
  			// Light DOM
  			let applied = StylePerk.#__vault.get(unit)["applied"];
  			if (applied.length > 0)
  			{
  				for (let i = 0; i < applied.length; i++)
  				{
  					StylePerk.#__applied[applied[i]]["count"]--;
  				}
  				StylePerk.#__vault.get(unit)["applied"] = [];

  				// Re-apply other CSS
  				document.adoptedStyleSheets = [];
  				Object.keys(StylePerk.#__applied).forEach((key) => {
  					if (StylePerk.#__applied[key]["count"] > 0)
  					{
  						document.adoptedStyleSheets = [...document.adoptedStyleSheets, StylePerk.#__applied[key]["object"]];
  					}
  				});
  			}
  		}

  	}

  	// -------------------------------------------------------------------------
  	//  Privates
  	// -------------------------------------------------------------------------

  	/**
  	 * Apply all CSS.
  	 *
  	 * @param	{Unit}			unit				Unit.
  	 * @param	{Array}			css					Array of CSS names to apply.
  	 */
  	static #__applyAllCSS(unit, css)
  	{

  		let chain = Promise.resolve();

  		for (let i = 0; i < css.length; i++)
  		{
  			chain = chain.then(() => {
  				return StylePerk.#_applyCSS(unit, css[i]);
  			});
  		}

  		return chain;

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Get settings from element's attribute.
  	 *
  	 * @param	{Unit}			unit				Unit.
  	 */
  	static #__loadAttrSettings(unit)
  	{

  		if (unit.hasAttribute("bm-styleref"))
  		{
  			let styleRef = unit.getAttribute("bm-styleref") || true;
  			if (styleRef === "false")
  			{
  				styleRef = false;
  			}

  			unit.set("setting", "style.options.styleRef", styleRef);
  		}

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Adjust unit settings.
  	 *
  	 * @param	{Unit}			unit				Unit.
  	 */
  	static #__adjustSettings(unit)
  	{

  		let url = unit.get("setting", "style.options.styleRef");
  		if (url === false)
  		{
  			unit.set("setting", "style.options.hasStyle", false);
  		}
  		else if (url)
  		{
  			let styleSettings = unit.get("setting", `style.styles.default`, {});
  			styleSettings["type"] = styleSettings["type"] || "URL";
  			styleSettings["URL"] = styleSettings["URL"] || ( typeof(url) === "string" ? url : "" );
  			unit.set("setting", `style.styles.default`, styleSettings);
  			unit.set("setting", "style.options.hasStyle", true);
  		}

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Returns a new Style info object.
  	 *
  	 * @param	{Unit}			unit				Parent unit.
  	 * @param	{String}		styleName			Style name.
  	 *
  	 * @return  {Object}		Style info.
  	 */
  	static #__createStyleInfo(unit, styleName)
  	{

  		let info = {
  			"name": 	styleName,
  			"CSS":		"",
  			"status":	"",
  		};

  		unit.get("inventory", `style.styles`).set(styleName, info);

  		return info;

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Return URL to CSS file.
  	 *
  	 * @param	{Unit}			unit				Unit.
  	 * @param	{String}		styleName			Style name.
  	 * @param	{Object}		options				Options.
  	 *
  	 * @return  {String}		URL.
  	 */
  	static #__getDefaultURL(unit, styleName, options)
  	{

  		let url;

  		let cssRef = unit.get("setting", "style.options.styleRef");
  		if (cssRef && cssRef !== true)
  		{
  			// If URL is specified in ref, use it
  			url = cssRef;
  		}
  		else
  		{
  			// Use default path and filename
  			let path = Util.concatPath([
  					unit.get("setting", "system.style.options.path",
  						unit.get("setting", "system.unit.options.path", "")),
  					Util.safeGet(options, "path",
  						unit.get("setting", "style.options.path",
  							unit.get("setting", "unit.options.path", ""))),
  				]);
  			let fileName =  StylePerk.#__getDefaultFilename(unit, styleName, options) + ".css";
  			let query = unit.get("setting", "unit.options.query");

  			url = Util.concatPath([path, fileName]) + (query ? `?${query}` : "");
  		}

  		return url;

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Get the default style name.
  	 *
  	 * @param	{Unit}			unit				Unit.
  	 * @param	{String}		styleName			Style name.
  	 * @param	{Object}		options				Options.
  	 *
  	 * @return 	{String}		Style name.
  	 */
  	static #__getDefaultFilename(unit, styleName, options)
  	{

  		return	Util.safeGet(options, "fileName",
  					unit.get("setting", "style.options.fileName",
  						unit.get("setting", "unit.options.fileName",
  							unit.tagName.toLowerCase())));

  	}

  }

  // =============================================================================
  /**
   * BitsmistJS - Javascript Web Client Framework
   *
   * @copyright		Masaki Yasutake
   * @link			https://bitsmist.com/
   * @license			https://github.com/bitsmist/bitsmist/blob/main/LICENSE
   */
  // =============================================================================


  // =============================================================================
  //	Event Perk class
  // =============================================================================

  class EventPerk extends Perk
  {

  	// -------------------------------------------------------------------------
  	//  Private Variables
  	// -------------------------------------------------------------------------

  	static #__eventInfo = new WeakMap();
  	static #__info = {
  		"sectionName":		"event",
  		"order":			210,
  	};

  	// -------------------------------------------------------------------------
  	//  Properties
  	// -------------------------------------------------------------------------

  	static get info()
  	{

  		return EventPerk.#__info;

  	}

  	// -------------------------------------------------------------------------
  	//  Methods
  	// -------------------------------------------------------------------------

  	static globalInit(unit, options)
  	{

  		Unit.upgrade("skill", "event.add", EventPerk.#_addEventHandler);
  		Unit.upgrade("skill", "event.remove", EventPerk.#_removeEventHandler);
  		Unit.upgrade("skill", "event.init", EventPerk.#_initEvents);
  		Unit.upgrade("skill", "event.reset", EventPerk.#_removeEvents);
  		Unit.upgrade("skill", "event.triggerSync", EventPerk.#_triggerSync);
  		Unit.upgrade("spell", "event.trigger", EventPerk.#_trigger);

  	}

  	static init(unit, options)
  	{

  		// Add event handlers
  		unit.use("event.add", "doApplySettings", {"handler":EventPerk.#EventPerk_onDoApplySettings, "order":EventPerk.info["order"]});
  		unit.use("event.add", "afterTransform", {"handler":EventPerk.#EventPerk_onAfterTransform, "order":EventPerk.info["order"]});

  	}

  	// -------------------------------------------------------------------------

  	static deinit(unit, options)
  	{

  		let events = unit.get("setting", "event");
  		if (events)
  		{
  			Object.keys(events).forEach((elementName) => {
  				EventPerk.#_removeEvents(unit, elementName, events[eventName]);
  			});
  		}

  	}

  	// -------------------------------------------------------------------------
  	//  Event Handlers (Unit)
  	// -------------------------------------------------------------------------

  	static #EventPerk_onDoApplySettings(sender, e, ex)
  	{

  		Object.entries(Util.safeGet(e.detail, "settings.event.events", {})).forEach(([sectionName, sectionValue]) => {
  			EventPerk.#_initEvents(this, sectionName, sectionValue);
  		});

  	}

  	// -------------------------------------------------------------------------

  	static #EventPerk_onAfterTransform(sender, e, ex)
  	{

  		Object.entries(this.get("setting", "event.events", {})).forEach(([sectionName, sectionValue]) => {
  			// Initialize only elements inside unit
  			if (!EventPerk.#__isTargetSelf(sectionName, sectionValue))
  			{
  				EventPerk.#_initEvents(this, sectionName, sectionValue);
  			}
  		});

  	}

  	// -------------------------------------------------------------------------
  	//  Skills (Unit)
  	// -------------------------------------------------------------------------

  	/**
  	 * Add an event handler.
  	 *
  	 * @param	{Unit}			unit				Unit.
  	 * @param	{String}		eventName			Event name.
  	 * @param	{Object/Function/String}	handlerInfo	Event handler info.
  	 * @param	{HTMLElement}	element				HTML element.
  	 * @param	{Object}		bindTo				Object that binds to the handler.
  	 */
  	static #_addEventHandler(unit, eventName, handlerInfo, element, bindTo)
  	{

  		element = element || unit;
  		let handlerOptions = (typeof handlerInfo === "object" ? handlerInfo : {});

  		// Get handler
  		let handler = EventPerk.#__getEventHandler(unit, handlerInfo);
  		Util.assert(handler, () => `EventPerk.#_addEventHandler(): handler not found. name=${unit.tagName}, eventName=${eventName}`);

  		// Init event info object for the element
  		if (!EventPerk.#__eventInfo.get(element))
  		{
  			EventPerk.#__eventInfo.set(element, {"unit":unit, "listeners":{}, "promises":{}, "statuses":{}});
  		}

  		// Add hook event handler
  		let listeners = EventPerk.#__eventInfo.get(element)["listeners"];
  		if (!listeners[eventName])
  		{
  			listeners[eventName] = [];
  			element.addEventListener(eventName, EventPerk.#__callEventHandler, handlerOptions["listnerOptions"]);
  		}

  		let order = Util.safeGet(handlerOptions, "order", 1000);

  		// Register listener info
  		listeners[eventName].push({"handler":handler, "options":handlerOptions["options"], "bindTo":bindTo, "order":order});

  		// Stable sort by order
  		listeners[eventName].sort((a, b) => {
  			if (a.order === b.order)	return 0;
  			else if (a.order > b.order)	return 1;
  			else 						return -1
  		});

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Remove an event handler.
  	 *
  	 * @param	{Unit}			unit				Unit.
  	 * @param	{String}		eventName			Event name.
  	 * @param	{HTMLElement}	element				HTML element.
  	 * @param	{Object/Function/String}	handlerInfo	Event handler info.
  	 */
  	static #_removeEventHandler(unit, eventName, handlerInfo, element)
  	{

  		element = element || unit;

  		// Get handler
  		let handler = EventPerk.#__getEventHandler(unit, handlerInfo);
  		Util.assert(handler, () => `EventPerk.#_removeEventHandler(): handler not found. name=${unit.tagName}, eventName=${eventName}`);

  		let listeners = Util.safeGet(EventPerk.#__eventInfo.get(element), `.listeners.${eventName}`);
  		if (listeners)
  		{
  			for (let i = listeners.length - 1; i >= 0; i--)
  			{
  				if (listeners[i]["handler"] === handler)
  				{
  					listeners.splice(i, 1);
  					break;
  				}
  			}
  		}

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Set event handlers to the element.
  	 *
  	 * @param	{Unit}			unit				Unit.
  	 * @param	{String}		elementName			Element name.
  	 * @param	{Object}		eventInfo			Event info.
  	 * @param	{HTMLElement}	rootNode			Root node of elements.
  	 */
  	static #_initEvents(unit, elementName, eventInfo, rootNode)
  	{

  		eventInfo = ( eventInfo ? eventInfo : unit.get("setting", `event.events.${elementName}`) );

  		// Get target elements
  		let elements = EventPerk.#__getTargetElements(unit, rootNode, elementName, eventInfo);
  		//Util.warn(elements.length > 0, `EventPerk.#_initEvents: No elements for the event found. name=${unit.tagName}, elementName=${elementName}`);

  		// Set event handlers
  		Object.keys(eventInfo["handlers"]).forEach((eventName) => {
  			let handlers = ( Array.isArray(eventInfo["handlers"][eventName]) ? eventInfo["handlers"][eventName] : [eventInfo["handlers"][eventName]] );
  			for (let i = 0; i < handlers.length; i++)
  			{
  				for (let j = 0; j < elements.length; j++)
  				{
  					EventPerk.#_addEventHandler(unit, eventName, handlers[i], elements[j]);
  				}
  			}
  		});

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Remove event handlers from the element.
  	 *
  	 * @param	{Unit}			unit				Unit.
  	 * @param	{String}		elementName			Element name.
  	 * @param	{Object}		eventInfo			Event info.
  	 * @param	{HTMLElement}	rootNode			Root node of elements.
  	 */
  	static #_removeEvents(unit, elementName, eventInfo, rootNode)
  	{

  		eventInfo = ( eventInfo ? eventInfo : unit.get("setting", `event.events.${elementName}`) );

  		// Get target elements
  		let elements = EventPerk.#__getTargetElements(unit, rootNode, elementName, eventInfo);
  		//Util.warn(elements.length > 0, `EventPerk.#_removeEvents: No elements for the event found. name=${unit.tagName}, elementName=${elementName}`);

  		// Remove event handlers
  		Object.keys(eventInfo["handlers"]).forEach((eventName) => {
  			let handlers = ( Array.isArray(eventInfo["handlers"][eventName]) ? eventInfo["handlers"][eventName] : [eventInfo["handlers"][eventName]] );
  			for (let i = 0; i < handlers.length; i++)
  			{
  				for (let j = 0; j < elements.length; j++)
  				{
  					unit.removeEventHandler(eventName, handlers[i], elements[j]);
  				}
  			}
  		});

  	}

  	// -------------------------------------------------------------------------
  	//  Spells (Unit)
  	// -------------------------------------------------------------------------

  	/**
  	 * Trigger the event synchronously.
  	 *
  	 * @param	{Unit}			unit					Unit.
  	 * @param	{String}		eventName				Event name to trigger.
  	 * @param	{Object}		options					Event parameter options.
  	 * @param	{HTMLElement}	element					HTML element.
  	 */
  	static #_trigger(unit, eventName, options, element)
  	{

  		options = options || {};
  		element = ( element ? element : unit );

  		element.dispatchEvent(new CustomEvent(eventName, { detail: options }));

  		// return the promise if exists
  		return Util.safeGet(EventPerk.#__eventInfo.get(element), `promises.${eventName}`) || Promise.resolve();

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Trigger the event synchronously.
  	 *
  	 * @param	{Unit}			unit					Unit.
  	 * @param	{String}		eventName				Event name to trigger.
  	 * @param	{Object}		options					Event parameter options.
  	 * @param	{HTMLElement}	element					HTML element.
  	 */
  	static #_triggerSync(unit, eventName, options, element)
  	{

  		options = options || {};
  		options["async"] = true;

  		return EventPerk.#_trigger(unit, eventName, options, element);

  	}

  	// -------------------------------------------------------------------------
  	//  Privates
  	// -------------------------------------------------------------------------

  	/**
  	 * Get the event handler from the handler info object.
  	 *
  	 * @param	{Unit}			unit					Unit.
  	 * @param	{Object/Function/String}	handlerInfo	Handler info.
  	 */
  	static #__getEventHandler(unit, handlerInfo)
  	{

  		let handler = ( typeof handlerInfo === "object" ? handlerInfo["handler"] : handlerInfo );

  		return handler;

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Check if the target element is unit itself.
  	 *
  	 * @param	{String}		elementName			Element name.
  	 * @param	{Object}		elementInfo			Element info.
  	 *
  	 * @return 	{Boolean}		Target node list.
  	 */
  		static #__isTargetSelf(elementName, eventInfo)
  	{

  		let ret = false;

  		if (elementName === "this" || eventInfo && eventInfo["selector"] === "this")
  		{
  			ret = true;
  		}

  		return ret;

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Get target elements for the eventInfo.
  	 *
  	 * @param	{Unit}			unit				Unit.
  	 * @param	{HTMLElement}	rootNode			Root node to search elements.
  	 * @param	{String}		elementName			Element name.
  	 * @param	{Object}		elementInfo			Element info.
  	 *
  	 * @return 	{Array}			Target node list.
  	 */
  	static #__getTargetElements(unit, rootNode, elementName, eventInfo)
  	{

  		rootNode = rootNode || unit;
  		let elements;

  		if (EventPerk.#__isTargetSelf(elementName, eventInfo))
  		{
  			// Target is "this"
  			elements = [rootNode];
  		}
  		else if (eventInfo && eventInfo["selector"])
  		{
  			// If eventInfo["selector"] is specified, target is eventInfo["selector"]
  			elements = Util.scopedSelectorAll(rootNode, eventInfo["selector"]);
  		}
  		else
  		{
  			// Target is #elementName
  			elements = Util.scopedSelectorAll(rootNode, `#${elementName}`);
  		}

  		return elements;

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Check if the given handler is already installed.
  	 *
  	 * @param	{HTMLElement}	element				HTMLElement to check.
  	 * @param	{String}		eventName			Event name.
  	 * @param	{Function}		handler				Event handler.
  	 *
  	 * @return 	{Boolean}		True if already installed.
  	 */
  	static #__isHandlerInstalled(element, eventName, handler)
  	{

  		let isInstalled = false;
  		let listeners = Util.safeGet(EventPerk.#__eventInfo.get(element), `listeners.${eventName}`);

  		if (listeners)
  		{
  			for (let i = 0; i < listeners.length; i++)
  			{
  				if (listeners[i]["handler"] === handler)
  				{
  					isInstalled = true;
  					break;
  				}
  			}
  		}

  		return isInstalled;

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Call event handlers.
  	 *
  	 * This function is registered as event listener by element.addEventListener(),
  	 * so "this" is HTML element that triggered the event.
  	 *
  	 * @param	{Object}		e						Event parameter.
  	 */
  	static #__callEventHandler(e)
  	{

  		let eventInfo = EventPerk.#__eventInfo.get(this);
  		let listeners = Util.safeGet(eventInfo, `listeners.${e.type}`);
  		let sender = Util.safeGet(e, "detail.sender", this);
  		let unit = Util.safeGet(eventInfo, "unit");
  		let templateStatuses = `statuses.${e.type}`;
  		let templatePromises = `promises.${e.type}`;

  		// Check if handler is already running
  		//Util.warn(Util.safeGet(this, templateStatuses) !== "handling", `EventPerk.#__callEventHandler(): Event handler is already running. name=${this.tagName}, eventName=${e.type}`);

  		Util.safeSet(eventInfo, templateStatuses, "handling");

  		if (Util.safeGet(e, "detail.async", false) === false)
  		{
  			// Async
  			eventInfo["promises"][e.type] = EventPerk.#__handle(e, sender, unit, listeners).then(() => {
  				Util.safeSet(eventInfo, templatePromises, null);
  				Util.safeSet(eventInfo, templateStatuses, "");
  			}).catch((err) => {
  				Util.safeSet(eventInfo, templatePromises, null);
  				Util.safeSet(eventInfo, templateStatuses, "");
  				throw(err);
  			});
  		}
  		else
  		{
  			// Sync
  			try
  			{
  				eventInfo["promises"][e.type] = EventPerk.#__handleSync(e, sender, unit, listeners);
  				Util.safeSet(eventInfo, templatePromises, null);
  				Util.safeSet(eventInfo, templateStatuses, "");
  			}
  			catch (err)
  			{
  				Util.safeSet(eventInfo, templatePromises, null);
  				Util.safeSet(eventInfo, templateStatuses, "");
  				throw err;
  			}
  		}

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Call event handlers.
  	 *
  	 * @param	{Object}		e						Event parameter.
  	 * @param	{Object}		sender					Sender object.
  	 * @param	{Object}		unit					Target unit.
  	 * @param	{Object}		listener				Listers info.
  	 */
  	static #__handle(e, sender, unit, listeners)
  	{

  		let chain = Promise.resolve();
  		let stopPropagation = false;

  		for (let i = 0; i < listeners.length; i++)
  		{
  			// Options set in addEventHandler()
  			let ex = {
  				"unit": unit,
  				"options": ( listeners[i]["options"] ? listeners[i]["options"] : {} )
  			};

  			chain = chain.then(() => {
  				// Get the handler
  				let handler = listeners[i]["handler"];
  				handler = ( typeof handler === "string" ? unit[handler] : handler );
  				Util.assert(typeof handler === "function", () => `EventPerk.#__handle(): Event handler is not a function. name=${unit.tagName}, eventName=${e.type}`, TypeError);

  				// Execute the handler
  				let bindTo = ( listeners[i]["bindTo"] ? listeners[i]["bindTo"] : unit );
  				return handler.call(bindTo, sender, e, ex);
  			});

  			stopPropagation = (listeners[i]["options"] && listeners[i]["options"]["stopPropagation"] ? true : stopPropagation);
  		}

  		if (stopPropagation)
  		{
  			e.stopPropagation();
  		}

  		return chain;

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Call event handlers Synchronously.
  	 *
  	 * @param	{Object}		e						Event parameter.
  	 * @param	{Object}		sender					Sender object.
  	 * @param	{Object}		unit					Target unit.
  	 * @param	{Object}		listener				Listers info.
  	 */
  	static #__handleSync(e, sender, unit, listeners)
  	{

  		let stopPropagation = false;

  		for (let i = 0; i < listeners.length; i++)
  		{
  			// Options set on addEventHandler()
  			let ex = {
  				"unit": unit,
  				"options": ( listeners[i]["options"] ? listeners[i]["options"] : {} )
  			};

  			// Get the handler
  			let handler = listeners[i]["handler"];
  			handler = ( typeof handler === "string" ? unit[handler] : handler );
  			Util.assert(typeof handler === "function", () => `EventPerk.#__handleSync(): Event handler is not a function. name=${unit.tagName}, eventName=${e.type}`, TypeError);

  			// Execute handler
  			let bindTo = ( listeners[i]["bindTo"] ? listeners[i]["bindTo"] : unit );
  			handler.call(bindTo, sender, e, ex);

  			stopPropagation = (listeners[i]["options"] && listeners[i]["options"]["stopPropagation"] ? true : stopPropagation);
  		}

  		if (stopPropagation)
  		{
  			e.stopPropagation();
  		}

  		return Promise.resolve();

  	}

  }

  // =============================================================================
  /**
   * BitsmistJS - Javascript Web Client Framework
   *
   * @copyright		Masaki Yasutake
   * @link			https://bitsmist.com/
   * @license			https://github.com/bitsmist/bitsmist/blob/main/LICENSE
   */
  // =============================================================================


  // =============================================================================
  //	Unit Perk Class
  // =============================================================================

  class UnitPerk extends Perk
  {

  	// -------------------------------------------------------------------------
  	//  Private Variables
  	// -------------------------------------------------------------------------

  	static #__classInfo = {"Unit": {"status":"loaded"}};
  	static #__info = {
  		"sectionName":		"unit",
  		"order":			400,
  	};

  	// -------------------------------------------------------------------------
  	//  Properties
  	// -------------------------------------------------------------------------

  	static get info()
  	{

  		return UnitPerk.#__info;

  	}

  	// -------------------------------------------------------------------------
  	//  Methods
  	// -------------------------------------------------------------------------

  	static async globalInit()
  	{

  		// Upgrade Unit
  		Unit.upgrade("spell", "unit.materializeAll", UnitPerk.#_loadTags);
  		Unit.upgrade("spell", "unit.materialize", UnitPerk.#_loadUnit);
  		Unit.upgrade("spell", "unit.summon", UnitPerk.#_loadClass);

  	}

  	// -------------------------------------------------------------------------

  	static init(unit, options)
  	{

  		// Upgrade unit
  		unit.upgrade("inventory", "unit.units", {});

  		// Add event handlers
  		unit.use("event.add", "doApplySettings", {"handler":UnitPerk.#UnitPerk_onDoApplySettings, "order":UnitPerk.info["order"]});

  		let settings = UnitPerk.#__loadAttrSettings(unit);
  		unit.use("setting.merge", settings);

  	}

  	// -------------------------------------------------------------------------
  	//  Event Handlers (Unit)
  	// -------------------------------------------------------------------------

  	static #UnitPerk_onDoApplySettings(sender, e, ex)
  	{

  		let chain = Promise.resolve();

  		Object.entries(Util.safeGet(e.detail, "settings.unit.units", {})).forEach(([sectionName, sectionValue]) => {
  			chain = chain.then(() => {
  				if (!this.get("inventory", `unit.units.${sectionName}.object`))
  				{
  					let parentUnit = Util.safeGet(sectionValue, "unit.options.parentUnit");
  					let targetUnit = ( parentUnit ? this.use("basic.locate", parentUnit) : this );
  					return targetUnit.cast("unit.materialize", sectionName, sectionValue);
  				}
  			});
  		});

  		return chain;

  	}

  	// -------------------------------------------------------------------------
  	//  Spells (Unit)
  	// -------------------------------------------------------------------------

  	/**
  	 * Load the class.
  	 *
  	 * @param	{String}		tagName				Tag name.
  	 * @param	{Object}		settings			Unit settings.
  	 *
  	 * @return  {Promise}		Promise.
  	 */
  	static #_loadClass(tagName, settings)
  	{

  		console.debug(`UnitPerk.#_loadClass(): Loading class. tagName=${tagName}`);

  		tagName = tagName.toLowerCase();
  		let className = Util.safeGet(settings, "unit.options.className", Util.getClassNameFromTagName(tagName));
  		let baseClassName = Util.safeGet(settings, "unit.options.autoMorph", className );
  		baseClassName = ( baseClassName === true ? "Unit" : baseClassName );

  		// Load the class if needed
  		let promise = Promise.resolve();
  		if (UnitPerk.#__hasExternalClass(tagName, baseClassName, settings))
  		{
  			if (UnitPerk.#__classInfo[baseClassName] && UnitPerk.#__classInfo[baseClassName]["status"] === "loading")
  			{
  				// Already loading
  				console.debug(`UnitPerk.#_loadClass(): Class Already loading. className=${className}, baseClassName=${baseClassName}`);
  				promise = UnitPerk.#__classInfo[baseClassName].promise;
  			}
  			else
  			{
  				// Need loading
  				console.debug(`ClassPerk.#_loadClass(): Loading class. className=${className}, baseClassName=${baseClassName}`);
  				UnitPerk.#__classInfo[baseClassName] = {"status":"loading"};

  				let options = {};
  				options["type"] = Unit.get("setting", "system.unit.options.type", "text/javascript");
  				promise = AjaxUtil.loadClass(UnitPerk.#__getClassURL(tagName, settings), options).then(() => {
  					UnitPerk.#__classInfo[baseClassName] = {"status":"loaded"};
  				});
  				UnitPerk.#__classInfo[baseClassName].promise = promise;
  			}
  		}

  		return promise.then(() => {
  			if (baseClassName !== className)
  			{
  				// Morph
  				let superClass = ClassUtil.getClass(baseClassName);
  				ClassUtil.newUnit(className, settings, superClass, tagName);
  				UnitPerk.#__classInfo[className] = {"status":"loaded"};
  			}

  			// Define the tag
  			if (!customElements.get(tagName))
  			{
  				let classDef = ClassUtil.getClass(className);
  				Util.assert(classDef, () => `UnitPerk.#_loadClass(): Class does not exist. tagName=${tagName}, className=${className}`);

  				customElements.define(tagName, classDef);
  			}
  		});

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Load the unit and add to parent unit.
  	 *
  	 * @param	{Unit}			unit				Parent unit.
  	 * @param	{String}		tagName				Unit tag name.
  	 * @param	{Object}		settings			Settings for the unit.
  	 * @param	{Object}		options				Load Options.
  	 *
  	 * @return  {Promise}		Promise.
  	 */
  	static async #_loadUnit(unit, tagName, settings, options)
  	{

  		console.debug(`UnitPerk.#_loadUnit(): Adding the unit. name=${unit.tagName}, tagName=${tagName}`);

  		// Already loaded
  		if (unit.get("inventory", `unit.units.${tagName}.object`))
  		{
  			console.debug(`UnitPerk.#_loadUnit(): Already loaded. name=${unit.tagName}, tagName=${tagName}`);
  			return Promise.resolve(unit.get("inventory", `unit.units.${tagName}.object`));
  		}

  		// Get the tag name from settings if specified
  		let tag = Util.safeGet(settings, "unit.options.tag");
  		if (tag)
  		{
  			tagName = tag.match(/([\w-]+)\s+\w+.*?>/)[1];
  		}

  		// Load class
  		await UnitPerk.#_loadClass(tagName, settings);

  		// Insert tag
  		let addedUnit = await UnitPerk.#__insertTag(unit, tagName, settings);
  		unit.set("inventory", `unit.units.${tagName}.object`, addedUnit);

  		// Wait for the added unit to be ready
  		let sync = Util.safeGet(options, "syncOnAdd", Util.safeGet(settings, "unit.options.syncOnAdd"));
  		if (sync)
  		{
  			await unit.cast("status.wait", [{
  				"uniqueId":	addedUnit.uniqueId,
  				"status":	(sync === true ? "ready" : sync)
  			}]);
  		}

  		return addedUnit;

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Load scripts for tags that has bm-autoload/bm-automorph attribute.
  	 *
  	 * @param	{Unit}			unit				Unit. Nullable.
  	 * @param	{HTMLElement}	rootNode			Target node.
  	 * @param	{Object}		options				Load Options.
  	 *
  	 * @return  {Promise}		Promise.
  	 */
  	static #_loadTags(unit, rootNode, options)
  	{

  		console.debug(`UnitPerk.#_loadTags(): Loading tags. rootNode=${rootNode.tagName}`);

  		let promises = [];

  		// Load tags that has bm-autoload/bm-classref/bm-automorph attribute
  		let targets = Util.scopedSelectorAll(rootNode, "[bm-autoload]:not([bm-autoloading]):not([bm-powered]),[bm-automorph]:not([bm-autoloading]):not([bm-powered]),[bm-classref]:not([bm-autoloading]):not([bm-powered]),[bm-htmlref]:not([bm-autoloading]):not([bm-powered])");
  		targets.forEach((element) => {
  			// Get settings from attributes
  			let settings = UnitPerk.#__loadAttrSettings(element);

  			element.setAttribute("bm-autoloading", "");
  			element._injectSettings = function(curSettings){
  				return Util.deepMerge(curSettings, settings);
  			};

  			// Load the class
  			promises.push(UnitPerk.#_loadClass(element.tagName, settings).then(() => {
  				element.removeAttribute("bm-autoloading");
  			}));
  		});

  		return Promise.all(promises).then(() => {
  			let waitFor = Util.safeGet(options, "waitForTags");
  			if (waitFor)
  			{
  				return UnitPerk.#__waitForChildren(rootNode);
  			}
  		});

  	}

  	// -------------------------------------------------------------------------
  	//  Privates
  	// -------------------------------------------------------------------------

  	/**
  	 * Get settings from unit's attribute.
  	 *
  	 * @param	{Unit}			unit				Unit.
  	 */
  	static #__loadAttrSettings(unit)
  	{

  		let settings = {
  			"unit": {
  				"options": {}
  			}
  		};

  		// Class name
  		if (unit.hasAttribute("bm-classname"))
  		{
  			settings["unit"]["options"]["className"] = unit.getAttribute("bm-classname");
  		}

  		// Split  class
  		if (unit.hasAttribute("bm-splitclass"))
  		{
  			let splitClass = unit.getAttribute("bm-splitclass") || true;
  			if (splitClass === "false")
  			{
  				splitClass = false;
  			}
  			settings["unit"]["options"]["splitClass"] = splitClass;
  		}

  		// Path
  		if (unit.hasAttribute("bm-path"))
  		{
  			settings["unit"]["options"]["path"] = unit.getAttribute("bm-path");
  		}

  		// File name
  		if (unit.hasAttribute("bm-filename"))
  		{
  			settings["unit"]["options"]["fileName"] = unit.getAttribute("bm-filename");
  		}

  		// Morphing
  		if (unit.hasAttribute("bm-automorph"))
  		{
  			settings["unit"]["options"]["autoMorph"] = ( unit.getAttribute("bm-automorph") ? unit.getAttribute("bm-automorph") : true );
  		}
  		if (unit.hasAttribute("bm-htmlref"))
  		{
  			settings["unit"]["options"]["autoMorph"] = ( unit.getAttribute("bm-htmlref") ? unit.getAttribute("bm-htmlref") : true );
  		}

  		// Auto loading
  		if (unit.hasAttribute("bm-autoload"))
  		{
  			settings["unit"]["options"]["autoLoad"] = ( unit.getAttribute("bm-autoload") ? unit.getAttribute("bm-autoload") : true );
  		}
  		if (unit.hasAttribute("bm-classref"))
  		{
  			settings["unit"]["options"]["autoLoad"] = ( unit.getAttribute("bm-classref") ? unit.getAttribute("bm-classref") : true );
  		}

  		//return settings;
  		return UnitPerk.#__adjustSettings(unit, settings);

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Adjust unit settings.
  	 *
  	 * @param	{Unit}			unit				Unit.
  	 */
  	static #__adjustSettings(unit, settings)
  	{

  		let autoLoad = Util.safeGet(settings, "unit.options.autoLoad");
  		if (typeof(autoLoad) === "string")
  		{
  			let url = URLUtil.parseURL(autoLoad);
  			settings["unit"]["options"]["path"] = url.path;
  			settings["unit"]["options"]["fileName"] = url.filenameWithoutExtension;

  			if (url.extension === "html")
  			{
  				settings["unit"]["options"]["autoMorph"] = Util.safeGet(settings, "unit.options.autoMorph", true);
  			}
  		}


  		return settings;

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Check if the unit has the external class file.
  	 *
  	 * @param	{String}		tagName				Tag name.
  	 * @param	{String}		className			Class name.
  	 * @param	{Object}		settings			Unit settings.
  	 *
  	 * @return  {Boolean}		True if the unit has the external class file.
  	 */
  	static #__hasExternalClass(tagName, className, settings)
  	{

  		let ret = false;

  		if ((Util.safeGet(settings, "unit.options.classRef"))
  				|| (Util.safeGet(settings, "unit.options.htmlRef"))
  				|| (Util.safeGet(settings, "unit.options.autoLoad"))
  				|| (Util.safeGet(settings, "unit.options.autoMorph")))
  		{
  			ret = true;

  			if (UnitPerk.#__classInfo[className] && UnitPerk.#__classInfo[className]["status"] === "loaded")
  			{
  				ret = false;
  			}
  			else if (customElements.get(tagName))
  			{
  				ret = false;
  			}
  			else if (ClassUtil.getClass(className))
  			{
  				ret = false;
  			}
  		}

  		return ret;

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Insert the tag and return the inserted unit.
  	 *
  	 * @param	{String}		tagName				Tagname.
  	 * @param	{Object}		settings			Unit settings.
  	 *
  	 * @return  {Unit}		Unit.
  	 */
  	static #__insertTag(unit, tagName, settings)
  	{

  		let addedUnit;
  		let root;

  		// Check root node
  		if (Util.safeGet(settings, "unit.options.parentNode"))
  		{
  			root = unit.use("basic.scan", Util.safeGet(settings, "unit.options.parentNode"));
  		}
  		else
  		{
  			root = this.get("inventory", "basic.unitRoot");
  		}

  		Util.assert(root, () => `UnitPerk.#__insertTag(): Root node does not exist. name=${unit.tagName}, tagName=${tagName}, parentNode=${Util.safeGet(settings, "unit.options.parentNode")}`, ReferenceError);

  		// Build tag
  		let tag = ( Util.safeGet(settings, "unit.options.tag") ? Util.safeGet(settings, "unit.options.tag") : `<${tagName}></${tagName}>` );

  		// Insert tag
  		if (Util.safeGet(settings, "unit.options.replaceParent"))
  		{
  			root.outerHTML = tag;
  			addedUnit = root;
  		}
  		else
  		{
  			let position = Util.safeGet(settings, "unit.options.adjacentPosition", "afterbegin");
  			root.insertAdjacentHTML(position, tag);

  			// Get new instance
  			switch (position)
  			{
  			case "beforebegin":
  				addedUnit = root.previousSibling;
  				break;
  			case "afterbegin":
  				addedUnit = root.children[0];
  				break;
  			case "beforeend":
  				addedUnit = root.lastChild;
  				break;
  			case "afterend":
  				addedUnit = root.nextSibling;
  				break;
  			}
  		}

  		// Inject settings to added unit
  		addedUnit._injectSettings = function(curSettings){
  			return Util.deepMerge(curSettings, settings);
  		};

  		return addedUnit;

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Wait for units under the specified root node to be ready.
  	 *
  	 * @param	{HTMLElement}	rootNode			Target node.
  	 *
  	 * @return  {Promise}		Promise.
  	 */
  	static #__waitForChildren(rootNode)
  	{

  		let waitList = [];
  		let targets = Util.scopedSelectorAll(rootNode, "[bm-powered],[bm-autoloading]");
  		targets.forEach((element) => {
  			if (rootNode != element.rootElement && !element.hasAttribute("bm-nowait"))
  			{
  				let waitItem = {"object":element, "status":"ready"};
  				waitList.push(waitItem);
  			}
  		});

  		return StatusPerk.waitFor(waitList, {"waiter":rootNode});

  	}

  	// -------------------------------------------------------------------------

  	/**
  	 * Return URL to Class file.
  	 *
  	 * @param	{String}		tagName				Tag name.
  	 * @param	{Object}		settings			Unit settings.
  	 *
  	 * @return  {String}		URL.
  	 */
  	static #__getClassURL(tagName, settings)
  	{

  		let path = Util.concatPath([
  			Util.safeGet(settings, "system.unit.options.path", Unit.get("setting", "system.unit.options.path", "")),
  			Util.safeGet(settings, "unit.options.path", ""),
  		]);
  		let fileName = Util.safeGet(settings, "unit.options.fileName", tagName);
  		let query = Util.safeGet(settings, "unit.options.query");

  		return Util.concatPath([path, fileName]) + (query ? `?${query}` : "");

  	}

  }

  // =============================================================================
  /**
   * BitsmistJS - Javascript Web Client Framework
   *
   * @copyright		Masaki Yasutake
   * @link			https://bitsmist.com/
   * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
   */
  // =============================================================================


  // Export to global BITSMIST.V1
  if (!globalThis.BITSMIST)
  {
  	globalThis.BITSMIST = {};
  	globalThis.BITSMIST.V1 = {};
  	globalThis.BITSMIST.V1.$CORE = {};
  	globalThis.BITSMIST.V1.$CORE.Util = Util;
  	globalThis.BITSMIST.V1.$CORE.ClassUtil = ClassUtil;
  	globalThis.BITSMIST.V1.$CORE.AjaxUtil = AjaxUtil;
  	globalThis.BITSMIST.V1.$CORE.URLUtil = URLUtil;
  	globalThis.BITSMIST.V1.$CORE.Store = Store;
  	globalThis.BITSMIST.V1.$CORE.ChainableStore = ChainableStore;
  	globalThis.BITSMIST.V1.$CORE.Perk = Perk;
  	globalThis.BITSMIST.V1.$CORE.Unit = Unit;
  }

  // Shortcut
  globalThis.BITSMIST.V1.Unit = Unit;

  // Register Perks (Order matters)
  Perk.registerPerk(BasicPerk);
  Perk.registerPerk(Perk);
  Perk.registerPerk(SettingPerk);
  Perk.registerPerk(StatusPerk);
  Perk.registerPerk(SkinPerk);
  Perk.registerPerk(StylePerk);
  Perk.registerPerk(EventPerk);
  Perk.registerPerk(UnitPerk);

  // Load Tags
  BasicPerk.ready.then(async () => {
  	if (Unit.get("setting", "system.unit.options.autoLoadOnStartup", true))
  	{
  		Unit.cast("unit.materializeAll", document.body, {"waitForTags":false});
  	}
  });

  exports.AjaxUtil = AjaxUtil;
  exports.ChainableStore = ChainableStore;
  exports.ClassUtil = ClassUtil;
  exports.Perk = Perk;
  exports.Store = Store;
  exports.URLUtil = URLUtil;
  exports.Unit = Unit;
  exports.Util = Util;

}));
//# sourceMappingURL=bitsmist-js_v1.js.map
