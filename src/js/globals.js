import Router from "./plugin/router";
import Store from "./plugin/store";

let Globals = (function(){
	let globals = {};

	globals["app"];
	globals["services"] = {};
	globals["services"]["router"] = new Router();
	globals["services"]["settings"] = new Store();
	globals["services"]["preferences"] = new Store(null, {"loadEvent":"loadPreferences", "saveEvent":"savePreferences"});
	globals["services"]["store"] = new Store();

	return globals;
}());

export default Globals;
