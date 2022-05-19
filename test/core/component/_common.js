import '../../../src/core/index';
import './_settings.js';

export class BarMain extends BITSMIST.v1.Component
{

	/*
	getFuncName() {
   		//return this.getFuncName.caller.name
		return (new Error()).stack.match(/at (\S+)/g)[1].slice(3);
	}
	*/

	_getSettings()
	{
		return this.__getSettings();
	}

	__getSettings()
	{

		return {
			"loadings": {
				"path": "common",
			},
			"settings": {
				"name": "BarMain",
//				"autoStop": false,
			},
			"events": {
				"this": {
					"handlers": {
						/*
						"beforeStart": [
							{"handler": this.onBeforeStart},
						],
						*/
						"beforeStart": [this.onBeforeStart],
						"afterStart": [this.onAfterStart],
						"beforeStop": [this.onBeforeStop],
						"doStop": [this.onDoStop],
						"afterStop": [this.onAfterStop],
						"beforeSetup": [this.onBeforeSetup],
						"doSetup": [this.onDoSetup],
						"afterSetup": [this.onAfterSetup],
						"afterAppend": [this.onAfterAppend],
						"beforeRefresh": [this.onBeforeRefresh],
						"doRefresh": [this.onDoRefresh],
						"afterRefresh": [this.onAfterRefresh],
						"doTarget": [this.onDoTarget],
						"beforeFetch": [this.onBeforeFetch],
						"doFetch": [this.onDoFetch],
						"afterFetch": [this.onAfterFetch],
						"beforeFill": [this.onBeforeFill],
						"doFill": [this.onDoFill],
						"afterFill": [this.onAfterFill],
					}
				}
			},
		};
	}

	onBeforeStart()
	{
//		console.log("@@@beforeStart");

		this.testVars = {};
		this.testVars["eventCalled"] = {
			"beforeStart": false,
			"afterStart": false,
			"beforeStop": false,
			"doStop": false,
			"afterStop": false,
			"beforeSetup": false,
			"doSetup": false,
			"afterSetup": false,
			"afterAppend": false,
			"beforeRefresh": false,
			"doRefresh": false,
			"afterRefresh": false,
			"doTarget": false,
			"beforeFetch": false,
			"doFetch": false,
			"afterFetch": false,
			"beforeFill": false,
			"doFill": false,
			"afterFill": false,
		};
		this.testVars["eventOrder"] = [];

		this.testVars["eventCalled"]["beforeStart"] = true;
		this.testVars["eventOrder"].push("beforeStart");
	}

	onAfterStart()
	{
//		console.log("@@@afterStart");

		this.testVars["eventCalled"]["afterStart"] = true;
		this.testVars["eventOrder"].push("afterStart");
	}

	onBeforeStop()
	{
//		console.log("@@@beforeStop");
		this.testVars["eventCalled"]["beforeStop"] = true;
//		this.testVars["eventOrder"].push("beforeStop");
	}

	onDoStop()
	{
//		console.log("@@@doStop");
		this.testVars["eventCalled"]["doStop"] = true;
//		this.testVars["eventOrder"].push("doStop");
	}

	onAfterStop()
	{
//		console.log("@@@afterStop");
		this.testVars["eventCalled"]["afterSetup"] = true;
//		this.testVars["eventOrder"].push("afterSetup");
	}

	onBeforeSetup()
	{
//		console.log("@@@beforeSetup");
		this.testVars["eventCalled"]["beforeSetup"] = true;
		this.testVars["eventOrder"].push("beforeSetup");
	}

	onDoSetup()
	{
//		console.log("@@@doSetup");
		this.testVars["eventCalled"]["doSetup"] = true;
		this.testVars["eventOrder"].push("doSetup");
	}

	onAfterSetup()
	{
//		console.log("@@@afterSetup");
		this.testVars["eventCalled"]["afterSetup"] = true;
		this.testVars["eventOrder"].push("afterSetup");
	}

	onAfterAppend()
	{
//		console.log("@@@afterAppend");
		this.testVars["eventCalled"]["afterAppend"] = true;
		this.testVars["eventOrder"].push("afterAppend");
	}

	onBeforeRefresh()
	{
//		console.log("@@@beforeRefresh");
		this.testVars["eventCalled"]["beforeRefresh"] = true;
		this.testVars["eventOrder"].push("beforeRefresh");
	}

	onDoRefresh()
	{
//		console.log("@@@doRefresh");
		this.testVars["eventCalled"]["doRefresh"] = true;
		this.testVars["eventOrder"].push("doRefresh");
	}

	onAfterRefresh()
	{
//		console.log("@@@afterRefresh");
		this.testVars["eventCalled"]["afterRefresh"] = true;
		this.testVars["eventOrder"].push("afterRefresh");
	}

	onDoTarget()
	{
//		console.log("@@@doTarget");
		this.testVars["eventCalled"]["doTarget"] = true;
		this.testVars["eventOrder"].push("doTarget");
	}

	onBeforeFetch()
	{
//		console.log("@@@beforeFetch");
		this.testVars["eventCalled"]["beforeFetch"] = true;
		this.testVars["eventOrder"].push("beforeFetch");
	}

	onDoFetch()
	{
//		console.log("@@@doFetch");
		this.testVars["eventCalled"]["doFetch"] = true;
		this.testVars["eventOrder"].push("doFetch");
	}

	onAfterFetch()
	{
//		console.log("@@@afterFetch");
		this.testVars["eventCalled"]["afterFetch"] = true;
		this.testVars["eventOrder"].push("afterFetch");
	}

	onBeforeFill()
	{
//		console.log("@@@beforeFill");
		this.testVars["eventCalled"]["beforeFill"] = true;
		this.testVars["eventOrder"].push("beforeFill");
	}

	onDoFill()
	{
//		console.log("@@@doFill");
		this.testVars["eventCalled"]["doFill"] = true;
		this.testVars["eventOrder"].push("doFill");
	}

	onAfterFill()
	{
//		console.log("@@@afterFill");
		this.testVars["eventCalled"]["afterFill"] = true;
		this.testVars["eventOrder"].push("afterFill");
	}

}
customElements.define("bar-main", BarMain);
