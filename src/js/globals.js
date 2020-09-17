import Router from "./plugin/router";
import Store from "./plugin/store";

let Globals = (function(){
	let globals = {};

	globals["app"];
	globals["components"] = {};

	return globals;
}());

export default Globals;
