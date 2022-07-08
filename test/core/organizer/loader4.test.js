/**
 * @jest-environment jsdom
 */
import { BarMain, BarFooter } from './_common.js';
window.BarMain = BarMain;
window.BarFooter = BarFooter;

// -----------------------------------------------------------------------------

test('Waiting for Children Test - Should wait for all the children to be "ready"', async () => {
	document.body.innerHTML = "<bar-main1 bm-autoload></bar-main1><bar-main2 bm-autoload bm-split></bar-main2>";

	return BITSMIST.v1.DefaultLoader.loadTags(document.body, {"waitForTags":true}).then(() => {
		expect(document.querySelector("bar-main1").state).toBe("ready");
		expect(document.querySelector("bar-main2").state).toBe("ready");
		expect(document.body.innerHTML).toBe('<bar-main1 bm-autoload="" bm-powered=""><div>bar-main1</div></bar-main1><bar-main2 bm-autoload="" bm-split="" bm-powered=""><div>bar-main2</div></bar-main2>');
	});
});

test('Loading Settings Test - Should respect system.appBaseUrl', async () => {
	BITSMIST.v1.settings.merge({
		"system": {
			"appBaseUrl": "http://test2.bitsmist.com",
		}
	});

	document.body.innerHTML = "<bar-side1 bm-autoload></bar-side1>";
	var barSide = document.querySelector("bar-side1");

	window.document.dispatchEvent(new Event("DOMContentLoaded"));

	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-side1"}]);
	expect(barSide).toBeInstanceOf(BarSide1);
	expect(barSide.name).toBe("BarSide1");
	expect(barSide.innerHTML).toBe('<div>bar-side1</div>');

	// Rollback settings
	BITSMIST.v1.settings.merge({
		"system": {
			"appBaseUrl": "http://test.bitsmist.com",
		}
	});
});

test('Loading Settings Test - Should respect system.componentPath', async () => {
	BITSMIST.v1.settings.merge({
		"system": {
			"componentPath": "components",
		}
	});

	document.body.innerHTML = "<bar-side2 bm-autoload></bar-side2>";
	var barSide = document.querySelector("bar-side2");

	window.document.dispatchEvent(new Event("DOMContentLoaded"));

	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-side2"}]);
	expect(barSide).toBeInstanceOf(BarSide2);
	expect(barSide.name).toBe("BarSide2");
	expect(barSide.innerHTML).toBe('<div>bar-side2</div>');

	// Rollback settings
	BITSMIST.v1.settings.remove("system.componentPath");
	console.log(BITSMIST.v1.settings.items);
});

test('Loading Settings Test - Should respect system.templatePath', async () => {
	BITSMIST.v1.settings.merge({
		"system": {
			"templatePath": "templates",
		}
	});

	document.body.innerHTML = "<bar-side3 bm-autoload></bar-side3>";
	var barSide = document.querySelector("bar-side3");

	window.document.dispatchEvent(new Event("DOMContentLoaded"));

	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-side3"}]);
	expect(barSide).toBeInstanceOf(BarSide3);
	expect(barSide.name).toBe("BarSide3");
	expect(barSide.innerHTML).toBe('<div>bar-side3</div>');

	// Rollback settings
	BITSMIST.v1.settings.remove("system.templatePath");
});

test('Loading Settings Test - Should use loadings.componentPath when system/loadings.templatePath is not specified', async () => {
	BarMain.prototype._getSettings = function() {
		let settings = this.__getSettings.call(this);
		settings["components"] = {
			"BarSide5": {
				"loadings": {
					"componentPath": "components",
					"autoLoad": true,
					"rootNode": "div",
				}
			}
		};

		return settings;
	};

	document.body.innerHTML = "<bar-main></bar-main>";
	var barMain = document.querySelector("bar-main");

	window.document.dispatchEvent(new Event("DOMContentLoaded"));

	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-side5"}]);
	expect(barMain).toBeInstanceOf(BarMain);
	expect(barMain.innerHTML).toBe('<div><bar-side5 bm-powered=\"\"><div>bar-side5</div></bar-side5>bar-main</div>');
	expect(document.querySelector("bar-side5")).toBeInstanceOf(BarSide5);
});

test('Loading Settings Test - Should override system.appBaseUrl with loadings.appBaseUrl', async () => {
	BarMain.prototype._getSettings = function() {
		let settings = this.__getSettings.call(this);
		settings["components"] = {
			"BarMenu1": {
				"loadings": {
					"appBaseUrl": "http://test2.bitsmist.com",
					"autoLoad": true,
					"rootNode": "div",
				}
			}
		};

		return settings;
	};

	document.body.innerHTML = "<bar-main></bar-main>";
	var barMain = document.querySelector("bar-main");

	window.document.dispatchEvent(new Event("DOMContentLoaded"));

	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-menu1"}]);
	expect(barMain).toBeInstanceOf(BarMain);
	expect(barMain.innerHTML).toBe('<div><bar-menu1 bm-powered=\"\"><div>bar-menu1</div></bar-menu1>bar-main</div>');
	expect(document.querySelector("bar-menu1")).toBeInstanceOf(BarMenu1);
});

test('Loading Test - Should override system.componentPath with loadings.componentPath', async () => {
	BITSMIST.v1.settings.merge({
		"system": {
			"componentPath": "",
		}
	});
	BarMain.prototype._getSettings = function() {
		let settings = this.__getSettings.call(this);
		settings["components"] = {
			"BarMenu2": {
				"loadings": {
					"componentPath": "components2",
					"autoLoad": true,
					"rootNode": "div",
				}
			}
		};

		return settings;
	};

	document.body.innerHTML = "<bar-main></bar-main>";
	var barMain = document.querySelector("bar-main");

	window.document.dispatchEvent(new Event("DOMContentLoaded"));

	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-menu2"}]);
	expect(barMain).toBeInstanceOf(BarMain);
	expect(barMain.innerHTML).toBe('<div><bar-menu2 bm-powered=\"\"><div>bar-menu2</div></bar-menu2>bar-main</div>');
	expect(document.querySelector("bar-menu2")).toBeInstanceOf(BarMenu2);

	// Rollback settings
	BITSMIST.v1.settings.remove("system.componentPath");
});

test('Loading Test - Should override system.templatePath with loadings.templatePath', async () => {
	BITSMIST.v1.settings.merge({
		"system": {
			"templatePath": "",
		}
	});
	BarMain.prototype._getSettings = function() {
		let settings = this.__getSettings.call(this);
		settings["components"] = {
			"BarMenu3": {
				"loadings": {
					"templatePath": "templates2",
					"autoLoad": true,
					"rootNode": "div",
				}
			}
		};

		return settings;
	};

	document.body.innerHTML = "<bar-main></bar-main>";
	var barMain = document.querySelector("bar-main");

	window.document.dispatchEvent(new Event("DOMContentLoaded"));

	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-menu3"}]);
	expect(barMain).toBeInstanceOf(BarMain);
	expect(barMain.innerHTML).toBe('<div><bar-menu3 bm-powered=\"\"><div>bar-menu3</div></bar-menu3>bar-main</div>');
	expect(document.querySelector("bar-menu3")).toBeInstanceOf(BarMenu3);

	// Rollback settings
	BITSMIST.v1.settings.remove("system.templatePath");
});
