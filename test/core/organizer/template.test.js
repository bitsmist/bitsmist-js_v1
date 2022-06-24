/**
 * @jest-environment jsdom
 */
import { BarMain } from './_common.js';

// -----------------------------------------------------------------------------

test('Template Loading Test - The Default template file should be loaded', async () => {
	document.body.innerHTML = "<bar-main></bar-main>";
	var barMain = document.querySelector("bar-main");

	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-main"}]);
	expect(barMain.innerHTML).toBe("<div>bar-main</div>");
});

// -----------------------------------------------------------------------------

test('Setting Test - settings.templateName should load the specified file as the template', async () => {
	BarMain.prototype._getSettings = function() {
		let settings = this.__getSettings.call(this);
		settings["settings"]["templateName"] = "bar-main2";

		return settings;
	};

	document.body.innerHTML = "<bar-main></bar-main>";
	var barMain = document.querySelector("bar-main");

	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-main"}]);
	expect(barMain.innerHTML).toBe("<div>bar-main2</div>");
});

// -----------------------------------------------------------------------------

test('Setting Test - loadings.fileName should load the specified file as the template', async () => {
	BarMain.prototype._getSettings = function() {
		let settings = this.__getSettings.call(this);
		settings["loadings"] = {
			"fileName": "bar-main2",
		}

		return settings;
	};

	document.body.innerHTML = "<bar-main></bar-main>";
	var barMain = document.querySelector("bar-main");

	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-main"}]);
	expect(barMain.innerHTML).toBe("<div>bar-main2</div>");
});

// -----------------------------------------------------------------------------

test('Setting Test - settings.templateName should have higher priority than loadings.fileName', async () => {
	BarMain.prototype._getSettings = function() {
		let settings = this.__getSettings.call(this);
		settings["settings"]["templateName"] = "bar-main2";
		settings["loadings"] = {
			"fileName": "bar-main3",
		}

		return settings;
	};

	document.body.innerHTML = "<bar-main></bar-main>";
	var barMain = document.querySelector("bar-main");

	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-main"}]);
	expect(barMain.innerHTML).toBe("<div>bar-main2</div>");
});

// -----------------------------------------------------------------------------
