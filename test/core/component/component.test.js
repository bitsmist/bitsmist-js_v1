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

/*
test('Default Root Element Test - Default root element should be itself', async () => {
	document.body.innerHTML = "<bar-main></bar-main>";
	var barMain = document.querySelector("bar-main");

	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-main"}]);
	console.log(document.querySelector("bar-main"));
	expect(barMain.rootNode).toBe(document.querySelector("bar-main"));
});
*/
