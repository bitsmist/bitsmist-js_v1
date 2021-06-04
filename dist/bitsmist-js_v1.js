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

		var result = defaultValue;

		var current = store;
		var found = true;
		var items = key.split(".");
		for (var i = 0; i < items.length; i++)
		{
			if (typeof current === "object" && items[i] in current)
			{
				current = current[items[i]];
			}
			else
			{
				found = false;
				break;
			}
		}

		if (found)
		{
			result = current;
		}

		return result;

	};

	// -----------------------------------------------------------------------------

	/**
	* Set an value to store.
	*
	* @param{Object}	store			Object which holds keys/values.
	* @param{String}	key				Key to store.
	* @param{Object}	value			Value to store.
	*/
	Util.safeSet = function safeSet (store, key, value)
	{

		var prevKey;
		var current = store;
		var items = key.split(".");
		for (var i = 0; i < items.length - 1; i++)
		{
			if (typeof current === "object" && !(items[i] in current))
			{
				current[items[i]] = {};
			}
			else if (typeof current !== "object")
			{
				throw new TypeError(("Key already exists. key=" + key + ", existingKey=" + prevKey + ", existingValue=" + current));
			}

			prevKey = items[i];
			current = current[items[i]];
		}

		if (typeof current !== "object")
		{
			throw new TypeError(("Key already exists. key=" + key + ", existingKey=" + prevKey + ", existingValue=" + current));
		}

		current[items[items.length - 1]] = value;

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
			if (typeof current === "object" && items[i] in current)
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
				if (path.slice(path.length - 1) == "/" && paths[i].slice(0, 1) == "/")
				{
					// "---/" and "/---"
					// Remove an extra slash
					path += paths[i].slice(1);
				}
				else if (path.slice(path.length - 1) == "/" || paths[i].slice(0, 1) == "/")
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
		 * Deep merge two arrays.
		 *
		 * @param{Object}	arr1				Array1.
		 * @param{Object}	arr2				Array2.
		 *
		 * @return  {Object}	Merged array.
		 */
	Util.deepMerge = function deepMerge (arr1, arr2)
	{

		if (arr2)
		{
			Object.keys(arr2).forEach(function (key) {
				if (Array.isArray(arr1[key]))
				{
					arr1[key] = arr1[key].concat(arr2[key]);
				}
				else if (arr1.hasOwnProperty(key) && typeof arr1[key] === 'object')
				{
					Util.deepMerge(arr1[key], arr2[key]);
				}
				else
				{
					arr1[key] = arr2[key];
				}
			});
		}

		return arr1;

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

		return c == c.toUpperCase() && c != c.toLowerCase();

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

		if (!c)
		{
			throw new ReferenceError(("Class '" + className + "' is not defined."));
		}

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

		if (!result)
		{
			throw new TypeError(("Class name '" + className + "' is not valid."));
		}

		return className;

	};

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
			return this.start();
		}
		else
		{
			return Promise.resolve();
		}

	};

	// -----------------------------------------------------------------------------

	/**
	 * Disconnected callback.
	 */
	Component.prototype.disconnectedCallback = function()
	{

		if (this._settings.get("settings.autoStop"))
		{
			return this.stop();
		}
		else
		{
			return Promise.resolve();
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
		var this$1 = this;


		// Defaults
		var defaults = {
			"settings": {
				"autoSetup": true,
				"autoStop": true,
				"useGlobalSettings": true,
			},
			"organizers": {
				"SettingOrganizer": "",
				"OrganizerOrganizer": "",
				"StateOrganizer": "",
			}
		};
		settings = Util.deepMerge(defaults, settings);

		// Init vars
		this._uniqueId = new Date().getTime().toString(16) + Math.floor(100*Math.random()).toString(16);
		this._name = this.constructor.name;
		this._rootElement = ( Util.safeGet(settings, "settings.rootElement") ? document.querySelector(Util.safeGet(settings, "settings.rootElement")) : this );

		return Promise.resolve().then(function () {
			return this$1._injectSettings(settings);
		}).then(function (newSettings) {
			return this$1.initOrganizers(newSettings);
		// }).then(() => {
			// suspend
			// return ( this.hasAttribute("data-suspend") || this._settings.get("autoSuspend") ? this.suspend("start") : null );
		}).then(function () {
			console.debug(("Component.start(): Starting component. name=" + (this$1.name) + ", id=" + (this$1.id)));
			return this$1.changeState("starting");
		}).then(function () {
			return this$1.callOrganizers("beforeStart", this$1._settings.items);
		}).then(function (newSettings) {
			settings = newSettings;

			return this$1.trigger("beforeStart", this$1);
		}).then(function () {
			var autoSetupOnStart = this$1._settings.get("settings.autoSetupOnStart");
			var autoSetup = this$1._settings.get("settings.autoSetup");
			if ( autoSetupOnStart || (autoSetupOnStart !== false && autoSetup) )
			{
				return this$1.setup(settings);
			}
		}).then(function () {
			return this$1.callOrganizers("afterStart", this$1._settings.items);
		}).then(function () {
			return this$1.trigger("afterStart", this$1);
		}).then(function () {
			console.debug(("Component.start(): Started component. name=" + (this$1.name) + ", id=" + (this$1.id)));
			return this$1.changeState("started");
		}).then(function () {
			return settings;
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
		var this$1 = this;


		options = Object.assign({}, options);
		var sender = ( options["sender"] ? options["sender"] : this );

		return Promise.resolve().then(function () {
			console.debug(("Component.stop(): Stopping component. name=" + (this$1.name) + ", id=" + (this$1.id)));
			return this$1.changeState("stopping");
		}).then(function () {
			return this$1.trigger("beforeStop", sender, options);
		}).then(function () {
			return this$1.trigger("doStop", sender, options);
		}).then(function () {
			return this$1.trigger("afterStop", sender, options);
		}).then(function () {
			console.debug(("Component.stop(): Stopped component. name=" + (this$1.name) + ", id=" + (this$1.id)));
			return this$1.changeState("stopped");
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
		var this$1 = this;


		options = Object.assign({}, options);
		var sender = ( options["sender"] ? options["sender"] : this );

		return Promise.resolve().then(function () {
			console.debug(("Component.setup(): Setting up component. name=" + (this$1.name) + ", state=" + (this$1.state) + ", id=" + (this$1.id)));
			return this$1.trigger("beforeSetup", sender, options);
		}).then(function () {
			return this$1.trigger("doSetup", sender, options);
		}).then(function () {
			return this$1.trigger("afterSetup", sender, options);
		}).then(function () {
			console.debug(("Component.setup(): Set up component. name=" + (this$1.name) + ", state=" + (this$1.state) + ", id=" + (this$1.id)));
		});

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
	 * Get component settings.  Need to override.
	 *
	 * @return  {Object}		Options.
	 */
	Component.prototype._getSettings = function()
	{

		return {};

	};

	// -----------------------------------------------------------------------------

	customElements.define("bm-component", Component);

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

		if (organizerInfo["targetEvents"].indexOf(conditions) > -1)
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

	var Store = function Store(options, chain)
	{

		// Init vars
		this._chain = Util.safeGet(options, "chain");
		this._filter;

		// Init
		this.items = Util.safeGet(options, "items");
		this.filter = Util.safeGet(options, "filter", function () { return true; } );
		this.merger = Util.safeGet(options, "merger", Util.deepMerge );

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

		var items;

		if (this._chain)
		{
			items = Object.assign({}, this._chain._items, this._items);
		}
		else
		{
			items = Object.assign({}, this._items);
		}

		return items;

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

		if (typeof value != "function")
		{
			throw TypeError(("Filter is not a function. filter=" + value));
		}

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

		if (typeof value != "function")
		{
			throw TypeError(("Merger is not a function. filter=" + value));
		}

		this._merger = value;

	};

	// -------------------------------------------------------------------------
	//  Method
	// -------------------------------------------------------------------------

	/**
	     * Chain another store.
	     *
		 * @param{Object}	component		Component to attach.
		 * @param{Object}	options			Plugin options.
	     */
	Store.prototype.chain = function chain (store)
	{

		this._chain = store;

	};

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
		 * Merge items.
		 *
		 * @param{Array/Object}newItems		Array/Object of Items to merge.
		 * @param{Function}	merger			Merge function.
		 */
	Store.prototype.merge = function merge (newItems, merger)
	{


		if (newItems)
		{
			merger = merger || this._merger;
			var items = (Array.isArray(newItems) ? newItems: [newItems]);

			for (var i = 0; i < items.length; i++)
			{
				merger(this._items, items[i]);
			}
		}

	};

	// -----------------------------------------------------------------------------

	/**
		 * Get a value from store. Return default value when specified key is not available.
		 * If chained, chained store is also considiered.
		 *
		 * @param{String}	key				Key to get.
		 * @param{Object}	defaultValue	Value returned when key is not found.
		 *
		 * @return  {*}			Value.
		 */
	Store.prototype.get = function get (key, defaultValue)
	{

		return this._getChainedItem(this._chain, this, key, defaultValue);

	};

	// -----------------------------------------------------------------------------

	/**
		 * Set a value to store.
		 *
		 * @param{String}	key				Key to store.
		 * @param{Object}	value			Value to store.
		 */
	Store.prototype.set = function set (key, value)
	{

		Util.safeSet(this._items, key, value);

	};

	Store.prototype.setWithOrder = function setWithOrder (key, value, order)
	{

		this.set(key, value);

	};

	// -------------------------------------------------------------------------

	/**
		 * Set a value to store. Unlike set(), this merges with an existing value
		 * if the existing value is object, otherwise overwrites.
		 *
		 * @param{String}	key				Key to store.
		 * @param{Object}	value			Value to store.
		 */
	Store.prototype.mergeSet = function mergeSet (key, value)
	{

		var holder = this._getLocal(key);

		if (typeof holder == "object")
		{
			Object.assign(holder, value);
		}
		else
		{
			this.set(key, value);
		}

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

	// -------------------------------------------------------------------------
	// Protected
	// -------------------------------------------------------------------------

	/**
	* Get an value from store. Return default value when specified key is not available.
	* Ignore chain.
	*
	* @param{String}	key				Key to get.
	* @param{Object}	defaultValue	Value returned when key is not found.
	*
	* @return  {*}			Value.
	*/
	Store.prototype._getLocal = function _getLocal (key, defaultValue)
	{

		return Util.safeGet(this._items, key, defaultValue);

	};

	// -----------------------------------------------------------------------------

	/**
	* Get an value from stores. Return default value when specified key is not available.
	* If both store1 and store2 has the key, store2 precedes store1.
	*
	* @param{String}	key				Key to get.
	* @param{Object}	defaultValue	Value returned when key is not found.
	*
	* @return  {*}			Value.
	*/
	Store.prototype._getChainedItem = function _getChainedItem (store1, store2, key, defaultValue)
	{

		var result = defaultValue;

		if (store2 && store2.has(key))
		{
			result = store2._getLocal(key);
		}
		else if (store1 && store1.has(key))
		{
			result = store1._getLocal(key);
		}

		return result;

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
				if (xhr.status == 200 || xhr.status == 201)
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
			Object.defineProperty(Component.prototype, 'settings', {
				get: function get() { return this._settings; },
			});

			// Init vars
			SettingOrganizer.__globalSettings = new Store();
			Object.defineProperty(SettingOrganizer, 'globalSettings', {
				get: function get() { return SettingOrganizer.__globalSettings; },
			});

		};

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
		SettingOrganizer.init = function init (conditions, component, settings)
		{

			// Init vars
			component._settings = new Store({"items":settings});
			component.settings.merge(component._getSettings());

			// Overwrite name if specified
			var name = component.settings.get("settings.name");
			if (name)
			{
				component._name = name;
			}

			// Chain global settings
			if (component.settings.get("settings.useGlobalSettings"))
			{
				component.settings.chain(SettingOrganizer.globalSettings);
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
				// Load extra settings
				return SettingOrganizer.__loadExtraSettings(component, "setting");
			}).then(function (extraSettings) {
				if (extraSettings)
				{
					component.settings.merge(extraSettings);
				}

				// Load settings from attributes
				SettingOrganizer.__loadAttrSettings(component);
			}).then(function () {
				// Load global settings
				var load = component.settings.get("settings.loadGlobalSettings");
				if (load)
				{
					// Load global settings
					SettingOrganizer.__globalSettings.merge(component.settings.items["globals"]);

					return SettingOrganizer._load(component).then(function (settings) {
						SettingOrganizer.__globalSettings.merge(settings);
					});
				}
			}).then(function () {
				return component.settings.items;
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

			if (conditions == "beforeStart")
			{
				return true;
			}
			else
			{
				return false;
			}

		};

		// -------------------------------------------------------------------------
		//  Protected
		// -------------------------------------------------------------------------

		/**
		 * Load setting file.
		 *
		 * @param	{String}		settingName			Setting name.
		 * @param	{String}		path				Path to setting file.
		 *
		 * @return  {Promise}		Promise.
		 */
		SettingOrganizer._loadSetting = function _loadSetting (settingName, path)
		{

			var url = Util.concatPath([path, settingName + ".js"]);
			var settings;

			console.debug(("SettingOrganizer._loadSetting(): Loading settings. url=" + url));
			return AjaxUtil.ajaxRequest({url:url, method:"GET"}).then(function (xhr) {
				console.debug(("SettingOrganizer._loadSetting(): Loaded settings. url=" + url));
				try
				{
					settings = JSON.parse(xhr.responseText);
				}
				catch(e)
				{
					throw new SyntaxError(("Illegal json string. url=" + url));
				}

				return settings;
			});

		};

		// -------------------------------------------------------------------------

		/**
		* Load items.
		*
		* @param	{Object}		options				Options.
		*
		* @return  {Promise}		Promise.
		*/
		SettingOrganizer._load = function _load (component, options)
		{

			var sender = ( options && options["sender"] ? options["sender"] : component );

			return component.trigger("doLoadStore", sender);

		};

		// -------------------------------------------------------------------------

		/**
		* Save items.
		*
		* @param	{Object}		options				Options.
		*
		* @return  {Promise}		Promise.
		*/
		SettingOrganizer._save = function _save (component, options)
		{

			var sender = ( options && options["sender"] ? options["sender"] : component );

			return component.trigger("doSaveStore", sender, {"data":PreferenceOrganizer.__preferences.items});

		};

		// -------------------------------------------------------------------------
		//  Privates
		// -------------------------------------------------------------------------

		/**
		 * Load an extra setting file.
		 *
		 * @param	{Component}		component			Component.
		 * @param	{String}		settingName			Setting name.
		 *
		 * @return  {Promise}		Promise.
		 */
		SettingOrganizer.__loadExtraSettings = function __loadExtraSettings (component, settingName)
		{

			var name, path;

			if (component.hasAttribute("data-" + settingName + "ref"))
			{
				var arr = Util.getFilenameAndPathFromUrl(component.getAttribute("data-" + settingName + "ref"));
				path = arr[0];
				name = arr[1].slice(0, -3);
			}
			else
			{
				path = ( component.hasAttribute("data-" + settingName + "path") ? component.getAttribute("data-" + settingName + "path") : "" );
				name = ( component.hasAttribute("data-" + settingName + "name") ? component.getAttribute("data-" + settingName + "name") : "" );
				if (path && !name)
				{
					name = "settings";
				}
			}

			if (name || path)
			{
				return SettingOrganizer._loadSetting(name, path);
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

			// Get path from  data-autoload
			if (component.getAttribute("data-autoload"))
			{
				var arr = Util.getFilenameAndPathFromUrl(component.getAttribute("data-autoload"));
				component.settings.set("system.appBaseUrl", "");
				component.settings.set("system.templatePath", arr[0]);
				component.settings.set("system.componentPath", arr[0]);
				component.settings.set("settings.path", "");
			}

			// Get path from attribute
			if (component.hasAttribute("data-path"))
			{
				component.settings.set("settings.path", component.getAttribute("data-path"));
			}

			// Get settings from the attribute

			var dataSettings = ( document.querySelector(component.settings.get("settings.rootNode")) ?
				document.querySelector(component.settings.get("settings.rootNode")).getAttribute("data-settings") :
				component.getAttribute("data-settings")
			);

			if (dataSettings)
			{
				var settings = {"settings": JSON.parse(dataSettings)};
				component.settings.merge(settings);
			}

		};

		return SettingOrganizer;
	}(Organizer));

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

		OrganizerOrganizer.globalInit = function globalInit ()
		{

			// Add properties
			Object.defineProperty(Component.prototype, 'organizers', {
				get: function get() { return this._organizers; },
			});

			// Add methods
			Component.prototype.callOrganizers = function(condition, settings) { return OrganizerOrganizer._callOrganizers(this, condition, settings); };
			Component.prototype.initOrganizers = function(settings) { return OrganizerOrganizer._initOrganizers(this, settings); };

			// Init vars
			OrganizerOrganizer.__organizers = new OrganizerStore();
			Object.defineProperty(OrganizerOrganizer, 'organizers', {
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

			var targets = {};
			var chain = Promise.resolve();

			// List new organizers
			var organizers = settings["organizers"];
			if (organizers)
			{
				Object.keys(organizers).forEach(function (key) {
					if (!component._organizers[key] && OrganizerOrganizer.__organizers.items[key])
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
					return component._organizers[key].object.init("*", component, settings);
				});
			});

			return chain.then(function () {
				return settings;
			});

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

		// ------------------------------------------------------------------------
		//  Protected
		// ------------------------------------------------------------------------

		/**
		 * Call organizers.
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

			return Promise.resolve().then(function () {
				// Init setting organizer
				return SettingOrganizer.init("*", component, settings);
			}).then(function () {
				// Add organizers
				return OrganizerOrganizer.organize("*", component, settings);
			});

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

			return Promise.resolve().then(function () {
				// Load settings
				if (SettingOrganizer.isTarget(conditions))
				{
					return SettingOrganizer.organize(conditions, component, settings);
				}
				else
				{
					return settings;
				}
			}).then(function (newSettings) {
				// Add organizers
				return OrganizerOrganizer.organize("*", component, newSettings);
			}).then(function (newSettings) {
				// Call organizers
				var chain = Promise.resolve(settings);
				OrganizerOrganizer._sortItems(component._organizers).forEach(function (key) {
					if (component._organizers[key].object.isTarget(conditions, component._organizers[key], component))
					{
						chain = chain.then(function (newSettings) {
							return component._organizers[key].object.organize(conditions, component, newSettings);
						});
					}
				});

				return chain;
			});

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
	//	Waitfor organizer class
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
			Object.defineProperty(Component.prototype, 'state', {
				get: function get() { return this._state; },
				set: function set(value) { this._state = value; }
			});

			// Add methods
			Component.prototype.changeState= function(newState) { return StateOrganizer._changeState(this, newState); };
			Component.prototype.isInitialized = function() { return StateOrganizer._isInitialized(this); };
			Component.prototype.waitFor = function(waitlist, timeout) { return StateOrganizer._waitFor(this, waitlist, timeout); };
			Component.prototype.suspend = function(state) { return StateOrganizer._suspend(this, state); };

			// Init vars
			StateOrganizer.__components = new Store();
			StateOrganizer.__waitingList = new Store();
			StateOrganizer.__waitingListIndexName = new Map();
			StateOrganizer.__waitingListIndexId = new Map();
			StateOrganizer.__waitingListIndexNone = [];	Component.prototype.resume = function(state) { return StateOrganizer._resume(this, state); };

		};

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
		StateOrganizer.init = function init (conditions, component, settings)
		{

			// Init vars
			component._state = "";
			//component._suspend = {};

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
				promise = StateOrganizer._waitFor(component, waitFor);
			}

			return promise.then(function () {
				return settings;
			});

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
		 * Check if event is target.
		 *
		 * @param	{String}		conditions			Event name.
		 * @param	{Object}		organizerInfo		Organizer info.
		 * @param	{Component}		component			Component.
		 *
		 * @return 	{Boolean}		True if it is target.
		 */
		StateOrganizer.isTarget = function isTarget (conditions, organizerInfo, component)
		{

			var ret = false;

			if (conditions == "beforeStart")
			{
				if (!(component instanceof BITSMIST.v1.Pad))
				{
					ret = true;
				}
			}
			else
			{
				ret = Organizer.isTarget.call(this, conditions, organizerInfo, component);
			}

			return ret;

		};

		// -------------------------------------------------------------------------
		//  Protected
		// -------------------------------------------------------------------------

		/**
		 * Wait for components to become specific states.
		 *
		 * @param	{Component}		component			Component.
		 * @param	{Array}			waitlist			Components to wait.
		 * @param	{integer}		timeout				Timeout in milliseconds.
		 *
		 * @return  {Promise}		Promise.
		 */
		StateOrganizer._waitFor = function _waitFor (component, waitlist, timeout)
		{

			var promise;
			timeout = ( timeout ? timeout : 10000 );

			var waitInfo = {"waiter":component, "waitlist":waitlist.slice()};

			if (StateOrganizer.__isAllReady(waitInfo))
			{
				promise = Promise.resolve();
			}
			else
			{
				promise = new Promise(function (resolve, reject) {
					waitInfo["resolve"] = resolve;
					waitInfo["reject"] = reject;
					setTimeout(function () {
						reject(("waitFor() timed out after " + timeout + " milliseconds waiting for " + (JSON.stringify(waitlist)) + ", name=" + (component.name) + "."));
					}, timeout);
				});
				waitInfo["promise"] = promise;

				//StateOrganizer.__addToWaitingList(waitInfo, component, state);
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

			if (newState == "starting")
			{
				return StateOrganizer._waitForSingle(component, "instantiated");
			}

			if (newState == "stopping")
			{
				return StateOrganizer._waitForSingle(component, "instantiated");
			}

			if (newState == "opening")
			{
				return StateOrganizer._waitForSingle(component, "started");
			}

			if (newState == "closing")
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

			if (StateOrganizer.__isTransitionable(component.state, state))
			{
				component.state = state;
				StateOrganizer.__components.mergeSet(component.uniqueId, {"object":component, "state":state});

				StateOrganizer.__processWaitingList(component, state);
			}
			else
			{
				throw Error(("Illegal transition. name=" + (component.name) + ", fromState=" + (component.state) + ", toState=" + state + ", id=" + (component.id)));
			}

		};

		// -------------------------------------------------------------------------

		/**
		 * Change component state and check waiting list.
		 *
		 * @param	{Component}		component			Component.
		 * @param	{String}		state				Component state.
		 *
		 * @return  {Promise}		Promise.
		 */
		StateOrganizer._suspend = function _suspend (component, state)
		{

			var suspendInfo = {};

			var promise = new Promise(function (resolve, reject) {
				suspendInfo["resolve"] = resolve;
				suspendInfo["reject"] = reject;
			});
			suspendInfo["promise"] = promise;

			component._suspend[state] = suspendInfo;

			return promise;

		};

		// -------------------------------------------------------------------------

		/**
		 * Change component state and check waiting list.
		 *
		 * @param	{Component}		component			Component.
		 * @param	{String}		state				Component state.
		 */
		StateOrganizer._resume = function _resume (component, state)
		{

			component._suspend[state].resolve();

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

			if (component.state &&
				component.state != "starting" &&
				component.state != "stopping" &&
				component.state != "stopped"
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

			if (currentState && currentState.slice(-3) == "ing")
			{
				if(
					( currentState == "stopping" && newState != "stopped") ||
					( currentState == "starting" && newState != "started") ||
					( currentState == "opening" && (newState != "opened" && newState != "opening") ) ||
					( currentState == "closing" && newState != "closed") ||
					( currentState == "stopping" && (newState != "stopped" && newState != "closing") )
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
			StateOrganizer.__processIndex(names);

			// Process ID index
			var ids = StateOrganizer.__waitingListIndexId.get(component.uniqueId + "." + state);
			StateOrganizer.__processIndex(ids);

			// Process non indexables
			StateOrganizer.__processIndex(StateOrganizer.__waitingListIndexNone);

		};

		// -------------------------------------------------------------------------

		/**
		 * Process waiting list index.
		 *
		 * @param	{Array}			list				List of indexed waiting list id.
		 */
		StateOrganizer.__processIndex = function __processIndex (list)
		{

			if (list)
			{
				for (var i = 0; i < list.length; i++)
				{
					var id = list[i];

					if (id)
					{
						StateOrganizer.__waitingList.get(id);

						if (StateOrganizer.__isAllReady(StateOrganizer.__waitingList.get(id)))
						{
							StateOrganizer.__waitingList.get(id).resolve();
							StateOrganizer.__waitingList.remove(id);

							// delete from index
							list[i] = null;
						}
					}
				}
			}

		};

		// -------------------------------------------------------------------------

		/**
		 * Add wait info to the waiting list.
		 *
		 * @param	{Object}		waitInfo			Wait info.
		 * @param	{Component}		component			Component.
		 * @param	{String}		state				State.
		 *
		 * @return  {Promise}		Promise.
		 */
		//static __addToWaitingList(waitInfo, component, state)
		StateOrganizer.__addToWaitingList = function __addToWaitingList (waitInfo, component)
		{

			// Add wait info to the waiting list.
			var id = new Date().getTime().toString(16) + Math.floor(100*Math.random()).toString(16);
			StateOrganizer.__waitingList.set(id, waitInfo);

			// Create index for faster processing
			var waitlist = waitInfo["waitlist"];
			for (var i = 0; i < waitlist.length; i++)
			{
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
					StateOrganizer.__waitingListIndexNone.push(id);
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

			if (!index.get(key))
			{
				index.set(key, []);
			}

			index.get(key).push(id);

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
					if (waitlistItem["name"] == StateOrganizer.__components.get(key).object.name)
					{
						componentInfo = StateOrganizer.__components.get(key);
					}
				});
			}
			else if (waitlistItem["rootNode"])
			{
				var element = document.querySelector(waitlistItem["rootNode"]);
				if (element)
				{
					componentInfo = StateOrganizer.__components.get(element.uniqueId);
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

			// Set defaults when not specified
			waitlistItem["state"] = waitlistItem["state"] || "opened";

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
			if (waitlistItem["name"] && componentInfo["object"].name != waitlistItem["name"])
			{
				isMatch = false;
			}

			// check id
			if (waitlistItem["id"] && componentInfo["object"].uniqueId != waitlistItem["id"])
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

			var isMatch = true;

			switch (expectedState)
			{
				case "started":
					if (
						currentState != "opening" &&
						currentState != "opened" &&
						currentState != "closing" &&
						currentState != "closed" &&
						currentState != "started"
					)
					{
						isMatch = false;
					}
					break;
				default:
					if (currentState != expectedState)
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

			if (component.hasAttribute("data-waitfor"))
			{
				var waitInfo = {"name":component.getAttribute("data-waitfor"), "state":"started"};
				component.settings.merge({"waitFor": [waitInfo]});
			}

			if (component.hasAttribute("data-waitfornode"))
			{
				var waitInfo$1 = {"rootNode":component.getAttribute("data-waitfornode"), "state":"started"};
				component.settings.merge({"waitFor": [waitInfo$1]});
			}

		};

		return StateOrganizer;
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
			Component.prototype.trigger = function(eventName, sender, options, element) {
				return EventOrganizer._trigger(this, eventName, sender, options, element)
			};
			Component.prototype.triggerAsync = function(eventName, sender, options, element) {
				return EventOrganizer._triggerAsync(this, eventName, sender, options, element)
			};
			Component.prototype.getEventHandler = function(component, eventInfo, bindTo, eventName) {
				return EventOrganizer._getEventHandler(this, component, eventInfo, bindTo, eventName)
			};

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

			return settings;

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

			// Get handler
			var handler = EventOrganizer._getEventHandler(component, handlerInfo);
			if (typeof handler !== "function")
			{
				throw TypeError(("Event handler is not a function. componentName=" + (component.name) + ", eventName=" + eventName));
			}

			// Init holder object for the element
			if (!element._bm_detail)
			{
				element._bm_detail = { "component":component, "listeners":{}, "promises":{}, "statuses":{} };
			}

			// Add hook event handler
			var listeners = element._bm_detail.listeners;
			if (!listeners[eventName])
			{
				listeners[eventName] = [];
				element.addEventListener(eventName, EventOrganizer.__callEventHandler, handlerInfo["listenerOptions"]);
			}

			listeners[eventName].push({"handler":handler, "options":Object.assign({}, handlerInfo["options"]), "bindTo":bindTo, "order":order});

			// Stable sort by order
			var order = Util.safeGet(handlerInfo, "order");
			listeners[eventName].sort(function (a, b) {
				if (a.order == b.order)		{ return 0; }
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

			var handler = EventOrganizer._getEventHandler(component, handlerInfo);
			if (typeof handler !== "function")
			{
				throw TypeError(("Event handler is not a function. componentName=" + (component.name) + ", eventName=" + eventName));
			}

			var listeners = Util.safeGet(element, "_bm_detail.listeners." + eventName);
			if (listeners)
			{
				var index = -1;
				for (var i = 0; i < listeners.length; i++)
				{
					if (listeners["handler"] == handler)
					{
						index = i;
						break;
					}
				}

				if (index > -1)
				{
					element._bm_detail.listeners = array.splice(index, 1);
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

			rootNode = ( rootNode ? rootNode : component.rootElement );
			handlerInfo = (handlerInfo ? handlerInfo : component.settings.get("events." + elementName));

			// Get target elements
			var elements = EventOrganizer.__getTargetElements(component, rootNode, elementName, handlerInfo);

			// Set event handlers
			if (handlerInfo["handlers"])
			{
				Object.keys(handlerInfo["handlers"]).forEach(function (eventName) {
					var arr = ( Array.isArray(handlerInfo["handlers"][eventName]) ? handlerInfo["handlers"][eventName] : [handlerInfo["handlers"][eventName]] );

					for (var i = 0; i < arr.length; i++)
					{
						var handler = component.getEventHandler(arr[i]);
						for (var j = 0; j < elements.length; j++)
						{
							if (!EventOrganizer.__isHandlerInstalled(elements[j], eventName, handler, component))
							{
								component.addEventHandler(eventName, arr[i], elements[j]);
							}
						}
					}
				});
			}

		};

		// -------------------------------------------------------------------------

		/**
		 * Trigger the event.
		 *
		 * @param	{Component}		component				Component.
		 * @param	{String}		eventName				Event name to trigger.
		 * @param	{Object}		sender					Object which triggered the event.
		 * @param	{Object}		options					Event parameter options.
		 */
		EventOrganizer._trigger = function _trigger (component, eventName, sender, options, element)
		{

			options = Object.assign({}, options);
			options["sender"] = sender;
			element = ( element ? element : component );
			var e = null;

			try
			{
				e = new CustomEvent(eventName, { detail: options });
			}
			catch(error)
			{
				e  = document.createEvent('CustomEvent');
				e.initCustomEvent(eventName, false, false, options);
			}

			element.dispatchEvent(e);

			// return the promise if exists
			return Util.safeGet(element, "_bm_detail.promises." + eventName) || Promise.resolve();

		};

		// -------------------------------------------------------------------------

		/**
		 * Trigger the event synchronously.
		 *
		 * @param	{Component}		component				Component.
		 * @param	{String}		eventName				Event name to trigger.
		 * @param	{Object}		sender					Object which triggered the event.
		 * @param	{Object}		options					Event parameter options.
		 */
		EventOrganizer._triggerAsync = function _triggerAsync (component, eventName, sender, options, element)
		{

			options = options || {};
			options["async"] = true;

			return EventOrganizer._trigger.call(component, component, eventName, sender, options, element);

		};

		// -----------------------------------------------------------------------------

		/**
		 * Get event handler from event info object.
		 *
		 * @param	{Component}		component			Component.
		 * @param	{Object/Function/String}	eventInfo	Event info.
		 */
		EventOrganizer._getEventHandler = function _getEventHandler (component, eventInfo)
		{

			var handler = ( typeof eventInfo === "object" ? eventInfo["handler"] : eventInfo );

			if ( typeof handler === "string" )
			{
				handler = component[handler];
			}

			return handler;

		};

		// -------------------------------------------------------------------------
		//  Privates
		// -------------------------------------------------------------------------

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
				if (elementInfo["rootNode"] == "this" || elementInfo["rootNode"] == component.tagName.toLowerCase())
				{
					elements = [rootNode];
				}
				else
				{
					elements = rootNode.querySelectorAll(elementInfo["rootNode"]);
				}
			}
			else if (elementName == "this" || elementName == component.tagName.toLowerCase())
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
			var listeners = Util.safeGet(element._bm_detail, "listeners." + eventName);

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
			var this$1 = this;


			var listeners = Util.safeGet(this, "_bm_detail.listeners." + e.type);
			var sender = Util.safeGet(e, "detail.sender", this);
			var component = Util.safeGet(this, "_bm_detail.component");

			// Check if handler is already running
			if (Util.safeGet(this, "_bm_detail.statuses." + e.type) == "handling")
			{
				throw new Error(("Event handler is already running. name=" + (this.tagName) + ", eventName=" + (e.type)));
			}

			Util.safeSet(this, "_bm_detail.statuses." + e.type, "handling");

			if (Util.safeGet(e, "detail.async", false) == false)
			{
				// Wait previous handler
				this._bm_detail["promises"][e.type] = EventOrganizer.__handle(e, sender, component, listeners).then(function (result) {
					Util.safeSet(this$1, "_bm_detail.promises." + e.type, null);
					Util.safeSet(this$1, "_bm_detail.statuses." + e.type, "");

					return result;
				});
			}
			else
			{
				// Does not wait previous handler
				this._bm_detail["promises"][e.type] = EventOrganizer.__handleAsync(e, sender, component, listeners);
				Util.safeSet(this, "_bm_detail.promises." + e.type, null);
				Util.safeSet(this, "_bm_detail.statuses." + e.type, "");
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
			var results = [];
			var stopPropagation = false;

			var loop = function ( i ) {
				// Options set on addEventHandler()
				var ex = {
					"component": component,
					"options": ( listeners[i]["options"] ? listeners[i]["options"] : {} )
				};

				// Execute handler
				chain = chain.then(function (result) {
					results.push(result);

					var bindTo = ( listeners[i]["bindTo"] ? listeners[i]["bindTo"] : component );
					return listeners[i]["handler"].call(bindTo, sender, e, ex);
				});

				stopPropagation = (listeners[i]["options"] && listeners[i]["options"]["stopPropagation"] ? true : stopPropagation);
			};

			for (var i = 0; i < listeners.length; i++)
			loop( i );

			if (stopPropagation)
			{
				e.stopPropagation();
			}

			return chain.then(function (result) {
				results.push(result);

				return results;
			});

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

				// Execute handler
				var bindTo = ( listeners[i]["bindTo"] ? listeners[i]["bindTo"] : component );
				listeners[i]["handler"].call(bindTo, sender, e, ex);

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
	customElements.define("bm-pad", Pad);

	// -----------------------------------------------------------------------------
	//  Methods
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
		var this$1 = this;


		options = Object.assign({}, options);
		var sender = ( options["sender"] ? options["sender"] : this );

		return Promise.resolve().then(function () {
			console.debug(("Pad.open(): Opening pad. name=" + (this$1.name) + ", id=" + (this$1.id)));
			return this$1.changeState("opening");
		}).then(function () {
			return this$1.switchTemplate(this$1._settings.get("settings.templateName"));
		}).then(function () {
			return this$1.trigger("beforeOpen", sender, options);
		}).then(function () {
			var autoSetupOnOpen = this$1._settings.get("settings.autoSetupOnOpen");
			var autoSetup = this$1._settings.get("settings.autoSetup");
			if ( autoSetupOnOpen || (autoSetupOnOpen !== false && autoSetup) )
			{
				return this$1.setup(options);
			}
		}).then(function () {
			if (this$1._settings.get("settings.autoRefresh"))
			{
				return this$1.refresh(options);
			}
		}).then(function () {
			return this$1.trigger("doOpen", sender, options);
		}).then(function () {
			return this$1.trigger("afterOpen", sender, options);
		}).then(function () {
			console.debug(("Pad.open(): Opened pad. name=" + (this$1.name) + ", id=" + (this$1.id)));
			return this$1.changeState("opened");
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
		var this$1 = this;


		console.debug(("Pad.openModal(): Opening pad modally. name=" + (this.name) + ", id=" + (this.id)));

		return new Promise(function (resolve, reject) {
			this$1._isModal = true;
			this$1._modalResult = {"result":false};
			this$1._modalPromise = { "resolve": resolve, "reject": reject };
			this$1.open(options);
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
		var this$1 = this;


		options = Object.assign({}, options);
		var sender = ( options["sender"] ? options["sender"] : this );

		return Promise.resolve().then(function () {
			console.debug(("Pad.close(): Closing pad. name=" + (this$1.name) + ", id=" + (this$1.id)));
			return this$1.changeState("closing");
		}).then(function () {
			return this$1.trigger("beforeClose", sender, options);
		}).then(function () {
			return this$1.trigger("doClose", sender, options);
		}).then(function () {
			return this$1.trigger("afterClose", sender, options);
		}).then(function () {
			if (this$1._isModal)
			{
				this$1._modalPromise.resolve(this$1._modalResult);
			}
		}).then(function () {
			console.debug(("Pad.close(): Closed pad. name=" + (this$1.name) + ", id=" + (this$1.id)));
			return this$1.changeState("closed");
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
		var this$1 = this;


		options = Object.assign({}, options);
		var sender = ( options["sender"] ? options["sender"] : this );

		return Promise.resolve().then(function () {
			console.debug(("Pad.refresh(): Refreshing pad. name=" + (this$1.name) + ", id=" + (this$1.id)));
			return this$1.trigger("beforeRefresh", sender, options);
		}).then(function () {
			if (this$1._settings.get("settings.autoFill"))
			{
				return this$1.fill(options);
			}
		}).then(function () {
			return this$1.trigger("doRefresh", sender, options);
		}).then(function () {
			return this$1.trigger("afterRefresh", sender, options);
		}).then(function () {
			console.debug(("Pad.refresh(): Refreshed pad. name=" + (this$1.name) + ", id=" + (this$1.id)));
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
		var this$1 = this;


		options = Object.assign({}, options);
		var sender = ( options["sender"] ? options["sender"] : this );

		if (this.isActiveTemplate(templateName))
		{
			return Promise.resolve();
		}

		return Promise.resolve().then(function () {
			console.debug(("Pad.switchTemplate(): Switching template. name=" + (this$1.name) + ", templateName=" + templateName + ", id=" + (this$1.id)));
			return this$1.addTemplate(templateName, {"rootNode":this$1._settings.get("settings.rootNode"), "templateNode":this$1._settings.get("settings.templateNode")});
		}).then(function () {
			var path = Util.concatPath([this$1._settings.get("system.appBaseUrl", ""), this$1._settings.get("system.componentPath", "")]);
			var splitComponent = this$1._settings.get("system.splitComponent", false);
			return this$1.loadTags(this$1, path, {"splitComponent":splitComponent});
		}).then(function () {
			return this$1.callOrganizers("afterAppend", this$1._settings.items);
		}).then(function () {
			return this$1.trigger("afterAppend", sender, options);
		}).then(function () {
			console.debug(("Pad.switchTemplate(): Switched template. name=" + (this$1.name) + ", templateName=" + templateName + ", id=" + (this$1.id)));
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
	 * Start pad.
	 *
	 * @param	{Object}		settings			Settings.
	 *
	 * @return  {Promise}		Promise.
	 */
	Pad.prototype.start = function(settings)
	{
		var this$1 = this;


		// Defaults
		var defaults = {
			"settings": {
				"autoSetupOnStart":false,
			},
			"organizers":{
				"TemplateOrganizer": "",
			}
		};
		settings = Util.deepMerge(defaults, settings);

		return Promise.resolve().then(function () {
			// super()
			return Component.prototype.start.call(this$1, settings);
		}).then(function (newSettings) {
			settings = newSettings;

			// Open
			if (this$1._settings.get("settings.autoOpen"))
			{
				return this$1.open(settings);
			}
		});

	};

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

			// Add methods
			Pad.prototype.addTemplate = function(templateName, options) { return TemplateOrganizer._addTemplate(this, templateName, options); };
			Pad.prototype.cloneTemplate = function(templateName) { return TemplateOrganizer._clone(this, templateName); };
			Pad.prototype.isActiveTemplate = function(templateName) { return TemplateOrganizer._isActive(this, templateName); };

		};

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
		TemplateOrganizer.init = function init (conditions, component, setttings)
		{

			// Init vars
			component._templates = {};

			// Set defaults if not set already
			component.settings.set("settings.templateName", component.settings.get("settings.templateName", component.tagName.toLowerCase()));
			component.settings.set("settings.autoOpen", component.settings.get("settings.autoOpen", true));
			component.settings.set("settings.autoClose", component.settings.get("settings.autoClose", true));

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

			var templates = settings["templates"];
			if (templates)
			{
				Object.keys(templates).forEach(function (key) {
					var templateInfo = TemplateOrganizer.__getTemplateInfo(component, key);
					templateInfo["html"] = templates[key];
				});
			}

			return settings;

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

		/**
		 * Check if event is target.
		 *
		 * @param	{String}		conditions			Event name.
		 * @param	{Object}		organizerInfo		Organizer info.
		 * @param	{Component}		component			Component.
		 *
		 * @return 	{Boolean}		True if it is target.
		 */
		TemplateOrganizer.isTarget = function isTarget (conditions, organizerInfo, component)
		{

			var ret = false;

			if (component instanceof BITSMIST.v1.Pad)
			{
				ret = Organizer.isTarget.call(this, conditions, organizerInfo, component);
				/*
				if (conditions == "*" || conditions == "beforeStart")
				{
					ret = true;
				}
				*/
			}

			return ret;

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
		TemplateOrganizer._isActive = function _isActive (component, templateName)
		{

			var ret = false;

			var templateInfo = TemplateOrganizer.__getTemplateInfo(component, templateName);
			if (templateInfo["isAppended"])
			{
				ret = true;
			}

			return ret;

		};

		// -------------------------------------------------------------------------

		/**
		 * Add a component to parent component.
		 *
		 * @param	{Component}		component			Parent component.
		 * @param	{String}		templateName		Template name.
		 * @param	{Object}		options				Options for the template.
		 *
		 * @return  {Promise}		Promise.
		 */
		TemplateOrganizer._addTemplate = function _addTemplate (component, templateName, options)
		{

			var templateInfo = TemplateOrganizer.__getTemplateInfo(component, templateName);
			if (templateInfo["isAppended"])
			{
				throw new ReferenceError(("Template already appended. name=" + (component.name) + ", templateName=" + templateName));
			}

			return Promise.resolve().then(function () {
				var path = Util.concatPath([
					component.settings.get("system.appBaseUrl", ""),
					component.settings.get("system.templatePath", ""),
					component.settings.get("settings.path", "")
				]);
				return TemplateOrganizer._loadTemplate(component, templateInfo, path);
			}).then(function () {
				if (component.settings.get("settings.templateNode"))
				{
					TemplateOrganizer.__storeTemplateNode(component, templateInfo, component.settings.get("settings.templateNode"));
				}

				return TemplateOrganizer.__applyTemplate(component, templateInfo);
			}).then(function () {
				if (component._templates[component.settings.get("settings.templateName")])
				{
					component._templates[component.settings.get("settings.templateName")]["isAppended"] = false;
				}
				component._templates[templateName]["isAppended"] = true;
				component.settings.set("settings.templateName", templateName);
			});

		};

		// -------------------------------------------------------------------------

		/**
		 * Load the template html.
		 *
		 * @param	{Component}		component			Parent component.
		 * @param	{Object}		templateInfo		Template info.
		 * @param	{String}		path				Path to template.
		 *
		 * @return  {Promise}		Promise.
		 */
		TemplateOrganizer._loadTemplate = function _loadTemplate (component, templateInfo, path)
		{

			return TemplateOrganizer.__autoLoadTemplate(component, templateInfo, path);

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

			templateName = templateName || component._settings.get("settings.templateName");
			var templateInfo = component._templates[templateName];

			if (!templateInfo)
			{
				throw new ReferenceError(("Template not loaded. name=" + (component.name) + ", templateName=" + templateName));
			}

			var clone;
			if (templateInfo["node"])
			{
				// template is a template tag
				clone = document.importNode(templateInfo["node"], true);
			}
			else
			{
				// template is not a template tag
				var ele = document.createElement("div");
				ele.innerHTML = templateInfo["html"];

				clone = ele.firstElementChild;
			}

			return clone;

		};

		// -------------------------------------------------------------------------
		//  Privates
		// -------------------------------------------------------------------------

		/**
		 * Load the template html if not loaded yet.
		 *
		 * @param	{Component}		component			Parent component.
		 * @param	{Object}		templateInfo		Template info.
		 *
		 * @return  {Promise}		Promise.
		 */
		TemplateOrganizer.__autoLoadTemplate = function __autoLoadTemplate (component, templateInfo, path)
		{

			console.debug(("TemplateOrganizer.__autoLoadTemplate(): Auto loading template. name=" + (component.name) + ", templateName=" + (templateInfo["name"]) + ", id=" + (component.id)));

			var promise;

			if (templateInfo["html"] || templateInfo["node"])
			{
				console.debug(("TemplateOrganizer.__autoLoadTemplate(): Template Already exists. name=" + (component.name) + ", templateName=" + (templateInfo["name"]) + ", id=" + (component.id)) );
			}
			else
			{
				var url = Util.concatPath([path, templateInfo["name"] + ".html"]);

				promise = TemplateOrganizer.__loadTemplateFile(url).then(function (template) {
					templateInfo["html"] = template;
				});
			}

			return Promise.all([promise]).then(function () {
				if (!templateInfo["isLoaded"])
				{
					return component.trigger("afterLoadTemplate", component);
				}
			}).then(function () {
				templateInfo["isLoaded"] = true;
			});

		};

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
		 * Returns templateInfo for the specified templateName. Create one if not exists.
		 *
		 * @param	{Component}		component			Parent component.
		 * @param	{String}		templateName		Template name.
		 *
		 * @return  {Object}		Template info.
		 */
		TemplateOrganizer.__getTemplateInfo = function __getTemplateInfo (component, templateName)
		{

			if (!component._templates[templateName])
			{
				component._templates[templateName] = {};
				component._templates[templateName]["name"] = templateName;
				component._templates[templateName]["html"] = "";
				component._templates[templateName]["isAppended"] = false;
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
			if (!rootNode)
			{
				throw new ReferenceError(("Root node does not exist. name=" + (component.name) + ", rootNode=" + templateNodeName + ", templateName=" + (templateInfo["name"])));
			}

			rootNode.insertAdjacentHTML("afterbegin", templateInfo["html"]);
			var node = rootNode.children[0];
			templateInfo["node"] = ('content' in node ? node.content : node);

		};

		// -------------------------------------------------------------------------

		/**
		 * Apply template.
		 *
		 * @param	{Component}		component			Parent component.
		 * @param	{Object}		templateInfo		Template info.
		 */
		TemplateOrganizer.__applyTemplate = function __applyTemplate (component, templateInfo)
		{

			if (templateInfo["node"])
			{
				var clone = TemplateOrganizer.clone(component, templateInfo["name"]);
				component.insertBefore(clone, component.firstChild);
			}
			else
			{
				component.innerHTML = templateInfo["html"];
			}

			console.debug(("TemplateOrganizer.__applyTemplate(): Applied template. name=" + (component.name) + ", templateName=" + (templateInfo["name"]) + ", id=" + (component.id)));

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
			if (component.hasAttribute("data-templatepath"))
			{
				component.settings.set("system.templatePath", component.getAttribute("data-templatepath"));
			}

			// Get template name from attribute
			if (component.hasAttribute("data-templatename"))
			{
				component.settings.set("templateName", component.getAttribute("data-templatename"));
			}

			// Get template ref from templateref
			if (component.hasAttribute("data-templateref"))
			{
				let arr = Util.getFilenameAndPathFromUrl(component.getAttribute("data-templateref"));
				component.settings.set("system.templatePath", arr[0]);
				component.settings.set("templateName", arr[1].replace(".html", ""));
			}
			*/

		};

		return TemplateOrganizer;
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

			// Add methods
			Pad.prototype.loadTags = ComponentOrganizer.loadTags;

			// Init vars
			ComponentOrganizer.__classes = new Store();

		};

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
		ComponentOrganizer.init = function init (conditions, component, settings)
		{

			// Add properties
			Object.defineProperty(component, 'components', {
				get: function get() { return this._components; },
			});

			// Add methods
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

			return chain.then(function () {
				return settings;
			});

		};

		// -------------------------------------------------------------------------

		/**
		 * Clear.
		 *
		 * @param	{Component}		component			Component.
		 */
		ComponentOrganizer.clear = function clear (component)
		{

			Object.keys(component.components).forEach(function (key) {
				component.components[key].parentNode.removeChild(component._components[key]);
			});

			component._components = {};

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
		ComponentOrganizer.isTarget = function isTarget (conditions, organizerInfo, component)
		{

			var ret = false;

			if (conditions == "beforeStart")
			{
				if (!(component instanceof BITSMIST.v1.Pad))
				{
					ret = true;
				}
			}
			else
			{
				ret = Organizer.isTarget.call(this, conditions, organizerInfo, component);
			}

			return ret;

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
				if (Util.safeGet(settings, "settings.rootNode") && !component.components[componentName])
				{
					component.components[componentName] = ComponentOrganizer.__insertTag(component, tagName, settings);
				}
			}).then(function () {
				// Expose component
				var expose = Util.safeGet(settings, "settings.expose");
				if (expose)
				{
					var exposeName = ( expose === true ? componentName : expose );
					Object.defineProperty(component.__proto__, exposeName, {
						get: function get() { return this.components[componentName]; }
					});
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
		 * Load scripts for tags which has data-autoload attribute.
		 *
		 * @param	{HTMLElement}	rootNode			Target node.
		 * @param	{String}		path				Base path prepend to each element's path.
		 * @param	{Object}		options				Load Options.
		 * @param	{String}		target				Target elements.
		 *
		 * @return  {Promise}		Promise.
		 */
		ComponentOrganizer.loadTags = function loadTags (rootNode, basePath, options, target)
		{

			console.debug(("ComponentOrganizer._loadTags(): Loading tags. rootNode=" + rootNode + ", basePath=" + basePath));

			var promises = [];
			var targets = ( target ?
				document.querySelectorAll(target) :
				rootNode.querySelectorAll("[data-autoload]:not([data-autoloaded]),[data-automorph]:not([data-autoloaded])")
			);

			targets.forEach(function (element) {
				element.setAttribute("data-autoloaded", "");

				var href = element.getAttribute("data-autoload");
				var className = element.getAttribute("data-classname") || Util.getClassNameFromTagName(element.tagName);
				var path = element.getAttribute("data-path") || "";
				var split = ( element.hasAttribute("data-split") ? true : options["splitComponent"] );
				var morph = ( element.hasAttribute("data-automorph") ?
					( element.getAttribute("data-automorph") ? element.getAttribute("data-automorph") : true ) :
					false
				);
				var settings = {"settings":{"morph":morph}};
				var loadOptions = {"splitComponent":split, "autoLoad": true};

				if (href)
				{
					var arr = Util.getFilenameAndPathFromUrl(href);
					path = arr[0];
					if (href.slice(-3).toLowerCase() == ".js")
					{
						settings["settings"]["fileName"] = arr[1].substring(0, arr[1].length - 3);
					}
					else if (href.slice(-5).toLowerCase() == ".html")
					{
						settings["settings"]["morph"] = true;
					}
				}
				else
				{
					path = Util.concatPath([basePath, path]);
				}

				promises.push(ComponentOrganizer._loadComponent(className, path, settings, loadOptions, element.tagName));
			});

			return Promise.all(promises);

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

			var morph = Util.safeGet(settings, "settings.morph");
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

			if (ComponentOrganizer.__classes.get(className, {})["state"] == "loaded")
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
				ComponentOrganizer.__classes.mergeSet(className, {"state":"loaded"});
				promise = Promise.resolve();
			}
			else if (ComponentOrganizer.__classes.get(className, {})["state"] == "loading")
			{
				// Already loading
				console.debug(("ComponentOrganizer.__autoLoadComponent(): Component Already loading. className=" + className));
				promise = ComponentOrganizer.__classes.get(className)["promise"];
			}
			else
			{
				// Not loaded
				ComponentOrganizer.__classes.mergeSet(className, {"state":"loading"});
				promise = ComponentOrganizer.__loadComponentScript(fileName, path, options).then(function () {
					ComponentOrganizer.__classes.mergeSet(className, {"state":"loaded", "promise":null});
				});
				ComponentOrganizer.__classes.mergeSet(className, {"promise":promise});
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
			var root = component._rootElement.querySelector(Util.safeGet(settings, "settings.rootNode"));
			if (!root)
			{
				throw new ReferenceError(("Root node does not exist. name=" + (component.name) + ", tagName=" + tagName + ", rootNode=" + (Util.safeGet(settings, "settings.rootNode"))));
			}

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
				var newSettings;

				// super()
				if (addedComponent._super.prototype._injectSettings)
				{
					newSettings = Object.assign({}, addedComponent._super.prototype._injectSettings.call(this, oldSettings));
				}
				else
				{
					newSettings = {};
				}

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

		AutoloadOrganizer.organize = function organize (conditions, component, settings)
		{

			if (document.readyState !== 'loading')
			{
				AutoloadOrganizer._load.call(component, component);
			}
			else
			{
				document.addEventListener('DOMContentLoaded', function () {
					AutoloadOrganizer._load.call(component, component);
				});
			}

			return settings;

		};

		// -------------------------------------------------------------------------
		//  Protected
		// -------------------------------------------------------------------------

		/**
		* Load components.
		*
		* @param	{Component}		component			Component.
		*/
		AutoloadOrganizer._load = function _load (component)
		{

			var path = Util.concatPath([component.settings.get("system.appBaseUrl", ""), component.settings.get("system.componentPath", "")]);
			var splitComponent = component.settings.get("system.splitComponent", false);
			var target = component.getAttribute("data-target");

			ComponentOrganizer.loadTags(document, path, {"splitComponent":splitComponent}, target);

		};

		return AutoloadOrganizer;
	}(Organizer));

	// =============================================================================

	// =============================================================================
	//	Observer store class
	// =============================================================================

	var ObserverStore = /*@__PURE__*/(function (Store) {
		function ObserverStore () {
			Store.apply(this, arguments);
		}

		if ( Store ) ObserverStore.__proto__ = Store;
		ObserverStore.prototype = Object.create( Store && Store.prototype );
		ObserverStore.prototype.constructor = ObserverStore;

		ObserverStore.prototype.notify = function notify (type, conditions)
		{
			var this$1 = this;
			var args = [], len = arguments.length - 2;
			while ( len-- > 0 ) args[ len ] = arguments[ len + 2 ];


			var chain = Promise.resolve();

			this._sortItems().forEach(function (id) {
				chain = chain.then(function () {
					var ref;

					return (ref = this$1)._callHandler.apply(ref, [ type, conditions, this$1._items[id] ].concat( args ));
				});
			});

			return chain;

		};

		// -------------------------------------------------------------------------

		/**
		 * Notify observers synchronously.
		 *
		 * @param	{String}		type				Notification type(=methodname).
		 * @param	{Object}		conditions			Current conditions.
		 * @param	{Object}		...args				Arguments to callback function.
		 */
		ObserverStore.prototype.notifySync = function notifySync (type, conditions)
		{
			var this$1 = this;
			var args = [], len = arguments.length - 2;
			while ( len-- > 0 ) args[ len ] = arguments[ len + 2 ];


			this._sortItems().forEach(function (id) {
				var ref;

				(ref = this$1)._callHandler.apply(ref, [ type, conditions, this$1._items[id] ].concat( args ));
			});

		};

		// -------------------------------------------------------------------------
		// 	Protected
		// -------------------------------------------------------------------------

		/**
		 * Call handler.
		 *
		 * @param	{String}		type				Notification type(=methodname).
		 * @param	{Object}		conditions			Current conditions.
		 * @param	{Object}		observerInfo		Observer info.
		 * @param	{Object}		...args				Arguments to callback function.
		 *
		 * @return  {Promise}		Promise.
		 */
		ObserverStore.prototype._callHandler = function _callHandler (type, conditions, observerInfo)
		{
			var ref, ref$1;

			var args = [], len = arguments.length - 3;
			while ( len-- > 0 ) args[ len ] = arguments[ len + 3 ];

			if ((ref = this)._filter.apply(ref, [ conditions, observerInfo ].concat( args )))
			{
				if (typeof observerInfo["object"][type] === "function")
				{
					return (ref$1 = observerInfo["object"][type]).call.apply(ref$1, [ observerInfo["object"], conditions ].concat( args ));
				}
			}

		};

		// -------------------------------------------------------------------------

		/**
		 * Sort item keys.
		 *
		 * @param	{Object}		observerInfo		Observer info.
		 *
		 * @return  {Array}			Sorted keys.
		 */
		ObserverStore.prototype._sortItems = function _sortItems ()
		{
			var this$1 = this;


			return Object.keys(this._items).sort(function (a,b) {
				return this$1._items[a]["order"] - this$1.items[b]["order"];
			})

		};

		return ObserverStore;
	}(Store));

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
	OrganizerOrganizer.globalInit();
	window.BITSMIST.v1.SettingOrganizer = SettingOrganizer;
	SettingOrganizer.globalInit();
	OrganizerOrganizer.organizers.set("StateOrganizer", {"object":StateOrganizer, "targetWords":"waitFor", "targetEvents":["afterAppend"], "order":200});
	window.BITSMIST.v1.StateOrganizer = StateOrganizer;
	OrganizerOrganizer.organizers.set("EventOrganizer", {"object":EventOrganizer, "targetWords":"events", "targetEvents":["beforeStart", "afterAppend"], "order":300});
	window.BITSMIST.v1.EventOrganizer = EventOrganizer;
	OrganizerOrganizer.organizers.set("TemplateOrganizer", {"object":TemplateOrganizer, "targetWords":"templates", "targetEvents":["beforeStart"], "order":600});
	window.BITSMIST.v1.TemplateOrganizer = TemplateOrganizer;
	OrganizerOrganizer.organizers.set("AutoloadOrganizer", {"object":AutoloadOrganizer, "targetWords":"autoloads", "targetEvents":["beforeStart"], "order":700});
	window.BITSMIST.v1.AutoloadOrganizer = AutoloadOrganizer;
	OrganizerOrganizer.organizers.set("ComponentOrganizer", {"object":ComponentOrganizer, "targetWords":"components","targetEvents":["afterAppend"], "order":800});
	window.BITSMIST.v1.ComponentOrganizer = ComponentOrganizer;
	window.BITSMIST.v1.Pad = Pad;
	window.BITSMIST.v1.Store = Store;
	window.BITSMIST.v1.ObserverStore = ObserverStore;
	window.BITSMIST.v1.AjaxUtil = AjaxUtil;
	window.BITSMIST.v1.ClassUtil = ClassUtil;
	window.BITSMIST.v1.Util = Util;

	// Settings

	BITSMIST.v1.settings = SettingOrganizer.globalSettings;
	ClassUtil.newComponent(Component, {
		"settings": {
			"name":					"SettingManager",
			"loadGlobalSettings":	true,
		}
	}, "bm-setting", "SettingManager");

	// Tag loader

	ClassUtil.newComponent(Component, {
		"settings": {
			"name":					"TagLoader",
			"autoSetup":			false,
		},
		"organizers": {
			"AutoloadOrganizer":	""
		}
	}, "bm-tagloader", "TagLoader");

	// Load tags

	document.addEventListener('DOMContentLoaded', function () {
		if (BITSMIST.v1.settings.get("system.autoLoadOnStartup", true))
		{
			var path = Util.concatPath([
				BITSMIST.v1.settings.get("system.appBaseUrl", ""),
				BITSMIST.v1.settings.get("system.componentPath", "")
			]);
			var splitComponent = BITSMIST.v1.settings.get("system.splitComponent", false);
			ComponentOrganizer.loadTags(document, path, {"splitComponent":splitComponent});
		}
	});

}());
//# sourceMappingURL=bitsmist-js_v1.js.map
