// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

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
		settings = Object.assign({}, settings);
		settings.settings = ( settings.settings ? settings.settings : {} );
		settings["settings"]["name"] = className;
		classDef.prototype._getSettings = function() {
			return Util.deepMerge(superClass.prototype._getSettings(), settings);
		}

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
