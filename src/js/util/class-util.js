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
		LoaderUtil.inherit(component, superClass);
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

}
