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
		Component.prototype.loadTags = function(rootNode, basePath, settings, target) {
			return ComponentOrganizer._loadTags(this, rootNode, basePath, settings, target);
		}

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

		let url = Util.concatPath([component.settings.get("system.appBaseUrl", ""), component.settings.get("system.componentPath", ""), ( "path" in settings ? settings["path"] : "")]);
		let splitComponent = ( "splitComponent" in settings ? settings["splitComponent"] : component.settings.get("system.splitComponent", false) );
		let className = settings["className"] || componentName;
		let tagName = settings["tagName"] || Util.getTagNameFromClassName(className || componentName);

		return Promise.resolve().then(() => {
			// Load component
			let options = Object.assign({}, settings, {"splitComponent":splitComponent});
			return ComponentOrganizer._loadComponent(className, url, options, tagName);
		}).then(() => {
			// Insert tag
			if (settings["rootNode"] && !component.components[componentName])
			{
				component.components[componentName] = ComponentOrganizer.__insertTag(tagName, settings);
			}
		}).then(() => {
			// Expose component
			if (settings["expose"])
			{
				let exposeName = ( settings["expose"] === true ? componentName : settings["expose"] );
				Object.defineProperty(component.__proto__, exposeName, {
					get() { return this.components[componentName]; }
				});
			}
		}).then(() => {
			// Wait for the added component to be ready
			if (sync || settings["sync"])
			{
				sync = sync || settings["sync"]; // sync precedes settings["sync"]
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
	 * @param	{Object}		settings			Settings.
	 * @param	{String}		target				Target elements.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _loadTags(component, rootNode, basePath, settings, target)
	{

		let promises = [];
		let targets = ( target ? document.querySelectorAll(target) : rootNode.querySelectorAll("[data-autoload],[data-automorph]") );

		console.debug(`ComponentOrganizer._loadTags(): Loading tags. name=${component.name}, target=${target}`);

		targets.forEach((element) => {
			if (element.getAttribute("href"))
			{
				let url = element.getAttribute("href");
				promises.push(AjaxUtil.loadScript(url));
			}
			else
			{
				let classPath = ( element.hasAttribute("data-path") ? element.getAttribute("data-path") : "" );
				let className = ( element.hasAttribute("data-classname") ? element.getAttribute("data-classname") : Util.getClassNameFromTagName(element.tagName) );
				let split = ( element.hasAttribute("data-split") ? element.getAttribute("data-split") : settings["splitComponent"] );
				let morph = ( element.hasAttribute("data-automorph") ? ( element.getAttribute("data-automorph") ? element.getAttribute("data-automorph") : true ) : false );
				let options = Object.assign({}, settings, {"splitComponent":split, "morph":morph});

				promises.push(ComponentOrganizer._loadComponent(className, Util.concatPath([basePath, classPath]), options, element.tagName));
			}

			element.removeAttribute("data-autoload");
			element.removeAttribute("data-automorph");
		});

		return Promise.all(promises);

	}

	// -------------------------------------------------------------------------

	/**
	 * Create component.
	 *
	 * @param	{String}		componentName		Component name.
	 * @param	{Object}		options				Component options.
	 * @param	{String}		path				Path to component.
	 * @param	{Object}		settings			System settings.
	 *
	 * @return  {Promise}		Promise.
	 */
	/*
	static _createComponent(componentName, options, path, settings)
	{

		options = Object.assign({}, options);
		let className = ( "className" in options ? options["className"] : componentName );
		let component = null;

		return ComponentOrganizer.__autoloadComponent(className, path, settings).then(() => {
			component = ClassUtil.createObject(className, options);

			return component;
		});

	}
	*/

	// -------------------------------------------------------------------------

	/**
	 * Load the template html.
	 *
	 * @param	{String}		componentName		Component name.
	 * @param	{String}		path				Path to component.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _loadComponent(componentName, path, options, tagName)
	{

		if (options["morph"])
		{
			// Define empty class
			console.debug(`ComponentOrganizer._loadComponent(): Creating empty component. tagName=${tagName}`);

			let classDef = ( options["morph"] === true ?  BITSMIST.v1.Pad : ClassUtil.getClass(options["morph"]) );
			ClassUtil.newComponent(classDef, options, tagName);
		}
		else
		{
			// Load component script
			return ComponentOrganizer.__autoloadComponent(componentName, path, options);
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
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static __autoloadComponent(className, path, options)
	{

		console.debug(`ComponentOrganizer.__autoLoadComponent(): Auto loading component. className=${className}, path=${path}`);

		let promise;
		let tagName = options["tagName"] || Util.getTagNameFromClassName(className);

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
			promise = ComponentOrganizer.__loadComponentScript(tagName, path, options).then(() => {
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
	 * @param	{String}		componentName		Component name.
	 * @param	{String}		path				Path to component.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static __loadComponentScript(componentName, path, options)
	{

		console.debug(`ComponentOrganizer.__loadComponentScript(): Loading script. componentName=${componentName}, path=${path}`);

		options = ( options ? options : {} );

		let url1 = Util.concatPath([path, componentName + ".js"]);
		let url2 = Util.concatPath([path, componentName + ".settings.js"]);

		return Promise.resolve().then(() => {
			return AjaxUtil.loadScript(url1);
		}).then(() => {
			if (options["splitComponent"])
			{
				return AjaxUtil.loadScript(url2);
			}
		}).then(() => {
			console.debug(`ComponentOrganizer.__loadComponentScript(): Loaded script. componentName=${componentName}`);
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Insert a tag and return the inserted component.
	 *
	 * @param	{String}		tagName				Tagname.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Component}		Component.
	 */
	static __insertTag(tagName, options)
	{

		let addedComponent;

		// Check root node
		let root = document.querySelector(options["rootNode"]);
		if (!root)
		{
			throw new ReferenceError(`Root node does not exist when adding component ${componentName} to ${options["rootNode"]}. name=${component.name}`);
		}

		// Build tag
		let tag = ( options["tag"] ? options["tag"] : "<" + tagName +  "></" + tagName + ">" );

		// Insert tag
		if (options["overwrite"])
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
		addedComponent._injectSettings = function(settings){
			// super()
			if (addedComponent._super.prototype._injectSettings)
			{
				settings = Object.assign({}, addedComponent._super.prototype._injectSettings.call(this, settings));
			}
			else
			{
				settings = {};
			}

			return Util.deepMerge(settings, options);
		};

		return addedComponent;

	}

}
