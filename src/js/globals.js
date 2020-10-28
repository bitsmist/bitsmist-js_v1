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

	return globals;
}());

export default Globals;
