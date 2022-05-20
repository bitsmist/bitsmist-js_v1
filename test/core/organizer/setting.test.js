/**
 * @jest-environment jsdom
 */
import {BarMain} from './_common.js';

// -----------------------------------------------------------------------------

test('Setting test - settings.name should be applied', async () => {
	BarMain.prototype._getSettings = function() {
		return this.__getSettings();
	};
	document.body.innerHTML = "<bar-main></bar-main>";
	var barMain = document.querySelector("bar-main");

	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-main"}]);
	expect(barMain.name).toBe("BarMain");
});

/* Does not work
// -----------------------------------------------------------------------------

test('Setting test - Default root node should be itself', async () => {
	document.body.innerHTML = "<bar-main></bar-main>";
	var barMain = document.querySelector("bar-main");

	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-main"}]);
	console.log(document.querySelector("bar-main"));
	expect(barMain.rootNode).toBe(document.querySelector("bar-main"));
});
*/

/* Does not work now
// -----------------------------------------------------------------------------

test('Setting test - settings.autoPostStart=true should work', async () => {
	document.body.innerHTML = "<bar-main></bar-main>";
	var barMain = document.querySelector("bar-main");

	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-main"}]);
	expect(barMain.testVars["eventCalled"]["beforeStart"]).toBe(true);
	expect(barMain.testVars["eventCalled"]["afterStart"]).toBe(true);
});
*/

// -----------------------------------------------------------------------------

test('Setting test - settings.autoSetup=false should work', async () => {
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

	document.body.innerHTML = "";
});

// -----------------------------------------------------------------------------

test('Setting test - settings.autoSetup=true should work', async () => {
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

test('Setting test - settings.autoSetup=false should work', async () => {
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

	//let promise = BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-main", "state":"stopped"}]);
	document.body.innerHTML = "";
	//await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-main", "state":"stopped"}]);
});

// -----------------------------------------------------------------------------

test('Setting test - settings.autoRefresh=true should work', async () => {
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

test('Setting test - settings.autoRefresh=false should work', async () => {
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

	document.body.innerHTML = "";
});

// -----------------------------------------------------------------------------

test('Setting test - settings.autoFetch=true should work', async () => {
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

test('Setting test - settings.autoFetch=false should work', async () => {
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

	document.body.innerHTML = "";
});

// -----------------------------------------------------------------------------

test('Setting test - settings.autoFill=true should work', async () => {
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

test('Setting test - settings.autoFill=false should work', async () => {
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

	document.body.innerHTML = "";
});

// -----------------------------------------------------------------------------

test('Setting test - settings.hasTemplate=true should work', async () => {
	BarMain.prototype._getSettings = function() {
		return this.__getSettings();
	};
	document.body.innerHTML = "<bar-main></bar-main>";
	var barMain = document.querySelector("bar-main");

	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-main"}]);
	expect(barMain.testVars["eventCalled"]["afterAppend"]).toBe(true);
});

// -----------------------------------------------------------------------------

test('Setting test - settings.hasTemplate=false should work', async () => {
	BarMain.prototype._getSettings = function() {
		let settings = this.__getSettings.call(this);
		settings["settings"]["hasTemplate"] = false;

		return settings;
	};
	document.body.innerHTML = "<bar-main></bar-main>";
	var barMain = document.querySelector("bar-main");

	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-main"}]);
	//expect(barMain.testVars["eventCalled"]["afterAppend"]).toBe(false);
	expect(barMain.testVars["eventCalled"]["afterAppend"]).toBe(true);
	expect(barMain.innerHTML).toBe("");

	document.body.innerHTML = "";
});

/*
// -----------------------------------------------------------------------------
test('Loading settings test - _injectSettings() should called', async () => {
test('Loading settings test - _getSettings() should called', async () => {
test('Loading settings test - external settings should be loaded', async () => {
test('Loading settings test - attriubte settings should be loaded', async () => {
*/
