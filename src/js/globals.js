// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import LoaderMixin from './mixin/loader-mixin';
import Store from './store';
import Util from './util/util';

// =============================================================================
//	Global class
// =============================================================================

class Globals
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
	constructor()
	{

		this._components = {};
		this._classes = {};
		this._organizers = {};
		this._settings = new Store();
		this._preferences = new Store();

	}

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	/**
	 * Components.
	 *
	 * @type	{Object}
	 */
	get components()
	{

		return this._components;

	}

	// -------------------------------------------------------------------------

	/**
	 * Classes.
	 *
	 * @type	{Object}
	 */
	get classes()
	{

		return this._classes;

	}

	// -------------------------------------------------------------------------

	/**
	 * Organizers.
	 *
	 * @type	{Object}
	 */
	get organizers()
	{

		return this._organizers;

	}

	// -------------------------------------------------------------------------

	/**
	 * Settings.
	 *
	 * @type	{Object}
	 */
	get settings()
	{

		return this._settings;

	}

	set settings(value)
	{

		this._settings = value;

	}

	// -------------------------------------------------------------------------

	/**
	 * Preferences.
	 *
	 * @type	{Object}
	 */
	get preferences()
	{

		return this._preferences;

	}

	set preferences(value)
	{

		this._preferences = value;

	}

	// -------------------------------------------------------------------------
	//  Method
	// -------------------------------------------------------------------------

	/**
     * Add an organizer.
     *
	 * @param	{Object}		organizerClass		Organizer class.
	 * @param	{Object}		target				Target.
     */
	addOrganizer(organizerClass, target)
	{

		this._organizers[target] = organizerClass;

	}

	// -------------------------------------------------------------------------

	/**
	 * Clear organizers.
	 */
	clearOrganizers(component)
	{

		Object.keys(this._organizers).forEach((key) => {
			if (typeof this._organizers[key].clear == "function")
			{
				this._organizers[key].clear(component);
			}
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Get an organizer. Throws an error if it is not a function.
	 *
	 * @param	{String}		type				Organizer type.
	 *
	 * @return 	{Promise}		Promise.
	 */
	getOrganizer(type)
	{

		let organizer = this._organizers[type];

		if (typeof organizer != "function" || typeof organizer.organize!= "function")
		{
			throw TypeError(`Organizer is not a function. type=${type}`);
		}

		return organizer;

	}

	// -------------------------------------------------------------------------

	/**
	 * Add a component to parent component.
	 *
	 * @param	{Component}		component			Parent component.
	 * @param	{String}		componentName		Component name.
	 * @param	{Object}		options				Options for the component.
	 *
	 * @return  {Promise}		Promise.
	 */
	addComponent(component, componentName, options)
	{

		if (!component._components)
		{
			component._components = {};
		}

		return new Promise((resolve, reject) => {
			let path = Util.concatPath([component._settings.get("system.appBaseUrl", ""), component._settings.get("system.componentPath", ""), ( "path" in options ? options["path"] : "")]);
			let splitComponent = ( "splitComponent" in options ? options["splitComponent"] : component._settings.get("system.splitComponent", false) );
			let className = ( "className" in options ? options["className"] : componentName );

			Promise.resolve().then(() => {
				// Load component
				return this.loadComponent(className, path, {"splitComponent":splitComponent});
			}).then(() => {
				// Insert tag
				if (options["rootNode"] && !component._components[componentName])
				{
					// Check root node
					let root = document.querySelector(options["rootNode"]);
					if (!root)
					{
						throw new ReferenceError(`Root node does not exist when adding component ${componentName} to ${options["rootNode"]}. name=${component.name}`);
					}

					// Get tag
					let tagName = ( options["tagName"] ? options["tagName"] : BITSMIST.v1.ClassUtil.getClass(className).tagName );
					let tag = ( options["tag"] ? options["tag"] : ( tagName ? "<" + tagName + "></" + tagName + ">" : "") );
					if (!tag)
					{
						throw new ReferenceError(`Tag name for '${componentName}' is not defined. name=${component.name}`);
					}

					// Insert tag
					root.insertAdjacentHTML("afterbegin", tag);
					component._components[componentName] = root.children[0];
				}
			}).then(() => {
				resolve();
			});
		});

	}

}

// Mixin
Object.assign(Globals.prototype, LoaderMixin);

let globals = new Globals();
export default globals;
