/**
 * @jest-environment jsdom
 */
import {BarMain} from './_common.js';

// -----------------------------------------------------------------------------

test('Component Name Test - Component name should be "BarMain"', () => {
	document.body.innerHTML = "<bar-main></bar-main>";
	var barMain = document.querySelector("bar-main");

	expect(barMain.name).toBe("BarMain");
});

// -----------------------------------------------------------------------------

test('Inheritance Test - Component instance should be an instance of HTMLElement', () => {
	document.body.innerHTML = "<bar-main></bar-main>";
	var barMain = document.querySelector("bar-main");

	expect(barMain).toBeInstanceOf(HTMLElement);
});

// -----------------------------------------------------------------------------

test('Initialization Test - Component should be initialized only once', async () => {
	document.body.innerHTML = "<div id='div1'><bar-main></bar-main></div><div id='div2'></div>";

	var oldId = document.querySelector("bar-main").uniqueId;
	document.getElementById('div2').insertAdjacentElement('afterbegin', document.querySelector('bar-main'));
	var newId = document.querySelector("bar-main").uniqueId;
	expect(oldId).toBe(newId);
	console.log(document.body.innerHTML);

});

// -----------------------------------------------------------------------------

test('State Transition Test - Does not stop when starting', async () => {
	BarMain.prototype._getSettings = function() {
		let settings = this.__getSettings.call(this);
		settings["events"] = {
			"this": {
				"handlers": {
					"beforeStart": this.onBeforeStart,
					"afterStart": this.onAfterStart,
					"beforeStop": this.onBeforeStop
				}
			}
		};

		return settings;
	};

	BarMain.prototype.onBeforeStart = function(sender, e, ex) {
		this.testVars = {
			"eventOrder": [],
		};
	};

	BarMain.prototype.onAfterStart = function(sender, e, ex) {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				this.testVars["eventOrder"].push(e.type);
				resolve();
			}, 3000);
		});
	};

	BarMain.prototype.onBeforeStop = function(sender, e, ex) {
		this.testVars["eventOrder"].push(e.type);
	};

	document.body.innerHTML = "<bar-main></bar-main>";
	var barMain = document.querySelector("bar-main");
	document.body.innerHTML = "";

	await BITSMIST.v1.StateOrganizer.waitFor([{"name":"BarMain", "state":"disconnected"}]);
	expect(barMain.testVars["eventOrder"][0]).toBe("afterStart");
	expect(barMain.testVars["eventOrder"][1]).toBe("beforeStop");
});

// -----------------------------------------------------------------------------

test('State Transition Test - Does not start when stopping', async () => {
	BarMain.prototype._getSettings = function() {
		let settings = this.__getSettings.call(this);
		settings["settings"]["autoRestart"] = true;
		settings["events"] = {
			"this": {
				"handlers": {
					"beforeStart": this.onBeforeStart,
					"afterStop": this.onAfterStop
				}
			}
		};

		return settings;
	};

	BarMain.prototype.onBeforeStart = function(sender, e, ex) {
		if (!this.testVars)
		{
			this.testVars = {
				"eventOrder": [],
			};
		}
		this.testVars["eventOrder"].push(e.type);
	};

	BarMain.prototype.onAfterStop = function(sender, e, ex) {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				this.testVars["eventOrder"].push(e.type);
				resolve();
			}, 3000);
		});
	};

	document.body.innerHTML = "<div id='container'><bar-main></bar-main></div>";
	var barMain = document.querySelector("bar-main");

	await BITSMIST.v1.StateOrganizer.waitFor([{"name":"BarMain"}]);
	document.querySelector("#container").removeChild(barMain);
	document.querySelector("#container").appendChild(barMain);
	await BITSMIST.v1.StateOrganizer.waitFor([{"name":"BarMain", "state":"disconnected"}]);
	await BITSMIST.v1.StateOrganizer.waitFor([{"name":"BarMain", "state":"ready"}]);
//	expect(barMain.testVars["eventOrder"].length).toBe(3);
	expect(barMain.testVars["eventOrder"][0]).toBe("beforeStart");
	expect(barMain.testVars["eventOrder"][1]).toBe("afterStop");
	expect(barMain.testVars["eventOrder"][2]).toBe("beforeStart");
});

// -----------------------------------------------------------------------------

test('Setting Test - settings.name should be applied', async () => {
	BarMain.prototype._getSettings = function() {
		let settings = this.__getSettings();
		settings["settings"]["name"] = "BarMain2";

		return settings;
	};

	document.body.innerHTML = "<bar-main></bar-main>";
	var barMain = document.querySelector("bar-main");

	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-main"}]);
	expect(barMain.name).toBe("BarMain2");
});

// -----------------------------------------------------------------------------

test('Setting Test - settings.autoSetup=true should work', async () => {
	BarMain.prototype._getSettings = function() {
		return this.__getSettings();
	};
	document.body.innerHTML = "<bar-main></bar-main>";
	var barMain = document.querySelector("bar-main");

	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-main"}]);
	expect(barMain.testVars["eventCalled"]["beforeSetup"]).toBe(true);
	expect(barMain.testVars["eventCalled"]["doSetup"]).toBe(true);
	expect(barMain.testVars["eventCalled"]["afterSetup"]).toBe(true);
});

// -----------------------------------------------------------------------------

test('Setting Test - settings.autoSetup=false should work', async () => {
	BarMain.prototype._getSettings = function() {
		let settings = this.__getSettings.call(this);
		settings["settings"]["autoSetup"] = false;

		return settings;
	};
	document.body.innerHTML = "<bar-main></bar-main>";
	var barMain = document.querySelector("bar-main");

	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-main"}]);
	expect(barMain.testVars["eventCalled"]["beforeSetup"]).toBe(false);
	expect(barMain.testVars["eventCalled"]["doSetup"]).toBe(false);
	expect(barMain.testVars["eventCalled"]["afterSetup"]).toBe(false);
});

// -----------------------------------------------------------------------------

test('Setting Test - settings.autoRefresh=true should work', async () => {
	BarMain.prototype._getSettings = function() {
		return this.__getSettings();
	};
	document.body.innerHTML = "<bar-main></bar-main>";
	var barMain = document.querySelector("bar-main");

	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-main"}]);
	expect(barMain.testVars["eventCalled"]["beforeRefresh"]).toBe(true);
	expect(barMain.testVars["eventCalled"]["doRefresh"]).toBe(true);
	expect(barMain.testVars["eventCalled"]["afterRefresh"]).toBe(true);
	expect(barMain.testVars["eventCalled"]["beforeFetch"]).toBe(true);
	expect(barMain.testVars["eventCalled"]["doTarget"]).toBe(true);
	expect(barMain.testVars["eventCalled"]["doFetch"]).toBe(true);
	expect(barMain.testVars["eventCalled"]["afterFetch"]).toBe(true);
});

// -----------------------------------------------------------------------------

test('Setting Test - settings.autoRefresh=false should work', async () => {
	BarMain.prototype._getSettings = function() {
		let settings = this.__getSettings.call(this);
		settings["settings"]["autoRefresh"] = false;

		return settings;
	};
	document.body.innerHTML = "<bar-main></bar-main>";
	var barMain = document.querySelector("bar-main");

	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-main"}]);
	expect(barMain.testVars["eventCalled"]["beforeRefresh"]).toBe(false);
	expect(barMain.testVars["eventCalled"]["doRefresh"]).toBe(false);
	expect(barMain.testVars["eventCalled"]["afterRefresh"]).toBe(false);
	expect(barMain.testVars["eventCalled"]["beforeFetch"]).toBe(false);
	expect(barMain.testVars["eventCalled"]["doTarget"]).toBe(false);
	expect(barMain.testVars["eventCalled"]["doFetch"]).toBe(false);
	expect(barMain.testVars["eventCalled"]["afterFetch"]).toBe(false);
});

// -----------------------------------------------------------------------------

test('Setting Test - settings.autoFetch=true should work', async () => {
	BarMain.prototype._getSettings = function() {
		return this.__getSettings();
	};
	document.body.innerHTML = "<bar-main></bar-main>";
	var barMain = document.querySelector("bar-main");

	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-main"}]);
	expect(barMain.testVars["eventCalled"]["beforeRefresh"]).toBe(true);
	expect(barMain.testVars["eventCalled"]["doRefresh"]).toBe(true);
	expect(barMain.testVars["eventCalled"]["afterRefresh"]).toBe(true);
	expect(barMain.testVars["eventCalled"]["beforeFetch"]).toBe(true);
	expect(barMain.testVars["eventCalled"]["doTarget"]).toBe(true);
	expect(barMain.testVars["eventCalled"]["doFetch"]).toBe(true);
	expect(barMain.testVars["eventCalled"]["afterFetch"]).toBe(true);
});

// -----------------------------------------------------------------------------

test('Setting Test - settings.autoFetch=false should work', async () => {
	BarMain.prototype._getSettings = function() {
		let settings = this.__getSettings.call(this);
		settings["settings"]["autoFetch"] = false;

		return settings;
	};
	document.body.innerHTML = "<bar-main></bar-main>";
	var barMain = document.querySelector("bar-main");

	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-main"}]);
	expect(barMain.testVars["eventCalled"]["beforeRefresh"]).toBe(true);
	expect(barMain.testVars["eventCalled"]["doRefresh"]).toBe(true);
	expect(barMain.testVars["eventCalled"]["afterRefresh"]).toBe(true);
	expect(barMain.testVars["eventCalled"]["beforeFetch"]).toBe(false);
	expect(barMain.testVars["eventCalled"]["doTarget"]).toBe(true);
	expect(barMain.testVars["eventCalled"]["doFetch"]).toBe(false);
	expect(barMain.testVars["eventCalled"]["afterFetch"]).toBe(false);
});

// -----------------------------------------------------------------------------

test('Setting Test - settings.autoFill=true should work', async () => {
	BarMain.prototype._getSettings = function() {
		return this.__getSettings();
	};
	document.body.innerHTML = "<bar-main></bar-main>";
	var barMain = document.querySelector("bar-main");

	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-main"}]);
	expect(barMain.testVars["eventCalled"]["beforeFill"]).toBe(true);
	expect(barMain.testVars["eventCalled"]["doFill"]).toBe(true);
	expect(barMain.testVars["eventCalled"]["afterFill"]).toBe(true);
});

// -----------------------------------------------------------------------------

test('Setting Test - settings.autoFill=false should work', async () => {
	BarMain.prototype._getSettings = function() {
		let settings = this.__getSettings.call(this);
		settings["settings"]["autoFill"] = false;

		return settings;
	};
	document.body.innerHTML = "<bar-main></bar-main>";
	var barMain = document.querySelector("bar-main");

	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-main"}]);
	expect(barMain.testVars["eventCalled"]["beforeFill"]).toBe(false);
	expect(barMain.testVars["eventCalled"]["doFill"]).toBe(false);
	expect(barMain.testVars["eventCalled"]["afterFill"]).toBe(false);
});

// -----------------------------------------------------------------------------

test('Setting Test - settings.hasTemplate=true should work', async () => {
	BarMain.prototype._getSettings = function() {
		return this.__getSettings();
	};
	document.body.innerHTML = "<bar-main></bar-main>";
	var barMain = document.querySelector("bar-main");

	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-main"}]);
	expect(barMain.testVars["eventCalled"]["afterAppend"]).toBe(true);
	expect(barMain.innerHTML).toBe("<div>bar-main</div>");
});

// -----------------------------------------------------------------------------

test('Setting Test - settings.hasTemplate=false should work', async () => {
	BarMain.prototype._getSettings = function() {
		let settings = this.__getSettings.call(this);
		settings["settings"]["hasTemplate"] = false;

		return settings;
	};
	document.body.innerHTML = "<bar-main></bar-main>";
	var barMain = document.querySelector("bar-main");

	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-main"}]);
	expect(barMain.testVars["eventCalled"]["afterAppend"]).toBe(true);
	expect(barMain.innerHTML).toBe("");
});

// -----------------------------------------------------------------------------

/*
test('Default Root Element Test - Default root element should be itself', async () => {
	document.body.innerHTML = "<bar-main></bar-main>";
	var barMain = document.querySelector("bar-main");

	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-main"}]);
	console.log(document.querySelector("bar-main"));
	expect(barMain.rootNode).toBe(document.querySelector("bar-main"));
});
*/
