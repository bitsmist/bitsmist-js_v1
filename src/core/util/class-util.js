// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

//import Component from "../component.js"; // Importing component breaks this class. Do not import.
import Util from "../util/util.js";

// =============================================================================
//	Loader util class
// =============================================================================

export default class ClassUtil
{

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
	 * Define new component in ES5 way.
	 *
	 * @param	{Object}		superClass			Super class.
	 * @param	{Object}		settings			Component Settings.
	 * @param	{String}		tagName				Tag name.
	 * @param	{String}		className			Class name.
	 */
	static newComponent(superClass, settings, tagName, className)
	{

		className = ( className ? className : Util.getClassNameFromTagName(tagName) );

		// Define class
		let funcDef = "{ return Reflect.construct(superClass, [], this.constructor); }";
		let component = Function("superClass", "return function " + ClassUtil.__validateClassName(className) + "(){ " + funcDef + " }")(superClass);
		ClassUtil.inherit(component, superClass);

		settings = Object.assign({}, settings);
		settings.settings = ( settings.settings ? settings.settings : {} );
		settings["settings"]["name"] = className;
		component.prototype._getSettings = function() {
			return settings;
		}

		// Define tag
		if (tagName)
		{
			customElements.define(tagName.toLowerCase(), component);
		}

		return component;

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
		subClass.prototype._super = superClass;
		Object.setPrototypeOf(subClass, superClass);

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
