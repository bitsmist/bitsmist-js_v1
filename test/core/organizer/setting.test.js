/**
 * @jest-environment jsdom
 */
import { BarMain } from './_common.js';

// -----------------------------------------------------------------------------

test('Settings Loading Test - _injectSettings() should be called', async () => {
	BarMain.prototype._injectSettings = function(settings) {
		settings["injectSettings"] = true;

		return settings;
	};

	document.body.innerHTML = "<bar-main></bar-main>";
	var barMain = document.querySelector("bar-main");

	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-main"}]);
	expect(barMain.settings.get("injectSettings")).toBe(true);
});

// -----------------------------------------------------------------------------

test('Settings Loading Test - _getSettings() should be called', async () => {
	BarMain.prototype._getSettings = function() {
		let settings = this.__getSettings.call(this);
		settings["getSettings"] = true;

		return settings;
	};

	document.body.innerHTML = "<bar-main></bar-main>";
	var barMain = document.querySelector("bar-main");

	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-main"}]);
	expect(barMain.settings.get("getSettings")).toBe(true);
});

// -----------------------------------------------------------------------------

test('Settings Loading Test - An external setting file should be loaded', async () => {
	document.body.innerHTML = "<bar-main bm-settingref='http://test.bitsmist.com/test.settings.js'></bar-main>";
	var barMain = document.querySelector("bar-main");

	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-main"}]);
	expect(barMain.settings.get("settings.externalSettingsTest")).toBe(true);
});

test('Settings Loading Test - Attriubte settings should be loaded', async () => {
	document.body.innerHTML = "<bar-main bm-settings='{\"attrib\":\"true\"}'></bar-main>";
	var barMain = document.querySelector("bar-main");

	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-main"}]);
	expect(barMain.settings.get("settings.attrib")).toBe("true");
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
// Does not work

// test('Setting Test - Default root node should be itself', async () => {
// 	document.body.innerHTML = "<bar-main></bar-main>";
// 	var barMain = document.querySelector("bar-main");

// 	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-main"}]);
// 	console.log(document.querySelector("bar-main"));
// 	expect(barMain.rootNode).toBe(document.querySelector("bar-main"));
// });

// -----------------------------------------------------------------------------

test('Setting Test - settings.autoSetup=false should work', async () => {
	BarMain.prototype._getSettings = function() {
		let settings = this.__getSettings.call(this);
		settings["settings"]["autoPosStart"] = false;

		return settings;
	};
	document.body.innerHTML = "<bar-main></bar-main>";
	var barMain = document.querySelector("bar-main");

	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-main"}]);
	expect(barMain.testVars["eventCalled"]["beforeStart"]).toBe(true);
	expect(barMain.testVars["eventCalled"]["afterStart"]).toBe(false);
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

test('Setting Test - settings.autoPostStart=true should work', async () => {
	BarMain.prototype.onBeforeStart = function() {
		this.testVars = {};
		this.testVars["promise"] = {};
		this.testVars["promise"]["promise"] = new Promise((resolve, reject) => {
			this.testVars["promise"]["resolve"] = resolve;
		});
		this.testVars["autoPostStart"] = false;
	};

	BarMain.prototype.onAfterStart = function() {
		this.testVars["autoPostStart"] = true;
		this.testVars["promise"]["resolve"]();
	};

	BarMain.prototype._getSettings = function() {
		let settings = this.__getSettings.call(this);
		settings["settings"]["autoPostStart"] = true;
		settings["events"] = {
			"this": {
				"handlers": {
					"beforeStart": [this.onBeforeStart],
					"afterStart": [this.onAfterStart],
				}
			}
		}

		return settings;
	};

	document.body.innerHTML = "<bar-main></bar-main>";
	var barMain = document.querySelector("bar-main");

	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-main"}]);
	return barMain.testVars["promise"]["promise"].then(() => {
		expect(barMain.testVars["autoPostStart"]).toBe(true);
	});
});

// -----------------------------------------------------------------------------

test('Setting Test - settings.autoPostStart=false should work', async () => {
	BarMain.prototype.onBeforeStart = function() {
		this.testVars = {};
		this.testVars["promise"] = {};
		this.testVars["promise"]["promise"] = new Promise((resolve, reject) => {
			this.testVars["promise"]["resolve"] = resolve;
		});
		this.testVars["autoPostStart"] = false;
	};

	BarMain.prototype.onAfterStart = function() {
		this.testVars["autoPostStart"] = true;
		this.testVars["promise"]["resolve"]();
	};

	BarMain.prototype._getSettings = function() {
		let settings = this.__getSettings.call(this);
		settings["settings"]["autoPostStart"] = false;
		settings["events"] = {
			"this": {
				"handlers": {
					"beforeStart": [this.onBeforeStart],
					"afterStart": [this.onAfterStart],
				}
			}
		}

		return settings;
	};

	document.body.innerHTML = "<bar-main></bar-main>";
	var barMain = document.querySelector("bar-main");

	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-main"}]);
	expect(barMain.testVars["autoPostStart"]).toBe(false);
});

// -----------------------------------------------------------------------------

test('Setting Test - settings.autoPostStart=true should work', async () => {
	BarMain.prototype.onBeforeStart = function() {
		this.testVars = {};
		this.testVars["promise"] = {};
		this.testVars["promise"]["promise"] = new Promise((resolve, reject) => {
			this.testVars["promise"]["resolve"] = resolve;
		});
		this.testVars["autoPostStart"] = false;
	};

	BarMain.prototype.onAfterStart = function() {
		this.testVars["autoPostStart"] = true;
		this.testVars["promise"]["resolve"]();
	};

	BarMain.prototype._getSettings = function() {
		let settings = this.__getSettings.call(this);
		settings["settings"]["autoPostStart"] = true;
		settings["events"] = {
			"this": {
				"handlers": {
					"beforeStart": [this.onBeforeStart],
					"afterStart": [this.onAfterStart],
				}
			}
		}

		return settings;
	};

	document.body.innerHTML = "<bar-main></bar-main>";
	var barMain = document.querySelector("bar-main");

	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-main"}]);
	return barMain.testVars["promise"]["promise"].then(() => {
		expect(barMain.testVars["autoPostStart"]).toBe(true);
	});
});

// -----------------------------------------------------------------------------

test('Setting Test - settings.autoPostStart=false should work', async () => {
	BarMain.prototype.onBeforeStart = function() {
		this.testVars = {};
		this.testVars["promise"] = {};
		this.testVars["promise"]["promise"] = new Promise((resolve, reject) => {
			this.testVars["promise"]["resolve"] = resolve;
		});
		this.testVars["autoPostStart"] = false;
	};

	BarMain.prototype.onAfterStart = function() {
		this.testVars["autoPostStart"] = true;
		this.testVars["promise"]["resolve"]();
	};

	BarMain.prototype._getSettings = function() {
		let settings = this.__getSettings.call(this);
		settings["settings"]["autoPostStart"] = false;
		settings["events"] = {
			"this": {
				"handlers": {
					"beforeStart": [this.onBeforeStart],
					"afterStart": [this.onAfterStart],
				}
			}
		}

		return settings;
	};

	document.body.innerHTML = "<bar-main></bar-main>";
	var barMain = document.querySelector("bar-main");

	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-main"}]);
	expect(barMain.testVars["autoPostStart"]).toBe(false);
});
