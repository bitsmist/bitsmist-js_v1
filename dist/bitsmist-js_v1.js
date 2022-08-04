(function () {
	'use strict';

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
		 * Set a value to object.
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
			let current = Util.__createIntermediateObject(store, keys);

			Util.assert(current !== null && typeof current === "object",
				`Util.safeSet(): Can't create an intermediate object. Non-object value already exists. key=${key}, existingKey=${( keys.length > 1 ? keys[keys.length-2] : "" )}, existingValue=${current}`, TypeError);

			current[keys[keys.length - 1]] = value;

			return store;

		}

		// -----------------------------------------------------------------------------

		/**
		 * Remove a value from object.
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
		 * Merge a value to store.
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
			let current = Util.__createIntermediateObject(store, keys);

			Util.assert(current && typeof current === "object",
				`Util.safeSet(): Can't create an intermediate object. Non-object value already exists. key=${key}, existingKey=${( keys.length > 1 ? keys[keys.length-2] : "" )}, existingValue=${current}`, TypeError);

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

			let ret = false;

			try
			{
				ret = Function(names, '"use strict";return (' + code + ')').apply(context, values);
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
				// obj1 is array
				if (Array.isArray(obj2))
				{
					Array.prototype.push.apply(result, Util.__cloneArr(obj2));
				}
				else
				{
					result.push(Util.deepClone(obj2));
				}
			}
			else if (Util.__isObject(obj1) && Util.__isMergeable(obj2))
			{
				// obj1 is Object and obj2 is Object/Array
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
				return Util.__cloneArr(target);
			}
			else if (Util.__isObject(target))
			{
				return Util.__cloneObj(target);
			}
			else
			{
				return target;
			}

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
		 * Parse URL.
		 *
		 * @param	{String}		url					URL to parse.
		 *
		 * @return 	{String}		Object contains each URL part.
		 */
		static parseURL(url)
		{

			var pattern = RegExp("^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\\?([^#]*))?(#(.*))?");
			var matches =  url.match(pattern);
			let parsed = {
				"protocol": matches[2],
				"hostname": matches[4],
				"pathname": matches[5],
				"path": "",
				"filename": "",
				"filenameWithoutExtension": "",
				"extension": "",
				"query": matches[7],
				"hash": matches[8],
			};

			parsed["path"] = (parsed.protocol ? parsed.protocol + "://" : "") + (parsed.hostname ? parsed.hostname : "" );

			// path and filename
			let pos = matches[5].lastIndexOf("/");
			if (pos > -1)
			{
				parsed["path"] += matches[5].substr(0, pos + 1);
				parsed["filename"] = matches[5].substr(pos + 1);
			}
			else
			{
				parsed["filename"] = matches[5];
			}

			// filename and extension
			let posExt =  parsed.filename.lastIndexOf(".");
			if (posExt)
			{
				parsed["filenameWithoutExtension"] = parsed.filename.substr(0, posExt);
				parsed["extension"] = parsed.filename.substr(posExt + 1);
			}
			else
			{
				parsed["filenameWithoutExtension"] = parsed.filename;
			}

			return parsed;

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
	    static scopedSelectorAll(rootNode, query, options)
	    {

	        // Set temp id
	        let guid = new Date().getTime().toString(16) + Math.floor(100*Math.random()).toString(16);
	        rootNode.setAttribute("__bm_tempid", guid);
	        let id = "[__bm_tempid='" + guid + "'] ";

	        // Query to select all
	        let newQuery = id + query.replace(",", "," + id);
	        let allElements = rootNode.querySelectorAll(newQuery);
			let setAll = new Set(allElements);

			if (options && !options["penetrate"])
			{
				// Query to select descendant of other component
				let removeQuery = id + "[bm-powered] " + query.replace(",", ", " + id + "[bm-powered] ");
				let removeElements = rootNode.querySelectorAll(removeQuery);

				// Remove elements descendant of other component
				let setRemove = new Set(removeElements);
				setRemove.forEach((item) => {
					setAll.delete(item);
				});
			}

	        // Remove temp id
	        rootNode.removeAttribute("__bm_tempid");

	        return Array.from(setAll);

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
		static __isUpper(c)
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
		static __createIntermediateObject(store, keys)
		{

			let current = store;

			for (let i = 0; i < keys.length - 1; i++)
			{
				Util.assert(current !== null && typeof current === "object",
					`Util.safeSet(): Can't create an intermediate object. Non-object value already exists. existingKey=${( i > 0 ? keys[i-1] : "" )}, existingValue=${current}`, TypeError);

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
		static __cloneObj(target)
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
		static __cloneArr(target)
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
		static __isObject(target)
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
		static __isMergeable(target)
		{

			return Util.__isObject(target) || Array.isArray(target);

		}

	}

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
		 * Define new component in ES5 way.
		 *
		 * @param	{String}		className			Class name.
		 * @param	{Object}		settings			Component Settings.
		 * @param	{Object}		superClass			Super class.
		 * @param	{String}		tagName				Tag name.
		 */
		static newComponent(className, settings, superClass, tagName)
		{

			superClass = ( superClass ? superClass : BITSMIST.v1.Component );

			// Define class
			let funcDef = "{ return Reflect.construct(superClass, [], this.constructor); }";
			let classDef = Function("superClass", "return function " + ClassUtil.__validateClassName(className) + "()" + funcDef)(superClass);
			ClassUtil.inherit(classDef, superClass);

			// Class settings
			settings = Util.deepMerge({}, settings);
			settings.settings = ( settings.settings ? settings.settings : {} );
			settings["settings"]["name"] = className;
			classDef.prototype._getSettings = function() {
				return Util.deepMerge(superClass.prototype._getSettings(), settings);
			};

			// Export class
			window[className] = classDef;

			// Define tag
			if (tagName)
			{
				customElements.define(tagName.toLowerCase(), classDef);
			}

			return classDef;

		}

		// -------------------------------------------------------------------------

		/**
		 * Inherit the component in ES5 way.
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
		 * Instantiate a component.
		 *
		 * @param	{String}		className			Class name.
		 * @param	{Object}		options				Options for the component.
		 *
		 * @return  {Object}		Initaiated object.
		 */
		static createObject(className, ...args)
		{

			let c = ClassUtil.getClass(className);
			Util.assert(c, `ClassUtil.createObject(): Class '${className}' is not defined.`, ReferenceError);

			return  new c(...args);

		}

		// -------------------------------------------------------------------------

		/**
		 * Get a class.
		 *
		 * @param	{String}		className			Class name.
		 *
		 * @return  {Object}		Class object.
		 */
		static getClass(className)
		{

			let ret;

			try
			{
				ret = Function("return (" + ClassUtil.__validateClassName(className) + ")")();
			}
			catch(e)
			{
				if (!(e instanceof ReferenceError))
				{
					throw e;
				}
			}

			return ret;

		}

		// -------------------------------------------------------------------------

		/**
		 * Validate class name.
		 *
		 * @param	{String}		className			Class name.
		 *
		 * @return  {String}		Class name when valid. Throws an exception when not valid.
		 */
		static __validateClassName(className)
		{

			let result = /^[a-zA-Z0-9\-\._]+$/.test(className);
			Util.assert(result, `ClassUtil.__validateClassName(): Class name '${className}' is not valid.`, TypeError);

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
	//	Base organizer class
	// =============================================================================

	class Organizer
	{

		// -------------------------------------------------------------------------
		//  Methods
		// -------------------------------------------------------------------------

		/**
		 * Global init.
		 */
		static globalInit(targetClass)
		{
		}

		// -------------------------------------------------------------------------

		/**
		 * Init.
		 *
		 * @param	{Object}		conditions			Conditions.
		 * @param	{Component}		component			Component.
		 * @param	{Object}		settings			Settings.
		 *
		 * @return 	{Promise}		Promise.
		 */
		static init(conditions, component, settings)
		{
		}

		// -------------------------------------------------------------------------

		/**
		 * Organize.
		 *
		 * @param	{Object}		conditions			Conditions.
		 * @param	{Component}		component			Component.
		 * @param	{Object}		settings			Settings.
		 *
		 * @return 	{Promise}		Promise.
		 */
		static organize(conditions, component, settings)
		{
		}

		// -------------------------------------------------------------------------

		/**
		 * Unorganize.
		 *
		 * @param	{Object}		conditions			Conditions.
		 * @param	{Component}		component			Component.
		 * @param	{Object}		settings			Settings.
		 *
		 * @return 	{Promise}		Promise.
		 */
		static unorganize(conditions, component, settings)
		{
		}

		// -------------------------------------------------------------------------

		/**
		 * Clear.
		 *
		 * @param	{Component}		component			Component.
		 */
		static clear(component)
		{
		}

		// -------------------------------------------------------------------------

		/**
		 * Check if event is target.
		 *
		 * @param	{String}		conditions			Event name.
		 * @param	{Object}		organizerInfo		Organizer info.
		 * @param	{Component}		component			Component.
		 *
		 * @return 	{Boolean}		True if it is target.
		 */
		static isTarget(conditions, organizerInfo, component)
		{

			if (organizerInfo["targetEvents"].indexOf("*") > -1)
			{
				return true;
			}
			else if (organizerInfo["targetEvents"].indexOf(conditions) > -1)
			{
				return true;
			}
			else
			{
				return false;
			}

		}

		// -------------------------------------------------------------------------

		/**
		 * Get editor for the organizer.
		 *
		 * @return 	{String}		Editor.
		 */
		static getEditor()
		{

			return "";

		}

	}

	// =============================================================================

	// =============================================================================
	//	Organizer organizer class
	// =============================================================================

	class OrganizerOrganizer extends Organizer
	{

		// -------------------------------------------------------------------------
		//  Methods
		// -------------------------------------------------------------------------

		/**
		 * Global init.
		 */
		static globalInit(targetClass)
		{

			// Add properties
			Object.defineProperty(targetClass.prototype, "organizers", {
				get() { return this._organizers; },
			});

			// Add methods
			targetClass.prototype.addOrganizers = function(settings) { return OrganizerOrganizer._addOrganizers(this, settings); };
			targetClass.prototype.initOrganizers = function(settings) { return OrganizerOrganizer._initOrganizers(this, settings); };
			targetClass.prototype.callOrganizers = function(condition, settings) { return OrganizerOrganizer._callOrganizers(this, condition, settings); };
			targetClass.prototype.clearOrganizers = function(condition, settings) { return OrganizerOrganizer._clearOrganizers(this, condition, settings); };

			// Init vars
			OrganizerOrganizer._organizers = {};
			OrganizerOrganizer._targetWords = {};

			Object.defineProperty(OrganizerOrganizer, "organizers", {
				get() { return OrganizerOrganizer._organizers; },
			});

		}

		// -------------------------------------------------------------------------

		/**
		 * Organize.
		 *
		 * @param	{Object}		conditions			Conditions.
		 * @param	{Component}		component			Component.
		 * @param	{Object}		settings			Settings.
		 *
		 * @return 	{Promise}		Promise.
		 */
		static organize(conditions, component, settings)
		{

			return OrganizerOrganizer._addOrganizers(component, settings);

		}

		// -------------------------------------------------------------------------

		/**
		 * Clear.
		 *
		 * @param	{Component}		component			Component.
		 */
		static clear(component)
		{

			component._organizers = {};

		}

		// -------------------------------------------------------------------------

		/**
		 * Register an organizer.
		 *
		 * @param	{String}		key					Key to store.
		 * @param	{Object}		value				Value to store.
		 */
		static register(organizerName, organizerInfo)
		{

			let info = Util.deepMerge({}, organizerInfo);
			info["name"] = ( organizerInfo["name"] ? organizerInfo["name"] : organizerName );
			info["targetWords"] = ( organizerInfo["targetWords"] ? organizerInfo["targetWords"] : [] );
			info["targetWords"] = ( Array.isArray(organizerInfo["targetWords"]) ? organizerInfo["targetWords"] : [organizerInfo["targetWords"]] );
			info["targetEvents"] = ( organizerInfo["targetEvents"] ? organizerInfo["targetEvents"] : [] );
			info["targetEvents"] = ( Array.isArray(organizerInfo["targetEvents"]) ? organizerInfo["targetEvents"] : [organizerInfo["targetEvents"]] );

			OrganizerOrganizer._organizers[organizerName] = info;

			// Global init
			info["object"].globalInit(info["targetClassName"]);

			// Create target index
			for (let i = 0; i < info["targetWords"].length; i++)
			{
				OrganizerOrganizer._targetWords[info["targetWords"][i]] = info;
			}

		}

		// -------------------------------------------------------------------------

		/**
		 * Add target words/events to oragnizer's settings.
		 *
		 * @param	{String}		organizerName		Organizer name.
		 * @param	{String}		targetname			Target setting name. "words" or "events".
		 * @param	{Array/String}	targets				Values to add.
		 *
		 * @return 	{Promise}		Promise.
		 */
		/*
		static addTarget(organizerName, targetName, targets)
		{

			let organizer = OrganizerOrganizer._organizers[organizerName];

			let ret1 = Util.warn(organizer, `Organizer not found. organizerName=${organizerName}`);
			let ret2 = Util.warn(["targetEvents", "targetWords"].indexOf(targetName) > -1, `Target name is invalid. targetName=${targetName}`);

			if (ret1 && ret2)
			{
				if (Array.isArray(targets))
				{
					organizer[targetName] = organizer[targetName].concat(targets);
				}
				else
				{
					organizer[targetName].push(targets);
				}
			}

		}
		*/

		// ------------------------------------------------------------------------
		//  Protected
		// ------------------------------------------------------------------------

		static _addOrganizers(component, settings)
		{

			let targets = {};
			let chain = Promise.resolve();

			// List new organizers
			let organizers = settings["organizers"];
			if (organizers)
			{
				Object.keys(organizers).forEach((key) => {
					if (
						Util.safeGet(organizers[key], "settings.attach") &&
						!component._organizers[key] &&
						OrganizerOrganizer._organizers[key]
					)
					{
						targets[key] = OrganizerOrganizer._organizers[key];
					}
				});
			}

			// List new organizers from settings keyword
			Object.keys(settings).forEach((key) => {
				let organizerInfo = OrganizerOrganizer._targetWords[key];
				if (organizerInfo)
				{
					if (!component._organizers[organizerInfo.name])
					{
						targets[organizerInfo.name] = organizerInfo.object;
					}
				}
			});

			// Add and init new organizers
			OrganizerOrganizer._sortItems(targets).forEach((key) => {
				chain = chain.then(() => {
					component._organizers[key] = Util.deepMerge(Util.deepClone(OrganizerOrganizer._organizers[key]), Util.safeGet(settings, "organizers." + key));
					return component._organizers[key].object.init(component, settings);
				});
			});

			return chain;

		}

		// ------------------------------------------------------------------------

		/**
		 * Init organizers.
		 *
		 * @param	{Component}		component			Component.
		 * @param	{Object}		settings			Settings.
		 *
		 * @return 	{Promise}		Promise.
		 */
		static _initOrganizers(component, settings)
		{

			// Init
			component._organizers = {};

			// Add organizers
			return OrganizerOrganizer.organize("*", component, settings);

		}

		// -------------------------------------------------------------------------

		/**
		 * Call organizers.
		 *
		 * @param	{Component}		component			Component.
		 * @param	{Object}		conditions			Conditions.
		 * @param	{Object}		settings			Settings.
		 *
		 * @return 	{Promise}		Promise.
		 */
		static _callOrganizers(component, conditions, settings)
		{

			let chain = Promise.resolve();

			OrganizerOrganizer._sortItems(component._organizers).forEach((key) => {
				if (component._organizers[key].object.isTarget(conditions, component._organizers[key], component))
				{
					chain = chain.then(() => {
						return component._organizers[key].object.organize(conditions, component, settings);
					});
				}
			});

			return chain;

		}

		// ------------------------------------------------------------------------

		/**
		 * Clear organizers.
		 *
		 * @param	{Component}		component			Component.
		 * @param	{Object}		conditions			Conditions.
		 * @param	{Object}		settings			Settings.
		 *
		 * @return 	{Promise}		Promise.
		 */
		static _clearOrganizers(component, conditions, settings)
		{

			let chain = Promise.resolve();

			OrganizerOrganizer._sortItems(component._organizers).forEach((key) => {
				if (component._organizers[key].object.isTarget(conditions, component._organizers[key], component))
				{
					chain = chain.then(() => {
						return component._organizers[key].object.unorganize(conditions, component, settings);
					});
				}
			});

			return chain;

		}

		// ------------------------------------------------------------------------

		/**
		 * Sort item keys.
		 *
		 * @param	{Object}		observerInfo		Observer info.
		 *
		 * @return  {Array}			Sorted keys.
		 */
		static _sortItems(organizers)
		{

			return Object.keys(organizers).sort((a,b) => {
				return organizers[a]["order"] - organizers[b]["order"];
			})

		}

	}

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
				let url = Util.safeGet(options, "url");
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
						/*
						let wait = Math.floor(Math.random() * 2000);
						setTimeout(() => {
							resolve(xhr);
						}, wait);
						*/
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
		 * Load the javascript file.
		 *
		 * @param	{string}		url					Javascript url.
		 *
		 * @return  {Promise}		Promise.
		 */
		static loadScript(url) {

	//console.log(`@@@Loading script: ${url}`);
			return new Promise((resolve, reject) => {
				let script = document.createElement('script');
				script.src = url;
				script.async = true;

				script.onload = () => {
					resolve();
				};

				script.onerror = (e) => {
					reject(e);
				};

				let head = document.getElementsByTagName('head')[0];
				head.appendChild(script);
			});

		}

	}

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
			this.options = options || {};
			this.items = Util.safeGet(options, "items", {});
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

			this._options = Util.deepMerge({}, value);

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

			this._items = Util.deepMerge({}, value);

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
		 * Get a value from store. Return default value when specified key is not available.
		 *
		 * @param	{String}		key					Key to get.
		 * @param	{Object}		defaultValue		Value returned when key is not found.
		 *
		 * @return  {*}				Value.
		 */
		get(key, defaultValue)
		{

			return Util.safeGet(this._items, key, defaultValue);

		}

		// -----------------------------------------------------------------------------

		/**
		 * Set a value to the store. If key is empty, it sets the value to the root.
		 *
		 * @param	{String}		key					Key to store.
		 * @param	{Object}		value				Value to store.
		 */
		set(key, value, options)
		{

			if (options && options["merge"])
			{
				return Util.safeMerge(this._items, key, defaultValue);
			}
			else
			{
				Util.safeSet(this._items, key, value);
			}

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
		 * @param	{Object}		component			Component to attach.
		 * @param	{Object}		options				Plugin options.
	     */
		chain(store)
		{

			Util.assert(store instanceof ChainableStore, `ChainableStore.chain(): "store" parameter must be a ChainableStore.`, TypeError);

			this._chain = store;

		}

		// -----------------------------------------------------------------------------

		/**
		 * Get a value from store. Return default value when specified key is not available.
		 * If chained, chained store is also considiered (Override).
		 *
		 * @param	{String}		key					Key to get.
		 * @param	{Object}		defaultValue		Value returned when key is not found.
		 *
		 * @return  {*}				Value.
		 */
		get(key, defaultValue)
		{

			let result = defaultValue;

			if (Store.prototype.has.call(this, key))
			{
				result = Store.prototype.get.call(this, key, defaultValue);
			}
			else if (this._chain)
			{
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
		 */
		merge(newItems, merger)
		{

			if (this._options["writeThrough"])
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
		 * Set a value to the store. If key is empty, it sets the value to the root.
		 *
		 * @param	{String}		key					Key to store.
		 * @param	{Object}		value				Value to store.
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
				result = Util.safeHas(this._chain._items, key);
			}

			return result;

		}

	}

	// =============================================================================

	// =============================================================================
	//	Setting organizer class
	// =============================================================================

	class SettingOrganizer extends Organizer
	{

		// -------------------------------------------------------------------------
		//  Methods
		// -------------------------------------------------------------------------

		/**
		 * Global init.
		 */
		static globalInit(targetClass)
		{

			// Add properties
			Object.defineProperty(targetClass.prototype, "settings", {
				get() { return this._settings; },
			});

			// Init vars
			SettingOrganizer.__globalSettings = new ChainableStore();
			Object.defineProperty(SettingOrganizer, "globalSettings", {
				get() { return SettingOrganizer.__globalSettings; },
			});

		}

		// -------------------------------------------------------------------------

		/**
		 * Init.
		 *
		 * @param	{Component}		component			Component.
		 * @param	{Object}		settings			Settings.
		 *
		 * @return 	{Promise}		Promise.
		 */
		static init(component, settings)
		{

			// Init vars
			component._settings = new ChainableStore({"items":settings});
			component._settings.merge(component._getSettings());

			// Chain global settings
			if (component._settings.get("settings.useGlobalSettings"))
			{
				component._settings.chain(SettingOrganizer.globalSettings);
			}

			return Promise.resolve().then(() => {
				// Load settings from an external file.
				return SettingOrganizer._loadExternalSetting(component, "setting");
			}).then(() => {
				// Load settings from attributes
				SettingOrganizer._loadAttrSettings(component);
			});

		}

		// -------------------------------------------------------------------------
		//  Protected
		// -------------------------------------------------------------------------

		/**
		 * Load a setting file.
		 *
		 * @param	{Component}		component			Component.
		 * @param	{String}		settingName			Setting name.
		 *
		 * @return  {Promise}		Promise.
		 */
		static _loadExternalSetting(component, settingName)
		{

			let fileName;
			let loadOptions = {};

			if (component.hasAttribute("bm-" + settingName + "ref"))
			{
				let url = Util.parseURL(component.getAttribute("bm-" + settingName + "ref"));
				fileName = url.filenameWithoutExtension;
				loadOptions["path"] = url.path;
				loadOptions["query"] = url.query;
			}
			else
			{
				let path = ( component.hasAttribute("bm-" + settingName + "path") ? component.getAttribute("bm-" + settingName + "path") : "" );
				fileName = ( component.hasAttribute("bm-" + settingName + "name") ? component.getAttribute("bm-" + settingName + "name") : "" );
				if (path && !fileName)
				{
					fileName = "settings";
				}
				loadOptions["path"] = path;
			}

			if (fileName || loadOptions["path"])
			{
				return component.loadSetting(fileName, loadOptions);
			}

		}

		// -------------------------------------------------------------------------

		/**
		 * Get settings from element's attribute.
		 *
		 * @param	{Component}		component			Component.
		 */
		static _loadAttrSettings(component)
		{

			// Get settings from the attribute

			let dataSettings = ( document.querySelector(component._settings.get("settings.rootNode")) ?
				document.querySelector(component._settings.get("settings.rootNode")).getAttribute("bm-settings") :
				component.getAttribute("bm-settings")
			);

			if (dataSettings)
			{
				let settings = {"settings": JSON.parse(dataSettings)};
				component._settings.merge(settings);
			}

		}

	}

	// =============================================================================

	// =============================================================================
	//	Component class
	// =============================================================================

	// -----------------------------------------------------------------------------
	//  Constructor
	// -----------------------------------------------------------------------------

	/**
	 * Constructor.
	 */
	function Component()
	{

		// super()
		return Reflect.construct(HTMLElement, [], this.constructor);

	}

	ClassUtil.inherit(Component, HTMLElement);

	// -----------------------------------------------------------------------------
	//  Callbacks
	// -----------------------------------------------------------------------------

	/**
	 * Connected callback.
	 */
	Component.prototype.connectedCallback = function()
	{

		// The first time only initialization
		if (!this._ready)
		{
			// Create a promise to prevent from start/stop while stopping/starting
			this._ready = Promise.resolve();

			this.setAttribute("bm-powered", "");
			this._uniqueId = new Date().getTime().toString(16) + Math.floor(100*Math.random()).toString(16);
			this._name = this.constructor.name;
		}

		// Start
		this._ready = this._ready.then(() => {
			console.debug(`Component.connectedCallback(): Component is connected. name=${this.name}, id=${this.id}, uniqueId=${this._uniqueId}`);
			return this.changeState("connected");
		}).then(() => {
			if (!this._initialized || this.settings.get("settings.autoRestart"))
			{
				this._initialized = true;
				return this.start();
			}
			else
			{
				console.debug(`Component.start(): Restarted component. name=${this.name}, id=${this.id}`);
				return this.changeState("ready");
			}
		});

	};

	// -----------------------------------------------------------------------------

	/**
	 * Disconnected callback.
	 */
	Component.prototype.disconnectedCallback = function()
	{

		// Stop
		this._ready = this._ready.then(() => {
			if (this.settings.get("settings.autoStop"))
			{
				return this.stop();
			}
		}).then(() => {
			console.debug(`Component.disconnectedCallback(): Component is disconnected. name=${this.name}, id=${this.id}`);
			return this.changeState("disconnected");
		});

	};

	// -----------------------------------------------------------------------------

	/**
	 * Adopted callback.
	 */
	Component.prototype.adoptedCallback = function()
	{
	};

	// -----------------------------------------------------------------------------

	/**
	 * Attribute changed callback.
	 */
	Component.prototype.attributeChangedCallback = function()
	{
	};

	// -----------------------------------------------------------------------------
	//  Setter/Getter
	// -----------------------------------------------------------------------------

	/**
	 * Component name.
	 *
	 * @type	{String}
	 */
	Object.defineProperty(Component.prototype, 'name', {
		get()
		{
			return this._name;
		}
	});

	// -----------------------------------------------------------------------------

	/**
	 * Instance's unique id.
	 *
	 * @type	{String}
	 */
	Object.defineProperty(Component.prototype, 'uniqueId', {
		get()
		{
			return this._uniqueId;
		}
	});

	// -----------------------------------------------------------------------------

	/**
	 * Root element.
	 *
	 * @type	{HTMLElement}
	 */
	Object.defineProperty(Component.prototype, 'rootElement', {
		get()
		{
			return this._rootElement;
		}
	});

	// -----------------------------------------------------------------------------
	//  Methods
	// -----------------------------------------------------------------------------

	/**
	 * Start component.
	 *
	 * @param	{Object}		settings			Settings.
	 *
	 * @return  {Promise}		Promise.
	 */
	Component.prototype.start = function(settings)
	{

		// Defaults
		let defaults = {
			"settings": {
				"autoFetch":			true,
				"autoFill":				true,
				"autoRefresh":			true,
				"autoRestart":			false,
				"autoSetup":			true,
				"autoStop":				true,
				"hasTemplate":			true,
				"useGlobalSettings":	true,
			},
			"organizers": {
				"OrganizerOrganizer":	{"settings":{"attach":true}},
				"SettingOrganizer":		{"settings":{"attach":true}},
				"StateOrganizer":		{"settings":{"attach":true}},
				"EventOrganizer":		{"settings":{"attach":true}},
				"LoaderOrganizer":		{"settings":{"attach":true}},
				"TemplateOrganizer":	{"settings":{"attach":true}},
			}
		};
		settings = Util.deepMerge(defaults, settings);

		return Promise.resolve().then(() => {
			return this._injectSettings(settings);
		}).then((newSettings) => {
			return SettingOrganizer.init(this, newSettings); // now settings are included in this.settings
		}).then(() => {
			this._name = this.settings.get("settings.name", this._name);
			this._rootElement = this.settings.get("settings.rootElement", this);
			return this.initOrganizers(this.settings.items);
		}).then(() => {
			console.debug(`Component.start(): Starting component. name=${this.name}, id=${this.id}`);
			return this.changeState("starting");
		}).then(() => {
			return this.callOrganizers("beforeStart", this.settings.items);
		}).then(() => {
			return this.trigger("beforeStart");
		}).then(() => {
			return this.switchTemplate(this.settings.get("settings.templateName"));
		}).then(() => {
			if (this.settings.get("settings.autoRefresh"))
			{
				return this.refresh();
			}
		}).then(() => {
			return this.trigger("doStart");
		}).then(() => {
			console.debug(`Component.start(): Started component. name=${this.name}, id=${this.id}`);
			return this.changeState("started");
		}).then(() => {
			return this.callOrganizers("afterStart", this.settings.items);
		}).then(() => {
			return this.trigger("afterStart");
		}).then(() => {
			console.debug(`Component.start(): Component is ready. name=${this.name}, id=${this.id}`);
			return this.changeState("ready");
		});

	};

	// -----------------------------------------------------------------------------

	/**
	 * Stop component.
	 *
	 * @param	{Object}		options				Options for the component.
	 *
	 * @return  {Promise}		Promise.
	 */
	Component.prototype.stop = function(options)
	{

		options = Util.deepMerge({}, options);

		return Promise.resolve().then(() => {
			console.debug(`Component.stop(): Stopping component. name=${this.name}, id=${this.id}`);
			return this.changeState("stopping");
		}).then(() => {
			return this.trigger("beforeStop", options);
		}).then(() => {
			return this.trigger("doStop", options);
		}).then(() => {
			console.debug(`Component.stop(): Stopped component. name=${this.name}, id=${this.id}`);
			return this.changeState("stopped");
		}).then(() => {
			return this.trigger("afterStop", options);
		});

	};

	// -----------------------------------------------------------------------------

	/**
	 * Change template html.
	 *
	 * @param	{String}		templateName		Template name.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	Component.prototype.switchTemplate = function(templateName, options)
	{

		options = Util.deepMerge({}, options);

		if (this.activeTemplateName === templateName)
		{
			return Promise.resolve();
		}

		return Promise.resolve().then(() => {
			// Switch template
			if (this.settings.get("settings.hasTemplate"))
			{
				return Promise.resolve().then(() => {
					console.debug(`Component.switchTemplate(): Switching template. name=${this.name}, templateName=${templateName}, id=${this.id}`);
					return this.addTemplate(templateName);
				}).then(() => {
					return this.applyTemplate(templateName);
				}).then(() => {
					console.debug(`Component.switchTemplate(): Switched template. name=${this.name}, templateName=${templateName}, id=${this.id}`);
				});
			}
		}).then(() => {
			// Setup
			let autoSetup = this.settings.get("settings.autoSetup");
			if (autoSetup)
			{
				return this.setup(this.settings.items);
			}
		 }).then(() => {
	 		return this.loadTags(this.rootElement);
		}).then(() => {
			return this.callOrganizers("afterAppend", this.settings.items);
		}).then(() => {
			return this.trigger("afterAppend", options);
		});

	};

	// -----------------------------------------------------------------------------

	/**
	 * Apply settings.
	 *
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	Component.prototype.setup = function(options)
	{

		options = Util.deepMerge({}, options);

		return Promise.resolve().then(() => {
			console.debug(`Component.setup(): Setting up component. name=${this.name}, state=${this.state}, id=${this.id}`);
			return this.trigger("beforeSetup", options);
		}).then(() => {
			return this.trigger("doSetup", options);
		}).then(() => {
			return this.trigger("afterSetup", options);
		}).then(() => {
			console.debug(`Component.setup(): Set up component. name=${this.name}, state=${this.state}, id=${this.id}`);
		});

	};

	// -----------------------------------------------------------------------------

	/**
	 * Refresh component.
	 *
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	Component.prototype.refresh = function(options)
	{

		options = Util.deepMerge({}, options);

		return Promise.resolve().then(() => {
			console.debug(`Component.refresh(): Refreshing component. name=${this.name}, id=${this.id}`);
			return this.trigger("beforeRefresh", options);
		}).then(() => {
			return this.trigger("doTarget", options);
		}).then(() => {
			// Fetch
			if (Util.safeGet(options, "autoFetch", this.settings.get("settings.autoFetch")))
			{
				return this.fetch(options);
			}
		}).then(() => {
			// Fill
			if (Util.safeGet(options, "autoFill", this.settings.get("settings.autoFill")))
			{
				return this.fill(options);
			}
		}).then(() => {
			return this.trigger("doRefresh", options);
		}).then(() => {
			return this.trigger("afterRefresh", options);
		}).then(() => {
			console.debug(`Component.refresh(): Refreshed component. name=${this.name}, id=${this.id}`);
		});

	};

	// -----------------------------------------------------------------------------

	/**
	 * Fetch data.
	 *
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	Component.prototype.fetch = function(options)
	{

		options = Util.deepMerge({}, options);

		return Promise.resolve().then(() => {
			console.debug(`Component.fetch(): Fetching data. name=${this.name}`);
			return this.trigger("beforeFetch", options);
		}).then(() => {
			return this.callOrganizers("doFetch", options);
		}).then(() => {
			return this.trigger("doFetch", options);
		}).then(() => {
			return this.trigger("afterFetch", options);
		}).then(() => {
			console.debug(`Component.fetch(): Fetched data. name=${this.name}`);
		});

	};

	// -----------------------------------------------------------------------------

	/**
	 * Fill component.
	 *
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	Component.prototype.fill = function(options)
	{

		options = Util.deepMerge({}, options);

		return Promise.resolve().then(() => {
			console.debug(`Component.fill(): Filling with data. name=${this.name}`);
			return this.trigger("beforeFill", options);
		}).then(() => {
			return this.trigger("doFill", options);
		}).then(() => {
			return this.trigger("afterFill", options);
		});

	};

	// -----------------------------------------------------------------------------

	/**
	 * Clear component.
	 *
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	Component.prototype.clear = function(options)
	{
	};

	// -----------------------------------------------------------------------------

	/**
	 * Execute query on this component excluding nested components inside.
	 *
	 * @param	{String}		query				Query.
	 *
	 * @return  {Array}			Array of matched elements.
	 */
	Component.prototype.scopedSelectorAll = function(query)
	{

		return Util.scopedSelectorAll(this, query);

	};

	// -----------------------------------------------------------------------------
	//  Protected
	// -----------------------------------------------------------------------------

	/**
	 * Inject settings.
	 *
	 * @param	{Object}		settings			Settings.
	 *
	 * @return  {Object}		New settings.
	 */
	Component.prototype._injectSettings = function(settings)
	{

		return settings;

	};

	// -----------------------------------------------------------------------------

	/**
	 * Get component settings. Need to override.
	 *
	 * @return  {Object}		Options.
	 */
	Component.prototype._getSettings = function()
	{

		return {};

	};

	customElements.define("bm-component", Component);

	// =============================================================================

	// =============================================================================
	//	State organizer class
	// =============================================================================

	class StateOrganizer extends Organizer
	{

		// -------------------------------------------------------------------------
		//  Methods
		// -------------------------------------------------------------------------

		/**
		 * Global init.
		 */
		static globalInit()
		{

			// Add properties
			Object.defineProperty(Component.prototype, "state", {
				get() { return this._state; },
				set(value) { this._state = value; }
			});

			// Add methods
			Component.prototype.changeState= function(newState) { return StateOrganizer._changeState(this, newState); };
			Component.prototype.waitFor = function(waitlist, timeout) { return StateOrganizer._waitFor(this, waitlist, timeout); };
			Component.prototype.suspend = function(state) { return StateOrganizer._suspend(this, state); };
			Component.prototype.resume = function(state) { return StateOrganizer._resume(this, state); };
			Component.prototype.pause = function(state) { return StateOrganizer._pause(this, state); };

			// Init vars
			StateOrganizer.__suspends = {};
			StateOrganizer.__components = new Store();
			StateOrganizer.__waitingList = new Store();
			StateOrganizer.__waitingListIndexName = new Map();
			StateOrganizer.__waitingListIndexId = new Map();
			StateOrganizer.__waitingListIndexNone = new Map();
			StateOrganizer.waitFor = function(waitlist, timeout) { return StateOrganizer._waitFor(null, waitlist, timeout); };

		}

		// -------------------------------------------------------------------------

		/**
		 * Init.
		 *
		 * @param	{Component}		component			Component.
		 * @param	{Object}		settings			Settings.
		 *
		 * @return 	{Promise}		Promise.
		 */
		static init(component, settings)
		{

			// Init vars
			component._state = "";
			component._suspends = {};

			// Load settings from attributes
			StateOrganizer._loadAttrSettings(component);

		}

		// -------------------------------------------------------------------------

		/**
		 * Organize.
		 *
		 * @param	{Object}		conditions			Conditions.
		 * @param	{Component}		component			Component.
		 * @param	{Object}		settings			Settings.
		 *
		 * @return 	{Promise}		Promise.
		 */
		static organize(conditions, component, settings)
		{

			let promise = Promise.resolve();

			let waitFor = settings["waitFor"];
			if (waitFor)
			{
				if (waitFor[conditions])
				{
					promise = StateOrganizer._waitFor(component, waitFor[conditions]);
				}
			}

			return promise;

		}

		// -------------------------------------------------------------------------

		/**
		 * Clear.
		 */
		static clear()
		{

			this.__waitingList.clear();

		}

		// -------------------------------------------------------------------------

		/**
		 * Suspend all components at a specified state.
		 *
		 * @param	{String}		state				Component state.
		 */
		static globalSuspend(state)
		{

			StateOrganizer.__suspends[state] = StateOrganizer.__createSuspendInfo(state);
			StateOrganizer.__suspends[state].state = "pending";

		}

		// -------------------------------------------------------------------------

		/**
		 * Resume all components at a specified state.
		 *
		 * @param	{String}		state				Component state.
		 */
		static globalResume(state)
		{

			StateOrganizer.__suspends[state].resolve();
			StateOrganizer.__suspends[state].state = "resolved";

		}

		// -------------------------------------------------------------------------
		//  Protected
		// -------------------------------------------------------------------------

		/**
		 * Wait for components to become specific states.
		 *
		 * @param	{Component}		component			Component.
		 * @param	{Array}			waitlist			Components to wait.
		 * @param	{Object}		options				Options.
		 *
		 * @return  {Promise}		Promise.
		 */
		static _waitFor(component, waitlist, options)
		{

			let promise;
			let timeout = ( options && options["timeout"] ) || BITSMIST.v1.settings.get("system.waitForTimeout", 10000);
			let waiter = ( options && options["waiter"] ? options["waiter"] : component );
			let waitInfo = {"waiter":waiter, "waitlist":Util.deepClone(waitlist)};

			if (StateOrganizer.__isAllReady(waitInfo))
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
						let name = ( component && component.name ) || ( waitInfo["waiter"] && waitInfo["waiter"].tagName ) || "";
						reject(`StateOrganizer._waitFor(): Timed out after ${timeout} milliseconds waiting for ${StateOrganizer.__dumpWaitlist(waitlist)}, name=${name}.`);
					}, timeout);
				});
				waitInfo["promise"] = promise;

				// Add to info to a waiting list.
				StateOrganizer._addToWaitingList(waitInfo, component);
			}

			return promise;

		}

		// -------------------------------------------------------------------------

		/**
		 * Change component state and check waiting list.
		 *
		 * @param	{Component}		component			Component to register.
		 * @param	{String}		state				Component state.
		 *
		 * @return  {Promise}		Promise.
		 */
		static _changeState(component, state)
		{

			Util.assert(StateOrganizer.__isTransitionable(component._state, state), `StateOrganizer._changeState(): Illegal transition. name=${component.name}, fromState=${component._state}, toState=${state}, id=${component.id}`, Error);

			component._state = state;
			StateOrganizer.__components.set(component.uniqueId, {"object":component, "state":state});

			StateOrganizer._processWaitingList(component, state);

		}

		// -------------------------------------------------------------------------

		/**
		 * Suspend a component at a specified state.
		 *
		 * @param	{Component}		component			Component.
		 * @param	{String}		state				Component state.
		 */
		static _suspend(component, state)
		{

			component._suspends[state] = StateOrganizer.__createSuspendInfo();
		 	component._suspends[state].state = "pending";

		}

		// -------------------------------------------------------------------------

		/**
		 * Resume a component at a specified state.
		 *
		 * @param	{Component}		component			Component.
		 * @param	{String}		state				Component state.
		 */
		static _resume(component, state)
		{

		 	component._suspends[state].resolve();
		 	component._suspends[state].state = "resolved";

		}

		// -------------------------------------------------------------------------

		/**
		 * Pause a component if it is suspended.
		 *
		 * @param	{Component}		component			Component.
		 * @param	{String}		state				Component state.
		 *
		 * @return  {Promise}		Promise.
		 */
		static _pause(component, state)
		{

			let ret = [];

			// Globally suspended?
			if (StateOrganizer.__suspends[state] && StateOrganizer.__suspends[state].state === "pending" && !component.settings.get("settings.ignoreGlobalSuspend"))
			{
				ret.push(StateOrganizer.__suspends[state].promise);
			}

			// Component suspended?
			if (component._suspends[state] && component._suspends[state].state === "pending")
			{
				ret.push(component._suspends[state].promise);
			}

			return Promise.all(ret);

		}

		// -------------------------------------------------------------------------

		/**
		 * Check wait list.
		 */
		static _processWaitingList(component, state)
		{

			Object.keys(StateOrganizer.__waitingList.items).forEach((id) => {
				if (StateOrganizer.__isAllReady(StateOrganizer.__waitingList.get(id)))
				{
					// Resolve & Remove from waiting list
					clearTimeout(StateOrganizer.__waitingList.get(id)["timer"]);
					StateOrganizer.__waitingList.get(id).resolve();
					StateOrganizer.__waitingList.remove(id);
				}
			});

		}

		// -------------------------------------------------------------------------

		/**
		 * Add wait info to the waiting list.
		 *
		 * @param	{Object}		waitInfo			Wait info.
		 */
		static _addToWaitingList(waitInfo)
		{

			let id = new Date().getTime().toString(16) + Math.floor(100*Math.random()).toString(16);

			/*
			for (let i = 0; i < waitInfo["waitlist"].length; i++)
			{
				// Check if the node exists
				if (waitInfo["waitlist"][i].rootNode)
				{
					let element = document.querySelector(waitInfo["waitlist"][i].rootNode);

					Util.assert(element && element.uniqueId, `StateOrganizer.__addToWaitingList(): Root node does not exist. waiter=${waitInfo["waiter"]}, rootNode=${waitInfo["waitlist"][i].rootNode}`, ReferenceError);
				}
			}
			*/

			StateOrganizer.__waitingList.set(id, waitInfo);

		}


		// -----------------------------------------------------------------------------

		/**
		 * Get settings from element's attribute.
		 *
		 * @param	{Component}		component			Component.
		 */
		static _loadAttrSettings(component)
		{

			// Get waitFor from attribute

			if (component.hasAttribute("bm-waitfor"))
			{
				let waitInfo = {"name":component.getAttribute("bm-waitfor"), "state":"ready"};
				component.settings.merge({"waitFor": [waitInfo]});
			}

			if (component.hasAttribute("bm-waitfornode"))
			{
				let waitInfo = {"rootNode":component.getAttribute("bm-waitfornode"), "state":"ready"};
				component.settings.merge({"waitFor": [waitInfo]});
			}

		}

		// -------------------------------------------------------------------------
		//  Privates
		// -------------------------------------------------------------------------

		/**
		 * Check whether changing current state to new state is allowed.
		 *
		 * @param	{String}		currentState		Current state.
		 * @param	{String}		newState			New state.
		 *
		 * @return  {Promise}		Promise.
		 */
		static __isTransitionable(currentState, newState)
		{

			let ret = true;

			if (currentState && currentState.slice(-3) === "ing")
			{
				if(
					( currentState === "stopping" && newState !== "stopped") ||
					( currentState === "starting" && newState !== "started")
				)
				{
					ret = false;
				}
			}

			return ret;

		}

		// -------------------------------------------------------------------------

		/**
		 * Get component info from wait list item.
		 *
		 * @param	{Object}		waitlistItem		Wait list item.
		 *
		 * @return  {Boolean}		True if ready.
		 */
		static __getComponentInfo(waitlistItem)
		{

			let componentInfo;

			if (waitlistItem["id"])
			{
				componentInfo = StateOrganizer.__components.get(waitlistItem["id"]);
			}
			else if (waitlistItem["name"])
			{
				Object.keys(StateOrganizer.__components.items).forEach((key) => {
					if (waitlistItem["name"] === StateOrganizer.__components.get(key).object.name)
					{
						componentInfo = StateOrganizer.__components.get(key);
					}
				});
			}
			else if (waitlistItem["rootNode"])
			{
				let element = document.querySelector(waitlistItem["rootNode"]);
				if (element && element.uniqueId)
				{
					componentInfo = StateOrganizer.__components.get(element.uniqueId);
				}
			}
			else if (waitlistItem["object"])
			{
				let element = waitlistItem["object"];
				if (element.uniqueId)
				{
					componentInfo = StateOrganizer.__components.get(element.uniqueId);
				}
			}

			return componentInfo;

		}

		// -------------------------------------------------------------------------

		/**
		 * Check if all components are ready.
		 *
		 * @param	{Object}		waitInfo			Wait info.
		 *
		 * @return  {Boolean}		True if ready.
		 */
		static __isAllReady(waitInfo)
		{

			let result = true;
			let waitlist = waitInfo["waitlist"];

			for (let i = 0; i < waitlist.length; i++)
			{
				let match = false;
				let componentInfo = this.__getComponentInfo(waitlist[i]);
				if (componentInfo)
				{
					if (StateOrganizer.__isReady(waitlist[i], componentInfo))
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
		 * Check if a component is ready.
		 *
		 * @param	{Object}		waitlistItem		Wait list item.
		 * @param	{Object}		componentInfo		Registered component info.
		 *
		 * @return  {Boolean}		True if ready.
		 */
		static __isReady(waitlistItem, componentInfo)
		{

			// Check component
			let isMatch = StateOrganizer.__isComponentMatch(componentInfo, waitlistItem);

			// Check state
			if (isMatch)
			{
				isMatch = StateOrganizer.__isStateMatch(componentInfo["state"], waitlistItem["state"]);
			}

			return isMatch;

		}

		// -------------------------------------------------------------------------

		/**
		 * Check if component match.
		 *
		 * @param	{Object}		componentInfo		Registered component info.
		 * @param	{Object}		waitlistItem		Wait list item.
		 *
		 * @return  {Boolean}		True if match.
		 */
		static __isComponentMatch(componentInfo, waitlistItem)
		{

			let isMatch = true;

			// check instance
			if (waitlistItem["object"] && componentInfo["object"] !== waitlistItem["object"])
			{
				isMatch = false;
			}
			// check name
			else if (waitlistItem["name"] && componentInfo["object"].name !== waitlistItem["name"])
			{
				isMatch = false;
			}
			// check id
			else if (waitlistItem["id"] && componentInfo["object"].uniqueId !== waitlistItem["id"])
			{
				isMatch = false;
			}
			// check node
			else if (waitlistItem["rootNode"]  && !document.querySelector(waitlistItem["rootNode"]))
			{
				isMatch = false;
			}

			return isMatch;

		}

		// -------------------------------------------------------------------------

		/**
		 * Check if state match.
		 *
		 * @param	{String}		currentState		Current state.
		 * @param	{String}		expectedState		Expected state.
		 *
		 * @return  {Boolean}		True if match.
		 */
		static __isStateMatch(currentState, expectedState)
		{

			expectedState = expectedState || "ready";
			let isMatch = false;

			switch (currentState)
			{
				case "ready":
					if (
						expectedState === "ready" ||
						expectedState === "started" ||
						expectedState === "starting"
					)
					{
						isMatch = true;
					}
					break;
				case "started":
					if (
						expectedState === "started" ||
						expectedState === "starting"
					)
					{
						isMatch = true;
					}
					break;
				case "stopped":
					if (
						expectedState === "stopped" ||
						expectedState === "stopping"
					)
					{
						isMatch = true;
					}
					break;
				default:
					if ( currentState === expectedState )
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
		static __dumpWaitlist(waitlist)
		{

			let result = "";

			for (let i = 0; i < waitlist.length; i++)
			{
				let id = ( waitlist[i].id ? "id:" + waitlist[i].id + "," : "" );
				let name = ( waitlist[i].name ? "name:" + waitlist[i].name + "," : "" );
				let object = ( waitlist[i].object ? "element:" + waitlist[i].object.tagName + "," : "" );
				let node = (waitlist[i].rootNode ? "node:" + waitlist[i].rootNode + "," : "" );
				let state = (waitlist[i].state ? "state:" + waitlist[i].state: "" );
				result += "\n\t{" + id + name + object + node + state + "},";
			}

			return "[" + result + "\n]";

		}

		// -------------------------------------------------------------------------

		/**
		 * Create a suspend info object.
		 *
		 * @return  {Object}		Suspend info.
		 */
		static __createSuspendInfo()
		{

			let suspendInfo = {};

			let promise = new Promise((resolve, reject) => {
				suspendInfo["resolve"] = resolve;
				suspendInfo["reject"] = reject;
				suspendInfo["state"] = "pending";
			});
			suspendInfo["promise"] = promise;

			return suspendInfo;

		}

	}

	// =============================================================================

	// =============================================================================
	//	Template organizer class
	// =============================================================================

	class TemplateOrganizer extends Organizer
	{

		// -------------------------------------------------------------------------
		//  Methods
		// -------------------------------------------------------------------------

		/**
		 * Global init.
		 */
		static globalInit()
		{

			// Add properties
			Object.defineProperty(Component.prototype, 'templates', { get() { return this._templates; }, });
			Object.defineProperty(Component.prototype, 'activeTemplateName', { get() { return this._activeTemplateName; }, set(value) { this._activeTemplateName = value; } });

			// Add methods
			Component.prototype.addTemplate = function(templateName, options) { return TemplateOrganizer._addTemplate(this, templateName, options); };
			Component.prototype.applyTemplate = function(templateName) { return TemplateOrganizer._applyTemplate(this, templateName); };
			Component.prototype.cloneTemplate = function(templateName) { return TemplateOrganizer._clone(this, templateName); };

		}

		// -------------------------------------------------------------------------

		/**
		 * Init.
		 *
		 * @param	{Component}		component			Component.
		 * @param	{Object}		settings			Settings.
		 *
		 * @return 	{Promise}		Promise.
		 */
		static init(component, settings)
		{

			// Init vars
			component._templates = {};
			component._activeTemplateName = "";

			// Set defaults if not set
			if (!component.settings.get("settings.templateName"))
			{
				let templateName = component.settings.get("loadings.fileName") || component.tagName.toLowerCase();
				component.settings.set("settings.templateName", templateName);
			}

		}

		// -------------------------------------------------------------------------

		/**
		 * Organize.
		 *
		 * @param	{Object}		conditions			Conditions.
		 * @param	{Component}		component			Component.
		 * @param	{Object}		settings			Settings.
		 *
		 * @return 	{Promise}		Promise.
		 */
		static organize(conditions, component, settings)
		{

			let promises = [];
			let templates = settings["templates"];
			if (templates)
			{
				Object.keys(templates).forEach((templateName) => {
					if (conditions === "beforeStart")
					{
						switch (templates[templateName]["type"])
						{
							case "html":
							case "url":
								promises.push(TemplateOrganizer._addTemplate(component, templateName));
								break;
						}
					}
					else if (conditions === "afterAppend")
					{
						switch (templates[templateName]["type"])
						{
							case "node":
								promises.push(TemplateOrganizer._addTemplate(component, templateName));
								break;
						}
					}
				});
			}

			return Promise.all(promises);

		}

		// -------------------------------------------------------------------------

		/**
		 * Clear.
		 *
		 * @param	{Component}		component			Component.
		 */
		static clear(component)
		{

			component._templates = {};

		}

		// -------------------------------------------------------------------------
		//  Protected
		// -------------------------------------------------------------------------

		/**
		 * Add a template.
		 *
		 * @param	{Component}		component			Parent component.
		 * @param	{String}		templateName		Template name.
		 * @param	{Object}		options				Options for adding a template.
		 *
		 * @return  {Promise}		Promise.
		 */
		static _addTemplate(component, templateName, options)
		{

			let templateInfo = component._templates[templateName] || TemplateOrganizer.__createTemplateInfo(component, templateName);

			if (templateInfo["isLoaded"])
			//if (templateInfo["isLoaded"] && options && !options["forceLoad"])
			{
				console.debug(`TemplateOrganizer._addTemplate(): Template already loaded. name=${component.name}, templateName=${templateName}`);
				return Promise.resolve();
			}

			return component.loadTemplate(templateName);

		}

		// -------------------------------------------------------------------------

		/**
		 * Apply template.
		 *
		 * @param	{Component}		component			Parent component.
		 * @param	{String}		templateName		Template name.
		 */
		static _applyTemplate(component, templateName)
		{

			if (component._activeTemplateName === templateName)
			{
				console.debug(`TemplateOrganizer._applyTemplate(): Template already applied. name=${component.name}, templateName=${templateName}`);
				return Promise.resolve();
			}

			let templateInfo = component._templates[templateName];

			Util.assert(templateInfo,`TemplateOrganizer._applyTemplate(): Template not loaded. name=${component.name}, templateName=${templateName}`, ReferenceError);

			if (templateInfo["node"])
			{
				// Template node
				let clone = TemplateOrganizer.clone(component, templateInfo["name"]);
				component.insertBefore(clone, component.firstChild);
			}
			else
			{
				// HTML
				component.innerHTML = templateInfo["html"];
			}

			// Change active template
			component._activeTemplateName = templateName;

			console.debug(`TemplateOrganizer._applyTemplate(): Applied template. name=${component.name}, templateName=${templateInfo["name"]}, id=${component.id}`);

		}

		// -------------------------------------------------------------------------

		/**
		 * Clone the component.
		 *
		 * @param	{Component}		component			Parent component.
		 * @param	{String}		templateName		Template name.
		 *
		 * @return  {Object}		Cloned component.
		 */
		static _clone(component, templateName)
		{

			templateName = templateName || component.settings.get("settings.templateName");
			let templateInfo = component._templates[templateName];

			Util.assert(templateInfo,`TemplateOrganizer._addTemplate(): Template not loaded. name=${component.name}, templateName=${templateName}`, ReferenceError);

			let clone;
			if (templateInfo["node"])
			{
				// A template tag
				clone = document.importNode(templateInfo["node"], true);
			}
			else
			{
				// Not a template tag
				let ele = document.createElement("div");
				ele.innerHTML = templateInfo["html"];

				clone = ele.firstElementChild;
			}

			return clone;

		}

		// -------------------------------------------------------------------------
		//  Privates
		// -------------------------------------------------------------------------

		/**
		 * Returns a new template info object.
		 *
		 * @param	{Component}		component			Parent component.
		 * @param	{String}		templateName		Template name.
		 *
		 * @return  {Object}		Template info.
		 */
		static __createTemplateInfo(component, templateName)
		{

			if (!component._templates[templateName])
			{
				component._templates[templateName] = {};
				component._templates[templateName]["name"] = templateName;
				component._templates[templateName]["html"] = "";
				component._templates[templateName]["isLoaded"] = false;
			}

			return component._templates[templateName];

		}

	}

	// =============================================================================

	// =============================================================================
	//	Event organizer class
	// =============================================================================

	class EventOrganizer extends Organizer
	{

		// -------------------------------------------------------------------------
		//  Methods
		// -------------------------------------------------------------------------

		/**
		 * Global init.
		 */
		static globalInit()
		{

			// Add methods
			Component.prototype.initEvents = function(elementName, handlerInfo, rootNode) {
				EventOrganizer._initEvents(this, elementName, handlerInfo, rootNode);
			};
			Component.prototype.addEventHandler = function(eventName, handlerInfo, element, bindTo) {
				EventOrganizer._addEventHandler(this, element, eventName, handlerInfo, bindTo);
			};
			Component.prototype.trigger = function(eventName, options, element) {
				return EventOrganizer._trigger(this, eventName, options, element)
			};
			Component.prototype.triggerAsync = function(eventName, options, element) {
				return EventOrganizer._triggerAsync(this, eventName, options, element)
			};
			Component.prototype.getEventHandler = function(handlerInfo) {
				return EventOrganizer._getEventHandler(this, handlerInfo)
			};
			Component.prototype.removeEventHandler = function(eventName, handlerInfo, element) {
				return EventOrganizer._removeEventHandler(this, element, eventName, handlerInfo)
			};

		}

		// -------------------------------------------------------------------------

		/**
		 * Init.
		 *
		 * @param	{Component}		component			Component.
		 * @param	{Object}		settings			Settings.
		 *
		 * @return 	{Promise}		Promise.
		 */
		static init(component, settings)
		{
		}

		// -------------------------------------------------------------------------

		/**
		 * Organize.
		 *
		 * @param	{Object}		conditions			Conditions.
		 * @param	{Component}		component			Component.
		 * @param	{Object}		settings			Settings.
		 *
		 * @return 	{Promise}		Promise.
		 */
		static organize(conditions, component, settings)
		{

			let events = settings["events"];
			if (events)
			{
				let targets = EventOrganizer.__filterElements(component, events, conditions);

				Object.keys(targets).forEach((elementName) => {
					EventOrganizer._initEvents(component, elementName, events[elementName]);
				});
			}

		}

		// -------------------------------------------------------------------------

		/**
		 * Unorganize.
		 *
		 * @param	{Object}		conditions			Conditions.
		 * @param	{Component}		component			Component.
		 * @param	{Object}		settings			Settings.
		 *
		 * @return 	{Promise}		Promise.
		 */
		static unorganize(conditions, component, settings)
		{

			let events = settings["events"];
			if (events)
			{
				Object.keys(events).forEach((elementName) => {
					EventOrganizer._removeEvents(component, elementName, events[elementName]);
				});
			}

		}

		// -------------------------------------------------------------------------
		//  Protected
		// -------------------------------------------------------------------------

		/**
		 * Add an event handler.
		 *
		 * @param	{Component}		component			Component.
		 * @param	{HTMLElement}	element					HTML element.
		 * @param	{String}		eventName				Event name.
		 * @param	{Object/Function/String}	handlerInfo	Event handler info.
		 * @param	{Object}		bindTo					Object that binds to the handler.
		 */
		static _addEventHandler(component, element, eventName, handlerInfo, bindTo)
		{

			element = element || component;
			let handlerOptions = (typeof handlerInfo === "object" ? Util.deepClone(handlerInfo) : {});

			// Get handler
			let handler = EventOrganizer._getEventHandler(component, handlerInfo);
			Util.assert(handler, `EventOrganizer._addEventHandler(): handler not found. name=${component.name}, eventName=${eventName}`);

			// Init holder object for the element
			if (!element.__bm_eventinfo)
			{
				element.__bm_eventinfo = { "component":component, "listeners":{}, "promises":{}, "statuses":{} };
			}

			// Add hook event handler
			let listeners = element.__bm_eventinfo.listeners;
			if (!listeners[eventName])
			{
				listeners[eventName] = [];
				element.addEventListener(eventName, EventOrganizer.__callEventHandler, handlerOptions["listnerOptions"]);
			}

			// Register listener info
			listeners[eventName].push({"handler":handler, "options":handlerOptions["options"], "bindTo":bindTo});

			// Stable sort by order
			Util.safeGet(handlerOptions, "order");
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
		 * @param	{Component}		component			Component.
		 * @param	{HTMLElement}	element					HTML element.
		 * @param	{String}		eventName				Event name.
		 * @param	{Object/Function/String}	handlerInfo	Event handler info.
		 */
		static _removeEventHandler(component, element, eventName, handlerInfo)
		{

			element = element || component;

			// Get handler
			let handler = EventOrganizer._getEventHandler(component, handlerInfo);
			Util.assert(handler, `EventOrganizer._removeEventHandler(): handler not found. name=${component.name}, eventName=${eventName}`);

			let listeners = Util.safeGet(element, "__bm_eventinfo.listeners." + eventName);
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
		 * @param	{Component}		component			Component.
		 * @param	{String}		elementName			Element name.
		 * @param	{Object}		eventInfo			Event info.
		 * @param	{HTMLElement}	rootNode			Root node of elements.
		 */
		static _initEvents(component, elementName, eventInfo, rootNode)
		{

			rootNode = ( rootNode ? rootNode : component );
			eventInfo = ( eventInfo ? eventInfo : component.settings.get("events." + elementName) );

			// Get target elements
			let elements = EventOrganizer.__getTargetElements(component, rootNode, elementName, eventInfo);
			//Util.assert(elements.length > 0, `EventOrganizer._initEvents: No elements for the event found. name=${component.name}, elementName=${elementName}`, TypeError);

			// Set event handlers
			Object.keys(eventInfo["handlers"]).forEach((eventName) => {
				let handlers = ( Array.isArray(eventInfo["handlers"][eventName]) ? eventInfo["handlers"][eventName] : [eventInfo["handlers"][eventName]] );
				for (let i = 0; i < handlers.length; i++)
				{
					for (let j = 0; j < elements.length; j++)
					{
						component.addEventHandler(eventName, handlers[i], elements[j]);
					}
				}
			});

		}

		// -------------------------------------------------------------------------

		/**
		 * Remove event handlers from the element.
		 *
		 * @param	{Component}		component			Component.
		 * @param	{String}		elementName			Element name.
		 * @param	{Object}		eventInfo			Event info.
		 * @param	{HTMLElement}	rootNode			Root node of elements.
		 */
		static _removeEvents(component, elementName, eventInfo, rootNode)
		{

			rootNode = ( rootNode ? rootNode : component );

			// Get target elements
			let elements = EventOrganizer.__getTargetElements(component, rootNode, elementName, eventInfo);

			// Remove event handlers
			Object.keys(eventInfo["handlers"]).forEach((eventName) => {
				let handlers = ( Array.isArray(eventInfo["handlers"][eventName]) ? eventInfo["handlers"][eventName] : [eventInfo["handlers"][eventName]] );
				for (let i = 0; i < handlers.length; i++)
				{
					for (let j = 0; j < elements.length; j++)
					{
						component.removeEventHandler(eventName, handlers[i], elements[j]);
					}
				}
			});

		}

		// -------------------------------------------------------------------------

		/**
		 * Trigger the event synchronously.
		 *
		 * @param	{Component}		component				Component.
		 * @param	{String}		eventName				Event name to trigger.
		 * @param	{Object}		options					Event parameter options.
		 * @param	{HTMLElement}	element					HTML element.
		 */
		static _trigger(component, eventName, options, element)
		{

			options = Util.deepMerge({}, options);
			options["sender"] = options["sender"] || component;
			element = ( element ? element : component );
			let e = null;

			try
			{
				e = new CustomEvent(eventName, { detail: options });
			}
			catch(error)
			{
				e  = document.createEvent("CustomEvent");
				e.initCustomEvent(eventName, false, false, options);
			}

			element.dispatchEvent(e);

			// return the promise if exists
			return Util.safeGet(element, "__bm_eventinfo.promises." + eventName) || Promise.resolve();

		}

		// -------------------------------------------------------------------------

		/**
		 * Trigger the event asynchronously.
		 *
		 * @param	{Component}		component				Component.
		 * @param	{String}		eventName				Event name to trigger.
		 * @param	{Object}		options					Event parameter options.
		 * @param	{HTMLElement}	element					HTML element.
		 */
		static _triggerAsync(component, eventName, options, element)
		{

			options = options || {};
			options["async"] = true;

			return EventOrganizer._trigger.call(component, component, eventName, options, element);

		}

		// -----------------------------------------------------------------------------

		/**
		 * Get an event handler from a handler info object.
		 *
		 * @param	{Component}		component				Component.
		 * @param	{Object/Function/String}	handlerInfo	Handler info.
		 */
		static _getEventHandler(component, handlerInfo)
		{

			let handler = ( typeof handlerInfo === "object" ? handlerInfo["handler"] : handlerInfo );

			return handler;

		}

		// -------------------------------------------------------------------------
		//  Privates
		// -------------------------------------------------------------------------

		/**
		 * Filter target elements according to a condition.
		 *
		 * @param	{Object}		component			Component.
		 * @param	{Object}		eventInfo			Event settings.
		 * @param	{Object}		conditions			Conditions.
		 *
		 * @return 	{Object}		Target elements.
		 */
		static __filterElements(component, eventInfo, conditions)
		{

			let keys;

			switch (conditions)
			{
			case "beforeStart":
				// Return events only for the component itself.
				keys = Object.keys(eventInfo).filter((elementName) => {
					return EventOrganizer.__isTargetSelf(elementName, eventInfo[elementName]);
				});
				break;
			case "afterAppend":
				// Return events only for elements inside the component.
				keys = Object.keys(eventInfo).filter((elementName) => {
					return !EventOrganizer.__isTargetSelf(elementName, eventInfo[elementName]);
				});
				break;
			case "afterSpecLoad":
				// Return all
				keys = Object.keys(eventInfo);
				break;
			}

			let targets = keys.reduce((result, key) => {
				result[key] = eventInfo[key];
				return result;
			}, {});

			return targets;

		}

		// -------------------------------------------------------------------------

		/**
		 * Check if a target element is component itself.
		 *
		 * @param	{String}		elementName			Element name.
		 * @param	{Object}		elementInfo			Element info.
		 *
		 * @return 	{Boolean}			Target node list.
		 */
			static __isTargetSelf(elementName, eventInfo)
		{

			let ret = false;

			if (elementName === "this" || eventInfo && eventInfo["rootNode"] === "this")
			{
				ret = true;
			}

			return ret;

		}

		// -------------------------------------------------------------------------

		/**
		 * Get target elements for the eventInfo.
		 *
		 * @param	{Component}		component			Component.
		 * @param	{HTMLElement}	rootNode			A root node to search elements.
		 * @param	{String}		elementName			Element name.
		 * @param	{Object}		elementInfo			Element info.
		 *
		 * @return 	{Array}			Target node list.
		 */
		static __getTargetElements(component, rootNode, elementName, eventInfo)
		{

			let elements;

			if (EventOrganizer.__isTargetSelf(elementName, eventInfo))
			{
				elements = [rootNode];
			}
			else if (eventInfo && eventInfo["rootNode"])
			{
				elements = Util.scopedSelectorAll(rootNode, eventInfo["rootNode"]);
			}
			else
			{
				elements = Util.scopedSelectorAll(rootNode, "#" + elementName);
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
		static __isHandlerInstalled(element, eventName, handler)
		{

			let isInstalled = false;
			let listeners = Util.safeGet(element.__bm_eventinfo, "listeners." + eventName);

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
		static __callEventHandler(e)
		{

			let listeners = Util.safeGet(this, "__bm_eventinfo.listeners." + e.type);
			let sender = Util.safeGet(e, "detail.sender", this);
			let component = Util.safeGet(this, "__bm_eventinfo.component");

			// Check if handler is already running
			//Util.assert(Util.safeGet(this, "__bm_eventinfo.statuses." + e.type) !== "handling", `EventOrganizer.__callEventHandler(): Event handler is already running. name=${this.tagName}, eventName=${e.type}`, Error);
			Util.warn(Util.safeGet(this, "__bm_eventinfo.statuses." + e.type) !== "handling", `EventOrganizer.__callEventHandler(): Event handler is already running. name=${this.tagName}, eventName=${e.type}`);

			Util.safeSet(this, "__bm_eventinfo.statuses." + e.type, "handling");

			if (Util.safeGet(e, "detail.async", false) === false)
			{
				// Wait previous handler
				this.__bm_eventinfo["promises"][e.type] = EventOrganizer.__handle(e, sender, component, listeners).then(() => {
					Util.safeSet(this, "__bm_eventinfo.promises." + e.type, null);
					Util.safeSet(this, "__bm_eventinfo.statuses." + e.type, "");
				}).catch((err) => {
					Util.safeSet(this, "__bm_eventinfo.promises." + e.type, null);
					Util.safeSet(this, "__bm_eventinfo.statuses." + e.type, "");
					throw(err);
				});
			}
			else
			{
				// Does not wait previous handler
				try
				{
					this.__bm_eventinfo["promises"][e.type] = EventOrganizer.__handleAsync(e, sender, component, listeners);
					Util.safeSet(this, "__bm_eventinfo.promises." + e.type, null);
					Util.safeSet(this, "__bm_eventinfo.statuses." + e.type, "");
				}
				catch (err)
				{
					Util.safeSet(this, "__bm_eventinfo.promises." + e.type, null);
					Util.safeSet(this, "__bm_eventinfo.statuses." + e.type, "");
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
		 * @param	{Object}		component				Target component.
		 * @param	{Object}		listener				Listers info.
		 */
		static __handle(e, sender, component, listeners)
		{

			let chain = Promise.resolve();
			let stopPropagation = false;

			for (let i = 0; i < listeners.length; i++)
			{
				// Options set in addEventHandler()
				let ex = {
					"component": component,
					"options": ( listeners[i]["options"] ? listeners[i]["options"] : {} )
				};

				chain = chain.then(() => {
					// Get a handler
					let handler = listeners[i]["handler"];
					handler = ( typeof handler === "string" ? component[handler] : handler );
					Util.assert(typeof handler === "function", `EventOrganizer._addEventHandler(): Event handler is not a function. name=${component.name}, eventName=${e.type}`, TypeError);

					// Execute the handler
					let bindTo = ( listeners[i]["bindTo"] ? listeners[i]["bindTo"] : component );
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
		 * Call event handlers (Async).
		 *
		 * @param	{Object}		e						Event parameter.
		 * @param	{Object}		sender					Sender object.
		 * @param	{Object}		component				Target component.
		 * @param	{Object}		listener				Listers info.
		 */
		static __handleAsync(e, sender, component, listeners)
		{

			let stopPropagation = false;

			for (let i = 0; i < listeners.length; i++)
			{
				// Options set on addEventHandler()
				let ex = {
					"component": component,
					"options": ( listeners[i]["options"] ? listeners[i]["options"] : {} )
				};

				// Get a handler
				let handler = listeners[i]["handler"];
				handler = ( typeof handler === "string" ? component[handler] : handler );
				Util.assert(typeof handler === "function", `EventOrganizer._addEventHandler(): Event handler is not a function. name=${component.name}, eventName=${e.type}`, TypeError);

				// Execute handler
				let bindTo = ( listeners[i]["bindTo"] ? listeners[i]["bindTo"] : component );
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

	// =============================================================================
	//	Loader organizer class
	// =============================================================================

	class LoaderOrganizer extends Organizer
	{

		// -------------------------------------------------------------------------
		//  Methods
		// -------------------------------------------------------------------------

		/**
		 * Global init.
		 */
		static globalInit()
		{

			// Add methods
			BITSMIST.v1.Component.prototype.getLoader = function(...args) { return LoaderOrganizer._getLoader(this, ...args); };
			BITSMIST.v1.Component.prototype.loadTags = function(...args) { return this.getLoader().loadTags(...args); };
			BITSMIST.v1.Component.prototype.loadComponent = function(...args) { return this.getLoader().loadComponent(...args); };
			BITSMIST.v1.Component.prototype.loadTemplate = function(...args) { return this.getLoader().loadTemplate(this, ...args); };
			BITSMIST.v1.Component.prototype.loadSetting = function(...args) { return this.getLoader().loadSetting(this, ...args); };
			BITSMIST.v1.Component.prototype.loadSettingFile = function(...args) { return this.getLoader().loadSettingFile(...args); };

			// Init vars
			LoaderOrganizer._loaders = {};
			Object.defineProperty(LoaderOrganizer, "loaders", {
				get() { return LoaderOrganizer._loaders; },
			});
			LoaderOrganizer._loaders["DefaultLoader"] = BITSMIST.v1.DefaultLoader;

			// Load tags on DOMContentLoaded event
			document.addEventListener("DOMContentLoaded", () => {
				if (BITSMIST.v1.settings.get("organizers.LoaderOrgaznier.settings.autoLoadOnStartup", true))
				{
					let loaderName = BITSMIST.v1.settings.get("system.loaderName", "DefaultLoader");
					let loader = LoaderOrganizer._loaders[loaderName].object;
					Util.assert(LoaderOrganizer._loaders[loaderName], `Loader doesn't exist. loaderName=${loaderName}`);

					loader.loadTags(document.body, {"waitForTags":false});
				}
			});

		}

		// -------------------------------------------------------------------------

		/**
		 * Init.
		 *
		 * @param	{Component}		component			Component.
		 * @param	{Object}		settings			Settings.
		 *
		 * @return 	{Promise}		Promise.
		 */
		static init(component, settings)
		{

			// Add properties
			Object.defineProperty(component, "components", {
				get() { return this._components; },
			});

			// Add methods
			component.addComponent = function(componentName, settings, sync) { return LoaderOrganizer._addComponent(this, componentName, settings, sync); };

			// Init vars
			component._components = {};
			component.getLoader().init(component);

		}

		// -------------------------------------------------------------------------

		/**
		 * Organize.
		 *
		 * @param	{Object}		conditions			Conditions.
		 * @param	{Component}		component			Component.
		 * @param	{Object}		settings			Settings.
		 *
		 * @return 	{Promise}		Promise.
		 */
		static organize(conditions, component, settings)
		{

			let chain = Promise.resolve();

			// Load molds
			let molds = settings["molds"];
			if (molds)
			{
				Object.keys(molds).forEach((moldName) => {
					chain = chain.then(() => {
						if (!component.components[moldName])
						{
							return LoaderOrganizer._addComponent(component, moldName, molds[moldName], true);
						}
					});
				});
			}

			// Load components
			let components = settings["components"];
			if (components)
			{
				Object.keys(components).forEach((componentName) => {
					chain = chain.then(() => {
						if (!component.components[componentName])
						{
							return LoaderOrganizer._addComponent(component, componentName, components[componentName]);
						}
					});
				});
			}

			return chain;

		}

		// -------------------------------------------------------------------------

		/**
		 * Register a loader.
		 *
		 * @param	{String}		key					Key to store.
		 * @param	{Object}		value				Value to store.
		 */
		static register(key, value)
		{

			value = Util.deepMerge({}, value);
			value["name"] = ( value["name"] ? value["name"] : key );

			LoaderOrganizer._loaders[key] = value;

		}

		// -------------------------------------------------------------------------
		//  Protected
		// -------------------------------------------------------------------------

		/**
		 * Get a loader.
		 *
		 * @param	{Component}		component			Component.
		 * @param	{String}		loaderName			Loader name.
		 *
		 * @return 	{Function}		Loader.
		 */
		static _getLoader(component, loaderName)
		{

			loaderName = ( loaderName ? loaderName : component.settings.get("settings.loaderName", "DefaultLoader") );
			Util.assert(LoaderOrganizer._loaders[loaderName], `Loader doesn't exist. loaderName=${loaderName}`);

			return LoaderOrganizer._loaders[loaderName].object;

		}

		// -------------------------------------------------------------------------

		/**
		 * Add a component to parent component.
		 *
		 * @param	{Component}		component			Parent component.
		 * @param	{String}		componentName		Component name.
		 * @param	{Object}		settings			Settings for the component.
		 * @param	{Boolean}		sync				Wait for the component to become the state.
		 *
		 * @return  {Promise}		Promise.
		 */
		static _addComponent(component, componentName, settings, sync)
		{

			console.debug(`Adding a component. name=${component.name}, componentName=${componentName}`);

			// Get a tag name
			let tagName;
			let tag = Util.safeGet(settings, "loadings.tag");
			if (tag)
			{
				let pattern = /([\w-]+)\s+\w+.*?>/;
				tagName = tag.match(pattern)[1];
			}
			else
			{
				tagName = Util.safeGet(settings, "loadings.tagName", Util.getTagNameFromClassName(componentName)).toLowerCase();
			}

			return Promise.resolve().then(() => {
				let loaderName = Util.safeGet(settings, "loadings.loaderName", "DefaultLoader");
				let loader = LoaderOrganizer._loaders[loaderName].object;
				if (Util.safeGet(settings, "loadings.autoLoad") || Util.safeGet(settings, "loadings.autoMorph"))
				{
					return loader.loadComponent(tagName, componentName, settings);
				}
			}).then(() => {
				Util.assert(Util.safeGet(settings, "loadings.rootNode"), `Root node not specified. name=${component.name}, componentName=${componentName}`);

				// Insert tag
				if (!component._components[componentName])
				{
					component._components[componentName] = LoaderOrganizer.__insertTag(component, tagName, settings);
				}
			}).then(() => {
				// Wait for the added component to be ready
				if (sync || Util.safeGet(settings, "loadings.sync"))
				{
					sync = sync || Util.safeGet(settings, "loadings.sync"); // sync precedes settings["sync"]
					let state = (sync === true ? "ready" : sync);

					return component.waitFor([{"id":component._components[componentName].uniqueId, "state":state}]);
				}
			});

		}

		// -------------------------------------------------------------------------
		//  Privates
		// -------------------------------------------------------------------------

		/**
		 * Insert a tag and return the inserted component.
		 *
		 * @param	{String}		tagName				Tagname.
		 * @param	{Object}		settings			Component settings.
		 *
		 * @return  {Component}		Component.
		 */
		static __insertTag(component, tagName, settings)
		{

			let addedComponent;

			// Check root node
			let root = Util.scopedSelectorAll(component.rootElement, Util.safeGet(settings, "loadings.rootNode"), {"penetrate":true})[0];
			Util.assert(root, `LoaderOrganizer.__insertTag(): Root node does not exist. name=${component.name}, tagName=${tagName}, rootNode=${Util.safeGet(settings, "loadings.rootNode")}`, ReferenceError);

			// Build tag
			let tag = ( Util.safeGet(settings, "loadings.tag") ? Util.safeGet(settings, "loadings.tag") : "<" + tagName +  "></" + tagName + ">" );

			// Insert tag
			if (Util.safeGet(settings, "loadings.overwrite"))
			{
				root.outerHTML = tag;
				addedComponent = root;
			}
			else
			{
				root.insertAdjacentHTML("afterbegin", tag);
				addedComponent = root.children[0];
			}

			// Inject settings to added component
			addedComponent._injectSettings = function(curSettings){
				return Util.deepMerge(curSettings, settings);
			};

			return addedComponent;

		}

	}

	// =============================================================================

	// =============================================================================
	//	Default loader class
	// =============================================================================

	class DefaultLoader
	{

		// -------------------------------------------------------------------------
		//  Methods
		// -------------------------------------------------------------------------

		/**
		 * Init.
		 *
		 * @param	{Component}		component			Component.
		 * @param	{Object}		options				Options.
		 *
		 * @return 	{Promise}		Promise.
		 */
		static init(component, options)
		{

			component.settings.merge(this._loadAttrSettings(component));

		}

		// -------------------------------------------------------------------------

		/**
		 * Load scripts for tags that has bm-autoload/bm-automorph attribute.
		 *
		 * @param	{HTMLElement}	rootNode			Target node.
		 * @param	{Object}		options				Load Options.
		 *
		 * @return  {Promise}		Promise.
		 */
		static loadTags(rootNode, options)
		{

			console.debug(`Loading tags. rootNode=${rootNode.tagName}`);

			let promises = [];

			// Load tags that has bm-autoload/bm-automorph attribute
			let targets = Util.scopedSelectorAll(rootNode, "[bm-autoload]:not([bm-autoloading]):not([bm-powered]),[bm-automorph]:not([bm-autoloading]):not([bm-powered])");
			targets.forEach((element) => {
				element.setAttribute("bm-autoloading", "");

				// Load a tag
				let loader = ( element.hasAttribute("bm-loadername") ? LoaderOrganizer.getLoader(element.getAttribute("bm-loadername")).object : this);
				let settings = this._loadAttrSettings(element);
				let className = Util.getClassNameFromTagName(element.tagName);
				element._injectSettings = function(curSettings){
					return Util.deepMerge(curSettings, settings);
				};
				promises.push(loader.loadComponent(element.tagName.toLowerCase(), className, settings).then(() => {
					element.removeAttribute("bm-autoloading");
				}));
			});

			return Promise.all(promises).then(() => {
				let waitFor = Util.safeGet(options, "waitForTags");
				if (waitFor)
				{
					return DefaultLoader._waitForChildren(rootNode);
				}
			});

		}

		// -------------------------------------------------------------------------

		/**
		 * Load a component.
		 *
		 * @param	{String}		tagName				Tag name.
		 * @param	{String}		className			Class name.
		 * @param	{Object}		settings			Component settings.
		 * @param	{Object}		loadOptions			Load options.
		 *
		 * @return  {Promise}		Promise.
		 */
		static loadComponent(tagName, className, settings, loadOptions)
		{

			console.debug(`Loading a component. tagName=${tagName}, className=${className}`);

			// Check if the tag is already defined
			if (customElements.get(tagName))
			{
				console.debug(`Tag already defined. className=${className}, tagName=${tagName}`);
				return Promise.resolve();
			}

			loadOptions = Util.deepMerge({}, loadOptions);

			// Override path and filename when url is specified in autoLoad option
			let href = Util.safeGet(settings, "loadings.autoLoad");
			href = ( href === true ? "" : href );
			if (href)
			{
				let url = Util.parseURL(href);

				settings["loadings"]["appBaseUrl"] = "";
				settings["loadings"]["componentPath"] = "";
				settings["loadings"]["templatePath"] = "";
				settings["loadings"]["path"] = url.path;
				settings["loadings"]["fileName"] = url.filenameWithoutExtension;

				if (url.extension === "html")
				{
					settings["loadings"]["autoMorph"] = ( settings["loadings"]["autoMorph"] ? settings["loadings"]["autoMorph"] : true );
				}

				loadOptions["query"] = url.query;
			}

			// Get a base class name
			let baseClassName = Util.safeGet(settings, "loadings.autoMorph", className );
			baseClassName = ( baseClassName === true ? "BITSMIST.v1.Component" : baseClassName );

			// Get a path
			let path = Util.safeGet(loadOptions, "path",
				Util.concatPath([
					Util.safeGet(settings, "loadings.appBaseUrl", BITSMIST.v1.settings.get("system.appBaseUrl", "")),
					Util.safeGet(settings, "loadings.componentPath", BITSMIST.v1.settings.get("system.componentPath", "")),
					Util.safeGet(settings, "loadings.path", ""),
				])
			);

			// Load a class
			let fileName = Util.safeGet(settings, "loadings.fileName", tagName.toLowerCase());
			loadOptions["splitComponent"] = Util.safeGet(loadOptions, "splitComponent", Util.safeGet(settings, "loadings.splitComponent", BITSMIST.v1.settings.get("system.splitComponent", false)));
			loadOptions["query"] = Util.safeGet(loadOptions, "query",  Util.safeGet(settings, "loadgings.query"), "");

			return DefaultLoader._autoloadComponent(baseClassName, fileName, path, loadOptions).then(() => {
				// Morphing
				if (baseClassName !== className)
				{
					let superClass = ClassUtil.getClass(baseClassName);
					ClassUtil.newComponent(className, settings, superClass, tagName);
				}

				if (!customElements.get(tagName))
				{
					let classDef = ClassUtil.getClass(className);
					customElements.define(tagName, classDef);
				}
			});

		}

		// -------------------------------------------------------------------------

		/**
		 * Get a template html according to settings.
		 *
		 * @param	{Component}		component			Component.
		 * @param	{String}		templateName		Template name.
		 * @param	{Object}		loadOptions			Load options.
		 *
		 * @return 	{Promise}		Promise.
		 */
		static loadTemplate(component, templateName, loadOptions)
		{

			let promise;
			let templateInfo = component._templates[templateName];
			let settings = component.settings.get("templates." + templateName, {});

			switch (settings["type"]) {
			case "html":
				templateInfo["html"] = settings["html"];
				promise = Promise.resolve();
				break;
			case "node":
				templateInfo["html"] = component.querySelector(settings["rootNode"]).innerHTML;
				promise = Promise.resolve();
				break;
			case "url":
			default:
				let path = Util.safeGet(loadOptions, "path",
					Util.concatPath([
						component.settings.get("loadings.appBaseUrl", BITSMIST.v1.settings.get("system.appBaseUrl", "")),
						component.settings.get("loadings.templatePath", BITSMIST.v1.settings.get("system.templatePath", component.settings.get("loadings.componentPath", BITSMIST.v1.settings.get("system.componentPath", "")))),
						component.settings.get("loadings.path", ""),
					])
				);

				promise = this._loadTemplateFile(templateInfo["name"], path, loadOptions).then((template) => {
					templateInfo["html"] = template;
				});
				break;
			}

			return promise.then(() => {
				templateInfo["isLoaded"] = true;
			});

		}

		// -------------------------------------------------------------------------

		/**
		 * Load a setting file and merge to component's settings.
		 *
		 * @param	{Component}		component			Component.
		 * @param	{String}		settingName			Setting name.
		 * @param	{Object}		loadOptions			Load options.
		 *
		 * @return 	{Promise}		Promise.
		 */
		static loadSetting(component, settingName, loadOptions)
		{

			let path;
			return Promise.resolve().then(() => {
				path = Util.safeGet(loadOptions, "path",
					Util.concatPath([
						component.settings.get("loadings.appBaseUrl", BITSMIST.v1.settings.get("system.appBaseUrl", "")),
						component.settings.get("loadings.componentPath", BITSMIST.v1.settings.get("system.componentPath", "")),
						component.settings.get("loadings.path", ""),
					])
				);

				return this.loadSettingFile(settingName, path, Object.assign({"type":"js", "bindTo":component}, loadOptions));
			}).then((extraSettings) => {
				if (extraSettings)
				{
					component.settings.merge(extraSettings);
				}
			});

		}

		// -------------------------------------------------------------------------

		/**
		 * Load setting file.
		 *
		 * @param	{Component}		component			Component.
		 * @param	{String}		settingName			Setting name.
		 * @param	{String}		path				Path to setting file.
		 * @param	{String}		type				Type of setting file.
		 *
		 * @return  {Promise}		Promise.
		 */
		static loadSettingFile(settingName, path, loadOptions)
		{

			let type = Util.safeGet(loadOptions, "type", "js");
			let query = Util.safeGet(loadOptions, "query");
			let url = Util.concatPath([path, settingName + "." + type]) + (query ? "?" + query : "");
			let settings;

			console.debug(`Loading setting. settingName=${settingName}, path=${path}`);

			return AjaxUtil.ajaxRequest({url:url, method:"GET"}).then((xhr) => {
				console.debug(`Loaded settings. url=${url}`);

				switch (type)
				{
				case "json":
					try
					{
						settings = JSON.parse(xhr.responseText);
					}
					catch(e)
					{
						if (e instanceof SyntaxError)
						{
							throw new SyntaxError(`Illegal json string. url=${url}, message=${e.message}`);
						}
						else
						{
							throw e;
						}
					}
					break;
				case "js":
				default:
					let bindTo = Util.safeGet(loadOptions, "bindTo");
					settings = Function('"use strict";return (' + xhr.responseText + ')').call(bindTo);
					break;
				}

				return settings;
			});

		}

		// -------------------------------------------------------------------------
		//  Protected
		// -------------------------------------------------------------------------

		/**
		 * Wait for components under the specified root node.
		 *
		 * @param	{HTMLElement}	rootNode			Target node.
		 *
		 * @return  {Promise}		Promise.
		 */
		static _waitForChildren(rootNode)
		{

			let waitList = [];
			let targets = Util.scopedSelectorAll(rootNode, "[bm-powered],[bm-autoloading]");
			targets.forEach((element) => {
				if (rootNode != element.rootElement && !element.hasAttribute("bm-nowait"))
				{
					let waitItem = {"object":element, "state":"ready"};
					waitList.push(waitItem);
				}
			});

			return BITSMIST.v1.StateOrganizer.waitFor(waitList, {"waiter":rootNode});

		}

		// -------------------------------------------------------------------------

		/**
		 * Check if the class exists.
		 *
		 * @param	{String}		className			Class name.
		 *
		 * @return  {Bool}			True if exists.
		 */
		static _isLoadedClass(className)
		{

			let ret = false;

			if (DefaultLoader._classes.get(className, {})["state"] === "loaded")
			{
				ret = true;
			}
			else if (ClassUtil.getClass(className))
			{
				ret = true;
			}

			return ret;

		}

		// -------------------------------------------------------------------------

		/**
		 * Load the component if not loaded yet.
		 *
		 * @param	{String}		className			Component class name.
		 * @param	{String}		fileName			Component file name.
		 * @param	{String}		path				Path to component.
		 * @param	{Object}		loadOptions			Load Options.
		 *
		 * @return  {Promise}		Promise.
		 */
		static _autoloadComponent(className, fileName, path, loadOptions)
		{

			console.debug(`Auto loading component. className=${className}, fileName=${fileName}, path=${path}`);

			let promise;

			if (this._isLoadedClass(className))
			{
				// Already loaded
				console.debug(`Component Already exists. className=${className}`);
				DefaultLoader._classes.set(className + ".state", "loaded");
				promise = Promise.resolve();
			}
			else if (DefaultLoader._classes.get(className, {})["state"] === "loading")
			{
				// Already loading
				console.debug(`Component Already loading. className=${className}`);
				promise = DefaultLoader._classes.get(className)["promise"];
			}
			else
			{
				// Not loaded
				DefaultLoader._classes.set(className + ".state", "loading");
				promise = this._loadComponentFile(fileName, path, loadOptions).then(() => {
					DefaultLoader._classes.set(className, {"state":"loaded", "promise":null});
				});
				DefaultLoader._classes.set(className + ".promise", promise);
			}

			return promise;

		}

		// -------------------------------------------------------------------------

		/**
		 * Load the component js files.
		 *
		 * @param	{String}		className			Class name.
		 * @param	{String}		path				Path to component.
		 * @param	{Object}		loadOptions			Load Options.
		 *
		 * @return  {Promise}		Promise.
		 */
		static _loadComponentFile(fileName, path, loadOptions)
		{

			console.debug(`Loading script. fileName=${fileName}, path=${path}`);

			let query = Util.safeGet(loadOptions, "query");
			let url1 = Util.concatPath([path, fileName + ".js"]) + (query ? "?" + query : "");
			let url2 = Util.concatPath([path, fileName + ".settings.js"]) + (query ? "?" + query : "");

			return Promise.resolve().then(() => {
				return AjaxUtil.loadScript(url1);
			}).then(() => {
				if (loadOptions["splitComponent"])
				{
					return AjaxUtil.loadScript(url2);
				}
			}).then(() => {
				console.debug(`Loaded script. fileName=${fileName}`);
			});

		}

		// -------------------------------------------------------------------------

		/**
		 * Load the template html.
		 *
		 * @param	{String}		templateName		Template name.
		 * @param	{String}		path				Path to template.
		 * @param	{Object}		loadOptions			Load options.
		 *
		 * @return  {Promise}		Promise.
		 */
		static _loadTemplateFile(templateName, path, loadOptions)
		{

			console.debug(`Loading template. templateName=${templateName}, path=${path}`);

			let query = Util.safeGet(loadOptions, "query");
			let url = Util.concatPath([path, templateName]) + ".html" + (query ? "?" + query : "");
			return AjaxUtil.ajaxRequest({url:url, method:"GET"}).then((xhr) => {
				console.debug(`Loaded template. templateName=${templateName}, path=${path}`);

				return xhr.responseText;
			});

		}

		// -------------------------------------------------------------------------

		/**
		 * Get settings from element's attribute.
		 *
		 * @param	{Component}		component			Component.
		 */
		static _loadAttrSettings(element)
		{

			let settings = {
				"loadings": {}
			};

			// Split component
			if (element.hasAttribute("bm-split"))
			{
				settings["loadings"]["splitComponent"] = true;
			}

			// Path
			if (element.hasAttribute("bm-path"))
			{
				settings["loadings"]["path"] = element.getAttribute("bm-path");
			}

			// File name
			if (element.hasAttribute("bm-filename"))
			{
				settings["loadings"]["fileName"] = element.getAttribute("bm-filename");
			}

			// Morphing
			if (element.hasAttribute("bm-automorph"))
			{
				settings["loadings"]["autoMorph"] = ( element.getAttribute("bm-automorph") ? element.getAttribute("bm-automorph") : true );
			}

			// Auto loading
			if (element.hasAttribute("bm-autoload"))
			{
				settings["loadings"]["autoLoad"] = ( element.getAttribute("bm-autoload") ? element.getAttribute("bm-autoload") : true );
			}

			return settings;

		}

	}

	// Init
	DefaultLoader._classes = new Store();

	// =============================================================================
	/**
	 * BitsmistJS - Javascript Web Client Framework
	 *
	 * @copyright		Masaki Yasutake
	 * @link			https://bitsmist.com/
	 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
	 */
	// =============================================================================

	window.BITSMIST = window.BITSMIST || {};
	window.BITSMIST.v1 = window.BITSMIST.v1 || {};
	window.BITSMIST.v1.Component = Component;
	window.BITSMIST.v1.Organizer = Organizer;
	window.BITSMIST.v1.OrganizerOrganizer = OrganizerOrganizer;
	OrganizerOrganizer.globalInit(Component);
	window.BITSMIST.v1.SettingOrganizer = SettingOrganizer;
	SettingOrganizer.globalInit(Component);
	window.BITSMIST.v1.settings = SettingOrganizer.globalSettings;
	OrganizerOrganizer.register("StateOrganizer", {"object":StateOrganizer, "targetWords":"waitFor", "targetEvents":"*", "order":100});
	window.BITSMIST.v1.StateOrganizer = StateOrganizer;
	OrganizerOrganizer.register("TemplateOrganizer", {"object":TemplateOrganizer, "targetWords":"templates", "targetEvents":["beforeStart", "afterAppend"], "order":200});
	window.BITSMIST.v1.TemplateOrganizer = TemplateOrganizer;
	OrganizerOrganizer.register("EventOrganizer", {"object":EventOrganizer, "targetWords":"events", "targetEvents":["beforeStart", "afterAppend", "afterSpecLoad"], "order":210});
	window.BITSMIST.v1.EventOrganizer = EventOrganizer;
	OrganizerOrganizer.register("LoaderOrganizer", {"object":LoaderOrganizer, "targetWords":["molds", "components"], "targetEvents":["afterStart", "afterSpecLoad"], "order":400});
	window.BITSMIST.v1.LoaderOrganizer = LoaderOrganizer;
	LoaderOrganizer.register("DefaultLoader", {"object":DefaultLoader});
	window.BITSMIST.v1.DefaultLoader = DefaultLoader;
	window.BITSMIST.v1.Store = Store;
	window.BITSMIST.v1.ChainableStore = ChainableStore;
	window.BITSMIST.v1.AjaxUtil = AjaxUtil;
	window.BITSMIST.v1.ClassUtil = ClassUtil;
	window.BITSMIST.v1.Util = Util;

})();
//# sourceMappingURL=bitsmist-js_v1.js.map
