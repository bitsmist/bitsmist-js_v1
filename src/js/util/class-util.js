// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

//import Component from '../component'; // Importing component breaks this class. Do not import.
import Util from '../util/util';

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

		//superClass = ( superClass ? superClass : Component );
		superClass = ( superClass ? superClass : BITSMIST.v1.Component );
		className = ( className ? className : Util.getClassNameFromTagName(tagName) );

		let component = function(options) {
			return Reflect.construct(superClass, [options], this.constructor);
		};
		ClassUtil.inherit(component, superClass);

		settings["name"] = className;
		component.prototype._getSettings = function() {
			return settings;
		}

		// Define tag
		if (tagName)
		{
			customElements.define(tagName.toLowerCase(), component);
		}

		// Export to global
		window[className] = component;

		return component;

	}

	// -------------------------------------------------------------------------

	/**
	 * Instantiate the component.
	 *
	 * @param	{Object}		subClass			Sub class.
	 * @param	{Object}		superClass			Super class.
	 */
	static inherit(subClass, superClass)
	{

		subClass.prototype = Object.create(superClass.prototype);
		subClass.prototype.constructor = subClass;
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
			ret = Function("return (" + className + ")")();
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

}
