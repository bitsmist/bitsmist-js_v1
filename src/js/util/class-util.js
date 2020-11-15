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
//import Globals from '../globals';

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
	 */
	static newComponent(superClass, settings, tagName)
	{

		//superClass = ( superClass ? superClass : Component );
		superClass = ( superClass ? superClass : BITSMIST.v1.Component );

		let component = function(options) {
			return Reflect.construct(superClass, [options], this.constructor);
		};
		ClassUtil.inherit(component, superClass);

		component.prototype._getSettings = function() {
			return settings;
		}

		if (tagName)
		{
			component.tagName = tagName;
			customElements.define(tagName, component);
		}

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

		return Function("return (" + className + ")")();

	}

}
