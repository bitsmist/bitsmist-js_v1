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
			let current = Util.__createIntermediateObject(store, keys);

			Util.assert(current !== null && typeof current === "object",
				`Util.safeSet(): Can't create an intermediate object. Non-object value already exists. key=${key}, existingKey=${( keys.length > 1 ? keys[keys.length-2] : "" )}, existingValue=${current}`, TypeError);

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
		 * Get the class name from tag name.
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

			let targetNode = rootNode.unitRoot || rootNode;
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
		 * Create UUID.
		 *
		 * @return  {String}		UUID.
		 */
		static getUUID()
		{

			let uuid = "";

			for (let i = 0; i < 32; i++)
			{
				let random = Math.random() * 16 | 0;

				if (i == 8 || i == 12 || i == 16 || i == 20)
				{
					uuid += "-";
				}
				uuid += (i == 12 ? 4 : (i == 16 ? (random & 3 | 8) : random)).toString(16);
			}

			return uuid;

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

			if (Util.__isObject(target))
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
		 * Define new unit in ES5 way.
		 *
		 * @param	{String}		className			Class name.
		 * @param	{Object}		settings			Unit Settings.
		 * @param	{Object}		superClass			Super class.
		 * @param	{String}		tagName				Tag name.
		 */
		static newUnit(className, settings, superClass, tagName)
		{

			superClass = ( superClass ? superClass : BITSMIST.v1.Unit );

			// Define class
			let funcDef = "{ return Reflect.construct(superClass, [], this.constructor); }";
			let classDef = Function("superClass", `return function ${ClassUtil.__validateClassName(className)}()${funcDef}`)(superClass);
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
		 * Instantiate the class.
		 *
		 * @param	{String}		className			Class name.
		 * @param	{Object}		options				Options for the unit.
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
		 * Get the class.
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
				ret = Function(`return (${ClassUtil.__validateClassName(className)})`)();
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
		static loadScript(url) {

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

				return Util.getObject(xhr.responseText, {"format":format});
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

			console.debug(`AjaxUtil.loadHTML(): Loading an HTML file. URL=${url}`);

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

			console.debug(`AjaxUtil.loadCSS(): Loading an CSS file. URL=${url}`);

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
				return AjaxUtil.loadScript(url1);
			}).then(() => {
				if (options["splitClass"])
				{
					let url2 = url + ".settings.js";
					console.debug(`AjaxUtil.loadClass(): Loading the second file. URL2=${url2}`);
					return AjaxUtil.loadScript(url2);
				}
			}).then(() => {
				console.debug(`AjaxUtil.loadClass(): Loaded the class files. URL=${url}`);
			});

		}

	}

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

			if (options && options["merge"])
			{
				Util.safeMerge(this._items, key, defaultValue);
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
		 * Set the value to the store. If key is empty, it sets the value to the root.
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
	 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
	 */
	// =============================================================================

	// =============================================================================
	//	Unit Class
	// =============================================================================

	class Unit extends HTMLElement
	{

		// -------------------------------------------------------------------------
		//  Callbacks
		// -------------------------------------------------------------------------

		/**
		 * Connected callback.
		 */
		connectedCallback()
		{

			this._connectedHandler(this);

		}

		// -------------------------------------------------------------------------

		/**
		 * Disconnected callback.
		 */
		disconnectedCallback()
		{

			this._disconnectedHandler(this);

		}

		// -------------------------------------------------------------------------

		/**
		 * Adopted callback.
		 */
		adoptedCallback()
		{

			this._adoptedHandler(this);

		}

		// -------------------------------------------------------------------------

		/**
		 * Attribute changed callback.
		 */
		attributeChangedCallback(name, oldValue, newValue)
		{

			this._attributeChangedHandler(this, name, oldValue, newValue);

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
	//	Base Perk Class
	// =============================================================================

	class Perk
	{

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

			return {};

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
		 * Get editor for the perk.
		 *
		 * @return 	{String}		Editor.
		 */
		static getEditor()
		{

			return "";

		}

		// -------------------------------------------------------------------------

		/**
		 * Set event handler for perk.
		 *
		 * @param	{Unit}			unit				Unit.
		 * @param	{String}		type				Upgrade type.
		 * @param	{String}		name				Section name.
		 * @param	{Function}		content				Upgrade content.
		 */
		static upgrade(unit, type, name, content)
		{

			switch (type)
			{
				case "asset":
					unit.__bm_assets[name] = content;
					break;
				case "method":
					unit[name] = content;
					break;
				case "property":
					Object.defineProperty(unit, name, content);
					break;
				case "event":
					unit.use("skill", "event.add", name, {
						"handler":	content,
						"order":	this.info["order"],
					});
					break;
				default:
					unit.__bm_assets[type].set(name, content);
					break;
			}

		}

	}

	// =============================================================================

	// =============================================================================
	//	Status Perk Class
	// =============================================================================

	class StatusPerk extends Perk
	{

		// -------------------------------------------------------------------------
		//  Properties
		// -------------------------------------------------------------------------

		static get info()
		{

			return {
				"section":		"status",
				"order":		100,
			};

		}

		// -------------------------------------------------------------------------
		//  Methods
		// -------------------------------------------------------------------------

		static globalInit()
		{

			// Init vars
			StatusPerk._unitInfo = BITSMIST.v1.BasicPerk._unitInfo; // Shortcut
			StatusPerk._waitingList = new Store();
			StatusPerk.__suspends = {};
			StatusPerk.waitFor = function(waitlist, timeout) { return StatusPerk._waitFor(BITSMIST.v1.Unit, waitlist, timeout); };

			// Upgrade Unit
			this.upgrade(BITSMIST.v1.Unit, "skill", "status.change", function(...args) { return StatusPerk._changeStatus(...args); });
			this.upgrade(BITSMIST.v1.Unit, "spell", "status.wait", function(...args) { return StatusPerk._waitFor(...args); });
			this.upgrade(BITSMIST.v1.Unit, "spell", "status.suspend", function(...args) { return StatusPerk._suspend(...args); });
			this.upgrade(BITSMIST.v1.Unit, "spell", "status.resume", function(...args) { return StatusPerk._resume(...args); });
			this.upgrade(BITSMIST.v1.Unit, "spell", "status.pause", function(...args) { return StatusPerk._pause(...args); });

		}

		// -------------------------------------------------------------------------

		static init(unit, options)
		{

			// Upgrade unit;
			this.upgrade(unit, "state", "status.status", "connected");
			this.upgrade(unit, "inventory", "status.suspends", {});
			this.upgrade(unit, "event", "doApplySettings", StatusPerk.StatusPerk_onDoApplySettings);

		}

		// -------------------------------------------------------------------------

		/**
		 * Suspend all units at the specified status.
		 *
		 * @param	{String}		status				Unit status.
		 */
		static globalSuspend(status)
		{

			StatusPerk.__suspends[status] = StatusPerk.__createSuspendInfo(status);
			StatusPerk.__suspends[status].status = "pending";

		}

		// -------------------------------------------------------------------------

		/**
		 * Resume all units at the specified status.
		 *
		 * @param	{String}		status				Unit status.
		 */
		static globalResume(status)
		{

			StatusPerk.__suspends[status].resolve();
			StatusPerk.__suspends[status].status = "resolved";

		}

		// -------------------------------------------------------------------------
		//  Event Handlers
		// -------------------------------------------------------------------------

		static StatusPerk_onDoApplySettings(sender, e, ex)
		{

			Object.entries(Util.safeGet(e.detail, "settings.status.waitFor", {})).forEach(([sectionName, sectionValue]) => {
				this.addEventHandler(sectionName, {"handler":StatusPerk.StatusPerk_onDoProcess, "options":sectionValue});
			});

		}

		// -------------------------------------------------------------------------

		static StatusPerk_onDoProcess(sender, e, ex)
		{

			return StatusPerk._waitFor(this, ex.options);

		}

		// -------------------------------------------------------------------------
		//  Skills
		// -------------------------------------------------------------------------

		/**
		 * Change unit status and check waiting list.
		 *
		 * @param	{Unit}			unit				Unit to register.
		 * @param	{String}		status				Unit status.
		 *
		 * @return  {Promise}		Promise.
		 */
		static _changeStatus(unit, status)
		{

			Util.assert(StatusPerk.__isTransitionable(unit.get("state", "status.status"), status), `StatusPerk._changeStatus(): Illegal transition. name=${unit.tagName}, fromStatus=${unit.get("state", "status.status")}, toStatus=${status}, id=${unit.id}`, Error);

			unit.set("state", "status.status", status);
			StatusPerk._unitInfo[unit.uniqueId]["status"] = status;

			StatusPerk.__processWaitingList();

		}

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
		static _waitFor(unit, waitlist, options)
		{

			let promise;
			let timeout =
					(options && options["timeout"]) ||
					unit.get("setting", "status.options.waitForTimeout", unit.get("setting", "system.status.options.waitForTimeout", 10000));
			let waiter = ( options && options["waiter"] ? options["waiter"] : unit );
			let waitInfo = {"waiter":waiter, "waitlist":Util.deepClone(waitlist)};

			if (StatusPerk.__isAllReady(waitInfo))
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
						reject(`StatusPerk._waitFor(): Timed out after ${timeout} milliseconds waiting for ${StatusPerk.__dumpWaitlist(waitlist)}, name=${name}, uniqueId=${uniqueId}.`);
					}, timeout);
				});
				waitInfo["promise"] = promise;

				// Add info to the waiting list.
				StatusPerk.__addToWaitingList(waitInfo);
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
		static _suspend(unit, status)
		{

			/*
			unit._suspends[status] = StatusPerk.__createSuspendInfo();
		 	unit._suspends[status].status = "pending";
			*/

		}

		// -------------------------------------------------------------------------

		/**
		 * Resume the unit at the specified status.
		 *
		 * @param	{Unit}			unit				Unit.
		 * @param	{String}		status				Unit status.
		 */
		static _resume(unit, status)
		{

			/*
		 	unit._suspends[status].resolve();
		 	unit._suspends[status].status = "resolved";
			*/

		}

		// -------------------------------------------------------------------------

		/**
		 * Pause the unit if it is suspended.
		 *
		 * @param	{Unit}			unit				Unit.
		 * @param	{String}		status				Unit status.
		 *
		 * @return  {Promise}		Promise.
		 */
		static _pause(unit, status)
		{

			/*
			let ret = [];

			// Globally suspended?
			if (StatusPerk.__suspends[status] && StatusPerk.__suspends[status].status === "pending" && !unit.get("setting", "setting.ignoreGlobalSuspend"))
			{
				ret.push(StatusPerk.__suspends[status].promise);
			}

			// Unit suspended?
			if (unit._suspends[status] && unit._suspends[status].status === "pending")
			{
				ret.push(unit._suspends[status].promise);
			}

			return Promise.all(ret);
			*/

		}

		// -------------------------------------------------------------------------
		//  Privates
		// -------------------------------------------------------------------------

		/**
		 * Process waiting list.
		 */
		static __processWaitingList()
		{

			let removeList = [];
			Object.keys(StatusPerk._waitingList.items).forEach((id) => {
				if (StatusPerk.__isAllReady(StatusPerk._waitingList.get(id)))
				{
					clearTimeout(StatusPerk._waitingList.get(id)["timer"]);
					StatusPerk._waitingList.get(id).resolve();
					removeList.push(id);
				}
			});

			// Remove from waiting list
			for (let i = 0; i < removeList.length; i++)
			{
				StatusPerk._waitingList.remove(removeList[i]);
			}

		}

		// -------------------------------------------------------------------------

		/**
		 * Add wait info to the waiting list.
		 *
		 * @param	{Object}		waitInfo			Wait info.
		 */
		static __addToWaitingList(waitInfo)
		{

			let id = Util.getUUID();

			/*
			for (let i = 0; i < waitInfo["waitlist"].length; i++)
			{
				// Check if the node exists
				if (waitInfo["waitlist"][i].rootNode)
				{
					let element = document.querySelector(waitInfo["waitlist"][i].rootNode);

					Util.assert(element && element.uniqueId, `StatusPerk.__addToWaitingList(): Root node does not exist. waiter=${waitInfo["waiter"]}, rootNode=${waitInfo["waitlist"][i].rootNode}`, ReferenceError);
				}
			}
			*/

			StatusPerk._waitingList.set(id, waitInfo);

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
		static __isTransitionable(currentStatus, newStatus)
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
		static __getUnitInfo(unit, waitlistItem)
		{

			let unitInfo;
			let target = unit.use("skill", "basic.locate", waitlistItem);
			if (target)
			{
				unitInfo = BITSMIST.v1.BasicPerk._unitInfo[target.uniqueId];
			}

			return unitInfo;

		}

		// -------------------------------------------------------------------------

		/**
		 * Check if all units are ready.
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
				let unitInfo = this.__getUnitInfo(waitInfo["waiter"], waitlist[i]);
				if (unitInfo)
				{
					if (StatusPerk.__isStatusMatch(unitInfo["status"], waitlist[i]["status"]))
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
		static __isStatusMatch(currentStatus, expectedStatus)
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
		static __dumpWaitlist(waitlist)
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
					let uniqueId = (waitlist[i].id ? `uniqueId:${waitlist[i].uniqueId}, ` : "");
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
		static __createSuspendInfo()
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

	// =============================================================================
	//	Unit Perk Class
	// =============================================================================

	class UnitPerk extends Perk
	{

		// -------------------------------------------------------------------------
		//  Properties
		// -------------------------------------------------------------------------

		static get info()
		{

			return {
				"section":		"unit",
				"order":		400,
			};

		}

		// -------------------------------------------------------------------------
		//  Methods
		// -------------------------------------------------------------------------

		static globalInit()
		{

			// Init vars
			UnitPerk._classInfo = BITSMIST.v1.BasicPerk._classInfo; // Shortcut

			// Upgrade Unit
			this.upgrade(BITSMIST.v1.Unit, "spell", "unit.materializeAll", function(...args) { return UnitPerk._loadTags(...args); });
			this.upgrade(BITSMIST.v1.Unit, "spell", "unit.materialize", function(...args) { return UnitPerk._loadUnit(...args); });
			this.upgrade(BITSMIST.v1.Unit, "spell", "unit.summon", function(...args) { return UnitPerk._loadClass(...args); });

		}

		// -------------------------------------------------------------------------

		static init(unit, options)
		{

			// Upgrade unit
			this.upgrade(unit, "inventory", "unit.units", {});
			this.upgrade(unit, "event", "doApplySettings", UnitPerk.UnitPerk_onDoApplySettings);

		}

		// -------------------------------------------------------------------------
		//  Event Handlers
		// -------------------------------------------------------------------------

		static UnitPerk_onDoApplySettings(sender, e, ex)
		{

			let chain = Promise.resolve();

			Object.entries(Util.safeGet(e.detail, "settings.unit.units", {})).forEach(([sectionName, sectionValue]) => {
				chain = chain.then(() => {
					if (!this.get("inventory", `unit.units.${sectionName}.object`))
					{
						let parentUnit = Util.safeGet(sectionValue, "unit.options.parentUnit");
						let targetUnit = ( parentUnit ? this.use("skill", "basic.locate", parentUnit) : this );
						return targetUnit.use("spell", "unit.materialize", sectionName, sectionValue);
					}
				});
			});

			return chain;

		}

		// -------------------------------------------------------------------------
		//  Skills
		// -------------------------------------------------------------------------

		/**
		 * Load the class.
		 *
		 * @param	{String}		tagName				Tag name.
		 * @param	{Object}		settings			Unit settings.
		 *
		 * @return  {Promise}		Promise.
		 */
		static _loadClass(tagName, settings)
		{

			console.debug(`UnitPerk._loadClass(): Loading class. tagName=${tagName}`);

			// Override settings if URL is specified
			let classRef = Util.safeGet(settings, "unit.options.autoLoad");
			if (classRef && classRef !== true)
			{
				settings["system"] = settings["system"] || {};
				settings["system"]["appBaseURL"] = "";
				settings["system"]["unitPath"] = "";
				settings["system"]["skinPath"] = "";
				settings["unit"] = settings["unit"] || {};
				settings["unit"]["options"] = settings["unit"]["options"] || {};
				let url = URLUtil.parseURL(classRef);
				settings["unit"]["options"]["path"] = url.path;
				settings["unit"]["options"]["fileName"] = url.filenameWithoutExtension;
				if (url.extension === "html")
				{
					settings["unit"]["options"]["autoMorph"] = ( settings["unit"]["options"]["autoMorph"] ? settings["unit"]["options"]["autoMorph"] : true );
				}
			}

			tagName = tagName.toLowerCase();
			let className = Util.safeGet(settings, "unit.options.className", Util.getClassNameFromTagName(tagName));
			let baseClassName = Util.safeGet(settings, "unit.options.autoMorph", className );
			baseClassName = ( baseClassName === true ? "BITSMIST.v1.Unit" : baseClassName );

			// Load the class if needed
			let promise = Promise.resolve();
			if (UnitPerk.__hasExternalClass(tagName, baseClassName, settings))
			{
				if (UnitPerk._classInfo[baseClassName] && UnitPerk._classInfo[baseClassName]["status"] === "loading")
				{
					// Already loading
					console.debug(`UnitPerk._loadClass(): Class Already loading. className=${className}, baseClassName=${baseClassName}`);
					promise = UnitPerk._classInfo[baseClassName].promise;
				}
				else
				{
					// Need loading
					console.debug(`ClassPerk._loadClass(): Loading class. className=${className}, baseClassName=${baseClassName}`);
					UnitPerk._classInfo[baseClassName] = {"status":"loading"};

					let options = {
						"splitClass": Util.safeGet(settings, "unit.options.splitClass", BITSMIST.v1.Unit.get("setting", "system.unit.options.splitClass", false)),
					};
					promise = AjaxUtil.loadClass(UnitPerk.__getClassURL(tagName, settings), options).then(() => {
						UnitPerk._classInfo[baseClassName] = {"status":"loaded"};
					});
					UnitPerk._classInfo[baseClassName].promise = promise;
				}
			}

			return promise.then(() => {
				// Morph
				if (baseClassName !== className)
				{
					let superClass = ClassUtil.getClass(baseClassName);
					ClassUtil.newUnit(className, settings, superClass, tagName);
				}

				// Define the tag
				if (!customElements.get(tagName))
				{
					let classDef = ClassUtil.getClass(className);
					Util.assert(classDef, `UnitPerk_loadClass(): Class does not exists. tagName=${tagName}, className=${className}`);

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
		static _loadUnit(unit, tagName, settings, options)
		{

			console.debug(`UnitPerk._loadUnit(): Adding the unit. name=${unit.tagName}, tagName=${tagName}`);

			// Already loaded
			if (unit.get("inventory", `unit.units.${tagName}.object`))
			{
				console.debug(`UnitPerk._loadUnit(): Already loaded. name=${unit.tagName}, tagName=${tagName}`);
				return Promise.resolve(unit.get("inventory", `unit.units.${tagName}.object`));
			}

			// Get the tag name from settings if specified
			let tag = Util.safeGet(settings, "unit.options.tag");
			if (tag)
			{
				let pattern = /([\w-]+)\s+\w+.*?>/;
				tagName = tag.match(pattern)[1];
			}

			let addedUnit;
			return Promise.resolve().then(() => {
				return UnitPerk._loadClass(tagName, settings);
			}).then(() => {
				// Insert tag
				addedUnit = UnitPerk.__insertTag(unit, tagName, settings);
				unit.set("inventory", `unit.units.${tagName}.object`, addedUnit);
			}).then(() => {
				// Wait for the added unit to be ready
				let sync = Util.safeGet(options, "syncOnAdd", Util.safeGet(settings, "unit.options.syncOnAdd"));
				if (sync)
				{
					let status = (sync === true ? "ready" : sync);

					return unit.use("spell", "status.wait", [{
						"uniqueId":	addedUnit.uniqueId,
						"status":	status
					}]);
				}
			}).then(() => {
				return addedUnit;
			});

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
		static _loadTags(unit, rootNode, options)
		{

			console.debug(`UnitPerk._loadTags(): Loading tags. rootNode=${rootNode.tagName}`);

			let promises = [];

			// Load tags that has bm-autoload/bm-classref/bm-automorph attribute
			let targets = Util.scopedSelectorAll(rootNode, "[bm-autoload]:not([bm-autoloading]):not([bm-powered]),[bm-automorph]:not([bm-autoloading]):not([bm-powered]),[bm-classref]:not([bm-autoloading]):not([bm-powered]),[bm-htmlref]:not([bm-autoloading]):not([bm-powered])");
			targets.forEach((element) => {
				// Get settings from attributes
				let settings = this.__loadAttrSettings(element);

				element.setAttribute("bm-autoloading", "");
				element._injectSettings = function(curSettings){
					return Util.deepMerge(curSettings, settings);
				};

				// Load the class
				promises.push(UnitPerk._loadClass(element.tagName, settings).then(() => {
					element.removeAttribute("bm-autoloading");
				}));
			});

			return Promise.all(promises).then(() => {
				let waitFor = Util.safeGet(options, "waitForTags");
				if (waitFor)
				{
					return UnitPerk.__waitForChildren(rootNode);
				}
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
		static __loadAttrSettings(element)
		{

			let settings = {
				"unit": {
					"options": {}
				}
			};

			// Class name
			if (element.hasAttribute("bm-classname"))
			{
				settings["unit"]["options"]["className"] = element.getAttribute("bm-classname");
			}

			// Split  class
			if (element.hasAttribute("bm-splitclass"))
			{
				let splitClass = unit.getAttribute("bm-splitclass") || true;
				if (splitClass === "false")
				{
					splitClass = false;
				}
				settings["unit"]["options"]["splitClass"] = splitClass;
			}

			// Path
			if (element.hasAttribute("bm-path"))
			{
				settings["unit"]["options"]["path"] = element.getAttribute("bm-path");
			}

			// File name
			if (element.hasAttribute("bm-filename"))
			{
				settings["unit"]["options"]["fileName"] = element.getAttribute("bm-filename");
			}

			// Morphing
			if (element.hasAttribute("bm-automorph"))
			{
				settings["unit"]["options"]["autoMorph"] = ( element.getAttribute("bm-automorph") ? element.getAttribute("bm-automorph") : true );
			}
			if (element.hasAttribute("bm-htmlref"))
			{
				settings["unit"]["options"]["autoMorph"] = ( element.getAttribute("bm-htmlref") ? element.getAttribute("bm-htmlref") : true );
			}

			// Auto loading
			if (element.hasAttribute("bm-autoload"))
			{
				settings["unit"]["options"]["autoLoad"] = ( element.getAttribute("bm-autoload") ? element.getAttribute("bm-autoload") : true );
			}
			if (element.hasAttribute("bm-classref"))
			{
				settings["unit"]["options"]["autoLoad"] = ( element.getAttribute("bm-classref") ? element.getAttribute("bm-classref") : true );
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
		static __hasExternalClass(tagName, className, settings)
		{

			let ret = false;

			if ((Util.safeGet(settings, "unit.options.classRef"))
					|| (Util.safeGet(settings, "unit.options.htmlRef"))
					|| (Util.safeGet(settings, "unit.options.autoLoad"))
					|| (Util.safeGet(settings, "unit.options.autoMorph")))
			{
				ret = true;

				if (customElements.get(tagName))
				{
					ret = false;
				}
				else if (UnitPerk._classInfo[className] && UnitPerk._classInfo[className]["status"] === "loaded")
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
		static __insertTag(unit, tagName, settings)
		{

			let addedUnit;
			let root;

			// Check root node
			if (Util.safeGet(settings, "unit.options.parentNode"))
			{
				root = unit.use("skill", "basic.scan", Util.safeGet(settings, "unit.options.parentNode"));
			}
			else
			{
				root = unit.unitRoot;
			}

			Util.assert(root, `UnitPerk.__insertTag(): Root node does not exist. name=${unit.tagName}, tagName=${tagName}, parentNode=${Util.safeGet(settings, "unit.options.parentNode")}`, ReferenceError);

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
		static __waitForChildren(rootNode)
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
		static __getClassURL(tagName, settings)
		{

			let path = Util.concatPath([
				Util.safeGet(settings, "system.unit.options.path", BITSMIST.v1.Unit.get("setting", "system.unit.options.path", "")),
				Util.safeGet(settings, "unit.options.path", ""),
			]);
			let fileName = Util.safeGet(settings, "unit.options.fileName", tagName);
			let query = Util.safeGet(settings, "unit.options.query");

			return Util.concatPath([path, fileName]) + (query ? `?${query}` : "");

		}

	}

	// =============================================================================

	// =============================================================================
	//	Basic Perk Class
	// =============================================================================

	class BasicPerk extends Perk
	{

		// -------------------------------------------------------------------------
		//  Properties
		// -------------------------------------------------------------------------

		static get info()
		{

			return {
				"section":		"basic",
				"order":		0,
			};

		}

		// -------------------------------------------------------------------------
		//  Methods
		// -------------------------------------------------------------------------

		static globalInit()
		{

			// Init vars
			BasicPerk._classInfo = {};
			BasicPerk._unitInfo = {};
			BasicPerk._indexes = {
				"tagName": {},
				"className": {},
				"id": {},
			};

			// Upgrade Unit
			BITSMIST.v1.Unit.__bm_assets = {};
			this.upgrade(BITSMIST.v1.Unit, "asset", "state", new ChainableStore());
			this.upgrade(BITSMIST.v1.Unit, "asset", "vault", new ChainableStore());
			this.upgrade(BITSMIST.v1.Unit, "asset", "inventory", new ChainableStore());
			this.upgrade(BITSMIST.v1.Unit, "asset", "skill", new ChainableStore());
			this.upgrade(BITSMIST.v1.Unit, "asset", "spell", new ChainableStore());
			this.upgrade(BITSMIST.v1.Unit, "method", "get", this._get);
			this.upgrade(BITSMIST.v1.Unit, "method", "set", this._set);
			this.upgrade(BITSMIST.v1.Unit, "method", "use", this._use);
			this.upgrade(BITSMIST.v1.Unit, "property", "uniqueId", {
				get() { return "00000000-0000-0000-0000-000000000000"; },
			});
			this.upgrade(BITSMIST.v1.Unit, "property", "tagName", {
				get() { return "BODY"; },
			});
			this.upgrade(BITSMIST.v1.Unit, "property", "unitRoot", {
				get() { return document.body; },
			});
			this.upgrade(BITSMIST.v1.Unit, "spell", "basic.start", function(...args) { return BasicPerk._start(...args); });
			this.upgrade(BITSMIST.v1.Unit, "spell", "basic.stop", function(...args) { return BasicPerk._stop(...args); });
			this.upgrade(BITSMIST.v1.Unit, "spell", "basic.transform", function(...args) { return BasicPerk._transform(...args); });
			this.upgrade(BITSMIST.v1.Unit, "spell", "basic.setup", function(...args) { return BasicPerk._setup(...args); });
			this.upgrade(BITSMIST.v1.Unit, "spell", "basic.refresh", function(...args) { return BasicPerk._refresh(...args); });
			this.upgrade(BITSMIST.v1.Unit, "spell", "basic.fetch", function(...args) { return BasicPerk._fetch(...args); });
			this.upgrade(BITSMIST.v1.Unit, "spell", "basic.fill", function(...args) { return BasicPerk._fill(...args); });
			this.upgrade(BITSMIST.v1.Unit, "spell", "basic.clear", function(...args) { return BasicPerk._clear(...args); });
			this.upgrade(BITSMIST.v1.Unit, "skill", "basic.scan", function(...args) { return BasicPerk._scan(...args); });
			this.upgrade(BITSMIST.v1.Unit, "skill", "basic.scanAll", function(...args) { return BasicPerk._scanAll(...args); });
			this.upgrade(BITSMIST.v1.Unit, "skill", "basic.locate", function(...args) { return BasicPerk._locate(...args); });
			this.upgrade(BITSMIST.v1.Unit, "skill", "basic.locateAll", function(...args) { return BasicPerk._locateAll(...args); });

			// Upgrade unit
			this.upgrade(BITSMIST.v1.Unit.prototype, "method", "_connectedHandler", this._connectedHandler);
			this.upgrade(BITSMIST.v1.Unit.prototype, "method", "_disconnectedHandler", this._disconnectedHandler);
			this.upgrade(BITSMIST.v1.Unit.prototype, "method", "_adoptedHandler", this._connectedHandler);
			this.upgrade(BITSMIST.v1.Unit.prototype, "method", "_attributeChangedHandler", this._attributeChangedHandler);
			this.upgrade(BITSMIST.v1.Unit.prototype, "method", "get", this._get);
			this.upgrade(BITSMIST.v1.Unit.prototype, "method", "set", this._set);
			this.upgrade(BITSMIST.v1.Unit.prototype, "method", "has", this._has);
			this.upgrade(BITSMIST.v1.Unit.prototype, "method", "use", this._use);
			this.upgrade(BITSMIST.v1.Unit.prototype, "property", "uniqueId", {
				get() { return this.__bm_uniqueid; },
			});
			this.upgrade(BITSMIST.v1.Unit.prototype, "property", "unitRoot", {
				get() { return this.__bm_unitroot; },
				set(value) { this.__bm_unitroot = value; },
			});

			// Create a promise that resolves when document is ready
			BITSMIST.v1.Unit.set("inventory", "promise.documentReady", new Promise((resolve, reject) => {
				if ((document.readyState === "interactive" || document.readyState === "complete"))
				{
					resolve();
				}
				else
				{
					document.addEventListener("DOMContentLoaded", () => {
						resolve();
					});
				}
			}));

			// Load tags
			BITSMIST.v1.Unit.get("inventory", "promise.documentReady").then(() => {
				if (BITSMIST.v1.Unit.get("setting", "system.unit.options.autoLoadOnStartup", true))
				{
					BITSMIST.v1.UnitPerk._loadTags(null, document.body, {"waitForTags":false});
				}
			});

		}

		// -------------------------------------------------------------------------
		// 	Methods (unit)
		// -------------------------------------------------------------------------

		/**
		 * Connected callback handler.
		 */
		static _connectedHandler(unit)
		{

			// The first time only initialization
			if (!this.__bm_uniqueid)
			{
				this.__bm_initialized = false;
				this.__bm_ready = Promise.resolve(); // A promise to prevent from starting/stopping while stopping/starting
				this.__bm_uniqueid = Util.getUUID();
				this.__bm_unitroot = this;
				this.setAttribute("bm-powered", "");
				BasicPerk._register(this);
			}

			// Start
			this.__bm_ready = this.__bm_ready.then(() => {
				console.debug(`BasicPerk._connectedHandler(): Unit is connected. name=${this.tagName}, id=${this.id}, uniqueId=${this.uniqueId}`);

				if (!this.__bm_initialized || this.get("setting", "basic.options.autoRestart", false))
				{
					this.__bm_initialized = true;

					// Upgrade unit
					unit.__bm_assets = {};
					Perk.upgrade(unit, "asset", "state", new ChainableStore({"chain":BITSMIST.v1.Unit.__bm_assets["state"]}));
					Perk.upgrade(unit, "asset", "vault", new ChainableStore());
					Perk.upgrade(unit, "asset", "inventory", new ChainableStore({"chain":BITSMIST.v1.Unit.__bm_assets["inventory"]}));
					Perk.upgrade(unit, "asset", "skill", new ChainableStore({"chain":BITSMIST.v1.Unit.__bm_assets["skill"]}));
					Perk.upgrade(unit, "asset", "spell", new ChainableStore({"chain":BITSMIST.v1.Unit.__bm_assets["spell"]}));

					// Attach default perks
					return Promise.resolve().then(() => {
						return this.use("spell", "perk.attach", BITSMIST.v1.BasicPerk);
					}).then(() => {
						return this.use("spell", "perk.attach", BITSMIST.v1.SettingPerk);
					}).then(() => {
						return this.use("spell", "perk.attach", BITSMIST.v1.PerkPerk);
					}).then(() => {
						return this.use("spell", "perk.attach", BITSMIST.v1.StatusPerk);
					}).then(() => {
						return this.use("spell", "perk.attach", BITSMIST.v1.EventPerk);
					}).then(() => {
						return this.use("spell", "perk.attach", BITSMIST.v1.SkinPerk);
					}).then(() => {
						return this.use("spell", "perk.attach", BITSMIST.v1.StylePerk);
					}).then(() => {
						return this.use("spell", "perk.attach", BITSMIST.v1.UnitPerk);
					}).then(() => {
						return this.use("spell", "basic.start");
					});
				}
			});

		}

		// -------------------------------------------------------------------------

		/**
		 * Disconnected callback handler.
		 */
		static _disconnectedHandler(unit)
		{

			// Stop
			this.__bm_ready = this.__bm_ready.then(() => {
				return this.use("spell", "basic.stop");
			}).then(() => {
				console.debug(`BasicPerk.disconnectedHandler(): Unit is disconnected. name=${this.tagName}, id=${this.id}, uniqueId=${this.uniqueId}`);
			});

		}

		// -------------------------------------------------------------------------

		/**
		 * Adopted callback handler.
		 */
		static _adoptedHandler(unit)
		{

			return unit.use("spell", "event.trigger", "afterAdopt");

		}

		// -------------------------------------------------------------------------

		/**
		 * Attribute changed callback handler.
		 */
		static _attributeChangedHandler(unit, name, oldValue, newValue)
		{

			if (this.__bm_initialized)
			{
				return unit.use("spell", "event.trigger", "afterAttributeChange", {"name":name, "oldValue":oldValue, "newValue":newValue});
			}

		}

		// -------------------------------------------------------------------------

		/**
		 * Get the value from the asset.
		 *
		 * @param	{String}		assetName			Asset name.
		 * @param	{String}		key					Key.
		 * @param	{*}				...args				Arguments.
		 *
		 * @return  {*}				Value.
		 */
		static _get(assetName, key, ...args)
		{

			return this.__bm_assets[assetName].get(key, ...args);

		}

		// -------------------------------------------------------------------------

		/**
		 * Set the value to the asset.
		 *
		 * @param	{String}		assetName			Asset name.
		 * @param	{String}		key					Key.
		 * @param	{*}				value				Value.
		 */
		static _set(assetName, key, value)
		{

			this.__bm_assets[assetName].set(key, value);

		}

		// -------------------------------------------------------------------------

		/**
		 * Return if the unit has the asset.
		 *
		 * @param	{String}		assetName			Asset name.
		 * @param	{String}		key					Key.
		 */
		static _has(assetName, key)
		{

			this.__bm_assets[assetName].has(key);

		}

		// -------------------------------------------------------------------------

		/**
		 * Call the function in the asset.
		 *
		 * @param	{String}		assetName			Asset name.
		 * @param	{String}		key					Key.
		 * @param	{*}				...args				Arguments.
		 */
		static _use(assetName, key, ...args)
		{

			let func = this.__bm_assets[assetName].get(key);
			Util.assert(typeof(func) === "function", `${assetName} is not available. ${assetName}Name=${key}`);

			return func.call(this, this, ...args);

		}

		// -------------------------------------------------------------------------
		//  Skills
		// -------------------------------------------------------------------------

		/**
		 * Start unit.
		 *
		 * @param	{Unit}			unit				Unit.
		 * @param	{Object}		options				Options.
		 *
		 * @return  {Promise}		Promise.
		 */
		static _start(unit, options)
		{

			return Promise.resolve().then(() => {
				console.debug(`BasicPerk._start(): Starting unit. name=${unit.tagName}, id=${unit.id}, uniqueId=${unit.uniqueId}`);

				return unit.use("spell", "setting.apply", {"settings":unit.__bm_assets["setting"].items});
			}).then(() => {
				return unit.use("spell", "event.trigger", "beforeStart");
			}).then(() => {
				return unit.use("skill", "status.change", "starting");
			}).then(() => {
				if (unit.get("setting", "basic.options.autoTransform", true))
				{
					return unit.use("spell", "basic.transform");
				}
			}).then(() => {
				return unit.use("spell", "event.trigger", "doStart");
			}).then(() => {
				if (unit.get("setting", "basic.options.autoRefresh", true))
				{
					return unit.use("spell", "basic.refresh");
				}
			}).then(() => {
				console.debug(`BasicPerk._start(): Started unit. name=${unit.tagName}, id=${unit.id}, uniqueId=${unit.uniqueId}`);
				return unit.use("skill", "status.change", "started");
			}).then(() => {
				return unit.use("spell", "event.trigger", "afterStart");
			}).then(() => {
				console.debug(`BasicPerk._start(): Unit is ready. name=${unit.tagName}, id=${unit.id}, uniqueId=${unit.uniqueId}`);
				return unit.use("skill", "status.change", "ready");
			}).then(() => {
				return unit.use("spell", "event.trigger", "afterReady");
			});

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
		static _stop(unit, options)
		{

			options = options || {};

			return Promise.resolve().then(() => {
				console.debug(`BasicPerk._stop(): Stopping unit. name=${unit.tagName}, id=${unit.id}, uniqueId=${unit.uniqueId}`);
				return unit.use("skill", "status.change", "stopping");
			}).then(() => {
				return unit.use("spell", "event.trigger", "beforeStop", options);
			}).then(() => {
				return unit.use("spell", "event.trigger", "doStop", options);
			}).then(() => {
				console.debug(`BasicPerk._stop(): Stopped unit. name=${unit.tagName}, id=${unit.id}, uniqueId=${unit.uniqueId}`);
				return unit.use("skill", "status.change", "stopped");
			}).then(() => {
				return unit.use("spell", "event.trigger", "afterStop", options);
			});

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
		static _transform(unit, options)
		{

			options = options || {};

			return Promise.resolve().then(() => {
				console.debug(`BasicPerk._transform(): Transforming. name=${unit.tagName}, id=${unit.id}, uniqueId=${unit.uniqueId}`);
				return unit.use("spell", "event.trigger", "beforeTransform", options);
			}).then(() => {
				if (unit.get("setting", "basic.options.autoSetup", true))
				{
					return unit.use("spell", "basic.setup", options);
				}
			}).then(() => {
				return unit.use("spell", "event.trigger", "doTransform", options);
			}).then(() => {
				return unit.use("spell", "unit.materializeAll", unit);
			}).then(() => {
				console.debug(`BasicPerk._transform(): Transformed. name=${unit.tagName}, id=${unit.id}, uniqueId=${unit.uniqueId}`);
				return unit.use("spell", "event.trigger", "afterTransform", options);
			});

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
		static _setup(unit, options)
		{

			options = options || {};

			return Promise.resolve().then(() => {
				console.debug(`BasicPerk._setup(): Setting up unit. name=${unit.tagName}, id=${unit.id}, uniqueId=${unit.uniqueId}`);
				return unit.use("spell", "event.trigger", "beforeSetup", options);
			}).then(() => {
				return unit.use("spell", "event.trigger", "doSetup", options);
			}).then(() => {
				console.debug(`BasicPerk._setup(): Set up unit. name=${unit.tagName}, id=${unit.id}, uniqueId=${unit.uniqueId}`);
				return unit.use("spell", "event.trigger", "afterSetup", options);
			});

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
		static _refresh(unit, options)
		{

			options = options || {};

			return Promise.resolve().then(() => {
				console.debug(`BasicPerk._refresh(): Refreshing unit. name=${unit.tagName}, id=${unit.id}, uniqueId=${unit.uniqueId}`);
				return unit.use("spell", "event.trigger", "beforeRefresh", options);
			}).then(() => {
				let autoClear = Util.safeGet(options, "autoClear", unit.get("setting", "basic.options.autoClear", true));
				if (autoClear)
				{
					return unit.use("spell", "basic.clear", options);
				}
			}).then(() => {
				if (Util.safeGet(options, "autoFetch", unit.get("setting", "basic.options.autoFetch", true)))
				{
					return unit.use("spell", "basic.fetch", options);
				}
			}).then(() => {
				if (Util.safeGet(options, "autoFill", unit.get("setting", "basic.options.autoFill", true)))
				{
					return unit.use("spell", "basic.fill", options);
				}
			}).then(() => {
				return unit.use("spell", "event.trigger", "doRefresh", options);
			}).then(() => {
				console.debug(`BasicPerk._refresh(): Refreshed unit. name=${unit.tagName}, id=${unit.id}, uniqueId=${unit.uniqueId}`);
				return unit.use("spell", "event.trigger", "afterRefresh", options);
			});

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
		static _fetch(unit, options)
		{

			options = options || {};

			return Promise.resolve().then(() => {
				console.debug(`BasicPerk._fetch(): Fetching data. name=${unit.tagName}, uniqueId=${unit.uniqueId}`);
				return unit.use("spell", "event.trigger", "beforeFetch", options);
			}).then(() => {
				return unit.use("spell", "event.trigger", "doFetch", options);
			}).then(() => {
				return unit.use("spell", "event.trigger", "afterFetch", options);
			}).then(() => {
				console.debug(`BasicPerk._fetch(): Fetched data. name=${unit.tagName}, uniqueId=${unit.uniqueId}`);
			});

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
		static _fill(unit, options)
		{

			options = options || {};

			return Promise.resolve().then(() => {
				console.debug(`BasicPerk._fill(): Filling with data. name=${unit.tagName}, uniqueId=${unit.uniqueId}`);
				return unit.use("spell", "event.trigger", "beforeFill", options);
			}).then(() => {
				return unit.use("spell", "event.trigger", "doFill", options);
			}).then(() => {
				console.debug(`BasicPerk._fill(): Filled with data. name=${unit.tagName}, uniqueId=${unit.uniqueId}`);
				return unit.use("spell", "event.trigger", "afterFill", options);
			});

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
		static _clear(unit, options)
		{

			options = options || {};

			return Promise.resolve().then(() => {
				console.debug(`BasicPerk._clear(): Clearing the unit. name=${unit.tagName}, uniqueId=${unit.uniqueId}`);
				return unit.use("spell", "event.trigger", "beforeClear", options);
			}).then(() => {
				return unit.use("spell", "event.trigger", "doClear", options);
			}).then(() => {
				console.debug(`BasicPerk._clear(): Cleared the unit. name=${unit.tagName}, uniqueId=${unit.uniqueId}`);
				return unit.use("spell", "event.trigger", "afterClear", options);
			});

		}

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
		static _scanAll(unit, query, options)
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
		static _scan(unit, query, options)
		{

			let nodes = Util.scopedSelectorAll(unit, query, options);

			return ( nodes ? nodes[0] : null );

		}

		// -------------------------------------------------------------------------

		/**
		 * Register the unit.
		 *
		 * @param	{Unit}			unit				Unit.
		 * @param	{Object}		options				Options.
		 *
		 * @return  {HTMLElement}	Element.
		 */
		static _register(unit, options)
		{

			let c = customElements.get(unit.tagName.toLowerCase());

			BasicPerk._unitInfo[unit.uniqueId] = {
				"object":		unit,
				"class":		c,
				"classInfo":	BasicPerk._classInfo[c.name],
			};

			// Indexes
			BasicPerk._indexes["tagName"][unit.tagName] = BasicPerk._indexes["tagName"][unit.tagName] || [];
			BasicPerk._indexes["tagName"][unit.tagName].push(unit);
			BasicPerk._indexes["className"][c.name] = BasicPerk._indexes["className"][c.name] || [];
			BasicPerk._indexes["className"][c.name].push(unit);
			if (unit.id)
			{
				BasicPerk._indexes["id"][unit.id] = BasicPerk._indexes["id"][unit.id] || [];
				BasicPerk._indexes["id"][unit.id].push(unit);
			}

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
		static _locateAll(unit, target)
		{

			if (typeof(target) === "object")
			{
				if ("selector" in target)
				{
					return document.querySelectorAll(target["selector"]);
				}
				else if ("scan" in target)
				{
					unit.use("skill", "basic.scan", target["scan"]);
					return unit.use("skill", "basic.scanAll", target["scan"]);
				}
				else if ("uniqueId" in target)
				{
					return [BasicPerk._unitInfo[target["uniqueId"]].object];
				}
				else if ("tagName" in target)
				{
					return BasicPerk._indexes["tagName"][target["tagName"].toUpperCase()];
				}
				else if ("object" in target)
				{
					return [target["object"]];
				}
				else if ("id" in target)
				{
					return BasicPerk._indexes["id"][target["id"]];
				}
				else if ("className" in target)
				{
					return BasicPerk._indexes["className"][target["className"]];
				}
			}
			else if (typeof(target) === "string")
			{
				return BasicPerk._indexes["tagName"][target.toUpperCase()];
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
		static _locate(unit, target)
		{

			let units = BasicPerk._locateAll(unit, target);

			if (units)
			{
				return units[0];
			}

		}

	}

	// =============================================================================

	// =============================================================================
	//	Perk Perk Class
	// =============================================================================

	class PerkPerk extends Perk
	{

		// -------------------------------------------------------------------------
		//  Properties
		// -------------------------------------------------------------------------

		static get info()
		{

			return {
				"section":		"perk",
				"order":		0,
			};

		}

		// -------------------------------------------------------------------------
		//  Methods
		// -------------------------------------------------------------------------

		/* Doesn't work on Safari
		static
		{

			// Init vars
			this._perks = {}
			this._sections = {};

		}
		*/

		// -------------------------------------------------------------------------

		static globalInit()
		{

			// Upgrade Unit
			this.upgrade(BITSMIST.v1.Unit, "spell", "perk.attachPerks", function(...args) { return PerkPerk._attachPerks(...args); });
			this.upgrade(BITSMIST.v1.Unit, "spell", "perk.attach", function(...args) { return PerkPerk._attach(...args); });

		}

		// -------------------------------------------------------------------------

		static init(unit, options)
		{

			// Upgrade unit
			this.upgrade(unit, "inventory", "perk.perks.PerkPerk", {"object": this});

		}

		// -------------------------------------------------------------------------

		/**
		 * Register an perk.
		 *
		 * @param	{Perk}		perk			Perk to register.
		 */
		static register(perk)
		{

			let info = perk.info;
			info["section"] = info["section"];
			info["order"] = ("order" in info ? info["order"] : 500);
			info["depends"] = info["depends"] || [];
			info["depends"] = ( Array.isArray(info["depends"]) ? info["depends"] : [info["depends"]] );

			this._perks[perk.name] = {
				"name":			perk.name,
				"object":		perk,
				"section":		info["section"],
				"order":		info["order"],
				"depends":		info["depends"],
			};

			// Global init
			perk.globalInit();

			// Create target word index
			PerkPerk._sections[info["section"]] = this._perks[perk.name];

		}

		// -------------------------------------------------------------------------
		//  Skills
		// -------------------------------------------------------------------------

		/**
		 * Attach new perks to unit according to settings.
		 *
		 * @param	{Unit}			unit				Unit.
		 * @param	{Object}		options				Options.
		 */
		static _attachPerks(unit, options)
		{

			let settings = options["settings"];
			let chain = Promise.resolve();
			let targets = PerkPerk.__listNewPerks(unit, settings);

			PerkPerk.__sortItems(targets).forEach((perkName) => {
				chain = chain.then(() => {
					return PerkPerk._attach(unit, this._perks[perkName].object, options);
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
		static _attach(unit, perk, options)
		{

			if (!unit.get("inventory", `perk.perks.${perk.name}`))
			{
				// Attach dependencies first
				let deps = this._perks[perk.name]["depends"];
				for (let i = 0; i < deps.length; i++)
				{
					PerkPerk._attach(unit, this._perks[deps[i]].object, options);
				}

				unit.set("inventory", `perk.perks.${perk.name}`, {
					"object":perk
				});

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
		static __listNewPerks(unit, settings)
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
					Util.assert(this._perks[perkName], `PerkPerk.__listNewPerk(): Perk not found. name=${unit.tagName}, perkName=${perkName}`);
					if (!unit.get("inventory", `perk.perks.${perkName}`))
					{
						targets[perkName] = this._perks[perkName];
					}
				}
			}

			// List new perks from settings keyword
			Object.keys(settings).forEach((key) => {
				let perkInfo = PerkPerk._sections[key];

				if (perkInfo && !unit.get("inventory", `perk.perks.${perkInfo.name}`))
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
		static __sortItems(perks)
		{

			return Object.keys(perks).sort((a,b) => {
				return perks[a]["order"] - perks[b]["order"];
			})

		}

	}

	// Init
	PerkPerk._perks = {};
	PerkPerk._sections = {};

	// =============================================================================

	// =============================================================================
	//	Setting Perk Class
	// =============================================================================

	class SettingPerk extends Perk
	{

		// -------------------------------------------------------------------------
		//  Properties
		// -------------------------------------------------------------------------

		static get info()
		{

			return {
				"section":		"setting",
				"order":		10,
			};

		}

		// -------------------------------------------------------------------------
		//  Methods
		// -------------------------------------------------------------------------

		static globalInit()
		{

			// Upgrade Unit
			this.upgrade(BITSMIST.v1.Unit, "asset", "setting", new ChainableStore());

			// Upgrade Unit
			this.upgrade(BITSMIST.v1.Unit, "skill", "setting.get", function(...args) { return SettingPerk._getSettings(...args); });
			this.upgrade(BITSMIST.v1.Unit, "skill", "setting.set", function(...args) { return SettingPerk._setSettings(...args); });
			this.upgrade(BITSMIST.v1.Unit, "skill", "setting.merge", function(...args) { return SettingPerk._mergeSettings(...args); });
			this.upgrade(BITSMIST.v1.Unit, "spell", "setting.summon", function(...args) { return SettingPerk._loadSettings(...args); });
			this.upgrade(BITSMIST.v1.Unit, "spell", "setting.apply", function(...args) { return SettingPerk._applySettings(...args); });

		}

		// -------------------------------------------------------------------------

		static init(unit, options)
		{

			// Get settings
			let settings = (options && options["settings"]) || {};
			settings = SettingPerk.__injectSettings(unit, settings);
			settings = SettingPerk.__mergeSettings(unit, settings);

			// Upgrade unit
			this.upgrade(unit, "asset", "setting", new ChainableStore({"items":settings, "chain":BITSMIST.v1.Unit.__bm_assets["setting"]}));

			return Promise.resolve().then(() => {
				SettingPerk.__loadAttrSettings(unit);
			}).then(() => {
				if (SettingPerk.__hasExternalSettings(unit))
				{
					return SettingPerk._loadSettings(unit);
				}
			}).then(() => {
				SettingPerk.__loadAttrSettings(unit); // Do it again to overwrite since attribute settings have higher priority
			});

		}

		// -------------------------------------------------------------------------
		//  Skills
		// -------------------------------------------------------------------------

		/**
		 * Apply settings.
		 *
	     * @param	{Unit}			unit				Unit.
		 * @param	{Object}		options				Options.
		 */
		static _applySettings(unit, options)
		{

			return Promise.resolve().then(() => {
				return unit.use("spell", "event.trigger", "beforeApplySettings", options);
			}).then(() => {
				return unit.use("spell", "perk.attachPerks", options);
			}).then(() => {
				return unit.use("spell", "event.trigger", "doApplySettings", options);
			}).then(() => {
				return unit.use("spell", "event.trigger", "afterApplySettings", options);
			});

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
		static _loadSettings(unit, options)
		{

			return AjaxUtil.loadJSON(SettingPerk.__getSettingsURL(unit), Object.assign({"bindTo":unit}, options)).then((settings) => {
				if (settings)
				{
					unit.use("skill", "setting.merge", settings);
				}
			});

		}

		// -------------------------------------------------------------------------

		/**
		 * Get settings.
		 *
	     * @param	{Unit}			unit				Unit.
		 * @param	{String}		key					Key.
		 * @param	{*}				defaultValue		Value returned when key is not found.
		 */
		static _getSettings(unit, key, defaultValue)
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
		static _setSettings(unit, key, value)
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
		static _mergeSettings(unit, key, value)
		{

			return unit.__bm_assets["setting"].merge(key, value);

		}

		// -------------------------------------------------------------------------
		//  Privates
		// -------------------------------------------------------------------------

		/**
		 * Get settings from element's attribute.
		 *
		 * @param	{Unit}			unit				Unit.
		 */
		static __loadAttrSettings(unit)
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
				unit.use("skill", "setting.merge", options);
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
		static __hasExternalSettings(unit)
		{

			let ret = false;

			if (unit.get("setting", "setting.options.settingsRef"))
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
		static __getSettingsURL(unit)
		{

			let path;
			let fileName;
			let query;

			let settingsRef = unit.get("setting", "setting.options.settingsRef");
			if (settingsRef && settingsRef !== true)
			{
				// If URL is specified in ref, use it
				let url = URLUtil.parseURL(settingsRef);
				path = url.path;
				fileName = url.filename;
				query = url.query;
			}
			else
			{
				// Use default path and filename
				path = Util.concatPath([
						unit.get("setting", "system.unit.options.path"),
						unit.get("setting", "unit.options.path", ""),
					]);
				let ext = unit.get("setting", "setting.options.settingFormat", unit.get("setting", "system.setting.options.settingFormat", "json"));
				fileName = unit.get("setting", "unit.options.fileName", unit.tagName.toLowerCase()) + ".settings." + ext;
				query = unit.get("setting", "unit.options.query");
			}

			return Util.concatPath([path, fileName]) + (query ? `?${query}` : "");

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
		static __injectSettings(unit, settings)
		{

			if (typeof(unit._injectSettings) === "function")
			{
				settings = unit._injectSettings.call(unit, settings);
			}

			return settings;

		}

		// -------------------------------------------------------------------------

		/**
		 * Get unit settings. Need to override.
		 *
		 * @param	{Unit}			unit				Unit.
		 *
		 * @return  {Object}		Options.
		 */
		static _getSettings(unit)
		{

			return {};

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
		static __mergeSettings(unit, settings)
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
			Util.deepMerge(settings, unit._getSettings.call(unit));

			return settings;

		}

	}

	// =============================================================================

	// =============================================================================
	//	Skin Perk Class
	// =============================================================================

	class SkinPerk extends Perk
	{

		// -------------------------------------------------------------------------
		//  Properties
		// -------------------------------------------------------------------------

		static get info()
		{

			return {
				"section":		"skin",
				"order":		210,
			};

		}

		// -------------------------------------------------------------------------
		//  Methods
		// -------------------------------------------------------------------------

		static globalInit()
		{

			// Upgrade Unit
			this.upgrade(BITSMIST.v1.Unit, "skill", "skin.apply", function(...args) { return SkinPerk._applySkin(...args); });
			this.upgrade(BITSMIST.v1.Unit, "skill", "skin.clone", function(...args) { return SkinPerk._cloneSkin(...args); });
			this.upgrade(BITSMIST.v1.Unit, "spell", "skin.summon", function(...args) { return SkinPerk._loadSkin(...args); });

		}

		// -------------------------------------------------------------------------

		static init(unit, options)
		{

			// Upgrade unit
			this.upgrade(unit, "inventory", "skin.skins", {});
			this.upgrade(unit, "state", "skin.active.skinName", "");
			this.upgrade(unit, "event", "beforeTransform", SkinPerk.SkinPerk_onBeforeTransform);
			this.upgrade(unit, "event", "doTransform", SkinPerk.SkinPerk_onDoTransform);

			SkinPerk.__loadAttrSettings(unit);

			// Shadow DOM
			switch (unit.get("setting", "skin.options.shadowDOM", unit.get("setting" ,"system.skin.options.shadowDOM")))
			{
			case "open":
				unit.set("state", "skin.shadowRoot", unit.attachShadow({mode:"open"}));
				break;
			case "closed":
				unit.set("state", "skin.shadowRoot", unit.attachShadow({mode:"closed"}));
				break;
			}

			unit.unitRoot = unit.get("state", "skin.shadowRoot", unit);

		}

		// -------------------------------------------------------------------------
		//  Event Handlers
		// -------------------------------------------------------------------------

		static SkinPerk_onBeforeTransform(sender, e, ex)
		{

			if (e.detail.skinName || SkinPerk.__hasDefaultSkin(this))
			{
				let skinName = e.detail.skinName || "default";

				return SkinPerk._loadSkin(this, skinName).then((skinInfo) => {
					this.unitRoot.textContent = "";
					this.unitRoot = skinInfo["template"].content.cloneNode(true);
				});
			}

		}

		// -------------------------------------------------------------------------

		static SkinPerk_onDoTransform(sender, e, ex)
		{

			if (e.detail.skinName || SkinPerk.__hasDefaultSkin(this))
			{
				let skinName = e.detail.skinName || "default";

				return SkinPerk._applySkin(this, skinName, this.unitRoot);
			}

		}

		// -------------------------------------------------------------------------
		//  Skills
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
		static _loadSkin(unit, skinName, options)
		{

			let promise = Promise.resolve();
			let skinInfo = unit.get("inventory", `skin.skins.${skinName}`) || SkinPerk.__createSkinInfo(unit, skinName);
			let skinSettings = options || unit.get("setting", `skin.skins.${skinName}`, {});

			if (skinInfo["status"] === "loaded")
			{
				console.debug(`SkinPerk._loadSkin(): Skin already loaded. name=${unit.tagName}, skinName=${skinName}`);
				return promise.then(() => {
					return skinInfo;
				});
			}

			switch (skinSettings["type"]) {
			case "HTML":
				skinInfo["HTML"] = skinSettings["HTML"];
				skinInfo["template"] = document.createElement("template");
				skinInfo["template"].innerHTML = skinInfo["HTML"];
				skinInfo["status"] = "loaded";
				unit.set("inventory", `skin.skins.${skinName}`, skinInfo);
				break;
			case "node":
				let rootNode = unit.use("skill", "basic.scan", skinSettings["rootNode"] || "");
				Util.assert(rootNode, `SkinPerk._loadSkin(): Root node does not exist. name=${unit.tagName}, skinName=${skinName}, rootNode=${skinSettings["rootNode"]}`);
				skinInfo["HTML"] = rootNode.innerHTML;
				skinInfo["template"] = document.createElement("template");
				skinInfo["template"].innerHTML = skinInfo["HTML"];
				skinInfo["status"] = "loaded";
				unit.set("inventory", `skin.skins.${skinName}`, skinInfo);
				break;
			case "URL":
			default:
				let url = skinSettings["URL"] || (skinName === "default" && SkinPerk.__getSkinURL(unit));
				Util.assert(url, `SkinPerk._loadSkin(): Skin URL is not speicified. name=${unit.tagName}, skinName=${skinName}`);
				promise = AjaxUtil.loadHTML(url).then((skin) => {
					skinInfo["HTML"] = skin;
					skinInfo["template"] = document.createElement("template");
					skinInfo["template"].innerHTML = skinInfo["HTML"];
					skinInfo["status"] = "loaded";
					unit.set("inventory", `skin.skins.${skinName}`, skinInfo);
				});
				break;
			}

			return promise.then(() => {
				return skinInfo;
			});

		}

		// -------------------------------------------------------------------------

		/**
		 * Apply skin.
		 *
		 * @param	{Unit}			unit				Parent unit.
		 * @param	{String}		skinName			Skin name.
		 */
		static _applySkin(unit, skinName, clone)
		{

			let skinInfo = unit.get("inventory", `skin.skins.${skinName}`);

			Util.assert(skinInfo,`SkinPerk._applySkin(): Skin not loaded. name=${unit.tagName}, skinName=${skinName}, id=${unit.id}, uniqueId=${unit.uniqueId}`, ReferenceError);

			// Append the clone to the unit
			clone = clone || skinInfo["template"].content.cloneNode(true);
			unit.unitRoot = unit.get("state", "skin.shadowRoot", unit);
			unit.unitRoot.innerHTML = "";
			unit.unitRoot.appendChild(clone);

			// Change active skin
			unit.set("state", "skin.active.skinName", skinName);

			console.debug(`SkinPerk._applySkin(): Applied skin. name=${unit.tagName}, skinName=${skinName}, id=${unit.id}, uniqueId=${unit.uniqueId}`);

		}

		// -------------------------------------------------------------------------
		//  Privates
		// -------------------------------------------------------------------------
		//
		/**
		 * Get settings from element's attribute.
		 *
		 * @param	{Unit}			unit				Unit.
		 */
		static __loadAttrSettings(unit)
		{

			if (unit.hasAttribute("bm-skinref"))
			{
				let skinRef = unit.getAttribute("bm-styleref") || true;
				if (skinRef === "false")
				{
					skinRef = false;
				}

				unit.set("setting", "skin.options.skinRef", skinRef);
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
		static __createSkinInfo(unit, skinName)
		{

			return {
				"name":		skinName,
				"HTML":		"",
				"template": null,
				"status":	"",
			};

		}

		// -------------------------------------------------------------------------

		/**
		 * Check if the unit has the default skin file.
		 *
		 * @param	{Unit}			unit				Unit.
		 *
		 * @return  {Boolean}		True if the unit has the external skin file.
		 */
		static __hasDefaultSkin(unit)
		{

			let ret = false;

			if (unit.get("setting", "skin.options.skinRef", true))
			{
				ret = true;
			}

			return ret;

		}

		// -------------------------------------------------------------------------

		/**
		 * Return URL to skin file.
		 *
		 * @param	{Unit}			unit				Unit.
		 * @param	{String	}		skinName			Skin name.
		 *
		 * @return  {String}		URL.
		 */
		static __getSkinURL(unit)
		{

			let path;
			let fileName;
			let query;

			let skinRef = unit.get("setting", "skin.options.skinRef");
			if (skinRef && skinRef !== true)
			{
				// If URL is specified in ref, use it
				let url = URLUtil.parseURL(skinRef);
				path = url.path;
				fileName = url.filename;
				query = url.query;
			}
			else
			{
				// Use default path and filename
				path = Util.concatPath([
						unit.get("setting", "system.skin.options.path", unit.get("setting", "system.unit.options.path", "")),
						unit.get("setting", "style.options.path", unit.get("setting", "unit.options.path", "")),
					]);
				fileName = SkinPerk.__getDefaultFilename(unit) + ".html";
				query = unit.get("setting", "unit.options.query");
			}

			return Util.concatPath([path, fileName]) + (query ? `?${query}` : "");

		}

		// -------------------------------------------------------------------------

		/**
		 * Get the default skin name.
		 *
		 * @param	{Unit}			unit				Unit.
		 *
		 * @return 	{String}		Skin name.
		 */
		static __getDefaultFilename(unit)
		{

			return unit.get("setting", "skin.options.fileName",
				unit.get("setting", "unit.options.fileName",
					unit.tagName.toLowerCase()));

		}

	}

	// =============================================================================

	// =============================================================================
	//	Style Perk Class
	// =============================================================================

	class StylePerk extends Perk
	{

		// -------------------------------------------------------------------------
		//  Properties
		// -------------------------------------------------------------------------

		static get info()
		{

			return {
				"section":		"style",
				"order":		200,
			};

		}

		// -------------------------------------------------------------------------
		//  Methods
		// -------------------------------------------------------------------------

		static globalInit()
		{

			// Upgrade Unit
			this.upgrade(BITSMIST.v1.Unit, "vault", "style.applied", []);
			this.upgrade(BITSMIST.v1.Unit, "inventory", "style.styles", new ChainableStore());
			this.upgrade(BITSMIST.v1.Unit, "spell", "style.summon", function(...args) { return StylePerk._loadCSS(...args); });
			this.upgrade(BITSMIST.v1.Unit, "spell", "style.apply", function(...args) { return StylePerk._applyCSS(...args); });

			this._cssReady = {};
			this._cssReady["promise"] = new Promise((resolve, reject) => {
				this._cssReady["resolve"] = resolve;
				this._cssReady["reject"] = reject;
			});

			// Load and apply common CSS
			Promise.resolve();
			BITSMIST.v1.Unit.get("inventory", "promise.documentReady").then(() => {
				let promises = [];
				Object.entries(BITSMIST.v1.Unit.get("setting", "system.style.styles", {})).forEach(([sectionName, sectionValue]) => {
					promises.push(StylePerk._loadCSS(BITSMIST.v1.Unit, sectionName, sectionValue));
				});

				Promise.all(promises).then(() => {
					let chain = Promise.resolve();
					let styles = BITSMIST.v1.Unit.get("setting", "system.style.options.apply", []);
					for (let i = 0; i < styles.length; i++)
					{
						chain = chain.then(() => {
							return StylePerk._applyCSS(BITSMIST.v1.Unit, styles[i]);
						});
					}

					return chain.then(() => {
						this._cssReady["resolve"]();
					});
				});
			});

		}

		// -------------------------------------------------------------------------

		static init(unit, options)
		{

			// Upgrade unit
			this.upgrade(unit, "vault", "style.applied", []);
			this.upgrade(unit, "inventory", "style.styles", new ChainableStore({
				"chain":	BITSMIST.v1.Unit.get("inventory", "style.styles"),
			}));
			this.upgrade(unit, "event", "doTransform", StylePerk.StylePerk_onDoTransform);

			StylePerk.__loadAttrSettings(unit);

		}

		// -------------------------------------------------------------------------
		//  Event Handlers
		// -------------------------------------------------------------------------

		static StylePerk_onDoTransform(sender, e, ex)
		{

			return StylePerk._cssReady.promise.then(() => {
				// List common CSS
				let css = this.get("setting", "style.options.apply", []);

				if (e.detail.styleName || StylePerk.__hasDefaultCSS(this))
				{
					let styleName = e.detail.styleName || "default";

					// Add style specific common CSS
					css = css.concat(this.get("setting", `style.styles.${styleName}.apply`, []));

					// Add unit specific CSS
					css.push(styleName);
				}

				// Load CSS
				let promises = [];
				for (let i = 0; i < css.length; i++)
				{
					promises.push(StylePerk._loadCSS(this, css[i]));
				}

				return Promise.all(promises).then(() => {
					// Clear CSS
					StylePerk._clearCSS(this);

					// Apply CSS
					let chain = Promise.resolve();
					for (let i = 0; i < css.length; i++)
					{
						chain = chain.then(() => {
							return StylePerk._applyCSS(this, css[i]);
						});
					}

					return chain;
				});
			});

		}

		// -------------------------------------------------------------------------
		//  Skills
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
		static _loadCSS(unit, styleName, options)
		{

			let promise = Promise.resolve();
			let styleInfo = unit.get("inventory", "style.styles").get(styleName) || StylePerk.__createStyleInfo(unit, styleName);
			let styleSettings = options || unit.get("setting", `style.styles.${styleName}`, {});

			if (styleInfo["status"] === "loaded")
			{
				console.debug(`StylePerk._loadCSS(): Style already loaded. name=${unit.tagName}, styleName=${styleName}`);
				return promise.then(() => {
					return styleInfo;
				});
			}

			switch (styleSettings["type"]) {
			case "CSS":
				styleInfo["CSS"] = styleSettings["CSS"];
				styleInfo["status"] = "loaded";
				unit.get("inventory", `style.styles`).set(styleName, styleInfo);
				break;
			case "URL":
			default:
				if (styleInfo["status"] === "loading")
				{
					promise = styleInfo["promise"];
				}
				else
				{
					let url = styleSettings["URL"] || (styleName === "default" && StylePerk.__getCSSURL(unit));
					Util.assert(url, `StylePerk._loadCSS(): CSS URL is not speicified. name=${unit.tagName}, styleName=${styleName}`);
					promise = AjaxUtil.loadCSS(url).then((css) => {
						let styleInfo = unit.get("inventory", "style.styles").get(styleName);
						styleInfo["CSS"] = css;
						styleInfo["status"] = "loaded";
						unit.get("inventory", "style.styles").set(styleName, styleInfo);
					});
					styleInfo["promise"] = promise;
					styleInfo["status"] = "loading";
					unit.get("inventory", `style.styles`).set(styleName, styleInfo);
				}
				break;
			}

			return promise.then(() => {
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
		static _applyCSS(unit, styleName)
		{

			let cssInfo = unit.get("inventory", "style.styles").get(styleName);
			let ss = new CSSStyleSheet();

			Util.assert(cssInfo,`StylePerk._applyCSS(): CSS not loaded. name=${unit.tagName || "Global"}, styleName=${styleName}, id=${unit.id}, uniqueId=${unit.uniqueId}`, ReferenceError);

			return Promise.resolve().then(() => {
				return ss.replace(`${cssInfo["CSS"]}`);
			}).then(() => {
				let shadowRoot = unit.get("state", "skin.shadowRoot");
				if (shadowRoot)
				{
					// Shadow DOM
					shadowRoot.adoptedStyleSheets = [...shadowRoot.adoptedStyleSheets, ss];
				}
				else
				{
					// Light DOM
					styleName = unit.tagName + "." + styleName;
					if (!(styleName in StylePerk.__applied) || StylePerk.__applied[styleName]["count"] <= 0)
					{
						// Apply styles
						StylePerk.__applied[styleName] = StylePerk.__applied[styleName] || {};
						document.adoptedStyleSheets = [...document.adoptedStyleSheets, ss];
						StylePerk.__applied[styleName]["object"] = ss;
						StylePerk.__applied[styleName]["count"] = 1;
					}
					else
					{
						// Already applied
						StylePerk.__applied[styleName]["count"]++;
					}

					let applied = unit.get("vault", "style.applied");
					applied.push(styleName);
					unit.set("vault", "style.applied", applied);
				}

				console.debug(`StylePerk._applyCSS(): Applied CSS. name=${unit.tagName}, styleName=${cssInfo["name"]}, id=${unit.id}, uniqueId=${unit.uniqueId}`);
			});

		}

		// -------------------------------------------------------------------------

		/**
		 * Clear styles. Works only in ShadowDOM.
		 *
		 * @param	{Unit}			unit				Parent unit.
		 */
		static _clearCSS(unit)
		{

			let shadowRoot = unit.get("state", "skin.shadowRoot");
			if (shadowRoot)
			{
				// Shadow DOM
				shadowRoot.adoptedStyleSheets = [];
			}
			else
			{
				// Light DOM
				let applied = unit.get("vault", "style.applied");
				if (applied.length > 0)
				{
					for (let i = 0; i < applied.length; i++)
					{
						StylePerk.__applied[applied[i]]["count"]--;
					}
					unit.set("vault", "style.applied", []);

					// Re-apply other CSS
					document.adoptedStyleSheets = [];
					Object.keys(StylePerk.__applied).forEach((key) => {
						if (StylePerk.__applied[key]["count"] > 0)
						{
							document.adoptedStyleSheets = [...document.adoptedStyleSheets, StylePerk.__applied[key]["object"]];
						}
					});
				}
			}

		}

		// -------------------------------------------------------------------------
		//  Privates
		// -------------------------------------------------------------------------
		//
		/**
		 * Get settings from element's attribute.
		 *
		 * @param	{Unit}			unit				Unit.
		 */
		static __loadAttrSettings(unit)
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
		 * Returns a new Style info object.
		 *
		 * @param	{Unit}			unit				Parent unit.
		 * @param	{String}		styleName			Style name.
		 *
		 * @return  {Object}		Style info.
		 */
		static __createStyleInfo(unit, styleName)
		{

			return {
				"name": 	styleName,
				"CSS":		"",
				"status":	"",
			}

		}

		// -------------------------------------------------------------------------

		/**
		 * Check if the unit has the default CSS file.
		 *
		 * @param	{Unit}			unit				Unit.
		 *
		 * @return  {Boolean}		True if the unit has the external CSS file.
		 */
		static __hasDefaultCSS(unit)
		{

			let ret = false;

			if (unit.get("setting", "style.options.styleRef", true))
			{
				ret = true;
			}

			return ret;

		}

		// -------------------------------------------------------------------------

		/**
		 * Return URL to CSS file.
		 *
		 * @param	{Unit}			unit				Unit.
		 *
		 * @return  {String}		URL.
		 */
		static __getCSSURL(unit)
		{

			let path;
			let fileName;
			let query;

			let cssRef = unit.get("setting", "style.options.styleRef");
			if (cssRef && cssRef !== true)
			{
				// If URL is specified in ref, use it
				let url = URLUtil.parseURL(cssRef);
				path = url.path;
				fileName = url.filename;
				query = url.query;
			}
			else
			{
				// Use default path and filename
				path = Util.concatPath([
						unit.get("setting", "system.style.options.path", unit.get("setting", "system.unit.options.path", "")),
						unit.get("setting", "skin.options.path", unit.get("setting", "unit.options.path", "")),
					]);
				fileName =  StylePerk.__getDefaultFilename(unit) + ".css";
				query = unit.get("setting", "unit.options.query");
			}

			return Util.concatPath([path, fileName]) + (query ? `?${query}` : "");

		}

		// -------------------------------------------------------------------------

		/**
		 * Get the default style name.
		 *
		 * @param	{Unit}			unit				Unit.
		 *
		 * @return 	{String}		Style name.
		 */
		static __getDefaultFilename(unit)
		{

			return unit.get("setting", "style.options.fileName",
				unit.get("setting", "unit.options.fileName",
					unit.tagName.toLowerCase()));

		}

	}

	// Init
	StylePerk.__applied = {};

	// =============================================================================

	// =============================================================================
	//	Event Perk class
	// =============================================================================

	class EventPerk extends Perk
	{

		// -------------------------------------------------------------------------
		//  Properties
		// -------------------------------------------------------------------------

		static get info()
		{

			return {
				"section":		"event",
				"order":		210,
			};

		}

		// -------------------------------------------------------------------------
		//  Methods
		// -------------------------------------------------------------------------

		static globalInit()
		{

			// Upgrade Unit
			this.upgrade(BITSMIST.v1.Unit, "skill", "event.add", function(...args) { return EventPerk._addEventHandler(...args); });
			this.upgrade(BITSMIST.v1.Unit, "skill", "event.remove", function(...args) { return EventPerk._removeEventHandler(...args); });
			this.upgrade(BITSMIST.v1.Unit, "skill", "event.init", function(...args) { return EventPerk._initEvents(...args); });
			this.upgrade(BITSMIST.v1.Unit, "skill", "event.reset", function(...args) { return EventPerk._removeEvents(...args); });
			this.upgrade(BITSMIST.v1.Unit, "spell", "event.trigger", function(...args) { return EventPerk._trigger(...args); });
			this.upgrade(BITSMIST.v1.Unit, "skill", "event.triggerSync", function(...args) { return EventPerk._triggerSync(...args); });

		}

		// -------------------------------------------------------------------------

		static init(unit, options)
		{

			// Upgrade unit
			this.upgrade(unit, "event", "doApplySettings", EventPerk.EventPerk_onDoApplySettings);
			this.upgrade(unit, "event", "afterTransform", EventPerk.EventPerk_onAfterTransform);

		}

		// -------------------------------------------------------------------------

		static deinit(unit, options)
		{

			let events = this.get("setting", "event");
			if (events)
			{
				Object.keys(events).forEach((elementName) => {
					EventPerk._removeEvents(unit, elementName, events[eventName]);
				});
			}

		}

		// -------------------------------------------------------------------------
		//  Event Handlers
		// -------------------------------------------------------------------------

		static EventPerk_onDoApplySettings(sender, e, ex)
		{

			Object.entries(Util.safeGet(e.detail, "settings.event.events", {})).forEach(([sectionName, sectionValue]) => {
				EventPerk._initEvents(this, sectionName, sectionValue);
			});

		}

		// -------------------------------------------------------------------------

		static EventPerk_onAfterTransform(sender, e, ex)
		{

			Object.entries(this.get("setting", "event.events", {})).forEach(([sectionName, sectionValue]) => {
				// Initialize only elements inside unit
				if (!EventPerk.__isTargetSelf(sectionName, sectionValue))
				{
					EventPerk._initEvents(this, sectionName, sectionValue);
				}
			});

		}

		// -------------------------------------------------------------------------
		//  Skills
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
		static _addEventHandler(unit, eventName, handlerInfo, element, bindTo)
		{

			element = element || unit;
			let handlerOptions = (typeof handlerInfo === "object" ? handlerInfo : {});

			// Get handler
			let handler = EventPerk.__getEventHandler(unit, handlerInfo);
			Util.assert(handler, `EventPerk._addEventHandler(): handler not found. name=${unit.tagName}, eventName=${eventName}`);

			// Init holder object for the element
			if (!element.__bm_eventinfo)
			{
				element.__bm_eventinfo = { "unit":unit, "listeners":{}, "promises":{}, "statuses":{} };
			}

			// Add hook event handler
			let listeners = element.__bm_eventinfo.listeners;
			if (!listeners[eventName])
			{
				listeners[eventName] = [];
				element.addEventListener(eventName, EventPerk.__callEventHandler, handlerOptions["listnerOptions"]);
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
		static _removeEventHandler(unit, eventName, handlerInfo, element)
		{

			element = element || unit;

			// Get handler
			let handler = EventPerk.__getEventHandler(unit, handlerInfo);
			Util.assert(handler, `EventPerk._removeEventHandler(): handler not found. name=${unit.tagName}, eventName=${eventName}`);

			let listeners = Util.safeGet(element, `__bm_eventinfo.listeners.${eventName}`);
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
		static _initEvents(unit, elementName, eventInfo, rootNode)
		{

			eventInfo = ( eventInfo ? eventInfo : unit.get("setting", `event.events.${elementName}`) );

			// Get target elements
			let elements = EventPerk.__getTargetElements(unit, rootNode, elementName, eventInfo);
			//Util.warn(elements.length > 0, `EventPerk._initEvents: No elements for the event found. name=${unit.tagName}, elementName=${elementName}`);

			// Set event handlers
			Object.keys(eventInfo["handlers"]).forEach((eventName) => {
				let handlers = ( Array.isArray(eventInfo["handlers"][eventName]) ? eventInfo["handlers"][eventName] : [eventInfo["handlers"][eventName]] );
				for (let i = 0; i < handlers.length; i++)
				{
					for (let j = 0; j < elements.length; j++)
					{
						EventPerk._addEventHandler(unit, eventName, handlers[i], elements[j]);
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
		static _removeEvents(unit, elementName, eventInfo, rootNode)
		{

			eventInfo = ( eventInfo ? eventInfo : unit.get("setting", `event.events.${elementName}`) );

			// Get target elements
			let elements = EventPerk.__getTargetElements(unit, rootNode, elementName, eventInfo);
			//Util.warn(elements.length > 0, `EventPerk._removeEvents: No elements for the event found. name=${unit.tagName}, elementName=${elementName}`);

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

		/**
		 * Trigger the event synchronously.
		 *
		 * @param	{Unit}			unit					Unit.
		 * @param	{String}		eventName				Event name to trigger.
		 * @param	{Object}		options					Event parameter options.
		 * @param	{HTMLElement}	element					HTML element.
		 */
		static _trigger(unit, eventName, options, element)
		{

			options = options || {};
			element = ( element ? element : unit );

			element.dispatchEvent(new CustomEvent(eventName, { detail: options }));

			// return the promise if exists
			return Util.safeGet(element, `__bm_eventinfo.promises.${eventName}`) || Promise.resolve();

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
		static _triggerSync(unit, eventName, options, element)
		{

			options = options || {};
			options["async"] = true;

			return EventPerk._trigger.call(unit, unit, eventName, options, element);

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
		static __getEventHandler(unit, handlerInfo)
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
		 * @param	{Unit}			unit				Unit.
		 * @param	{HTMLElement}	rootNode			Root node to search elements.
		 * @param	{String}		elementName			Element name.
		 * @param	{Object}		elementInfo			Element info.
		 *
		 * @return 	{Array}			Target node list.
		 */
		static __getTargetElements(unit, rootNode, elementName, eventInfo)
		{

			rootNode = rootNode || unit;
			let elements;

			if (EventPerk.__isTargetSelf(elementName, eventInfo))
			{
				// Target is "this"
				elements = [rootNode];
			}
			else if (eventInfo && eventInfo["rootNode"])
			{
				// If eventInfo["rootNode"] is specified, target is eventInfo["rootNode"]
				elements = Util.scopedSelectorAll(rootNode, eventInfo["rootNode"]);
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
		static __isHandlerInstalled(element, eventName, handler)
		{

			let isInstalled = false;
			let listeners = Util.safeGet(element.__bm_eventinfo, `listeners.${eventName}`);

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

			let listeners = Util.safeGet(this, `__bm_eventinfo.listeners.${e.type}`);
			let sender = Util.safeGet(e, "detail.sender", this);
			let unit = Util.safeGet(this, "__bm_eventinfo.unit");
			let templateStatuses = `__bm_eventinfo.statuses.${e.type}`;
			let templatePromises = `__bm_eventinfo.promises.${e.type}`;

			// Check if handler is already running
			//Util.warn(Util.safeGet(this, templateStatuses) !== "handling", `EventPerk.__callEventHandler(): Event handler is already running. name=${this.tagName}, eventName=${e.type}`);

			Util.safeSet(this, templateStatuses, "handling");

			if (Util.safeGet(e, "detail.async", false) === false)
			{
				// Async
				this.__bm_eventinfo["promises"][e.type] = EventPerk.__handle(e, sender, unit, listeners).then(() => {
					Util.safeSet(this, templatePromises, null);
					Util.safeSet(this, templateStatuses, "");
				}).catch((err) => {
					Util.safeSet(this, templatePromises, null);
					Util.safeSet(this, templateStatuses, "");
					throw(err);
				});
			}
			else
			{
				// Sync
				try
				{
					this.__bm_eventinfo["promises"][e.type] = EventPerk.__handleSync(e, sender, unit, listeners);
					Util.safeSet(this, templatePromises, null);
					Util.safeSet(this, templateStatuses, "");
				}
				catch (err)
				{
					Util.safeSet(this, templatePromises, null);
					Util.safeSet(this, templateStatuses, "");
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
		static __handle(e, sender, unit, listeners)
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
					Util.assert(typeof handler === "function", `EventPerk._addEventHandler(): Event handler is not a function. name=${unit.tagName}, eventName=${e.type}`, TypeError);

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
		static __handleSync(e, sender, unit, listeners)
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
				Util.assert(typeof handler === "function", `EventPerk._addEventHandler(): Event handler is not a function. name=${unit.tagName}, eventName=${e.type}`, TypeError);

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
	 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
	 */
	// =============================================================================

	window.BITSMIST = window.BITSMIST || {};
	window.BITSMIST.v1 = window.BITSMIST.v1 || {};
	window.BITSMIST.v1.Util = Util;
	window.BITSMIST.v1.ClassUtil = ClassUtil;
	window.BITSMIST.v1.AjaxUtil = AjaxUtil;
	window.BITSMIST.v1.URLUtil = URLUtil;
	window.BITSMIST.v1.Store = Store;
	window.BITSMIST.v1.ChainableStore = ChainableStore;
	window.BITSMIST.v1.Unit = Unit;
	window.BITSMIST.v1.Perk = Perk;
	window.BITSMIST.v1.BasicPerk = BasicPerk;
	PerkPerk.register(BasicPerk);
	window.BITSMIST.v1.PerkPerk = PerkPerk;
	PerkPerk.register(PerkPerk);
	window.BITSMIST.v1.SettingPerk = SettingPerk;
	PerkPerk.register(SettingPerk);
	window.BITSMIST.v1.StatusPerk = StatusPerk;
	PerkPerk.register(StatusPerk);
	window.BITSMIST.v1.SkinPerk = SkinPerk;
	PerkPerk.register(SkinPerk);
	window.BITSMIST.v1.StylePerk = StylePerk;
	PerkPerk.register(StylePerk);
	window.BITSMIST.v1.EventPerk = EventPerk;
	PerkPerk.register(EventPerk);
	window.BITSMIST.v1.UnitPerk = UnitPerk;
	PerkPerk.register(UnitPerk);

})();
//# sourceMappingURL=bitsmist-js_v1.js.map
