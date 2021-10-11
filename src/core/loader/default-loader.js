// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import AjaxUtil from "../util/ajax-util.js";
import LoaderOrganizer from "../organizer/loader-organizer.js";
import ClassUtil from "../util/class-util.js";
import Store from "../store/store.js";
import Util from "../util/util.js";

// =============================================================================
//	Default loader class
// =============================================================================

export default class DefaultLoader
{

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
	 * Load scripts for tags which has bm-autoload attribute.
	 *
	 * @param	{HTMLElement}	rootNode			Target node.
	 * @param	{String}		basePath			Base path prepend to each element's path.
	 * @param	{Object}		options				Load Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static loadTags(rootNode, basePath, options)
	{

		console.debug(`Loading tags. rootNode=${rootNode.tagName}, basePath=${basePath}`);

		let promises = [];
		let waitList = [];

		// Load tags that has bm-autoload/bm-automorph attribute
		let targets = Util.scopedSelectorAll(rootNode, "[bm-autoload]:not([bm-autoloading]):not([bm-powered]),[bm-automorph]:not([bm-autoloading]):not([bm-powered])");
		targets.forEach((element) => {
			element.setAttribute("bm-autoloading", "");

			let loader = ( element.hasAttribute("bm-loader") ? LoaderOrganizer.loaders[element.getAttribute("bm-loader")].object : this);
			promises.push(loader.loadTag(element, basePath, options).then(() => {
				element.removeAttribute("bm-autoloading");
			}));
		});

		// Create waiting list to wait Bitsmist components
		targets = Util.scopedSelectorAll(rootNode, "[bm-powered],[bm-autoloading]");
		targets.forEach((element) => {
			if (rootNode != element.rootElement && !element.hasAttribute("bm-nowait"))
			{
				let waitItem = {"object":element, "state":"started"};
				waitList.push(waitItem);
			}
		});

		// Wait for the elements to be loaded
		return Promise.all(promises).then(() => {
			let waitFor = Util.safeGet(options, "waitForTags") && waitList.length > 0;
			if (waitFor)
			{
				// Wait for the elements to become "started"
				return BITSMIST.v1.StateOrganizer.waitFor(waitList, {"waiter":rootNode});
			}
		});

	}

	// -----------------------------------------------------------------------------

	/**
	 * Load a tag.
	 *
	 * @param	{HTMLElement}	element				Target element.
	 * @param	{String}		basePath			Base path prepend to each element's path.
	 * @param	{Object}		options				Load Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static loadTag(element, basePath, options)
	{

		let href = element.getAttribute("bm-autoload");
		let className = element.getAttribute("bm-classname") || Util.getClassNameFromTagName(element.tagName);
		let path = element.getAttribute("bm-path") || "";
		let split = ( element.hasAttribute("bm-split") ? true : options["splitComponent"] );
		let morph = ( element.hasAttribute("bm-automorph") ?
			( element.getAttribute("bm-automorph") ? element.getAttribute("bm-automorph") : true ) :
			false
		);
		let settings = {"settings":{"autoMorph":morph}};
		let loadOptions = {"splitComponent":split, "autoLoad": true};

		if (href)
		{
			let arr = Util.getFilenameAndPathFromUrl(href);
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

		return this.loadComponent(className, path, settings, loadOptions, element.tagName);

	}

	// -------------------------------------------------------------------------

	/**
	 * Load a component.
	 *
	 * @param	{String}		className			Class name.
	 * @param	{String}		path				Path to component.
	 * @param	{Object}		settings			Component settings.
	 * @param	{Object}		options				Load options.
	 * @param	{String}		tagName				Component's tag name
	 *
	 * @return  {Promise}		Promise.
	 */
	static loadComponent(className, path, settings, options, tagName)
	{

		let promise;

		let morph = Util.safeGet(settings, "settings.autoMorph");
		if (morph)
		{
			// Define empty class
			console.debug(`Creating empty component. className=${className}, path=${path}, tagName=${tagName}`);

			let superClass = ( morph === true ?  BITSMIST.v1.Component : ClassUtil.getClass(morph) );
			if (!customElements.get(tagName.toLowerCase()))
			{
				ClassUtil.newComponent(superClass, settings, tagName, className);
			}
		}
		else
		{
			if (options["autoLoad"])
			{
				// Load component script
				promise = this._autoloadComponent(className, path, settings, options);
			}
		}

		return Promise.all([promise]).then(() => {
			// Define tag if not defined yet
			if (!customElements.get(tagName.toLowerCase()))
			{
				let newClass = ClassUtil.getClass(className);
				customElements.define(tagName.toLowerCase(), newClass);
			}
		});

	}

	// -------------------------------------------------------------------------
	//  Protected
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

		if (LoaderOrganizer._classes.get(className, {})["state"] === "loaded")
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
	 * @param	{String}		path				Path to component.
	 * @param	{Object}		settings			Component settings.
	 * @param	{Object}		options				Load Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _autoloadComponent(className, path, settings, options)
	{

		console.debug(`Auto loading component. className=${className}, path=${path}`);

		let promise;
		let tagName = Util.safeGet(settings, "settings.tagName") || Util.getTagNameFromClassName(className);
		let fileName = Util.safeGet(settings, "settings.fileName", tagName);

		if (this._isLoadedClass(className) || customElements.get(tagName))
		{
			// Already loaded
			console.debug(`Component Already exists. className=${className}`);
			LoaderOrganizer._classes.set(className, {"state":"loaded"});
			promise = Promise.resolve();
		}
		else if (LoaderOrganizer._classes.get(className, {})["state"] === "loading")
		{
			// Already loading
			console.debug(`Component Already loading. className=${className}`);
			promise = LoaderOrganizer._classes.get(className)["promise"];
		}
		else
		{
			// Not loaded
			LoaderOrganizer._classes.set(className, {"state":"loading"});
			promise = this._loadComponentScript(fileName, path, options).then(() => {
				LoaderOrganizer._classes.set(className, {"state":"loaded", "promise":null});
			});
			LoaderOrganizer._classes.set(className, {"promise":promise});
		}

		return promise;

	}

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
	static _loadComponentScript(fileName, path, options)
	{

		console.debug(`Loading script. fileName=${fileName}, path=${path}`);

		let url1 = Util.concatPath([path, fileName + ".js"]);
		let url2 = Util.concatPath([path, fileName + ".settings.js"]);

		return Promise.resolve().then(() => {
			return AjaxUtil.loadScript(url1);
		}).then(() => {
			if (options["splitComponent"])
			{
				return AjaxUtil.loadScript(url2);
			}
		}).then(() => {
			console.debug(`Loaded script. fileName=${fileName}`);
		});

	}

}
