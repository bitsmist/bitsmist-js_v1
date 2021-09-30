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

	var Util = function Util () {};

	Util.safeGet = function safeGet (store, key, defaultValue)
	{

		var current = store;
		var found = true;
		var items = key.split(".");
		for (var i = 0; i < items.length; i++)
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

	};

	// -----------------------------------------------------------------------------

	/**
		 * Set an value to store.
		 *
		 * @param{Object}	store			Object that holds keys/values.
		 * @param{String}	key				Key to store.
		 * @param{Object}	value			Value to store.
		 */
	Util.safeSet = function safeSet (store, key, value)
	{

		var current = store;
		var items = key.split(".");
		for (var i = 0; i < items.length - 1; i++)
		{
			Util.assert(current && typeof current === "object",
				("Util.safeSet(): Key already exists. key=" + key + ", existingKey=" + (( i > 0 ? items[i-1] : "" )) + ", existingValue=" + current), TypeError);

			if (!(items[i] in current))
			{
				current[items[i]] = {};
			}

			current = current[items[i]];
		}

		current[items[items.length - 1]] = value;

		return store;

	};

	// -----------------------------------------------------------------------------

	/**
		 * Set an value to store. Unlike safeSet() if both the existing value and
		 * the value is an object, it merges them instead of overwrite it.
		 *
		 * @param{Object}	store			Object that holds keys/values.
		 * @param{String}	key				Key to store.
		 * @param{Object}	value			Value to store.
		 */
	Util.safeMerge = function safeMerge (store, key, value)
	{

		var current = store;
		var items = key.split(".");
		for (var i = 0; i < items.length - 1; i++)
		{
			Util.assert(current && typeof current === "object",
				("Util.safeSet(): Key already exists. key=" + key + ", existingKey=" + (( i > 0 ? items[i-1] : "" )) + ", existingValue=" + current), TypeError);

			if (!(items[i] in current))
			{
				current[items[i]] = {};
			}

			current = current[items[i]];
		}

		// Overwrite/Merge value
		var lastWord = items[items.length - 1];
		if (current[lastWord] && (typeof current[lastWord] === "object") && value && (typeof value === "object"))
		{
			Util.deepMerge(current[lastWord], value);
		}
		else
		{
			current[lastWord] = value;
		}

		return store;

	};

	// -----------------------------------------------------------------------------

	/**
		 * Check if the store has specified key.
		 *
		 * @param{Object}	store			Store.
		 * @param{String}	key				Key to check.
		 *
		 * @return{Boolean}	True:exists, False:not exists.
		 */
	Util.safeHas = function safeHas (store, key)
	{

		var current = store;
		var found = true;
		var items = key.split(".");
		for (var i = 0; i < items.length; i++)
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

	};

	// -----------------------------------------------------------------------------

	/**
	 	 * Execute Javascript code from string.
		 *
		 * @param{String}	code			Code to execute.
		 * @param{Object}	context			Context refered as "this" inside the code.
		 * @param{Object}	parameters		Parameters passed to the code.
		 *
		 * @return{*}			Result of eval.
		 */
	Util.safeEval = function safeEval (code, context, parameters)
	{

		var names;
		var values = [];

		if (parameters)
		{
			names = Object.keys(parameters).join(",");
			Object.keys(parameters).forEach(function (key) {
				values.push(parameters[key]);
			});
		}

		return Function(names, '"use strict";return (' + code + ')').apply(context, values);

	};

	// -----------------------------------------------------------------------------

	/**
		 * Concatenat path strings appending trainling "/" when needed.
		 *
		 * @param{Array}		paths			Paths.
		 *
		 * @return{String}	Concatenated paths
		 */
	Util.concatPath = function concatPath (paths)
	{

		var path = paths[0] || "";

		for (var i = 1; i < paths.length; i++)
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

	};

	// -------------------------------------------------------------------------

	/**
		 * Deep merge two objects. Merge obj2 into obj1.
		 *
		 * @param{Object}	obj1				Object1.
		 * @param{Object}	obj2				Object2.
		 *
		 * @return  {Object}	Merged object.
		 */
	Util.deepMerge = function deepMerge (obj1, obj2)
	{

		Util.assert(obj1 && typeof obj1 === "object" && obj2 && typeof obj2 === "object", "Util.deepMerge(): \"obj1\" and \"obj2\" parameters must be an object.", TypeError);

		Object.keys(obj2).forEach(function (key) {
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

	};

	// -------------------------------------------------------------------------

	/**
		 * Deep clone an objects into another object.
		 *
		 * @param{Object}	obj1				Object1.
		 * @param{Object}	obj2				Object2.
		 *
		 * @return  {Object}	Merged object.
		 */
	Util.deepClone = function deepClone (obj1, obj2)
	{

		Util.assert(obj1 && typeof obj1 === "object" && obj2 && typeof obj2 === "object", "Util.deepMerge(): \"obj1\" and \"obj2\" parameters must be an object.", TypeError);

		Object.keys(obj2).forEach(function (key) {
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

	};

	// -------------------------------------------------------------------------

	/**
		 * Deep clone an array.
		 *
		 * @param{Object}	arr					Array.
		 *
		 * @return  {Object}	Merged array.
		 */
	Util.deepCloneArray = function deepCloneArray (arr)
	{

		Util.assert(Array.isArray(arr), "Util.deepCloneArray(): \"arr\" parameter must be an array.", TypeError);

		var result = [];

		for (var i = 0; i < arr.length; i++)
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

	};

	// -----------------------------------------------------------------------------

	/**
		 * Get a class name from tag name.
		 *
		 * @param{String}	tagName			Tag name.
		 *
		 * @return  {String}	Class name.
		 */
	Util.getClassNameFromTagName = function getClassNameFromTagName (tagName)
	{

		var tag = tagName.split("-");
		var className = tag[0].charAt(0).toUpperCase() + tag[0].slice(1).toLowerCase() + tag[1].charAt(0).toUpperCase() + tag[1].slice(1).toLowerCase();

		return className;

	};

	// -------------------------------------------------------------------------

	/**
		 * Get tag name from class name.
		 *
		 * @param{String}	className		Class name.
		 *
		 * @return {String}	Tag name.
		 */
	Util.getTagNameFromClassName = function getTagNameFromClassName (className)
	{

		var pos;
		var result = className;
		var c = className.split(".");
		var cName = c[c.length - 1];

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

	};

	// -------------------------------------------------------------------------

	/**
		 * Get file name and path from url.
		 *
		 * @param{String}	path			Path.
		 *
		 * @return {String}	File name.
		 */
	Util.getFilenameAndPathFromUrl = function getFilenameAndPathFromUrl (url)
	{

		var pos = url.lastIndexOf("/");
		var path = url.substr(0, pos);
		var fileName = url.substr(pos + 1);

		return [path, fileName];

	};

	// -------------------------------------------------------------------------

	/**
		 * Check if character is upper case.
		 *
		 * @param{String}	c				Character.
		 *
		 * @return {Boolean}	True if it is upper case.
		 */
	Util.__isUpper = function __isUpper (c)
	{

		return c === c.toUpperCase() && c !== c.toLowerCase();

	};

	// -------------------------------------------------------------------------

	/**
		 * Assert conditions. Throws an error when assertion failed.
		 *
		 * @param{Boolean}	conditions		Conditions.
		 * @param{String}	Message			Error message.
		 * @param{Error}		error			Error to throw.
		 * @param{Options}	options			Options.
		 *
		 * @return {Boolean}	True if it is upper case.
		 */
	Util.assert = function assert (conditions, msg, error, options)
	{

		if (!conditions)
		{
			error = error || Error;
			var e = new error(msg);

			// Remove last stack (assert() itself)
			var stacks = e.stack.split("\n");
			stacks.splice(1, 1);
			e.stack = stacks.join("\n");

			throw e;
		}

	};

	// -------------------------------------------------------------------------

	/**
		 * Warns when condition failed.
		 *
		 * @param{Boolean}	conditions		Conditions.
		 * @param{String}	Message			Error message.
		 * @param{String}	level			Warn level.
		 * @param{Options}	options			Options.
		 *
		 * @return {Boolean}	True if it is upper case.
		 */
	Util.warn = function warn (conditions, msg, level, options)
	{

		var ret = true;

		if (!conditions)
		{
			level = level || "warn";
			console[level](msg);

			ret = false;
		}

		return ret;

	};

	// -------------------------------------------------------------------------

	/**
		 * Return a promise that resolved after random milliseconds.
		 *
		 * @param{Integer}	max				Maximum time in milliseconds.
		 *
		 * @return {Promise}	Promise.
		 */
	Util.randomWait = function randomWait (max, fixed)
	{

		var timeout = ( fixed ? max : Math.floor(Math.random() * max ) );

		return new Promise(function (resolve, reject) {
			setTimeout(function () {
				resolve();
			}, timeout);
		});

	};

	// -------------------------------------------------------------------------

	/**
		 * Execute query on root node excluding nested components inside.
		 *
		 * @param{HTMLElement}rootNode		Root node.
		 * @param{String}	query			Query.
		 *
		 * @return  {Array}		Array of matched elements.
		 */
	    Util.scopedSelectorAll = function scopedSelectorAll (rootNode, query)
	    {

	        // Set temp id
	        var guid = new Date().getTime().toString(16) + Math.floor(100*Math.random()).toString(16);
	        rootNode.setAttribute("__bm_tempid", guid);
	        var id = "[__bm_tempid='" + guid + "'] ";

	        // Query to select all
	        var newQuery = id + query.replace(",", "," + id);
	        var allElements = rootNode.querySelectorAll(newQuery);

		// Query to select descendant of other component
	        var removeQuery = id + "[bm-powered] " + query.replace(",", ", " + id + "[bm-powered] ");
	        var removeElements = rootNode.querySelectorAll(removeQuery);

		// Remove elements descendant of other component
	        var setAll = new Set(allElements);
	        var setRemove = new Set(removeElements);
	        setRemove.forEach(function (item) {
	            setAll.delete(item);
	        });

	        // Remove temp id
	        rootNode.removeAttribute("__bm_tempid");

	        return Array.from(setAll);

	    };

	// =============================================================================

	// =============================================================================
	//	Loader util class
	// =============================================================================

	var ClassUtil = function ClassUtil () {};

	ClassUtil.newComponent = function newComponent (superClass, settings, tagName, className)
	{

		className = ( className ? className : Util.getClassNameFromTagName(tagName) );

		// Define class
		var funcDef = "{ return Reflect.construct(superClass, [], this.constructor); }";
		var component = Function("superClass", "return function " + ClassUtil.__validateClassName(className) + "(){ " + funcDef + " }")(superClass);
		ClassUtil.inherit(component, superClass);

		settings = Object.assign({}, settings);
		settings.settings = ( settings.settings ? settings.settings : {} );
		settings["settings"]["name"] = className;
		component.prototype._getSettings = function() {
			return settings;
		};

		// Define tag
		if (tagName)
		{
			customElements.define(tagName.toLowerCase(), component);
		}

		return component;

	};

	// -------------------------------------------------------------------------

	/**
		 * Inherit the component in ES5 way.
		 *
		 * @param{Object}	subClass		Sub class.
		 * @param{Object}	superClass		Super class.
		 */
	ClassUtil.inherit = function inherit (subClass, superClass)
	{

		subClass.prototype = Object.create(superClass.prototype);
		subClass.prototype.constructor = subClass;
		subClass.prototype._super = superClass;
		Object.setPrototypeOf(subClass, superClass);

	};

	// -------------------------------------------------------------------------

	/**
		 * Instantiate a component.
		 *
		 * @param{String}	className		Class name.
		 * @param{Object}	options			Options for the component.
		 *
		 * @return  {Object}	Initaiated object.
		 */
	ClassUtil.createObject = function createObject (className)
	{
			var args = [], len = arguments.length - 1;
			while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];


		var c = ClassUtil.getClass(className);
		Util.assert(c, ("ClassUtil.createObject(): Class '" + className + "' is not defined."), ReferenceError);

		return  new (Function.prototype.bind.apply( c, [ null ].concat( args) ));

	};

	// -------------------------------------------------------------------------

	/**
		 * Get a class.
		 *
		 * @param{String}	className		Class name.
		 *
		 * @return  {Object}	Class object.
		 */
	ClassUtil.getClass = function getClass (className)
	{

		var ret;

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

	};

	// -------------------------------------------------------------------------

	/**
		 * Validate class name.
		 *
		 * @param{String}	className		Class name.
		 *
		 * @return  {String}	Class name when valid. Throws an exception when not valid.
		 */
	ClassUtil.__validateClassName = function __validateClassName (className)
	{

		var result = /^[a-zA-Z0-9\-\._]+$/.test(className);
		Util.assert(result, ("ClassUtil.__validateClassName(): Class name '" + className + "' is not valid."), TypeError);

		return className;

	};

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

	var Organizer = function Organizer () {};

	Organizer.globalInit = function globalInit (targetClass)
	{
	};

	// -------------------------------------------------------------------------

	/**
		 * Init.
		 *
		 * @param{Object}	conditions		Conditions.
		 * @param{Component}	component		Component.
		 * @param{Object}	settings		Settings.
		 *
		 * @return {Promise}	Promise.
		 */
	Organizer.init = function init (conditions, component, settings)
	{
	};

	// -------------------------------------------------------------------------

	/**
		 * Organize.
		 *
		 * @param{Object}	conditions		Conditions.
		 * @param{Component}	component		Component.
		 * @param{Object}	settings		Settings.
		 *
		 * @return {Promise}	Promise.
		 */
	Organizer.organize = function organize (conditions, component, settings)
	{
	};

	// -------------------------------------------------------------------------

	/**
		 * Unorganize.
		 *
		 * @param{Object}	conditions		Conditions.
		 * @param{Component}	component		Component.
		 * @param{Object}	settings		Settings.
		 *
		 * @return {Promise}	Promise.
		 */
	Organizer.unorganize = function unorganize (conditions, component, settings)
	{
	};

	// -------------------------------------------------------------------------

	/**
		 * Clear.
		 *
		 * @param{Component}	component		Component.
		 */
	Organizer.clear = function clear (component)
	{
	};

	// -------------------------------------------------------------------------

	/**
		 * Check if event is target.
		 *
		 * @param{String}	conditions		Event name.
		 * @param{Object}	organizerInfo	Organizer info.
		 * @param{Component}	component		Component.
		 *
		 * @return {Boolean}	True if it is target.
		 */
	Organizer.isTarget = function isTarget (conditions, organizerInfo, component)
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

	};

	// -------------------------------------------------------------------------

	/**
		 * Get editor for the organizer.
		 *
		 * @return {String}	Editor.
		 */
	Organizer.getEditor = function getEditor ()
	{

		return "";

	};

	// =============================================================================

	// =============================================================================
	//	Store class
	// =============================================================================

	var Store = function Store(options)
	{

		// Init vars
		this._filter;
		this._options = Object.assign({}, options);

		// Init
		this.items = Util.safeGet(this._options, "items");
		this.filter = Util.safeGet(this._options, "filter", function () { return true; } );
		this.merger = Util.safeGet(this._options, "merger", Util.deepMerge );

	};

	var prototypeAccessors = { items: { configurable: true },filter: { configurable: true },merger: { configurable: true } };

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	/**
		 * Items.
		 *
		 * @type{String}
		 */
	prototypeAccessors.items.get = function ()
	{

		return this.clone();

	};

	prototypeAccessors.items.set = function (value)
	{

		this._items = Object.assign({}, value);

	};

	// -------------------------------------------------------------------------

	/**
		 * Filter function.
		 *
		 * @type{Function}
		 */
	prototypeAccessors.filter.get = function ()
	{

		this._filter;

	};

	prototypeAccessors.filter.set = function (value)
	{

		Util.assert(typeof value === "function", ("Store.filter(setter): Filter is not a function. filter=" + value), TypeError);

		this._filter = value;

	};

	// -------------------------------------------------------------------------

	/**
		 * Merge function.
		 *
		 * @type{Function}
		 */
	prototypeAccessors.merger.get = function ()
	{

		this._merger;

	};

	prototypeAccessors.merger.set = function (value)
	{

		Util.assert(typeof value === "function", ("Store.merger(setter): Merger is not a function. filter=" + value), TypeError);

		this._merger = value;

	};

	// -------------------------------------------------------------------------
	//  Method
	// -------------------------------------------------------------------------

	/**
	     * Clear.
	     *
		 * @param{Object}	component		Component to attach.
		 * @param{Object}	options			Plugin options.
	     */
	Store.prototype.clear = function clear ()
	{

		this._items = {};

	};

	// -------------------------------------------------------------------------

	/**
	     * Clone contents as an object.
	     *
		 * @return  {Object}	Cloned items.
	     */
	Store.prototype.clone = function clone ()
	{

		return Util.deepClone({}, this._items);

	};

	// -------------------------------------------------------------------------

	/**
		 * Merge items.
		 *
		 * @param{Array/Object}newItems		Array/Object of Items to merge.
		 * @param{Function}	merger			Merge function.
		 */
	Store.prototype.merge = function merge (newItems, merger)
	{

		merger = merger || this._merger;
		var items = (Array.isArray(newItems) ? newItems: [newItems]);

		for (var i = 0; i < items.length; i++)
		{
			if (items[i] && typeof items[i] === "object")
			{
				merger(this._items, items[i]);
			}
		}

	};

	// -----------------------------------------------------------------------------

	/**
		 * Get a value from store. Return default value when specified key is not available.
		 *
		 * @param{String}	key				Key to get.
		 * @param{Object}	defaultValue	Value returned when key is not found.
		 *
		 * @return  {*}			Value.
		 */
	Store.prototype.get = function get (key, defaultValue)
	{

		return Util.safeGet(this._items, key, defaultValue);

	};

	// -----------------------------------------------------------------------------

	/**
		 * Set a value to the store. If key is empty, it sets the value to the root.
		 *
		 * @param{String}	key				Key to store.
		 * @param{Object}	value			Value to store.
		 */
	Store.prototype.set = function set (key, value, options)
	{

		Util.safeMerge(this._items, key, value);

	};

	// -------------------------------------------------------------------------

	/**
		 * Remove from the list.
		 *
		 * @param{String}	key				Key to store.
		 */
	Store.prototype.remove = function remove (key)
	{

		delete this._items[key];

	};

	// -----------------------------------------------------------------------------

	/**
		 * Check if the store has specified key.
		 *
		 * @param{String}	key				Key to check.
		 *
		 * @return{Boolean}	True:exists, False:not exists.
		 */
	Store.prototype.has = function has (key)
	{

		return Util.safeHas(this._items, key);

	};

	Object.defineProperties( Store.prototype, prototypeAccessors );

	// =============================================================================

	// =============================================================================
	//	Organizer store class
	// =============================================================================

	var OrganizerStore = /*@__PURE__*/(function (Store) {
		function OrganizerStore(options, chain)
		{

			Store.call(this, options, chain);

			this._targetWords = {};

		}

		if ( Store ) OrganizerStore.__proto__ = Store;
		OrganizerStore.prototype = Object.create( Store && Store.prototype );
		OrganizerStore.prototype.constructor = OrganizerStore;

		// -------------------------------------------------------------------------
		//  Method
		// -------------------------------------------------------------------------

		/**
		 * Set a value to store.
		 *
		 * @param	{String}		key					Key to store.
		 * @param	{Object}		value				Value to store.
		 */
		OrganizerStore.prototype.set = function set (key, value)
		{

			// Assert
			value = Object.assign({}, value);
			value["name"] = ( value["name"] ? value["name"] : key );
			value["targetWords"] = ( value["targetWords"] ? value["targetWords"] : [] );
			value["targetWords"] = ( Array.isArray(value["targetWords"]) ? value["targetWords"] : [value["targetWords"]] );
			value["targetEvents"] = ( value["targetEvents"] ? value["targetEvents"] : [] );
			value["targetEvents"] = ( Array.isArray(value["targetEvents"]) ? value["targetEvents"] : [value["targetEvents"]] );

			Store.prototype.set.call(this, key, value);

			// Global init
			value["object"].globalInit(value["targetClass"]);

			// Create target index
			for (var i = 0; i < value["targetWords"].length; i++)
			{
				this._targetWords[value["targetWords"][i]] = value;
			}

		};

		// -------------------------------------------------------------------------

		/**
		 * Get a merge function for the key.
		 *
		 * @param	{String}		key					Key.
		 *
		 * @return  {*}				Merge function.
		 */
		OrganizerStore.prototype.getMerger = function getMerger (key)
		{

			return Util.safeGet(this._targetWords, key + ".object.merger", Util.deepmerge);

		};
		// -------------------------------------------------------------------------

		/**
		 * Get an organizer by target words.
		 *
		 * @param	{String}		key					Key.
		 *
		 * @return  {*}				Organizer.
		 */
		OrganizerStore.prototype.getOrganizerInfoByTargetWords = function getOrganizerInfoByTargetWords (target)
		{

			return Util.safeGet(this._targetWords, target);

		};

		return OrganizerStore;
	}(Store));

	// =============================================================================

	// =============================================================================
	//	Organizer organizer class
	// =============================================================================

	var OrganizerOrganizer = /*@__PURE__*/(function (Organizer) {
		function OrganizerOrganizer () {
			Organizer.apply(this, arguments);
		}

		if ( Organizer ) OrganizerOrganizer.__proto__ = Organizer;
		OrganizerOrganizer.prototype = Object.create( Organizer && Organizer.prototype );
		OrganizerOrganizer.prototype.constructor = OrganizerOrganizer;

		OrganizerOrganizer.globalInit = function globalInit (targetClass)
		{

			// Add properties
			Object.defineProperty(targetClass.prototype, "organizers", {
				get: function get() { return this._organizers; },
			});

			// Add methods
			targetClass.prototype.addOrganizers = function(settings) { return OrganizerOrganizer._addOrganizers(this, settings); };
			targetClass.prototype.initOrganizers = function(settings) { return OrganizerOrganizer._initOrganizers(this, settings); };
			targetClass.prototype.callOrganizers = function(condition, settings) { return OrganizerOrganizer._callOrganizers(this, condition, settings); };
			targetClass.prototype.clearOrganizers = function(condition, settings) { return OrganizerOrganizer._clearOrganizers(this, condition, settings); };

			// Init vars
			OrganizerOrganizer.__organizers = new OrganizerStore();
			Object.defineProperty(OrganizerOrganizer, "organizers", {
				get: function get() { return OrganizerOrganizer.__organizers; },
			});

		};

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
		OrganizerOrganizer.organize = function organize (conditions, component, settings)
		{

			return OrganizerOrganizer._addOrganizers(component, settings);

		};

		// -------------------------------------------------------------------------

		/**
		 * Clear.
		 *
		 * @param	{Component}		component			Component.
		 */
		OrganizerOrganizer.clear = function clear (component)
		{

			component._organizers = {};

		};

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
		OrganizerOrganizer.addTarget = function addTarget (organizerName, targetName, targets)
		{

			var organizer = OrganizerOrganizer.organizers.get(organizerName);

			var ret1 = Util.warn(organizer, ("Organizer not found. organizerName=" + organizerName));
			var ret2 = Util.warn(["targetEvents", "targetWords"].indexOf(targetName) > -1, ("Target name is invalid. targetName=" + targetName));

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

		};

		// ------------------------------------------------------------------------
		//  Protected
		// ------------------------------------------------------------------------

		OrganizerOrganizer._addOrganizers = function _addOrganizers (component, settings)
		{

			var targets = {};
			var chain = Promise.resolve();

			// List new organizers
			var organizers = settings["organizers"];
			if (organizers)
			{
				Object.keys(organizers).forEach(function (key) {
					if (
						Util.safeGet(organizers[key], "settings.attach") &&
						!component._organizers[key] &&
						OrganizerOrganizer.__organizers.get(key)
					)
					{
						targets[key] = OrganizerOrganizer.__organizers.items[key];
					}
				});
			}

			// List new organizers from settings keyword
			Object.keys(settings).forEach(function (key) {
				var organizerInfo = OrganizerOrganizer.__organizers.getOrganizerInfoByTargetWords(key);
				if (organizerInfo)
				{
					if (!component._organizers[organizerInfo.name])
					{
						targets[organizerInfo.name] = organizerInfo.object;
					}
				}
			});

			// Add and init new organizers
			OrganizerOrganizer._sortItems(targets).forEach(function (key) {
				chain = chain.then(function () {
					component._organizers[key] = Object.assign({}, OrganizerOrganizer.__organizers.items[key], Util.safeGet(settings, "organizers." + key));
					return component._organizers[key].object.init(component, settings);
				});
			});

			return chain;

		};

		// ------------------------------------------------------------------------

		/**
		 * Init organizers.
		 *
		 * @param	{Component}		component			Component.
		 * @param	{Object}		settings			Settings.
		 *
		 * @return 	{Promise}		Promise.
		 */
		OrganizerOrganizer._initOrganizers = function _initOrganizers (component, settings)
		{

			// Init
			component._organizers = {};

			// Add organizers
			return OrganizerOrganizer.organize("*", component, settings);

		};

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
		OrganizerOrganizer._callOrganizers = function _callOrganizers (component, conditions, settings)
		{

			var chain = Promise.resolve();

			OrganizerOrganizer._sortItems(component._organizers).forEach(function (key) {
				if (component._organizers[key].object.isTarget(conditions, component._organizers[key], component))
				{
					chain = chain.then(function () {
						return component._organizers[key].object.organize(conditions, component, settings);
					});
				}
			});

			return chain;

		};

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
		OrganizerOrganizer._clearOrganizers = function _clearOrganizers (component, conditions, settings)
		{

			var chain = Promise.resolve();

			OrganizerOrganizer._sortItems(component._organizers).forEach(function (key) {
				if (component._organizers[key].object.isTarget(conditions, component._organizers[key], component))
				{
					chain = chain.then(function () {
						return component._organizers[key].object.unorganize(conditions, component, settings);
					});
				}
			});

			return chain;

		};

		// ------------------------------------------------------------------------

		/**
		 * Sort item keys.
		 *
		 * @param	{Object}		observerInfo		Observer info.
		 *
		 * @return  {Array}			Sorted keys.
		 */
		OrganizerOrganizer._sortItems = function _sortItems (organizers)
		{

			return Object.keys(organizers).sort(function (a,b) {
				return organizers[a]["order"] - organizers[b]["order"];
			})

		};

		return OrganizerOrganizer;
	}(Organizer));

	// =============================================================================

	// =============================================================================
	//	Ajax util class
	// =============================================================================

	var AjaxUtil = function AjaxUtil () {};

	AjaxUtil.ajaxRequest = function ajaxRequest (options)
	{

		return new Promise(function (resolve, reject) {
			var url = Util.safeGet(options, "url");
			var method = Util.safeGet(options, "method");
			var data = Util.safeGet(options, "data", "");
			var headers = Util.safeGet(options, "headers");
			var xhrOptions = Util.safeGet(options, "options");

			var xhr = new XMLHttpRequest();
			xhr.open(method, url, true);

			// options
			if (xhrOptions)
			{
				Object.keys(xhrOptions).forEach(function (option) {
					xhr[option] = xhrOptions[option];
				});
			}

			// extra headers
			if (headers)
			{
				Object.keys(headers).forEach(function (header) {
					xhr.setRequestHeader(header, headers[header]);
				});
			}

			// callback (load)
			xhr.addEventListener("load", function () {
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
			xhr.addEventListener("error", function () {
				reject(xhr);
			});

			// send
			xhr.send(data);
		});

	};

	// -------------------------------------------------------------------------

	/**
		 * Load the javascript file.
		 *
		 * @param{string}	url				Javascript url.
		 *
		 * @return  {Promise}	Promise.
		 */
	AjaxUtil.loadScript = function loadScript (url) {

		return new Promise(function (resolve, reject) {
			var source = url;
			var script = document.createElement('script');
			var prior = document.getElementsByTagName('script')[0];
			script.async = 1;
			script.onload = script.onreadystatechange = function ( _, isAbort ) {
				if(isAbort || !script.readyState || /loaded|complete/.test(script.readyState) ) {
					script.onload = script.onreadystatechange = null;
					script = undefined;

					if(!isAbort) {
						resolve();
					}
				}
			};

			script.src = source;
			prior.parentNode.insertBefore(script, prior);
		});

	};

	// =============================================================================

	// =============================================================================
	//	Chainable store class
	// =============================================================================

	var ChainableStore = /*@__PURE__*/(function (Store) {
		function ChainableStore(options)
		{

			Store.call(this, options);

			// Init vars
			this.chain;

			// Chain
			var chain = Util.safeGet(this._options, "chain");
			if (chain)
			{
				this.chain(chain);
			}

		}

		if ( Store ) ChainableStore.__proto__ = Store;
		ChainableStore.prototype = Object.create( Store && Store.prototype );
		ChainableStore.prototype.constructor = ChainableStore;

		var prototypeAccessors = { items: { configurable: true },localItems: { configurable: true } };

		// -------------------------------------------------------------------------
		//  Setter/Getter
		// -------------------------------------------------------------------------

		/**
		 * Items (Override).
		 *
		 * @type	{Object}
		 */
		prototypeAccessors.items.get = function ()
		{

			var items;

			if (this._chain)
			{
				items = Util.deepClone(this._chain.clone(), this._items);
			}
			else
			{
				items = this.clone();
			}

			return items;

		};

		prototypeAccessors.items.set = function (value)
		{

			this._items = Object.assign({}, value);

		};

		// -------------------------------------------------------------------------

		/**
		 * Local items.
		 *
		 * @type	{Object}
		 */
		prototypeAccessors.localItems.get = function ()
		{

			return this.clone();

		};

		// -------------------------------------------------------------------------
		//  Method
		// -------------------------------------------------------------------------

		/**
	     * Clone contents as an object (Override).
	     *
		 * @return  {Object}		Cloned items.
	     */
		ChainableStore.prototype.clone = function clone ()
		{

			if (this._chain)
			{
				return Util.deepClone(this._chain.clone(), this._items);
			}
			else
			{
				return Store.prototype.clone.call(this);
			}

		};

		// -------------------------------------------------------------------------

		/**
	     * Chain another store.
	     *
		 * @param	{Object}		component			Component to attach.
		 * @param	{Object}		options				Plugin options.
	     */
		ChainableStore.prototype.chain = function chain (store)
		{

			Util.assert(store instanceof ChainableStore, "ChainableStore.chain(): \"store\" parameter must be a ChainableStore.", TypeError);

			this._chain = store;

		};

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
		ChainableStore.prototype.get = function get (key, defaultValue)
		{

			var result = defaultValue;

			if (this.has(key))
			{
				result = Store.prototype.get.call(this, key, defaultValue);
			}
			else if (this._chain)
			{
				result = this._chain.get(key, defaultValue);
			}

			return result;

		};

		// -------------------------------------------------------------------------

		/**
		 * Merge items.
		 *
		 * @param	{Array/Object}	newItems			Array/Object of Items to merge.
		 * @param	{Function}		merger				Merge function.
		 */
		ChainableStore.prototype.merge = function merge (newItems, merger)
		{

			if (this._options["writeThrough"])
			{
				this._chain.merge(newItems, merger);
			}
			else
			{
				Store.prototype.merge.call(this, newItems, merger);
			}

		};

		// -------------------------------------------------------------------------

		/**
		 * Set a value to the store. If key is empty, it sets the value to the root.
		 *
		 * @param	{String}		key					Key to store.
		 * @param	{Object}		value				Value to store.
		 */
		ChainableStore.prototype.set = function set (key, value, options)
		{

			if (Util.safeGet(options, "writeThrough", this._options["writeThrough"]))
			{
				this._chain.set(key, value, options);
			}
			else
			{
				Store.prototype.set.call(this, key, value);
			}

		};

		Object.defineProperties( ChainableStore.prototype, prototypeAccessors );

		return ChainableStore;
	}(Store));

	// =============================================================================

	// =============================================================================
	//	Setting organizer class
	// =============================================================================

	var SettingOrganizer = /*@__PURE__*/(function (Organizer) {
		function SettingOrganizer () {
			Organizer.apply(this, arguments);
		}

		if ( Organizer ) SettingOrganizer.__proto__ = Organizer;
		SettingOrganizer.prototype = Object.create( Organizer && Organizer.prototype );
		SettingOrganizer.prototype.constructor = SettingOrganizer;

		SettingOrganizer.globalInit = function globalInit (targetClass)
		{

			// Add properties
			Object.defineProperty(targetClass.prototype, "settings", {
				get: function get() { return this._settings; },
			});

			// Init vars
			SettingOrganizer.__globalSettings = new ChainableStore();
			Object.defineProperty(SettingOrganizer, "globalSettings", {
				get: function get() { return SettingOrganizer.__globalSettings; },
			});

		};

		// -------------------------------------------------------------------------

		/**
		 * Init.
		 *
		 * @param	{Component}		component			Component.
		 * @param	{Object}		settings			Settings.
		 *
		 * @return 	{Promise}		Promise.
		 */
		SettingOrganizer.init = function init (component, settings)
		{

			// Init vars
			component._settings = new ChainableStore({"items":settings});
			component._settings.merge(component._getSettings());

			// Overwrite name if specified
			var name = component._settings.get("settings.name");
			if (name)
			{
				component._name = name;
			}

			// Chain global settings
			if (component._settings.get("settings.useGlobalSettings"))
			{
				component._settings.chain(SettingOrganizer.globalSettings);
			}

		};

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
		SettingOrganizer.organize = function organize (conditions, component, settings)
		{

			return Promise.resolve().then(function () {
				// Load external settings
				return SettingOrganizer.__loadExternalSettings(component, "setting");
			}).then(function (extraSettings) {
				if (extraSettings)
				{
					component._settings.merge(extraSettings);
				}

				// Load settings from attributes
				SettingOrganizer.__loadAttrSettings(component);
			});

		};

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
		SettingOrganizer.isTarget = function isTarget (conditions, organizerInfo, component)
		{

			if (conditions === "beforeStart")
			{
				return true;
			}
			else
			{
				return false;
			}

		};

		// -------------------------------------------------------------------------

		/**
		 * Load setting file.
		 *
		 * @param	{String}		settingName			Setting name.
		 * @param	{String}		path				Path to setting file.
		 * @param	{String}		path				Type of setting file.
		 *
		 * @return  {Promise}		Promise.
		 */
		SettingOrganizer.loadSetting = function loadSetting (component, settingName, path, type)
		{

			type = type || "js";
			var url = Util.concatPath([path, settingName + "." + type]);
			var settings;

			console.debug(("SettingOrganizer.loadSetting(): Loading settings. name=" + (component.name) + ", url=" + url));

			return AjaxUtil.ajaxRequest({url:url, method:"GET"}).then(function (xhr) {
				console.debug(("SettingOrganizer.loadSetting(): Loaded settings. name=" + (component.name) + ", url=" + url));

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
							throw new SyntaxError(("Illegal json string. url=" + url + ", message=" + (e.message)));
						}
						else
						{
							throw e;
						}
					}
					break;
				case "js":
				default:
					settings = Function('"use strict";return (' + xhr.responseText + ')').call(component);
					break;
				}

				return settings;
			});

		};

		// -------------------------------------------------------------------------
		//  Privates
		// -------------------------------------------------------------------------

		/**
		 * Load an external setting file.
		 *
		 * @param	{Component}		component			Component.
		 * @param	{String}		settingName			Setting name.
		 *
		 * @return  {Promise}		Promise.
		 */
		SettingOrganizer.__loadExternalSettings = function __loadExternalSettings (component, settingName)
		{

			var name, path;

			if (component.hasAttribute("bm-" + settingName + "ref"))
			{
				var arr = Util.getFilenameAndPathFromUrl(component.getAttribute("bm-" + settingName + "ref"));
				path = arr[0];
				name = arr[1].slice(0, -3);
			}
			else
			{
				path = ( component.hasAttribute("bm-" + settingName + "path") ? component.getAttribute("bm-" + settingName + "path") : "" );
				name = ( component.hasAttribute("bm-" + settingName + "name") ? component.getAttribute("bm-" + settingName + "name") : "" );
				if (path && !name)
				{
					name = "settings";
				}
			}

			if (name || path)
			{
				return SettingOrganizer.loadSetting(component, name, path);
			}

		};

		// -----------------------------------------------------------------------------

		/**
		 * Get settings from element's attribute.
		 *
		 * @param	{Component}		component			Component.
		 */
		SettingOrganizer.__loadAttrSettings = function __loadAttrSettings (component)
		{

			// Get path from  bm-autoload
			if (component.getAttribute("bm-autoload"))
			{
				var arr = Util.getFilenameAndPathFromUrl(component.getAttribute("bm-autoload"));
				component._settings.set("system.appBaseUrl", "");
				component._settings.set("system.templatePath", arr[0]);
				component._settings.set("system.componentPath", arr[0]);
				component._settings.set("settings.path", "");
			}

			// Get path from attribute
			if (component.hasAttribute("bm-path"))
			{
				component._settings.set("settings.path", component.getAttribute("bm-path"));
			}

			// Get settings from the attribute

			var dataSettings = ( document.querySelector(component._settings.get("settings.rootNode")) ?
				document.querySelector(component._settings.get("settings.rootNode")).getAttribute("bm-settings") :
				component.getAttribute("bm-settings")
			);

			if (dataSettings)
			{
				var settings = {"settings": JSON.parse(dataSettings)};
				component._settings.merge(settings);
			}

		};

		return SettingOrganizer;
	}(Organizer));

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

		if (!this.isInitialized())
		{
			this.start();
		}

	};

	// -----------------------------------------------------------------------------

	/**
	 * Disconnected callback.
	 */
	Component.prototype.disconnectedCallback = function()
	{

		if (this.settings.get("settings.autoStop"))
		{
			this.stop();
		}

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
		get: function get()
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
		get: function get()
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
		get: function get()
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
		var this$1$1 = this;


		// Defaults
		var defaults = {
			"settings": {
				"autoSetup":			true,
				"autoPostStart":		true,
				"autoRefreshOnStart":	false,
				"autoStop":				true,
				"triggerAppendOnStart": true,
				"useGlobalSettings":	true,
			},
			"organizers": {
				"OrganizerOrganizer":	{"settings":{"attach":true}},
				"SettingOrganizer":		{"settings":{"attach":true}},
				"StateOrganizer":		{"settings":{"attach":true}},
				"EventOrganizer":		{"settings":{"attach":true}},
				"AutoloadOrganizer":	{"settings":{"attach":true}},
			}
		};
		settings = ( settings ? BITSMIST.v1.Util.deepMerge(defaults, settings) : defaults );

		// Init vars
		this.setAttribute("bm-powered", "");
		this._uniqueId = new Date().getTime().toString(16) + Math.floor(100*Math.random()).toString(16);
		this._name = this.constructor.name;
		this._rootElement = Util.safeGet(settings, "settings.rootElement", this);

		return Promise.resolve().then(function () {
			return this$1$1._initStart(settings);
		}).then(function () {
			return this$1$1._preStart();
		}).then(function () {
			if (this$1$1.settings.get("settings.autoPostStart"))
			{
				return this$1$1._postStart();
			}
		}).then(function () {
			// Refresh
			if (this$1$1.settings.get("settings.autoRefreshOnStart"))
			{
				return this$1$1.refresh();
			}
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
		var this$1$1 = this;


		options = Object.assign({}, options);

		return Promise.resolve().then(function () {
			console.debug(("Component.stop(): Stopping component. name=" + (this$1$1.name) + ", id=" + (this$1$1.id)));
			return this$1$1.changeState("stopping");
		}).then(function () {
			return this$1$1.trigger("beforeStop", options);
		}).then(function () {
			return this$1$1.trigger("doStop", options);
		}).then(function () {
			return this$1$1.trigger("afterStop", options);
		}).then(function () {
			console.debug(("Component.stop(): Stopped component. name=" + (this$1$1.name) + ", id=" + (this$1$1.id)));
			return this$1$1.changeState("stopped");
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
		var this$1$1 = this;


		options = Object.assign({}, options);

		return Promise.resolve().then(function () {
			console.debug(("Component.setup(): Setting up component. name=" + (this$1$1.name) + ", state=" + (this$1$1.state) + ", id=" + (this$1$1.id)));
			return this$1$1.trigger("beforeSetup", options);
		}).then(function () {
			return this$1$1.trigger("doSetup", options);
		}).then(function () {
			return this$1$1.trigger("afterSetup", options);
		}).then(function () {
			console.debug(("Component.setup(): Set up component. name=" + (this$1$1.name) + ", state=" + (this$1$1.state) + ", id=" + (this$1$1.id)));
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
		var this$1$1 = this;


		options = Object.assign({}, options);

		return Promise.resolve().then(function () {
			console.debug(("Component.refresh(): Refreshing component. name=" + (this$1$1.name)));
			return this$1$1.trigger("beforeRefresh", options);
		}).then(function () {
			return this$1$1.trigger("doTarget", options);
		}).then(function () {
			// Fetch
			if (Util.safeGet(options, "autoFetch", this$1$1.settings.get("settings.autoFetch")))
			{
				return this$1$1.fetch(options);
			}
		}).then(function () {
			return this$1$1.trigger("doRefresh", options);
		}).then(function () {
			return this$1$1.trigger("afterRefresh", options);
		}).then(function () {
			console.debug(("Component.refresh(): Refreshed component. name=" + (this$1$1.name)));
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
		var this$1$1 = this;


		options = Object.assign({}, options);

		return Promise.resolve().then(function () {
			console.debug(("Component.fetch(): Fetching data. name=" + (this$1$1.name)));
			return this$1$1.trigger("beforeFetch", options);
		}).then(function () {
			return this$1$1.callOrganizers("doFetch", options);
		}).then(function () {
			return this$1$1.trigger("doFetch", options);
		}).then(function () {
			return this$1$1.trigger("afterFetch", options);
		}).then(function () {
			console.debug(("Component.fetch(): Fetched data. name=" + (this$1$1.name)));
		});

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

	// -----------------------------------------------------------------------------

	/**
	 * Initialize start processing.
	 *
	 * @param	{Object}		settings			Settings.
	 *
	 * @return  {Promise}		Promise.
	 */
	Component.prototype._initStart = function(settings)
	{
		var this$1$1 = this;


		return Promise.resolve().then(function () {
			return this$1$1._injectSettings(settings);
		}).then(function (newSettings) {
			return SettingOrganizer.init(this$1$1, newSettings); // now settings are included in this.settings
		}).then(function () {
			return this$1$1.initOrganizers(this$1$1.settings.items);
		});

	};

	// -----------------------------------------------------------------------------

	/**
	 * Pre start processing.
	 *
	 * @return  {Promise}		Promise.
	 */
	Component.prototype._preStart = function()
	{
		var this$1$1 = this;


		return Promise.resolve().then(function () {
			console.debug(("Component.start(): Starting component. name=" + (this$1$1.name) + ", id=" + (this$1$1.id)));
			return this$1$1.changeState("starting");
		}).then(function () {
			return SettingOrganizer.organize("beforeStart", this$1$1, this$1$1.settings.items);
		}).then(function () {
			return this$1$1.addOrganizers(this$1$1.settings.items);
		}).then(function () {
			return this$1$1.callOrganizers("beforeStart", this$1$1.settings.items);
		}).then(function (newSettings) {
			return this$1$1.trigger("beforeStart");
		}).then(function () {
			var autoSetupOnStart = this$1$1.settings.get("settings.autoSetupOnStart");
			var autoSetup = this$1$1.settings.get("settings.autoSetup");
			if ( autoSetupOnStart || (autoSetupOnStart !== false && autoSetup) )
			{
				return this$1$1.setup(this$1$1.settings.items);
			}
		}).then(function () {
			var triggerAppendOnStart = this$1$1.settings.get("settings.triggerAppendOnStart");
			if (triggerAppendOnStart)
			{
				return Promise.resolve().then(function () {
					return this$1$1.callOrganizers("afterAppend", this$1$1.settings.items);
				}).then(function () {
					return this$1$1.trigger("afterAppend", this$1$1.settings.items);
				});
			}
		});

	};

	// -----------------------------------------------------------------------------

	/**
	 * Post start processing.
	 *
	 * @return  {Promise}		Promise.
	 */
	Component.prototype._postStart = function()
	{
		var this$1$1 = this;


		return Promise.resolve().then(function () {
			console.debug(("Component.start(): Started component. name=" + (this$1$1.name) + ", id=" + (this$1$1.id)));
			return this$1$1.changeState("started");
		}).then(function () {
			return this$1$1.callOrganizers("afterStart", this$1$1.settings.items);
		}).then(function () {
			return this$1$1.trigger("afterStart");
		});

	};

	// -----------------------------------------------------------------------------

	customElements.define("bm-component", Component);

	// =============================================================================

	// =============================================================================
	//	State organizer class
	// =============================================================================

	var StateOrganizer = /*@__PURE__*/(function (Organizer) {
		function StateOrganizer () {
			Organizer.apply(this, arguments);
		}

		if ( Organizer ) StateOrganizer.__proto__ = Organizer;
		StateOrganizer.prototype = Object.create( Organizer && Organizer.prototype );
		StateOrganizer.prototype.constructor = StateOrganizer;

		StateOrganizer.globalInit = function globalInit ()
		{

			// Add properties
			Object.defineProperty(Component.prototype, "state", {
				get: function get() { return this._state; },
				set: function set(value) { this._state = value; }
			});

			// Add methods
			Component.prototype.changeState= function(newState) { return StateOrganizer._changeState(this, newState); };
			Component.prototype.isInitialized = function() { return StateOrganizer._isInitialized(this); };
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

		};

		// -------------------------------------------------------------------------

		/**
		 * Init.
		 *
		 * @param	{Component}		component			Component.
		 * @param	{Object}		settings			Settings.
		 *
		 * @return 	{Promise}		Promise.
		 */
		StateOrganizer.init = function init (component, settings)
		{

			// Init vars
			component._state = "";
			component._suspends = {};

			// Load settings from attributes
			StateOrganizer.__loadAttrSettings(component);

		};

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
		StateOrganizer.organize = function organize (conditions, component, settings)
		{

			var promise = Promise.resolve();

			var waitFor = settings["waitFor"];
			if (waitFor)
			{
				if (waitFor[conditions])
				{
					promise = StateOrganizer._waitFor(component, waitFor[conditions], component.settings.get("system.waitforTimeout"));
				}
			}

			return promise;

		};

		// -------------------------------------------------------------------------

		/**
		 * Clear.
		 */
		StateOrganizer.clear = function clear ()
		{

			this.__waitingList.clear();

		};

		// -------------------------------------------------------------------------

		/**
		 * Suspend all components at a specified state.
		 *
		 * @param	{String}		state				Component state.
		 */
		StateOrganizer.globalSuspend = function globalSuspend (state)
		{

			StateOrganizer.__suspends[state] = StateOrganizer._createSuspendInfo(state);
			StateOrganizer.__suspends[state].state = "pending";

		};

		// -------------------------------------------------------------------------

		/**
		 * Resume all components at a specified state.
		 *
		 * @param	{String}		state				Component state.
		 */
		StateOrganizer.globalResume = function globalResume (state)
		{

			StateOrganizer.__suspends[state].resolve();
			StateOrganizer.__suspends[state].state = "resolved";

		};

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
		StateOrganizer._waitFor = function _waitFor (component, waitlist, options)
		{

			var promise;
			var timeout = ( options && options["timeout"] ? options["timeout"] : 10000 );
			var waiter = ( options && options["waiter"] ? options["waiter"] : component );
			var waitInfo = {"waiter":waiter, "waitlist":waitlist.slice()};

			if (StateOrganizer.__isAllReady(waitInfo))
			{
				promise = Promise.resolve();
			}
			else
			{
				// Create a promise that is resolved when waiting is completed.
				promise = new Promise(function (resolve, reject) {
					waitInfo["resolve"] = resolve;
					waitInfo["reject"] = reject;
					setTimeout(function () {
						var name = ( component && component.name ) || ( waitInfo["waiter"] && waitInfo["waiter"].tagName ) || "";
						reject(("StateOrganizer._waitFor(): Timed out after " + timeout + " milliseconds waiting for " + (StateOrganizer.__dumpWaitlist(waitlist)) + ", name=" + name + "."));
					}, timeout);
				});
				waitInfo["promise"] = promise;

				// Add to info to a waiting list.
				StateOrganizer.__addToWaitingList(waitInfo, component);
			}

			return promise;

		};

		// -------------------------------------------------------------------------

		/**
		 * Wait for a component to become specific state.
		 *
		 * @param	{Component}		component			Component.
		 * @param	{String}		state				state.
		 * @param	{integer}		timeout				Timeout in milliseconds.
		 *
		 * @return  {Promise}		Promise.
		 */
		StateOrganizer._waitForSingle = function _waitForSingle (component, state, timeout)
		{

			var componentInfo = StateOrganizer.__components.get(component.uniqueId);
			var waitlistItem = {"id":component.uniqueId, "state":state};

			if (StateOrganizer.__isReady(waitlistItem, componentInfo))
			{
				return Promise.resolve();
			}
			else
			{
				return StateOrganizer.waitFor(component, [waitlistItem], timeout);
			}

		};

		// -------------------------------------------------------------------------

		/**
		 * Wait for a component to become transitionable state.
		 *
		 * @param	{Object}		component			Component to register.
		 * @param	{String}		newState			New state.
		 *
		 * @return  {Promise}		Promise.
		 */
		/*
		static _waitForTransitionableState(component, newState)
		{

			if (newState === "starting")
			{
				return StateOrganizer._waitForSingle(component, "instantiated");
			}

			if (newState === "stopping")
			{
				return StateOrganizer._waitForSingle(component, "instantiated");
			}

			if (newState === "opening")
			{
				return StateOrganizer._waitForSingle(component, "started");
			}

			if (newState === "closing")
			{
				return StateOrganizer._waitForSingle(component, "opened");
			}

		}
		*/

		// -------------------------------------------------------------------------

		/**
		 * Change component state and check waiting list.
		 *
		 * @param	{Component}		component			Component to register.
		 * @param	{String}		state				Component state.
		 *
		 * @return  {Promise}		Promise.
		 */
		StateOrganizer._changeState = function _changeState (component, state)
		{

			Util.assert(StateOrganizer.__isTransitionable(component._state, state), ("StateOrganizer._changeState(): Illegal transition. name=" + (component.name) + ", fromState=" + (component._state) + ", toState=" + state + ", id=" + (component.id)), Error);

			component._state = state;
			StateOrganizer.__components.set(component.uniqueId, {"object":component, "state":state});

			StateOrganizer.__processWaitingList(component, state);

		};

		// -------------------------------------------------------------------------

		/**
		 * Suspend a component at a specified state.
		 *
		 * @param	{Component}		component			Component.
		 * @param	{String}		state				Component state.
		 */
		StateOrganizer._suspend = function _suspend (component, state)
		{

			component._suspends[state] = StateOrganizer._createSuspendInfo();
		 	component._suspends[state].state = "pending";

		};

		// -------------------------------------------------------------------------

		/**
		 * Resume a component at a specified state.
		 *
		 * @param	{Component}		component			Component.
		 * @param	{String}		state				Component state.
		 */
		StateOrganizer._resume = function _resume (component, state)
		{

		 	component._suspends[state].resolve();
		 	component._suspends[state].state = "resolved";

		};

		// -------------------------------------------------------------------------

		/**
		 * Pause a component if it is suspended.
		 *
		 * @param	{Component}		component			Component.
		 * @param	{String}		state				Component state.
		 *
		 * @return  {Promise}		Promise.
		 */
		StateOrganizer._pause = function _pause (component, state)
		{

			var ret = [];

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

		};

		// -------------------------------------------------------------------------

		/**
		 * Check if the componenet is initialized.
		 *
		 * @param	{Component}		component			Parent component.
		 *
		 * @return  {Boolean}		True when initialized.
		 */
		StateOrganizer._isInitialized = function _isInitialized (component)
		{

			var ret = false;

			if (component._state &&
				component._state !== "starting" &&
				component._state !== "stopping" &&
				component._state !== "stopped"
			)
			{
				ret = true;
			}

			return ret;

		};

		// -------------------------------------------------------------------------
		//  Privates
		// -------------------------------------------------------------------------

		/**
		 * Check whether changing curren state to new state is allowed.
		 *
		 * @param	{String}		currentState		Current state.
		 * @param	{String}		newState			New state.
		 *
		 * @return  {Promise}		Promise.
		 */
		StateOrganizer.__isTransitionable = function __isTransitionable (currentState, newState)
		{

			var ret = true;

			if (currentState && currentState.slice(-3) === "ing")
			{
				if(
					( currentState === "stopping" && newState !== "stopped") ||
					( currentState === "starting" && newState !== "started") ||
					( currentState === "opening" && (newState !== "opened" && newState !== "opening") ) ||
					( currentState === "closing" && newState !== "closed") ||
					( currentState === "stopping" && (newState !== "stopped" && newState !== "closing") )
				)
				{
					ret = false;
				}
			}

			return ret;

		};

		// -------------------------------------------------------------------------

		/**
		 * Check wait list and resolve() if components are ready.
		 */
		StateOrganizer.__processWaitingList = function __processWaitingList (component, state)
		{

			// Process name index
			var names = StateOrganizer.__waitingListIndexName.get(component.name + "." + state);
			if (names && names.length > 0)
			{
				StateOrganizer.__processIndex(names);
			}

			// Process ID index
			var ids = StateOrganizer.__waitingListIndexId.get(component.uniqueId + "." + state);
			if (ids && ids.length > 0)
			{
				StateOrganizer.__processIndex(ids);
			}

			// Process non indexables
			var list = StateOrganizer.__waitingListIndexNone.get("none");
			if (list && list.length > 0)
			{
				StateOrganizer.__processIndex(list);
			}

		};

		// -------------------------------------------------------------------------

		/**
		 * Process waiting list index.
		 *
		 * @param	{Array}			list				List of indexed waiting list id.
		 */
		StateOrganizer.__processIndex = function __processIndex (list)
		{

			var removeList = [];

			for (var i = 0; i < list.length; i++)
			{
				var id = list[i];
				StateOrganizer.__waitingList.get(id);

				if (StateOrganizer.__isAllReady(StateOrganizer.__waitingList.get(id)))
				{
					// Remove from waiting list
					StateOrganizer.__waitingList.get(id).resolve();
					StateOrganizer.__waitingList.remove(id);

					// Add to remove list
					removeList.push(id);
				}
			}

			// Remove from index;
			for (var i$1 = removeList.length - 1; i$1 >= 0; i$1--)
			{
				StateOrganizer.__removeFromIndex(list, removeList[i$1]);
			}

		};

		// -------------------------------------------------------------------------

		/**
		 * Add wait info to the waiting list.
		 *
		 * @param	{Object}		waitInfo			Wait info.
		 * @param	{Component}		component			Component.
		 *
		 * @return  {Promise}		Promise.
		 */
		//static __addToWaitingList(waitInfo, component)
		StateOrganizer.__addToWaitingList = function __addToWaitingList (waitInfo)
		{

			// Add wait info to the waiting list.
			var id = new Date().getTime().toString(16) + Math.floor(100*Math.random()).toString(16);
			StateOrganizer.__waitingList.set(id, waitInfo);

			// Create index for faster processing
			var waitlist = waitInfo["waitlist"];
			for (var i = 0; i < waitlist.length; i++)
			{
				// Set default state when not specified
				waitlist[i]["state"] = waitlist[i]["state"] || "started";

				// Index for component id + state
				if (waitlist[i].id)
				{
					StateOrganizer.__addToIndex(StateOrganizer.__waitingListIndexId, waitlist[i].id+ "." + waitlist[i].state, id);
				}
				// Index for component name + state
				else if (waitlist[i].name)
				{
					StateOrganizer.__addToIndex(StateOrganizer.__waitingListIndexName, waitlist[i].name + "." + waitlist[i].state, id);
				}
				// Not indexable
				else
				{
					StateOrganizer.__addToIndex(StateOrganizer.__waitingListIndexNone, "none", id);
				}
			}

		};

		// -------------------------------------------------------------------------

		/**
		 * Add id to a waiting list index.
		 *
		 * @param	{Map}			index				Waiting list index.
		 * @param	{String}		key					Index key.
		 * @param	{String}		id					Waiting list id.
		 */
		StateOrganizer.__addToIndex = function __addToIndex (index, key, id)
		{

			var list = index.get(key);
			if (!list)
			{
				list = [];
				index.set(key, list);
			}

			if (list.indexOf(id) === -1)
			{
				list.push(id);
			}

		};

		// -------------------------------------------------------------------------

		/**
		 * Remove id from a waiting list index.
		 *
		 * @param	{Array}			list				List of ids.
		 * @param	{String}		id					Waiting list id.
		 */
		StateOrganizer.__removeFromIndex = function __removeFromIndex (list, id)
		{

			var index = list.indexOf(id);
			if (index > -1)
			{
				list.splice(index, 1);
			}

		};

		// -------------------------------------------------------------------------

		/**
		 * Get component info from wait list item.
		 *
		 * @param	{Object}		waitlistItem		Wait list item.
		 *
		 * @return  {Boolean}		True if ready.
		 */
		StateOrganizer.__getComponentInfo = function __getComponentInfo (waitlistItem)
		{

			var componentInfo;

			if (waitlistItem["id"])
			{
				componentInfo = StateOrganizer.__components.get(waitlistItem["id"]);
			}
			else if (waitlistItem["name"])
			{
				Object.keys(StateOrganizer.__components.items).forEach(function (key) {
					if (waitlistItem["name"] === StateOrganizer.__components.get(key).object.name)
					{
						componentInfo = StateOrganizer.__components.get(key);
					}
				});
			}
			else if (waitlistItem["rootNode"])
			{
				var element = document.querySelector(waitlistItem["rootNode"]);
				if (element && element.uniqueId)
				{
					componentInfo = StateOrganizer.__components.get(element.uniqueId);
				}
			}
			else if (waitlistItem["object"])
			{
				var element$1 = waitlistItem["object"];
				if (element$1.uniqueId)
				{
					componentInfo = StateOrganizer.__components.get(element$1.uniqueId);
				}
			}

			return componentInfo;

		};

		// -------------------------------------------------------------------------

		/**
		 * Check if all components are ready.
		 *
		 * @param	{Object}		waitInfo			Wait info.
		 *
		 * @return  {Boolean}		True if ready.
		 */
		StateOrganizer.__isAllReady = function __isAllReady (waitInfo)
		{

			var result = true;
			var waitlist = waitInfo["waitlist"];

			for (var i = 0; i < waitlist.length; i++)
			{
				var match = false;
				var componentInfo = this.__getComponentInfo(waitlist[i]);
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

		};

		// -------------------------------------------------------------------------

		/**
		 * Check if a component is ready.
		 *
		 * @param	{Object}		waitlistItem		Wait list item.
		 * @param	{Object}		componentInfo		Registered component info.
		 *
		 * @return  {Boolean}		True if ready.
		 */
		StateOrganizer.__isReady = function __isReady (waitlistItem, componentInfo)
		{

			// Check component
			var isMatch = StateOrganizer.__isComponentMatch(componentInfo, waitlistItem);

			// Check state
			if (isMatch)
			{
				isMatch = StateOrganizer.__isStateMatch(componentInfo["state"], waitlistItem["state"]);
			}

			return isMatch;

		};

		// -------------------------------------------------------------------------

		/**
		 * Check if component match.
		 *
		 * @param	{Object}		componentInfo		Registered component info.
		 * @param	{Object}		waitlistItem		Wait list item.
		 *
		 * @return  {Boolean}		True if match.
		 */
		StateOrganizer.__isComponentMatch = function __isComponentMatch (componentInfo, waitlistItem)
		{

			var isMatch = true;

			// check instance
			if (waitlistItem["component"] && componentInfo["object"] !== waitlistItem["component"])
			{
				isMatch = false;
			}

			// check name
			if (waitlistItem["name"] && componentInfo["object"].name !== waitlistItem["name"])
			{
				isMatch = false;
			}

			// check id
			if (waitlistItem["id"] && componentInfo["object"].uniqueId !== waitlistItem["id"])
			{
				isMatch = false;
			}

			// check node
			if (waitlistItem["rootNode"]  && !document.querySelector(waitlistItem["rootNode"]))
			{
				isMatch = false;
			}

			return isMatch;

		};

		// -------------------------------------------------------------------------

		/**
		 * Check if state match.
		 *
		 * @param	{String}		currentState		Current state.
		 * @param	{String}		expectedState		Expected state.
		 *
		 * @return  {Boolean}		True if match.
		 */
		StateOrganizer.__isStateMatch = function __isStateMatch (currentState, expectedState)
		{

			expectedState = expectedState || "started"; // Default is "started"
			var isMatch = true;

			switch (expectedState)
			{
				case "started":
					if (
						currentState !== "opening" &&
						currentState !== "opened" &&
						currentState !== "closing" &&
						currentState !== "closed" &&
						currentState !== "started"
					)
					{
						isMatch = false;
					}
					break;
				default:
					if (currentState !== expectedState)
					{
						isMatch = false;
					}
					break;
			}

			return isMatch;

		};

		// -----------------------------------------------------------------------------

		/**
		 * Get settings from element's attribute.
		 *
		 * @param	{Component}		component			Component.
		 */
		StateOrganizer.__loadAttrSettings = function __loadAttrSettings (component)
		{

			// Get waitFor from attribute

			if (component.hasAttribute("bm-waitfor"))
			{
				var waitInfo = {"name":component.getAttribute("bm-waitfor"), "state":"started"};
				component.settings.merge({"waitFor": [waitInfo]});
			}

			if (component.hasAttribute("bm-waitfornode"))
			{
				var waitInfo$1 = {"rootNode":component.getAttribute("bm-waitfornode"), "state":"started"};
				component.settings.merge({"waitFor": [waitInfo$1]});
			}

		};

		// -----------------------------------------------------------------------------

		/**
		 * Dump wait list as string.
		 *
		 * @param	{Array}			Wait list.
		 *
		 * @return  {String}		Wait list string.
		 */
		StateOrganizer.__dumpWaitlist = function __dumpWaitlist (waitlist)
		{

			var result = "";

			for (var i = 0; i < waitlist.length; i++)
			{
				var id = ( waitlist[i].id ? "id:" + waitlist[i].id + "," : "" );
				var name = ( waitlist[i].name ? "name:" + waitlist[i].name + "," : "" );
				var object = ( waitlist[i].object ? "element:" + waitlist[i].object.tagName + "," : "" );
				var node = (waitlist[i].rootNode ? "node:" + waitlist[i].rootNode + "," : "" );
				var state = (waitlist[i].state ? "state:" + waitlist[i].state: "" );
				result += "\n\t{" + id + name + object + node + state + "},";
			}

			return "[" + result + "\n]";

		};

		// -------------------------------------------------------------------------

		/**
		 * Create a suspend info object.
		 *
		 * @return  {Object}		Suspend info.
		 */
		StateOrganizer._createSuspendInfo = function _createSuspendInfo ()
		{

			var suspendInfo = {};

			var promise = new Promise(function (resolve, reject) {
				suspendInfo["resolve"] = resolve;
				suspendInfo["reject"] = reject;
				suspendInfo["state"] = "pending";
			});
			suspendInfo["promise"] = promise;

			return suspendInfo;

		};

		return StateOrganizer;
	}(Organizer));

	// =============================================================================

	// =============================================================================
	//	Pad class
	// =============================================================================

	// -----------------------------------------------------------------------------
	//  Constructor
	// -----------------------------------------------------------------------------

	/**
	 * Constructor.
	 */
	function Pad()
	{

		// super()
		return Reflect.construct(Component, [], this.constructor);

	}

	ClassUtil.inherit(Pad, Component);

	// -----------------------------------------------------------------------------
	//  Setter/Getter
	// -----------------------------------------------------------------------------

	/**
	 * Component name.
	 *
	 * @type	{String}
	 */
	Object.defineProperty(Component.prototype, 'modalResult', {
		get: function get()
		{
			return this._modalResult;
		}
	});

	// -----------------------------------------------------------------------------
	//  Methods
	// -----------------------------------------------------------------------------

	/**
	 * Start pad.
	 *
	 * @param	{Object}		settings			Settings.
	 *
	 * @return  {Promise}		Promise.
	 */
	Pad.prototype.start = function(settings)
	{
		var this$1$1 = this;


		// Defaults
		var defaults = {
			"settings": {
				"autoClose":			true,
				"autoFetch":			true,
				"autoFill":				true,
				"autoOpen":				true,
				"autoRefresh":			true,
				"autoRefreshOnStart":	false,
				"autoSetupOnStart":		false,
				"autoPostStart":		false,
				"triggerAppendOnStart":	false,
			},
			"organizers":{
				"AutoloadOrganizer":	{"settings":{"attach":true}},
				"TemplateOrganizer":	{"settings":{"attach":true}},
			}
		};
		settings = ( settings ? BITSMIST.v1.Util.deepMerge(defaults, settings) : defaults );

		return Promise.resolve().then(function () {
			// super()
			return Component.prototype.start.call(this$1$1, settings);
		}).then(function () {
			return this$1$1.switchTemplate(this$1$1.settings.get("settings.templateName"));
		}).then(function () {
			return this$1$1._postStart();
		}).then(function () {
			// Open
			if (this$1$1.settings.get("settings.autoOpen"))
			{
				return this$1$1.open();
			}
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
	Pad.prototype.switchTemplate = function(templateName, options)
	{
		var this$1$1 = this;


		options = Object.assign({}, options);

		if (this.isActiveTemplate(templateName))
		{
			return Promise.resolve();
		}

		return Promise.resolve().then(function () {
			console.debug(("Pad.switchTemplate(): Switching template. name=" + (this$1$1.name) + ", templateName=" + templateName + ", id=" + (this$1$1.id)));
			return this$1$1.addTemplate(templateName);
		}).then(function () {
			return this$1$1.applyTemplate(templateName);
		}).then(function () {
			return this$1$1.callOrganizers("afterAppend", this$1$1.settings.items);
		}).then(function () {
			return this$1$1.trigger("afterAppend", options);
		}).then(function () {
			console.debug(("Pad.switchTemplate(): Switched template. name=" + (this$1$1.name) + ", templateName=" + templateName + ", id=" + (this$1$1.id)));
		});

	};

	// -----------------------------------------------------------------------------

	/**
	 * Open pad.
	 *
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	Pad.prototype.open = function(options)
	{
		var this$1$1 = this;


		options = Object.assign({}, options);

		return Promise.resolve().then(function () {
			console.debug(("Pad.open(): Opening pad. name=" + (this$1$1.name) + ", id=" + (this$1$1.id)));
			return this$1$1.changeState("opening");
		}).then(function () {
			return this$1$1.trigger("beforeOpen", options);
		}).then(function () {
			// Hide conditional elements
			this$1$1.hideConditionalElements();

			// Setup
			var autoSetupOnOpen = Util.safeGet(options, "autoSetupOnOpen", this$1$1.settings.get("settings.autoSetupOnOpen"));
			var autoSetup = Util.safeGet(options, "autoSetupOnOpen", this$1$1.settings.get("settings.autoSetup"));
			if ( autoSetupOnOpen || (autoSetupOnOpen !== false && autoSetup) )
			{
				return this$1$1.setup(options);
			}
		}).then(function () {
			// Refresh
			if (Util.safeGet(options, "autoRefresh", this$1$1.settings.get("settings.autoRefresh")))
			{
				return this$1$1.refresh(options);
			}
		}).then(function () {
			return this$1$1.trigger("doOpen", options);
		}).then(function () {
			// Auto focus
			var autoFocus = this$1$1.settings.get("settings.autoFocus");
			if (autoFocus)
			{
				var target = ( autoFocus === true ? this$1$1 : this$1$1.querySelector(autoFocus) );
				if (target)
				{
					target.focus();
				}
			}
		}).then(function () {
			return this$1$1.trigger("afterOpen", options);
		}).then(function () {
			console.debug(("Pad.open(): Opened pad. name=" + (this$1$1.name) + ", id=" + (this$1$1.id)));
			return this$1$1.changeState("opened");
		});

	};

	// -----------------------------------------------------------------------------

	/**
	 * Open pad modally.
	 *
	 * @param	{array}			options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	Pad.prototype.openModal = function(options)
	{
		var this$1$1 = this;


		console.debug(("Pad.openModal(): Opening pad modally. name=" + (this.name) + ", id=" + (this.id)));

		return new Promise(function (resolve, reject) {
			this$1$1._isModal = true;
			this$1$1._modalResult = {"result":false};
			this$1$1._modalPromise = { "resolve": resolve, "reject": reject };
			this$1$1.open(options);
		});

	};

	// -----------------------------------------------------------------------------

	/**
	 * Close pad.
	 *
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	Pad.prototype.close = function(options)
	{
		var this$1$1 = this;


		options = Object.assign({}, options);

		return Promise.resolve().then(function () {
			console.debug(("Pad.close(): Closing pad. name=" + (this$1$1.name) + ", id=" + (this$1$1.id)));
			return this$1$1.changeState("closing");
		}).then(function () {
			return this$1$1.trigger("beforeClose", options);
		}).then(function () {
			return this$1$1.trigger("doClose", options);
		}).then(function () {
			return this$1$1.trigger("afterClose", options);
		}).then(function () {
			if (this$1$1._isModal)
			{
				this$1$1._modalPromise.resolve(this$1$1._modalResult);
			}
		}).then(function () {
			console.debug(("Pad.close(): Closed pad. name=" + (this$1$1.name) + ", id=" + (this$1$1.id)));
			return this$1$1.changeState("closed");
		});

	};

	// -----------------------------------------------------------------------------

	/**
	 * Refresh pad.
	 *
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	Pad.prototype.refresh = function(options)
	{
		var this$1$1 = this;


		options = Object.assign({}, options);

		return Promise.resolve().then(function () {
			console.debug(("Pad.refresh(): Refreshing pad. name=" + (this$1$1.name) + ", id=" + (this$1$1.id)));
			return this$1$1.trigger("beforeRefresh", options);
		}).then(function () {
			return this$1$1.trigger("doTarget", options);
		}).then(function () {
			// Fetch
			if (Util.safeGet(options, "autoFetch", this$1$1.settings.get("settings.autoFetch")))
			{
				return this$1$1.fetch(options);
			}
		}).then(function () {
			// Show condtional elements
			this$1$1.showConditionalElements(this$1$1.item);
		}).then(function () {
			// Fill
			if (Util.safeGet(options, "autoFill", this$1$1.settings.get("settings.autoFill")))
			{
				return this$1$1.fill(options);
			}
		}).then(function () {
			return this$1$1.trigger("doRefresh", options);
		}).then(function () {
			return this$1$1.trigger("afterRefresh", options);
		}).then(function () {
			console.debug(("Pad.refresh(): Refreshed pad. name=" + (this$1$1.name) + ", id=" + (this$1$1.id)));
		});

	};

	// -----------------------------------------------------------------------------

	/**
	 * Fill.
	 *
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	Pad.prototype.fill = function(options)
	{
	};

	// -----------------------------------------------------------------------------

	/**
	 * Clear pad.
	 *
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	Pad.prototype.clear = function(options)
	{
	};

	// -----------------------------------------------------------------------------

	customElements.define("bm-pad", Pad);

	// =============================================================================

	// =============================================================================
	//	Template organizer class
	// =============================================================================

	var TemplateOrganizer = /*@__PURE__*/(function (Organizer) {
		function TemplateOrganizer () {
			Organizer.apply(this, arguments);
		}

		if ( Organizer ) TemplateOrganizer.__proto__ = Organizer;
		TemplateOrganizer.prototype = Object.create( Organizer && Organizer.prototype );
		TemplateOrganizer.prototype.constructor = TemplateOrganizer;

		TemplateOrganizer.globalInit = function globalInit ()
		{

			// Add properties
			Object.defineProperty(Pad.prototype, 'templates', { get: function get() { return this._templates; }, });
			Object.defineProperty(Pad.prototype, 'activeTemplateName', { get: function get() { return this._activeTemplateName; }, set: function set(value) { this._activeTemplateName = value; } });

			// Add methods
			Pad.prototype.addTemplate = function(templateName, options) { return TemplateOrganizer._addTemplate(this, templateName, options); };
			Pad.prototype.applyTemplate = function(templateName) { return TemplateOrganizer._applyTemplate(this, templateName); };
			Pad.prototype.cloneTemplate = function(templateName) { return TemplateOrganizer._clone(this, templateName); };
			Pad.prototype.isActiveTemplate = function(templateName) { return TemplateOrganizer._isActiveTemplate(this, templateName); };
			Pad.prototype.showConditionalElements = function(item) { return TemplateOrganizer._showConditionalElements(this, item); };
			Pad.prototype.hideConditionalElements = function() { return TemplateOrganizer._hideConditionalElements(this); };

		};

		// -------------------------------------------------------------------------

		/**
		 * Init.
		 *
		 * @param	{Component}		component			Component.
		 * @param	{Object}		settings			Settings.
		 *
		 * @return 	{Promise}		Promise.
		 */
		TemplateOrganizer.init = function init (component, setttings)
		{

			// Init vars
			component._templates = {};
			component._activeTemplateName = "";

			// Set defaults if not set already
			component.settings.set("settings.templateName", component.settings.get("settings.templateName", component.tagName.toLowerCase()));

			// Load settings from attributes
			TemplateOrganizer.__loadAttrSettings(component);

		};

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
		TemplateOrganizer.organize = function organize (conditions, component, settings)
		{

			var promises = [];
			var templates = settings["templates"];
			if (templates)
			{
				Object.keys(templates).forEach(function (templateName) {
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

		};

		// -------------------------------------------------------------------------

		/**
		 * Clear.
		 *
		 * @param	{Component}		component			Component.
		 */
		TemplateOrganizer.clear = function clear (component)
		{

			component._templates = {};

		};

		// -------------------------------------------------------------------------
		//  Protected
		// -------------------------------------------------------------------------

		/**
		 * Check if the template is active.
		 *
		 * @param	{Component}		component			Parent component.
		 * @param	{String}		templateName		Template name.
		 *
		 * @return  {Boolean}		True when active.
		 */
		TemplateOrganizer._isActiveTemplate = function _isActiveTemplate (component, templateName)
		{

			var ret = false;

			if (component._activeTemplateName === templateName)
			{
				ret = true;
			}

			return ret;

		};

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
		TemplateOrganizer._addTemplate = function _addTemplate (component, templateName, options)
		{

			var templateInfo = component._templates[templateName] || TemplateOrganizer.__createTemplateInfo(component, templateName);

			if (templateInfo["isLoaded"])
			//if (templateInfo["isLoaded"] && options && !options["forceLoad"])
			{
				console.debug(("TemplateOrganizer._addTemplate(): Template already loaded. name=" + (component.name) + ", templateName=" + templateName));
				return Promise.resolve();
			}

			return TemplateOrganizer.__getTemplate(component, component.settings.get("templates." + templateName, {}), templateInfo);

		};

		// -------------------------------------------------------------------------

		/**
		 * Apply template.
		 *
		 * @param	{Component}		component			Parent component.
		 * @param	{String}		templateName		Template name.
		 */
		TemplateOrganizer._applyTemplate = function _applyTemplate (component, templateName)
		{

			if (component._activeTemplateName === templateName)
			{
				console.debug(("TemplateOrganizer._applyTemplate(): Template already applied. name=" + (component.name) + ", templateName=" + templateName));
				return Promise.resolve();
			}

			var templateInfo = component._templates[templateName];

			Util.assert(templateInfo,("TemplateOrganizer._applyTemplate(): Template not loaded. name=" + (component.name) + ", templateName=" + templateName), ReferenceError);

			if (templateInfo["node"])
			{
				// Template node
				var clone = TemplateOrganizer.clone(component, templateInfo["name"]);
				component.insertBefore(clone, component.firstChild);
			}
			else
			{
				// HTML
				component.innerHTML = templateInfo["html"];
			}

			// Change active template
			component._activeTemplateName = templateName;

			console.debug(("TemplateOrganizer._applyTemplate(): Applied template. name=" + (component.name) + ", templateName=" + (templateInfo["name"]) + ", id=" + (component.id)));

		};


		// -------------------------------------------------------------------------

		/**
		 * Clone the component.
		 *
		 * @param	{Component}		component			Parent component.
		 * @param	{String}		templateName		Template name.
		 *
		 * @return  {Object}		Cloned component.
		 */
		TemplateOrganizer._clone = function _clone (component, templateName)
		{

			templateName = templateName || component.settings.get("settings.templateName");
			var templateInfo = component._templates[templateName];

			Util.assert(templateInfo,("TemplateOrganizer._addTemplate(): Template not loaded. name=" + (component.name) + ", templateName=" + templateName), ReferenceError);

			var clone;
			if (templateInfo["node"])
			{
				// A template tag
				clone = document.importNode(templateInfo["node"], true);
			}
			else
			{
				// Not a template tag
				var ele = document.createElement("div");
				ele.innerHTML = templateInfo["html"];

				clone = ele.firstElementChild;
			}

			return clone;

		};

		// -------------------------------------------------------------------------

		/**
		 * Show "bm-visible" elements if condition passed.
		 *
		 * @param	{Component}		component			Component.
		 * @param	{Object}		item				Item used to judge condition.
		 */
		TemplateOrganizer._showConditionalElements = function _showConditionalElements (component, item)
		{

			// Get elements with bm-visible attribute
			var elements = Util.scopedSelectorAll(component, "[bm-visible]");

			// Show elements
			elements.forEach(function (element) {
				var condition = element.getAttribute("bm-visible");
				if (Util.safeEval(condition, item, item))
				{
					element.style.removeProperty("display");
				}
				else
				{
					element.style.display = "none";
				}
			});

		};

		// -------------------------------------------------------------------------

		/**
		 * Hide "bm-visible" elements.
		 *
		 * @param	{Component}		component			Component.
		 */
		TemplateOrganizer._hideConditionalElements = function _hideConditionalElements (component)
		{

			// Get elements with bm-visible attribute
			var elements = Util.scopedSelectorAll(component, "[bm-visible]");

			// Hide elements
			elements.forEach(function (element) {
				element.style.display = "none";
			});

		};

		// -------------------------------------------------------------------------
		//  Privates
		// -------------------------------------------------------------------------

		/**
		 * Load the template html.
		 *
		 * @param	{String}		url					Template url.
		 *
		 * @return  {Promise}		Promise.
		 */
		TemplateOrganizer.__loadTemplateFile = function __loadTemplateFile (url)
		{

			console.debug(("TemplateOrganzier.loadTemplate(): Loading template. url=" + url));

			return AjaxUtil.ajaxRequest({url:url, method:"GET"}).then(function (xhr) {
				console.debug(("TemplateOrganzier.loadTemplate(): Loaded template. url=" + url));

				return xhr.responseText;
			});

		};

		// -----------------------------------------------------------------------------

		/**
		 * Returns a new template info object.
		 *
		 * @param	{Component}		component			Parent component.
		 * @param	{String}		templateName		Template name.
		 *
		 * @return  {Object}		Template info.
		 */
		TemplateOrganizer.__createTemplateInfo = function __createTemplateInfo (component, templateName)
		{

			if (!component._templates[templateName])
			{
				component._templates[templateName] = {};
				component._templates[templateName]["name"] = templateName;
				component._templates[templateName]["html"] = "";
				component._templates[templateName]["isLoaded"] = false;
			}

			return component._templates[templateName];

		};

		// -------------------------------------------------------------------------

		/**
		 * Store a template node.
		 *
		 * @param	{Component}		component			Parent component.
		 * @param	{Object}		templateInfo		Template info.
		 * @param	{String}		templateNodeName	Template node name.
		 */
		TemplateOrganizer.__storeTemplateNode = function __storeTemplateNode (component, templateInfo, templateNodeName)
		{

			var rootNode = document.querySelector(templateNodeName);
			Util.assert(rootNode, ("TemplateOrganizer._storeTemplate(): Root node does not exist. name=" + (component.name) + ", rootNode=" + templateNodeName + ", templateName=" + (templateInfo["name"])), ReferenceError);

			rootNode.insertAdjacentHTML("afterbegin", templateInfo["html"]);
			var node = rootNode.children[0];
			templateInfo["node"] = ('content' in node ? node.content : node);

		};

		// -----------------------------------------------------------------------------

		/**
		 * Get settings from element's attribute.
		 *
		 * @param	{Component}		component			Component.
		 */
		TemplateOrganizer.__loadAttrSettings = function __loadAttrSettings (component)
		{

			/*
			// Get template path from attribute
			if (component.hasAttribute("bm-templatepath"))
			{
				component.settings.set("system.templatePath", component.getAttribute("bm-templatepath"));
			}

			// Get template name from attribute
			if (component.hasAttribute("bm-templatename"))
			{
				component.settings.set("templateName", component.getAttribute("bbmmplatename"));
			}

			// Get template ref from templateref
			if (component.hasAttribute("bm-templateref"))
			{
				let arr = Util.getFilenameAndPathFromUrl(component.getAttribute("bm-templateref"));
				component.settings.set("system.templatePath", arr[0]);
				component.settings.set("templateName", arr[1].replace(".html", ""));
			}
			*/

		};

		// -------------------------------------------------------------------------

		/**
		 * Get a template html according to settings.
		 *
		 * @param	{Object}		settings			Settings.
		 *
		 * @return 	{Promise}		Promise.
		 */
		TemplateOrganizer.__getTemplate = function __getTemplate (component, settings, templateInfo)
		{

			var promise = Promise.resolve();

			switch (settings["type"]) {
			case "html":
				templateInfo["html"] = settings["html"];
				break;
			case "node":
				templateInfo["html"] = component.querySelector(settings["rootNode"]).innerHTML;
				break;
			case "url":
			default:
				var path = Util.concatPath([
					component.settings.get("system.appBaseUrl", ""),
					component.settings.get("system.templatePath", ""),
					component.settings.get("settings.path", "")
				]);
				var url = Util.concatPath([path, templateInfo["name"] + ".html"]);

				promise = TemplateOrganizer.__loadTemplateFile(url).then(function (template) {
					templateInfo["html"] = template;
					/*
				}).then(() => {
					if (component.settings.get("settings.templateNode"))
					{
						TemplateOrganizer.__storeTemplateNode(component, templateInfo, component.settings.get("settings.templateNode"));
					}
					*/
				});
				break;
			}

			return promise.then(function () {
				templateInfo["isLoaded"] = true;
			});

		};

		return TemplateOrganizer;
	}(Organizer));

	// =============================================================================

	// =============================================================================
	//	Event organizer class
	// =============================================================================

	var EventOrganizer = /*@__PURE__*/(function (Organizer) {
		function EventOrganizer () {
			Organizer.apply(this, arguments);
		}

		if ( Organizer ) EventOrganizer.__proto__ = Organizer;
		EventOrganizer.prototype = Object.create( Organizer && Organizer.prototype );
		EventOrganizer.prototype.constructor = EventOrganizer;

		EventOrganizer.globalInit = function globalInit ()
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

			// Add properties
			Object.defineProperty(Component.prototype, 'eventResult', {
				get: function get() { return this._eventResult; },
			});

		};

		// -------------------------------------------------------------------------

		/**
		 * Init.
		 *
		 * @param	{Component}		component			Component.
		 * @param	{Object}		settings			Settings.
		 *
		 * @return 	{Promise}		Promise.
		 */
		EventOrganizer.init = function init (component, settings)
		{

			// Init vars
			component._eventResult = {};

		};

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
		EventOrganizer.organize = function organize (conditions, component, settings)
		{

			var events = settings["events"];
			if (events)
			{
				Object.keys(events).forEach(function (elementName) {
					EventOrganizer._initEvents(component, elementName, events[elementName]);
				});
			}

		};

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
		EventOrganizer.unorganize = function unorganize (conditions, component, settings)
		{

			var events = settings["events"];
			if (events)
			{
				Object.keys(events).forEach(function (elementName) {
					EventOrganizer._removeEvents(component, elementName, events[elementName]);
				});
			}

		};

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
		EventOrganizer._addEventHandler = function _addEventHandler (component, element, eventName, handlerInfo, bindTo)
		{

			element = element || component;
			var handlerOptions = (typeof handlerInfo === "object" ? handlerInfo : {});

			// Get handler
			var handler = EventOrganizer._getEventHandler(component, handlerInfo);
			Util.assert(handler, ("EventOrganizer._addEventHandler(): handler not found. name=" + (component.name) + ", eventName=" + eventName));

			// Init holder object for the element
			if (!element.__bm_eventinfo)
			{
				element.__bm_eventinfo = { "component":component, "listeners":{}, "promises":{}, "statuses":{} };
			}

			// Add hook event handler
			var listeners = element.__bm_eventinfo.listeners;
			if (!listeners[eventName])
			{
				listeners[eventName] = [];
				element.addEventListener(eventName, EventOrganizer.__callEventHandler, handlerOptions["listnerOptions"]);
			}

			listeners[eventName].push({"handler":handler, "options":handlerOptions["options"], "bindTo":bindTo, "order":order});

			// Stable sort by order
			var order = Util.safeGet(handlerOptions, "order");
			listeners[eventName].sort(function (a, b) {
				if (a.order === b.order)		{ return 0; }
				else if (a.order > b.order)	{ return 1; }
				else 						{ return -1 }
			});

		};

		// -------------------------------------------------------------------------

		/**
		 * Remove an event handler.
		 *
		 * @param	{Component}		component			Component.
		 * @param	{HTMLElement}	element					HTML element.
		 * @param	{String}		eventName				Event name.
		 * @param	{Object/Function/String}	handlerInfo	Event handler info.
		 */
		EventOrganizer._removeEventHandler = function _removeEventHandler (component, element, eventName, handlerInfo)
		{

			element = element || component;

			// Get handler
			var handler = EventOrganizer._getEventHandler(component, handlerInfo);
			Util.assert(handler, ("EventOrganizer._removeEventHandler(): handler not found. name=" + (component.name) + ", eventName=" + eventName));

			var listeners = Util.safeGet(element, "__bm_eventinfo.listeners." + eventName);
			if (listeners)
			{
				for (var i = listeners.length - 1; i >= 0; i--)
				{
					if (listeners[i]["handler"] === handler)
					{
						listeners.splice(i, 1);
						break;
					}
				}
			}

		};

		// -------------------------------------------------------------------------

		/**
		 * Set event handlers to the element.
		 *
		 * @param	{Component}		component			Component.
		 * @param	{String}		elementName			Element name.
		 * @param	{Options}		options				Options.
		 * @param	{HTMLElement}	rootNode			Root node of elements.
		 */
		EventOrganizer._initEvents = function _initEvents (component, elementName, handlerInfo, rootNode)
		{

			rootNode = ( rootNode ? rootNode : component );
			handlerInfo = (handlerInfo ? handlerInfo : component.settings.get("events." + elementName));

			// Get target elements
			var elements = EventOrganizer.__getTargetElements(component, rootNode, elementName, handlerInfo);
			//DebugUtil.assert(elements.length > 0, `EventOrganizer._initEvents(): No elements found. name=${component.name}, elementName=${elementName}`, TypeError);

			// Set event handlers
			if (handlerInfo["handlers"])
			{
				Object.keys(handlerInfo["handlers"]).forEach(function (eventName) {
					var handlers = ( Array.isArray(handlerInfo["handlers"][eventName]) ? handlerInfo["handlers"][eventName] : [handlerInfo["handlers"][eventName]] );

					for (var i = 0; i < handlers.length; i++)
					{
						var handler = component.getEventHandler(handlers[i]);
						for (var j = 0; j < elements.length; j++)
						{
							if (!EventOrganizer.__isHandlerInstalled(elements[j], eventName, handler, component))
							{
								component.addEventHandler(eventName, handlers[i], elements[j]);
							}
						}
					}
				});
			}

		};

		// -------------------------------------------------------------------------

		/**
		 * Remove event handlers from the element.
		 *
		 * @param	{Component}		component			Component.
		 * @param	{String}		elementName			Element name.
		 * @param	{Options}		options				Options.
		 * @param	{HTMLElement}	rootNode			Root node of elements.
		 */
		EventOrganizer._removeEvents = function _removeEvents (component, elementName, handlerInfo, rootNode)
		{

			rootNode = ( rootNode ? rootNode : component );
			handlerInfo = (handlerInfo ? handlerInfo : component.settings.get("events." + elementName));

			// Get target elements
			var elements = EventOrganizer.__getTargetElements(component, rootNode, elementName, handlerInfo);

			// Remove event handlers
			if (handlerInfo["handlers"])
			{
				Object.keys(handlerInfo["handlers"]).forEach(function (eventName) {
					var handlers = ( Array.isArray(handlerInfo["handlers"][eventName]) ? handlerInfo["handlers"][eventName] : [handlerInfo["handlers"][eventName]] );
					for (var i = 0; i < handlers.length; i++)
					{
						var handler = component.getEventHandler(handlers[i]);
						handler = ( typeof handler === "string" ? component[handler] : handler );

						for (var j = 0; j < elements.length; j++)
						{
							component.removeEventHandler(eventName, handlers[i], elements[j]);
						}
					}
				});
			}

		};

		// -------------------------------------------------------------------------

		/**
		 * Trigger the event synchronously.
		 *
		 * @param	{Component}		component				Component.
		 * @param	{String}		eventName				Event name to trigger.
		 * @param	{Object}		options					Event parameter options.
		 * @param	{HTMLElement}	element					HTML element.
		 */
		EventOrganizer._trigger = function _trigger (component, eventName, options, element)
		{

			options = Object.assign({}, options);
			options["sender"] = options["sender"] || component;
			component._eventResult = {};
			options["result"] = component._eventResult;
			element = ( element ? element : component );
			var e = null;

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

		};

		// -------------------------------------------------------------------------

		/**
		 * Trigger the event asynchronously.
		 *
		 * @param	{Component}		component				Component.
		 * @param	{String}		eventName				Event name to trigger.
		 * @param	{Object}		options					Event parameter options.
		 * @param	{HTMLElement}	element					HTML element.
		 */
		EventOrganizer._triggerAsync = function _triggerAsync (component, eventName, options, element)
		{

			options = options || {};
			options["async"] = true;

			return EventOrganizer._trigger.call(component, component, eventName, options, element);

		};

		// -----------------------------------------------------------------------------

		/**
		 * Get an event handler from a handler info object.
		 *
		 * @param	{Component}		component				Component.
		 * @param	{Object/Function/String}	handlerInfo	Handler info.
		 */
		EventOrganizer._getEventHandler = function _getEventHandler (component, handlerInfo)
		{

			var handler = ( typeof handlerInfo === "object" ? handlerInfo["handler"] : handlerInfo );

			return handler;

		};

		// -------------------------------------------------------------------------
		//  Privates
		// -------------------------------------------------------------------------

		//@@@ fix
		/**
		 * Set html elements event handlers.
		 *
		 * @param	{Component}		component			Component.
		 * @param	{HTMLElement}	rootNode			A root node to search elements.
		 * @param	{String}		elementName			Element name.
		 * @param	{Object}		elementInfo			Element info.
		 *
		 * @return 	{Array}			Target node list.
		 */
		EventOrganizer.__getTargetElements = function __getTargetElements (component, rootNode, elementName, elementInfo)
		{

			var elements;

			if (elementInfo["rootNode"])
			{
				if (elementInfo["rootNode"] === "this" || elementInfo["rootNode"] === component.tagName.toLowerCase())
				{
					elements = [rootNode];
				}
				else
				{
					elements = rootNode.querySelectorAll(elementInfo["rootNode"]);
				}
			}
			else if (elementName === "this" || elementName === component.tagName.toLowerCase())
			{
				elements = [rootNode];
			}
			else
			{
				elements = rootNode.querySelectorAll("#" + elementName);
			}

			return elements;

		};

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
		EventOrganizer.__isHandlerInstalled = function __isHandlerInstalled (element, eventName, handler)
		{

			var isInstalled = false;
			var listeners = Util.safeGet(element.__bm_eventinfo, "listeners." + eventName);

			if (listeners)
			{
				for (var i = 0; i < listeners.length; i++)
				{
					if (listeners[i]["handler"] === handler)
					{
						isInstalled = true;
						break;
					}
				}
			}

			return isInstalled;

		};

		// -------------------------------------------------------------------------

		/**
		 * Call event handlers.
		 *
		 * This function is registered as event listener by element.addEventListener(),
		 * so "this" is HTML element that triggered the event.
		 *
		 * @param	{Object}		e						Event parameter.
		 */
		EventOrganizer.__callEventHandler = function __callEventHandler (e)
		{
			var this$1$1 = this;


			var listeners = Util.safeGet(this, "__bm_eventinfo.listeners." + e.type);
			var sender = Util.safeGet(e, "detail.sender", this);
			var component = Util.safeGet(this, "__bm_eventinfo.component");

			// Check if handler is already running
			//DebugUtil.assert(Util.safeGet(this, "__bm_eventinfo.statuses." + e.type) !== "handling", `EventOrganizer.__callEventHandler(): Event handler is already running. name=${this.tagName}, eventName=${e.type}`, Error);
			Util.warn(Util.safeGet(this, "__bm_eventinfo.statuses." + e.type) !== "handling", ("EventOrganizer.__callEventHandler(): Event handler is already running. name=" + (this.tagName) + ", eventName=" + (e.type)));

			Util.safeSet(this, "__bm_eventinfo.statuses." + e.type, "handling");

			if (Util.safeGet(e, "detail.async", false) === false)
			{
				// Wait previous handler
				this.__bm_eventinfo["promises"][e.type] = EventOrganizer.__handle(e, sender, component, listeners).then(function (result) {
					Util.safeSet(this$1$1, "__bm_eventinfo.promises." + e.type, null);
					Util.safeSet(this$1$1, "__bm_eventinfo.statuses." + e.type, "");
				});
			}
			else
			{
				// Does not wait previous handler
				this.__bm_eventinfo["promises"][e.type] = EventOrganizer.__handleAsync(e, sender, component, listeners);
				Util.safeSet(this, "__bm_eventinfo.promises." + e.type, null);
				Util.safeSet(this, "__bm_eventinfo.statuses." + e.type, "");
			}

		};

		// -------------------------------------------------------------------------

		/**
		 * Call event handlers.
		 *
		 * @param	{Object}		e						Event parameter.
		 * @param	{Object}		sender					Sender object.
		 * @param	{Object}		component				Target component.
		 * @param	{Object}		listener				Listers info.
		 */
		EventOrganizer.__handle = function __handle (e, sender, component, listeners)
		{

			var chain = Promise.resolve();
			var stopPropagation = false;

			var loop = function ( i ) {
				// Options set on addEventHandler()
				var ex = {
					"component": component,
					"options": ( listeners[i]["options"] ? listeners[i]["options"] : {} )
				};

				chain = chain.then(function () {
					// Get a handler
					var handler = listeners[i]["handler"];
					handler = ( typeof handler === "string" ? component[handler] : handler );
					Util.assert(typeof handler === "function", ("EventOrganizer._addEventHandler(): Event handler is not a function. name=" + (component.name) + ", eventName=" + (e.type)), TypeError);

					// Execute handler
					var bindTo = ( listeners[i]["bindTo"] ? listeners[i]["bindTo"] : component );
					return handler.call(bindTo, sender, e, ex);
				});

				stopPropagation = (listeners[i]["options"] && listeners[i]["options"]["stopPropagation"] ? true : stopPropagation);
			};

			for (var i = 0; i < listeners.length; i++)
			loop( i );

			if (stopPropagation)
			{
				e.stopPropagation();
			}

			return chain;

		};

		// -------------------------------------------------------------------------

		/**
		 * Call event handlers (Async).
		 *
		 * @param	{Object}		e						Event parameter.
		 * @param	{Object}		sender					Sender object.
		 * @param	{Object}		component				Target component.
		 * @param	{Object}		listener				Listers info.
		 */
		EventOrganizer.__handleAsync = function __handleAsync (e, sender, component, listeners)
		{

			var stopPropagation = false;

			for (var i = 0; i < listeners.length; i++)
			{
				// Options set on addEventHandler()
				var ex = {
					"component": component,
					"options": ( listeners[i]["options"] ? listeners[i]["options"] : {} )
				};

				// Get a handler
				var handler = listeners[i]["handler"];
				handler = ( typeof handler === "string" ? component[handler] : handler );
				Util.assert(typeof handler === "function", ("EventOrganizer._addEventHandler(): Event handler is not a function. name=" + (component.name) + ", eventName=" + (e.type)), TypeError);

				// Execute handler
				var bindTo = ( listeners[i]["bindTo"] ? listeners[i]["bindTo"] : component );
				handler.call(bindTo, sender, e, ex);

				stopPropagation = (listeners[i]["options"] && listeners[i]["options"]["stopPropagation"] ? true : stopPropagation);
			}

			if (stopPropagation)
			{
				e.stopPropagation();
			}

			return Promise.resolve();

		};

		return EventOrganizer;
	}(Organizer));

	// =============================================================================

	// =============================================================================
	//	Component organizer class
	// =============================================================================

	var ComponentOrganizer = /*@__PURE__*/(function (Organizer) {
		function ComponentOrganizer () {
			Organizer.apply(this, arguments);
		}

		if ( Organizer ) ComponentOrganizer.__proto__ = Organizer;
		ComponentOrganizer.prototype = Object.create( Organizer && Organizer.prototype );
		ComponentOrganizer.prototype.constructor = ComponentOrganizer;

		ComponentOrganizer.globalInit = function globalInit (targetClass)
		{

			// Init vars
			ComponentOrganizer.__classes = new Store();

		};

		// -------------------------------------------------------------------------

		/**
		 * Init.
		 *
		 * @param	{Component}		component			Component.
		 * @param	{Object}		settings			Settings.
		 *
		 * @return 	{Promise}		Promise.
		 */
		ComponentOrganizer.init = function init (component, settings)
		{

			// Add properties
			Object.defineProperty(component, "components", {
				get: function get() { return this._components; },
			});

			// Add methods
			component.loadTags = ComponentOrganizer.loadTags;
			component.addComponent = function(componentName, settings, sync) { return ComponentOrganizer._addComponent(this, componentName, settings, sync); };

			// Init vars
			component._components = {};

		};

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
		ComponentOrganizer.organize = function organize (conditions, component, settings)
		{

			var chain = Promise.resolve();

			// Load molds
			var molds = settings["molds"];
			if (molds)
			{
				Object.keys(molds).forEach(function (moldName) {
					chain = chain.then(function () {
						return ComponentOrganizer._addComponent(component, moldName, molds[moldName], "opened");
					});
				});
			}

			// Load components
			var components = settings["components"];
			if (components)
			{
				Object.keys(components).forEach(function (componentName) {
					chain = chain.then(function () {
						return ComponentOrganizer._addComponent(component, componentName, components[componentName]);
					});
				});
			}

			return chain;

		};

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
		ComponentOrganizer.unorganize = function unorganize (conditions, component, settings)
		{

			ComponentOrganizer.clear(component);

		};

		// -------------------------------------------------------------------------

		/**
		 * Clear.
		 *
		 * @param	{Component}		component			Component.
		 */
		ComponentOrganizer.clear = function clear (component)
		{

			Object.keys(component._components).forEach(function (key) {
				component._components[key].parentNode.removeChild(component._components[key]);
			});

			component._components = {};

		};

		// -------------------------------------------------------------------------
		//  Protected
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
		ComponentOrganizer._addComponent = function _addComponent (component, componentName, settings, sync)
		{

			var path = Util.concatPath([
				component.settings.get("system.appBaseUrl", ""),
				component.settings.get("system.componentPath", ""),
				Util.safeGet(settings, "settings.path", "")
			]);
			var className = Util.safeGet(settings, "settings.className") || componentName;
			var tagName = Util.safeGet(settings, "settings.tagName") || Util.getTagNameFromClassName(className);

			return Promise.resolve().then(function () {
				// Load component
				var autoLoad = Util.safeGet(settings, "settings.autoLoad", component.settings.get("system.autoLoad", true));
				var splitComponent = Util.safeGet(settings, "settings.splitComponent", component.settings.get("system.splitComponent", false));
				var options = { "autoLoad":autoLoad, "splitComponent":splitComponent };
				return ComponentOrganizer._loadComponent(className, path, settings, options, tagName);
			}).then(function () {
				// Insert tag
				if (Util.safeGet(settings, "settings.rootNode") && !component._components[componentName])
				{
					component._components[componentName] = ComponentOrganizer.__insertTag(component, tagName, settings);
				}
			}).then(function () {
				// Wait for the added component to be ready
				if (sync || Util.safeGet(settings, "settings.sync"))
				{
					sync = sync || Util.safeGet(settings, "settings.sync"); // sync precedes settings["sync"]
					var state = (sync === true ? "started" : sync);
					var c = className.split(".");
					return component.waitFor([{"name":c[c.length - 1], "state":state}]);
				}
			});

		};

		// -----------------------------------------------------------------------------

		/**
		 * Load scripts for tags which has bm-autoload attribute.
		 *
		 * @param	{HTMLElement}	rootNode			Target node.
		 * @param	{String}		path				Base path prepend to each element's path.
		 * @param	{Object}		options				Load Options.
		 *
		 * @return  {Promise}		Promise.
		 */
		ComponentOrganizer.loadTags = function loadTags (rootNode, basePath, options)
		{

			console.debug(("ComponentOrganizer._loadTags(): Loading tags. rootNode=" + (rootNode.tagName) + ", basePath=" + basePath));

			var promises = [];
			var waitList = [];
			var targets = rootNode.querySelectorAll("[bm-autoload]:not([bm-autoloaded]),[bm-automorph]:not([bm-autoloaded])");

			targets.forEach(function (element) {
				element.setAttribute("bm-autoloaded", "");

				var href = element.getAttribute("bm-autoload");
				var className = element.getAttribute("bm-classname") || Util.getClassNameFromTagName(element.tagName);
				var path = element.getAttribute("bm-path") || "";
				var split = ( element.hasAttribute("bm-split") ? true : options["splitComponent"] );
				var morph = ( element.hasAttribute("bm-automorph") ?
					( element.getAttribute("bm-automorph") ? element.getAttribute("bm-automorph") : true ) :
					false
				);
				var settings = {"settings":{"autoMorph":morph}};
				var loadOptions = {"splitComponent":split, "autoLoad": true};

				if (href)
				{
					var arr = Util.getFilenameAndPathFromUrl(href);
					path = arr[0];
					if (href.slice(-3).toLowerCase() === ".js")
					{
						settings["settings"]["fileName"] = arr[1].substring(0, arr[1].length - 3);
					}
					else if (href.slice(-5).toLowerCase() === ".html")
					{
						settings["settings"]["autoMorph"] = true;
					}
				}
				else
				{
					path = Util.concatPath([basePath, path]);
				}

				promises.push(ComponentOrganizer._loadComponent(className, path, settings, loadOptions, element.tagName));

				var waitItem = {"object":element, "state":"started"};
				waitList.push(waitItem);
			});

			var waitFor = Util.safeGet(options, "waitForTags") && waitList.length > 0;

			return Promise.all(promises).then(function () {
				if (waitFor)
				{
					// Wait for elements to become "started"
					return BITSMIST.v1.StateOrganizer.waitFor(waitList, {"waiter":rootNode});
				}
			});

		};

		// -------------------------------------------------------------------------

		/**
		 * Load the template html.
		 *
		 * @param	{String}		className			Class name.
		 * @param	{String}		path				Path to component.
		 * @param	{Object}		settings			Component settings.
		 * @param	{Object}		options				Load options.
		 * @param	{String}		tagName				Component's tag name
		 *
		 * @return  {Promise}		Promise.
		 */
		ComponentOrganizer._loadComponent = function _loadComponent (className, path, settings, options, tagName)
		{

			var morph = Util.safeGet(settings, "settings.autoMorph");
			if (morph)
			{
				// Define empty class
				console.debug(("ComponentOrganizer._loadComponent(): Creating empty component. className=" + className + ", path=" + path + ", tagName=" + tagName));

				var classDef = ( morph === true ?  BITSMIST.v1.Pad : ClassUtil.getClass(morph) );
				if (!customElements.get(tagName.toLowerCase()))
				{
					ClassUtil.newComponent(classDef, settings, tagName, className);
				}
			}
			else
			{
				if (options["autoLoad"])
				{
					// Load component script
					return ComponentOrganizer.__autoloadComponent(className, path, settings, options);
				}
			}

		};

		// -------------------------------------------------------------------------
		//  Privates
		// -------------------------------------------------------------------------

		/**
		 * Check if the class exists.
		 *
		 * @param	{String}		className			Class name.
		 *
		 * @return  {Bool}			True if exists.
		 */
		ComponentOrganizer.__isLoadedClass = function __isLoadedClass (className)
		{

			var ret = false;

			if (ComponentOrganizer.__classes.get(className, {})["state"] === "loaded")
			{
				ret = true;
			}
			else if (ClassUtil.getClass(className))
			{
				ret = true;
			}

			return ret;

		};

		// -------------------------------------------------------------------------

		/**
		 * Load the component if not loaded yet.
		 *
		 * @param	{String}		className			Component class name.
		 * @param	{String}		path				Path to component.
		 * @param	{Object}		settings			Component settings.
		 * @param	{Object}		options				Load Options.
		 *
		 * @return  {Promise}		Promise.
		 */
		ComponentOrganizer.__autoloadComponent = function __autoloadComponent (className, path, settings, options)
		{

			console.debug(("ComponentOrganizer.__autoLoadComponent(): Auto loading component. className=" + className + ", path=" + path));

			var promise;
			var tagName = Util.safeGet(settings, "settings.tagName") || Util.getTagNameFromClassName(className);
			var fileName = Util.safeGet(settings, "settings.fileName", tagName);

			if (ComponentOrganizer.__isLoadedClass(className) || customElements.get(tagName))
			{
				// Already loaded
				console.debug(("ComponentOrganizer.__autoLoadComponent(): Component Already exists. className=" + className));
				ComponentOrganizer.__classes.set(className, {"state":"loaded"});
				promise = Promise.resolve();
			}
			else if (ComponentOrganizer.__classes.get(className, {})["state"] === "loading")
			{
				// Already loading
				console.debug(("ComponentOrganizer.__autoLoadComponent(): Component Already loading. className=" + className));
				promise = ComponentOrganizer.__classes.get(className)["promise"];
			}
			else
			{
				// Not loaded
				ComponentOrganizer.__classes.set(className, {"state":"loading"});
				promise = ComponentOrganizer.__loadComponentScript(fileName, path, options).then(function () {
					ComponentOrganizer.__classes.set(className, {"state":"loaded", "promise":null});
				});
				ComponentOrganizer.__classes.set(className, {"promise":promise});
			}

			return promise;

		};

		// -------------------------------------------------------------------------

		/**
		 * Load the component js files.
		 *
		 * @param	{String}		className			Class name.
		 * @param	{String}		path				Path to component.
		 * @param	{Object}		options				Load Options.
		 *
		 * @return  {Promise}		Promise.
		 */
		ComponentOrganizer.__loadComponentScript = function __loadComponentScript (fileName, path, options)
		{

			console.debug(("ComponentOrganizer.__loadComponentScript(): Loading script. fileName=" + fileName + ", path=" + path));

			var url1 = Util.concatPath([path, fileName + ".js"]);
			var url2 = Util.concatPath([path, fileName + ".settings.js"]);

			return Promise.resolve().then(function () {
				return AjaxUtil.loadScript(url1);
			}).then(function () {
				if (options["splitComponent"])
				{
					return AjaxUtil.loadScript(url2);
				}
			}).then(function () {
				console.debug(("ComponentOrganizer.__loadComponentScript(): Loaded script. fileName=" + fileName));
			});

		};

		// -------------------------------------------------------------------------

		/**
		 * Insert a tag and return the inserted component.
		 *
		 * @param	{String}		tagName				Tagname.
		 * @param	{Object}		settings			Component settings.
		 *
		 * @return  {Component}		Component.
		 */
		ComponentOrganizer.__insertTag = function __insertTag (component, tagName, settings)
		{

			var addedComponent;

			// Check root node
			var root = component.rootElement.querySelector(Util.safeGet(settings, "settings.rootNode"));
			Util.assert(root, ("ComponentOrganizer.__insertTag(): Root node does not exist. name=" + (component.name) + ", tagName=" + tagName + ", rootNode=" + (Util.safeGet(settings, "settings.rootNode"))), ReferenceError);

			// Build tag
			var tag = ( Util.safeGet(settings, "settings.tag") ? Util.safeGet(settings, "settings.tag") : "<" + tagName +  "></" + tagName + ">" );

			// Insert tag
			if (Util.safeGet(settings, "settings.overwrite"))
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
			addedComponent._injectSettings = function(oldSettings){
				// super()
				var newSettings = Object.assign({}, addedComponent._super.prototype._injectSettings.call(addedComponent, oldSettings));

				return Util.deepMerge(newSettings, settings);
			};

			return addedComponent;

		};

		return ComponentOrganizer;
	}(Organizer));

	// =============================================================================

	// =============================================================================
	//	Autoload organizer class
	// =============================================================================

	var AutoloadOrganizer = /*@__PURE__*/(function (Organizer) {
		function AutoloadOrganizer () {
			Organizer.apply(this, arguments);
		}

		if ( Organizer ) AutoloadOrganizer.__proto__ = Organizer;
		AutoloadOrganizer.prototype = Object.create( Organizer && Organizer.prototype );
		AutoloadOrganizer.prototype.constructor = AutoloadOrganizer;

		AutoloadOrganizer.globalInit = function globalInit ()
		{
			var this$1$1 = this;


			document.addEventListener("DOMContentLoaded", function () {
				if (BITSMIST.v1.settings.get("organizers.AutoloadOrganizer.settings.autoLoadOnStartup", true))
				{
					this$1$1.load(document.body, BITSMIST.v1.settings, {"waitForTags":false});
				}
			});

		};

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
		AutoloadOrganizer.organize = function organize (conditions, component, settings)
		{

			return AutoloadOrganizer.load(component.rootElement, component.settings);

		};

		// -------------------------------------------------------------------------

		/**
		 * Load all tags.
		 */
		AutoloadOrganizer.load = function load (rootNode, settings, options)
		{

			var path = Util.concatPath([settings.get("system.appBaseUrl", ""), settings.get("system.componentPath", "")]);
			var splitComponent = Util.safeGet(options, "splitComponent", settings.get("system.splitComponent", false));
			var waitForTags = Util.safeGet(options, "waitForTags", settings.get("system.waitForTags", true));

			return ComponentOrganizer.loadTags(rootNode, path, {"splitComponent":splitComponent, "waitForTags":waitForTags});

		};

		return AutoloadOrganizer;
	}(Organizer));

	// =============================================================================

	// =============================================================================
	//	SettingManager class
	// =============================================================================

	// -----------------------------------------------------------------------------
	//  Constructor
	// -----------------------------------------------------------------------------

	/**
	 * Constructor.
	 */
	function SettingManager()
	{

		// super()
		return Reflect.construct(HTMLElement, [], this.constructor);

	}

	ClassUtil.inherit(SettingManager, Component);

	// -----------------------------------------------------------------------------

	/**
	 * Get component settings.
	 *
	 * @return  {Object}		Options.
	 */
	SettingManager.prototype._getSettings = function()
	{

		return {
			"settings": {
				"name":					"SettingManager",
				"autoSetup":			false,
			}
		};

	};

	// -----------------------------------------------------------------------------

	customElements.define("bm-setting", SettingManager);

	// =============================================================================

	// =============================================================================
	//	TagLoader class
	// =============================================================================

	// -----------------------------------------------------------------------------
	//  Constructor
	// -----------------------------------------------------------------------------

	/**
	 * Constructor.
	 */
	function TagLoader()
	{

		// super()
		return Reflect.construct(HTMLElement, [], this.constructor);

	}

	ClassUtil.inherit(TagLoader, Component);

	// -----------------------------------------------------------------------------
	//  Methods
	// -----------------------------------------------------------------------------

	/**
	 * Start pad.
	 *
	 * @param	{Object}		settings			Settings.
	 *
	 * @return  {Promise}		Promise.
	 */
	TagLoader.prototype.start = function(settings)
	{
		var this$1$1 = this;


		// Defaults
		var defaults = {
			"settings": {
				"name": "TagLoader",
			},
		};
		settings = ( settings ? BITSMIST.v1.Util.deepMerge(defaults, settings) : defaults );

		// super()
		return BITSMIST.v1.Component.prototype.start.call(this, settings).then(function () {
			if (document.readyState !== "loading")
			{
				AutoloadOrganizer.load(document.body, this$1$1.settings);
			}
			else
			{
				document.addEventListener("DOMContentLoaded", function () {
					AutoloadOrganizer.load(document.body, this$1$1.settings);
				});
			}
		});

	};

	// -----------------------------------------------------------------------------

	customElements.define("bm-tagloader", TagLoader);

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
	OrganizerOrganizer.organizers.set("StateOrganizer", {"object":StateOrganizer, "targetWords":"waitFor", "targetEvents":"*", "order":100});
	window.BITSMIST.v1.StateOrganizer = StateOrganizer;
	OrganizerOrganizer.organizers.set("TemplateOrganizer", {"object":TemplateOrganizer, "targetWords":"templates", "targetEvents":["beforeStart", "afterAppend"], "order":200});
	window.BITSMIST.v1.TemplateOrganizer = TemplateOrganizer;
	OrganizerOrganizer.organizers.set("EventOrganizer", {"object":EventOrganizer, "targetWords":"events", "targetEvents":["beforeStart", "afterAppend", "afterSpecLoad"], "order":210});
	window.BITSMIST.v1.EventOrganizer = EventOrganizer;
	OrganizerOrganizer.organizers.set("AutoloadOrganizer", {"object":AutoloadOrganizer, "targetEvents":["afterAppend"], "order":400});
	window.BITSMIST.v1.AutoloadOrganizer = AutoloadOrganizer;
	OrganizerOrganizer.organizers.set("ComponentOrganizer", {"object":ComponentOrganizer, "targetWords":["molds", "components"],"targetEvents":["afterStart"], "order":410});
	window.BITSMIST.v1.ComponentOrganizer = ComponentOrganizer;
	window.BITSMIST.v1.Pad = Pad;
	window.BITSMIST.v1.Store = Store;
	window.BITSMIST.v1.OrganizerStore = OrganizerStore;
	window.BITSMIST.v1.ChainableStore = ChainableStore;
	window.BITSMIST.v1.AjaxUtil = AjaxUtil;
	window.BITSMIST.v1.ClassUtil = ClassUtil;
	window.BITSMIST.v1.Util = Util;

})();
//# sourceMappingURL=bitsmist-js_v1.js.map
