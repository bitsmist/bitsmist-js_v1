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

// -----------------------------------------------------------------------------

test('Settings Loading Test - Attriubte settings should be loaded', async () => {
	document.body.innerHTML = "<bar-main bm-settings='{\"attrib\":\"true\"}'></bar-main>";
	var barMain = document.querySelector("bar-main");

	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-main"}]);
	expect(barMain.settings.get("settings.attrib")).toBe("true");
});
