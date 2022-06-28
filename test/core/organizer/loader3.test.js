/**
 * @jest-environment jsdom
 */
import { BarMain, BarFooter } from './_common.js';
window.BarMain = BarMain;
window.BarFooter = BarFooter;

// -----------------------------------------------------------------------------

test('Adding Component Test (Auto Morph) - should use the existing component', async () => {
	BarFooter.prototype._getSettings = function() {
		let settings = this.__getSettings.call(this);
		settings["components"] = {
			"BarMain": {
				"loadings": {
					"rootNode": "div",
				}
			}
		};

		return settings;
	};

	document.body.innerHTML = "<bar-footer></bar-footer>";
	var barFooter = document.querySelector("bar-footer");

	window.document.dispatchEvent(new Event("DOMContentLoaded"));

	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-main"}]);
	expect(barFooter).toBeInstanceOf(BarFooter);
	expect(barFooter.innerHTML).toBe("<div><bar-main bm-powered=\"\"><div>bar-main</div></bar-main>bar-footer</div>");
	expect(document.querySelector("bar-main")).toBeInstanceOf(BarMain);
});

test('Adding Component Test (Auto Morph) - tagName should use the specified tag name to add an existing component', async () => {
	BarFooter.prototype._getSettings = function() {
		let settings = this.__getSettings.call(this);
		settings["components"] = {
			"BarMainDummy": {
				"loadings": {
					"rootNode": "div",
					"tagName": "bar-main",
				}
			}
		};

		return settings;
	};

	document.body.innerHTML = "<bar-footer></bar-footer>";
	var barFooter = document.querySelector("bar-footer");

	window.document.dispatchEvent(new Event("DOMContentLoaded"));

	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-main"}]);
	expect(barFooter).toBeInstanceOf(BarFooter);
	expect(barFooter.innerHTML).toBe("<div><bar-main bm-powered=\"\"><div>bar-main</div></bar-main>bar-footer</div>");
	expect(document.querySelector("bar-main")).toBeInstanceOf(BarMain);
});

test('Adding Component Test (Auto Morph) - tag should use the specified tag to add an existing component', async () => {
	BarFooter.prototype._getSettings = function() {
		let settings = this.__getSettings.call(this);
		settings["components"] = {
			"BarMainDummy": {
				"loadings": {
					"rootNode": "div",
					"tag": "<bar-main class='@@@'></bar-main>",
				}
			}
		};

		return settings;
	};

	document.body.innerHTML = "<bar-footer></bar-footer>";
	var barFooter = document.querySelector("bar-footer");

	window.document.dispatchEvent(new Event("DOMContentLoaded"));

	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-main"}]);
	expect(barFooter).toBeInstanceOf(BarFooter);
	expect(barFooter.innerHTML).toBe("<div><bar-main class=\"@@@\" bm-powered=\"\"><div>bar-main</div></bar-main>bar-footer</div>");
	expect(document.querySelector("bar-main")).toBeInstanceOf(BarMain);
});

test('Adding Component Test (Auto Morph) - tagName should use the specified tag name and morph from the specified class', async () => {
	BarFooter.prototype._getSettings = function() {
		let settings = this.__getSettings.call(this);
		settings["components"] = {
			"BarMainDummy": {
				"loadings": {
					"autoMorph": "BarMain",
					"rootNode": "div",
					"tagName": "bar-main2",
				}
			}
		};

		return settings;
	};

	document.body.innerHTML = "<bar-footer></bar-footer>";
	var barFooter = document.querySelector("bar-footer");

	window.document.dispatchEvent(new Event("DOMContentLoaded"));

	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-main2"}]);
	expect(barFooter).toBeInstanceOf(BarFooter);
	expect(barFooter.innerHTML).toBe("<div><bar-main2 bm-powered=\"\"><div>bar-main2</div></bar-main2>bar-footer</div>");
	expect(document.querySelector("bar-main2")).toBeInstanceOf(BarMain);
	expect(document.querySelector("bar-main2")).toBeInstanceOf(BarMainDummy);
	expect(document.querySelector("bar-main2").name).toBe("BarMainDummy");
});

test('Adding Component Test (Auto Morph) - tag should use the specified tag and morph from the specified class', async () => {
	BarFooter.prototype._getSettings = function() {
		let settings = this.__getSettings.call(this);
		settings["components"] = {
			"BarMainDummy": {
				"loadings": {
					"autoMorph": "BarMain",
					"rootNode": "div",
					"tag": "<bar-main2 class='@@@'></bar-main2>",
				}
			}
		};

		return settings;
	};

	document.body.innerHTML = "<bar-footer></bar-footer>";
	var barFooter = document.querySelector("bar-footer");

	window.document.dispatchEvent(new Event("DOMContentLoaded"));

	setTimeout(() => {
		console.log(document.body.innerHTML);
	}, 2000);
	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-main2"}]);
	expect(barFooter).toBeInstanceOf(BarFooter);
	expect(barFooter.innerHTML).toBe("<div><bar-main2 class=\"@@@\" bm-powered=\"\"><div>bar-main2</div></bar-main2>bar-footer</div>");
	expect(document.querySelector("bar-main2")).toBeInstanceOf(BarMainDummy);
});

test('Adding Component Test (Auto Load) - tagName should use the specified tagName', async () => {
	BarMain.prototype._getSettings = function() {
		let settings = this.__getSettings.call(this);
		settings["components"] = {
			"BarMain1": {
				"loadings": {
					"autoLoad": true,
					"rootNode": "div",
					"fileName": "bar-main1",
					"tagName": "bar-maindummy1",
				}
			}
		};

		return settings;
	};

	document.body.innerHTML = "<bar-main></bar-main>";
	var barMain = document.querySelector("bar-main");

	window.document.dispatchEvent(new Event("DOMContentLoaded"));

	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-maindummy1"}]);
	expect(barMain).toBeInstanceOf(BarMain);
	expect(barMain.innerHTML).toBe("<div><bar-maindummy1 bm-powered=\"\"><div>bar-main1</div></bar-maindummy1>bar-main</div>");
	expect(document.querySelector("bar-maindummy1")).toBeInstanceOf(BarMain1);
});

test('Adding Component Test (Auto Load) - tag should use the specified tagName and load split component files', async () => {
	BarMain.prototype._getSettings = function() {
		let settings = this.__getSettings.call(this);
		settings["components"] = {
			"BarMain2": {
				"loadings": {
					"autoLoad": true,
					"rootNode": "div",
					"splitComponent": true,
					"fileName": "bar-main2",
					"tag": "<bar-maindummy2 class='@@@'></bar-maindummy2>",
				}
			}
		};

		return settings;
	};

	document.body.innerHTML = "<bar-main></bar-main>";
	var barMain = document.querySelector("bar-main");

	window.document.dispatchEvent(new Event("DOMContentLoaded"));

	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-maindummy2"}]);
	expect(barMain).toBeInstanceOf(BarMain);
	expect(barMain.innerHTML).toBe("<div><bar-maindummy2 class=\"@@@\" bm-powered=\"\"><div>bar-main2</div></bar-maindummy2>bar-main</div>");
	expect(document.querySelector("bar-maindummy2")).toBeInstanceOf(BarMain2);
});
