// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

//import Component from '../component'; // Importing component breaks this class. So do not import.
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

		let ret;

		try
		{
			let c = Function("return (" + className + ")")();
			ret = new c(...args);
		}
		catch(e)
		{
			if (e instanceof TypeError)
			{
				let c = window;
				className.split(".").forEach((value) => {
					c = c[value];
					if (!c)
					{
						throw new ReferenceError(`Class not found. className=${className}`);
					}
				});
				ret = new c(...args);
			}
			else
			{
				throw e;
			}
		}

		// Cache existence of the class
		//Globals["classes"][className] = true;

		return ret;

	}

}
