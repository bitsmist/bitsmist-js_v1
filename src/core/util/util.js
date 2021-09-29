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

export default class Util
{

	/**
	 * Get an value from store. Return default value when specified key is not available.
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

		return ( found ? current : defaultValue);

	}

	// -----------------------------------------------------------------------------

	/**
	 * Set an value to store.
	 *
	 * @param	{Object}		store				Object that holds keys/values.
	 * @param	{String}		key					Key to store.
	 * @param	{Object}		value				Value to store.
	 */
	static safeSet(store, key, value)
	{

		let current = store;
		let items = key.split(".");
		for (let i = 0; i < items.length - 1; i++)
		{
			Util.assert(current && typeof current === "object",
				`Util.safeSet(): Key already exists. key=${key}, existingKey=${( i > 0 ? items[i-1] : "" )}, existingValue=${current}`, TypeError);

			if (!(items[i] in current))
			{
				current[items[i]] = {}
			}

			current = current[items[i]];
		}

		current[items[items.length - 1]] = value;

		return store;

	}

	// -----------------------------------------------------------------------------

	/**
	 * Set an value to store. Unlike safeSet() if both the existing value and
	 * the value is an object, it merges them instead of overwrite it.
	 *
	 * @param	{Object}		store				Object that holds keys/values.
	 * @param	{String}		key					Key to store.
	 * @param	{Object}		value				Value to store.
	 */
	static safeMerge(store, key, value)
	{

		let current = store;
		let items = key.split(".");
		for (let i = 0; i < items.length - 1; i++)
		{
			Util.assert(current && typeof current === "object",
				`Util.safeSet(): Key already exists. key=${key}, existingKey=${( i > 0 ? items[i-1] : "" )}, existingValue=${current}`, TypeError);

			if (!(items[i] in current))
			{
				current[items[i]] = {}
			}

			current = current[items[i]];
		}

		// Overwrite/Merge value
		let lastWord = items[items.length - 1];
		if (current[lastWord] && (typeof current[lastWord] === "object") && value && (typeof value === "object"))
		{
			Util.deepMerge(current[lastWord], value);
		}
		else
		{
			current[lastWord] = value;
		}

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
	 * @param	{Object}		context				Context refered as "this" inside the code.
	 * @param	{Object}		parameters			Parameters passed to the code.
	 *
	 * @return	{*}				Result of eval.
	 */
	static safeEval(code, context, parameters)
	{

		let names;
		let values = [];

		if (parameters)
		{
			names = Object.keys(parameters).join(",");
			Object.keys(parameters).forEach((key) => {
				values.push(parameters[key]);
			});
		}

		return Function(names, '"use strict";return (' + code + ')').apply(context, values);

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
	 * Deep merge two objects. Merge obj2 into obj1.
	 *
	 * @param	{Object}		obj1					Object1.
	 * @param	{Object}		obj2					Object2.
	 *
	 * @return  {Object}		Merged object.
	 */
	static deepMerge(obj1, obj2)
	{

		Util.assert(obj1 && typeof obj1 === "object" && obj2 && typeof obj2 === "object", `Util.deepMerge(): "obj1" and "obj2" parameters must be an object.`, TypeError);

		Object.keys(obj2).forEach((key) => {
			// array <--- *
			if (Array.isArray(obj1[key]))
			{
				obj1[key] = obj1[key].concat(obj2[key]);
			}
			// object <--- object
			else if (
				obj1.hasOwnProperty(key) &&
				obj1[key] && typeof obj1[key] === "object" &&
				obj2[key] && typeof obj2[key] === "object" &&
				!(obj1[key] instanceof HTMLElement) &&
				!(obj2[key] instanceof HTMLElement)
			)
			{
				Util.deepMerge(obj1[key], obj2[key]);
			}
			// value <--- *
			else
			{
				obj1[key] = obj2[key];
			}
		});

		return obj1;

	}

	// -------------------------------------------------------------------------

	/**
	 * Deep clone an objects into another object.
	 *
	 * @param	{Object}		obj1					Object1.
	 * @param	{Object}		obj2					Object2.
	 *
	 * @return  {Object}		Merged object.
	 */
	static deepClone(obj1, obj2)
	{

		Util.assert(obj1 && typeof obj1 === "object" && obj2 && typeof obj2 === "object", `Util.deepMerge(): "obj1" and "obj2" parameters must be an object.`, TypeError);

		Object.keys(obj2).forEach((key) => {
			// array <--- *
			if (Array.isArray(obj1[key]))
			{
				obj1[key] = obj1[key].concat(obj2[key]);
			}
			// object <--- object
			else if (
				obj1.hasOwnProperty(key) &&
				obj1[key] && typeof obj1[key] === "object" &&
				obj2[key] && typeof obj2[key] === "object" &&
				!(obj1[key] instanceof HTMLElement) &&
				!(obj2[key] instanceof HTMLElement)
			)
			{
				Util.deepClone(obj1[key], obj2[key]);
			}
			// * <--- array
			else if (Array.isArray(obj2[key]))
			{
				obj1[key] = Util.deepCloneArray(obj2[key]);
			}
			// * <--- object
			else if (
				obj2[key] && typeof obj2[key] === "object" &&
				!(obj2[key] instanceof HTMLElement)
			)
			{
				obj1[key] = {};
				Util.deepClone(obj1[key], obj2[key]);
			}
			// value <--- value
			else
			{
				obj1[key] = obj2[key];
			}
		});

		return obj1;

	}

	// -------------------------------------------------------------------------

	/**
	 * Deep clone an array.
	 *
	 * @param	{Object}		arr						Array.
	 *
	 * @return  {Object}		Merged array.
	 */
	static deepCloneArray(arr)
	{

		Util.assert(Array.isArray(arr), `Util.deepCloneArray(): "arr" parameter must be an array.`, TypeError);

		let result = [];

		for (let i = 0; i < arr.length; i++)
		{
			if (
				arr[i] && typeof arr[i] === "object" &&
				!(arr[i] instanceof HTMLElement)
			)
			{
				result.push(Util.deepClone({}, arr[i]));
			}
			else
			{
				result.push(arr[i]);
			}
		}

		return result;

	}

	// -----------------------------------------------------------------------------

	/**
	 * Get a class name from tag name.
	 *
	 * @param	{String}		tagName				Tag name.
	 *
	 * @return  {String}		Class name.
	 */
	static getClassNameFromTagName(tagName)
	{

		let tag = tagName.split("-");
		let className = tag[0].charAt(0).toUpperCase() + tag[0].slice(1).toLowerCase() + tag[1].charAt(0).toUpperCase() + tag[1].slice(1).toLowerCase();

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
			if ( Util.__isUpper(cName.substring(pos, pos + 1)) )
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
	 * Get file name and path from url.
	 *
	 * @param	{String}		path				Path.
	 *
	 * @return 	{String}		File name.
	 */
	static getFilenameAndPathFromUrl(url)
	{

		let pos = url.lastIndexOf("/");
		let path = url.substr(0, pos);
		let fileName = url.substr(pos + 1);

		return [path, fileName];

	}

	// -------------------------------------------------------------------------

	/**
	 * Check if character is upper case.
	 *
	 * @param	{String}		c					Character.
	 *
	 * @return 	{Boolean}		True if it is upper case.
	 */
	static __isUpper(c)
	{

		return c === c.toUpperCase() && c !== c.toLowerCase();

	}

	// -------------------------------------------------------------------------

	/**
	 * Assert conditions. Throws an error when assertion failed.
	 *
	 * @param	{Boolean}		conditions			Conditions.
	 * @param	{String}		Message				Error message.
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
	 * @param	{String}		Message				Error message.
	 * @param	{String}		level				Warn level.
	 * @param	{Options}		options				Options.
	 *
	 * @return 	{Boolean}		True if it is upper case.
	 */
	static warn(conditions, msg, level, options)
	{

		let ret = true;

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
	static scopedSelectorAll(rootNode, query)
	{

		// Set temp id
		let guid = new Date().getTime().toString(16) + Math.floor(100*Math.random()).toString(16);
		rootNode.setAttribute("__bm_tempid", guid);

		// Build query
		let attr = "[__bm_tempid='" + guid + "'] ";
		let newQuery = attr + query.replace(",", ", " + attr).replace(":not(", ":not(" + attr) + ":not(" + attr + "[bm-powered] " + query + ")";

		// Query
		let elements = rootNode.querySelectorAll(newQuery);
		elements = Array.prototype.slice.call(elements, 0);

		// Remove temp id
		rootNode.removeAttribute("__bm_tempid");

		return elements;

	}

}
