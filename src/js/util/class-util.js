// =============================================================================
/**
 * Bitsmist WebView - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

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
	 * @param	{String}		componentName		Component name.
	 * @param	{Object}		settings			Component Settings.
	 * @param	{Object}		superClass			Super class.
	 * @param	{Function}		ctor				Constructor.
	 * @param	{Object}		options				Options for constructor.
	 */
	static newComponent(componentName, settings, superClass, ctor, options)
	{

		superClass = ( superClass ? superClass : BITSMIST.v1.Component );

		let component = function() {
			let _this = Reflect.construct(superClass, [], this.constructor);
			if (ctor)
			{
				ctor.call(_this, [options]);
			}
			return _this;
		};
		ClassUtil.inherit(component, superClass);
		customElements.define(componentName, component);

		component.prototype._getOptions = function() {
			return settings;
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

		return ret;

	}

}
