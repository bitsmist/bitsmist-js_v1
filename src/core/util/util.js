// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import Unit from "../unit/unit.js";

// =============================================================================
//	Util class
// =============================================================================

export default class Util
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
		{
		}
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
				current[keys[i]] = {}
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
