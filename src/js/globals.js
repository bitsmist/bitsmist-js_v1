import Store from './plugin/store';

let Globals = (function(){
	let globals = {};

	globals["components"] = {};
	globals["classes"] = {};
	globals["settings"] = new Store();
	globals["preferences"] = new Store();

	return globals;
}());

export default Globals;
