// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import Store from './store';

let Globals = (function(){
	let globals = {};

	globals["components"] = {};
	globals["classes"] = {};
	globals["settings"] = new Store();
	globals["preferences"] = new Store();
	globals["initializers"] = {};

	/**
	* Add a initializer to Globals.
	*
	* @param	{Object}		initializerClass	Initializer class.
	* @param	{Object}		target				Setting key name.
	*/
	globals["addInitializer"] = function(initializerClass, target)
	{

		Globals["initializers"][target] = initializerClass;

	}

	return globals;
}());

export default Globals;
