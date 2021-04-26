// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import AjaxUtil from '../util/ajax-util';
import ClassUtil from '../util/class-util';
import Component from '../component';
import Organizer from './organizer';
import Pad from '../pad';
import Store from '../store/store';
import Util from '../util/util';

// =============================================================================
//	Component organizer class
// =============================================================================

export default class ComponentOrganizer extends Organizer
{

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
	 * Global init.
	 */
	static globalInit(targetClass)
	{

		// Add methods
		Pad.prototype.loadTags = ComponentOrganizer.loadTags;

		// Init vars
		ComponentOrganizer.__classes = new Store();

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

		// Add properties
		Object.defineProperty(component, 'components', {
			get() { return this._components; },
		});

		// Add methods
		component.addComponent = function(componentName, settings, sync) { return ComponentOrganizer._addComponent(this, componentName, settings, sync); }

		// Init vars
		component._components = {};

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
					return ComponentOrganizer._addComponent(component, moldName, molds[moldName], "opened");
				});
			});
		}

		// Load components
		let components = settings["components"];
		if (components)
		{
			Object.keys(components).forEach((componentName) => {
				chain = chain.then(() => {
					return ComponentOrganizer._addComponent(component, componentName, components[componentName]);
				});
			});
		}

		return chain.then(() => {
			return settings;
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Clear.
	 *
	 * @param	{Component}		component			Component.
	 */
	static clear(component)
	{

		Object.keys(component.components).forEach((key) => {
			component.components[key].parentNode.removeChild(component._components[key]);
		});

		component._components = {};

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

		let ret = false;

		if (conditions == "beforeStart")
		{
			if (!(component instanceof BITSMIST.v1.Pad))
			{
				ret = true;
			}
		}
		else
		{
			ret = super.isTarget(conditions, organizerInfo, component);
		}

		return ret;

	}

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
	static _addComponent(component, componentName, settings, sync)
	{

		let path = Util.concatPath([
			component.settings.get("system.appBaseUrl", ""),
			component.settings.get("system.componentPath", ""),
			Util.safeGet(settings, "settings.path", "")
		]);
		let className = Util.safeGet(settings, "settings.className") || componentName;
		let tagName = Util.safeGet(settings, "settings.tagName") || Util.getTagNameFromClassName(className);

		return Promise.resolve().then(() => {
			// Load component
			let autoLoad = Util.safeGet(settings, "settings.autoLoad", component.settings.get("system.autoLoad", true));
			let splitComponent = Util.safeGet(settings, "settings.splitComponent", component.settings.get("system.splitComponent", false));
			let options = { "autoLoad":autoLoad, "splitComponent":splitComponent };
			return ComponentOrganizer._loadComponent(className, path, settings, options, tagName);
		}).then(() => {
			// Insert tag
			if (Util.safeGet(settings, "settings.rootNode") && !component.components[componentName])
			{
				component.components[componentName] = ComponentOrganizer.__insertTag(component, tagName, settings);
			}
		}).then(() => {
			// Expose component
			let expose = Util.safeGet(settings, "settings.expose");
			if (expose)
			{
				let exposeName = ( expose === true ? componentName : expose );
				Object.defineProperty(component.__proto__, exposeName, {
					get() { return this.components[componentName]; }
				});
			}
		}).then(() => {
			// Wait for the added component to be ready
			if (sync || Util.safeGet(settings, "settings.sync"))
			{
				sync = sync || Util.safeGet(settings, "settings.sync"); // sync precedes settings["sync"]
				let state = (sync === true ? "started" : sync);
				let c = className.split(".");
				return component.waitFor([{"name":c[c.length - 1], "state":state}]);
			}
		});

	}

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
	static loadTags(rootNode, basePath, options, target)
	{

		console.debug(`ComponentOrganizer._loadTags(): Loading tags. rootNode=${rootNode}, basePath=${basePath}`);

		let promises = [];
		let targets = ( target ?
			document.querySelectorAll(target) :
			rootNode.querySelectorAll("[data-autoload]:not([data-autoloaded]),[data-automorph]:not([data-autoloaded])")
		);

		targets.forEach((element) => {
			element.setAttribute("data-autoloaded", "");

			let href = element.getAttribute("data-autoload");
			let className = element.getAttribute("data-classname") || Util.getClassNameFromTagName(element.tagName);
			let path = element.getAttribute("data-path") || "";
			let split = ( element.hasAttribute("data-split") ? true : options["splitComponent"] );
			let morph = ( element.hasAttribute("data-automorph") ?
				( element.getAttribute("data-automorph") ? element.getAttribute("data-automorph") : true ) :
				false
			);
			let settings = {"settings":{"morph":morph}};
			let loadOptions = {"splitComponent":split, "autoLoad": true};

			if (href)
			{
				let arr = Util.getFilenameAndPathFromUrl(href);
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

	}

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
	static _loadComponent(className, path, settings, options, tagName)
	{

		let morph = Util.safeGet(settings, "settings.morph");
		if (morph)
		{
			// Define empty class
			console.debug(`ComponentOrganizer._loadComponent(): Creating empty component. className=${className}, path=${path}, tagName=${tagName}`);

			let classDef = ( morph === true ?  BITSMIST.v1.Pad : ClassUtil.getClass(morph) );
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

	}

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
	static __isLoadedClass(className)
	{

		let ret = false;

		if (ComponentOrganizer.__classes.get(className, {})["state"] == "loaded")
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
	static __autoloadComponent(className, path, settings, options)
	{

		console.debug(`ComponentOrganizer.__autoLoadComponent(): Auto loading component. className=${className}, path=${path}`);

		let promise;
		let tagName = Util.safeGet(settings, "settings.tagName") || Util.getTagNameFromClassName(className);
		let fileName = ( settings["fileName"] ? settings["fileName"] : tagName );

		if (ComponentOrganizer.__isLoadedClass(className) || customElements.get(tagName))
		{
			// Already loaded
			console.debug(`ComponentOrganizer.__autoLoadComponent(): Component Already exists. className=${className}`);
			ComponentOrganizer.__classes.mergeSet(className, {"state":"loaded"});
			promise = Promise.resolve();
		}
		else if (ComponentOrganizer.__classes.get(className, {})["state"] == "loading")
		{
			// Already loading
			console.debug(`ComponentOrganizer.__autoLoadComponent(): Component Already loading. className=${className}`);
			promise = ComponentOrganizer.__classes.get(className)["promise"];
		}
		else
		{
			// Not loaded
			ComponentOrganizer.__classes.mergeSet(className, {"state":"loading"});
			promise = ComponentOrganizer.__loadComponentScript(fileName, path, options).then(() => {
				ComponentOrganizer.__classes.mergeSet(className, {"state":"loaded", "promise":null});
			});
			ComponentOrganizer.__classes.mergeSet(className, {"promise":promise});
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
	static __loadComponentScript(fileName, path, options)
	{

		console.debug(`ComponentOrganizer.__loadComponentScript(): Loading script. fileName=${fileName}, path=${path}`);

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
			console.debug(`ComponentOrganizer.__loadComponentScript(): Loaded script. fileName=${fileName}`);
		});

	}

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
		let root = component._rootElement.querySelector(Util.safeGet(settings, "settings.rootNode"));
		if (!root)
		{
			throw new ReferenceError(`Root node does not exist. name=${component.name}, tagName=${tagName}, rootNode=${Util.safeGet(settings, "settings.rootNode")}`);
		}

		// Build tag
		let tag = ( Util.safeGet(settings, "settings.tag") ? Util.safeGet(settings, "settings.tag") : "<" + tagName +  "></" + tagName + ">" );

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
			let newSettings;

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

	}

}
