/**
 * @jest-environment jsdom
 */
import { BarMain, BarFooter } from './_common.js';
window.BarMain = BarMain;
window.BarFooter = BarFooter;

// -----------------------------------------------------------------------------

test('Auto Morphing Test - autoMorph=true should load a default template HTML file', async () => {
	BarFooter.prototype._getSettings = function() {
		let settings = this.__getSettings.call(this);
		settings["components"] = {
			"BarFooter1": {
				"loadings": {
					"autoMorph": true,
					"rootNode": "div",
				}
			}
		};

		return settings;
	};

	document.body.innerHTML = "<bar-footer></bar-footer>";
	var barFooter = document.querySelector("bar-footer");

	window.document.dispatchEvent(new Event("DOMContentLoaded"));

	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-footer1"}]);
	expect(barFooter).toBeInstanceOf(BarFooter);
	expect(barFooter.innerHTML).toBe("<div><bar-footer1 bm-powered=\"\"><div>bar-footer1</div></bar-footer1>bar-footer</div>");
	expect(document.querySelector("bar-footer1")).toBeInstanceOf(BarFooter1);
});

// ----------------------------------------------------------------------------

test('Auto Morphing Test - bm-automorph and bm-filename should load a specified template HTML', async () => {
	BarFooter.prototype._getSettings = function() {
		let settings = this.__getSettings.call(this);
		settings["components"] = {
			"BarFooter2": {
				"loadings": {
					"autoMorph": true,
					"fileName": "bar-footer2a",
					"rootNode": "div",
				}
			}
		};

		return settings;
	};

	document.body.innerHTML = "<bar-footer></bar-footer>";
	var barFooter = document.querySelector("bar-footer");

	window.document.dispatchEvent(new Event("DOMContentLoaded"));

	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-footer2"}]);
	expect(barFooter).toBeInstanceOf(BarFooter);
	expect(barFooter.innerHTML).toBe("<div><bar-footer2 bm-powered=\"\"><div>bar-footer2a</div></bar-footer2>bar-footer</div>");
	expect(document.querySelector("bar-footer2")).toBeInstanceOf(BarFooter2);
});

// ----------------------------------------------------------------------------

test('Auto Morphing Test - bm-automorph and bm-path should load a template HTML file from the specified path', async () => {
	BarFooter.prototype._getSettings = function() {
		let settings = this.__getSettings.call(this);
		settings["components"] = {
			"BarFooter3": {
				"loadings": {
					"autoMorph": true,
					"path": "common",
					"rootNode": "div",
				}
			}
		};

		return settings;
	};

	document.body.innerHTML = "<bar-footer></bar-footer>";
	var barFooter = document.querySelector("bar-footer");

	window.document.dispatchEvent(new Event("DOMContentLoaded"));

	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-footer3"}]);
	expect(barFooter).toBeInstanceOf(BarFooter);
	expect(barFooter.innerHTML).toBe("<div><bar-footer3 bm-powered=\"\"><div>bar-footer3</div></bar-footer3>bar-footer</div>");
	expect(document.querySelector("bar-footer3")).toBeInstanceOf(BarFooter3);
});

// ----------------------------------------------------------------------------

test('Auto Morphing Test - bm-automorph and bm-path and bm-filename should load a specified template HTML file from the specified path', async () => {
	BarFooter.prototype._getSettings = function() {
		let settings = this.__getSettings.call(this);
		settings["components"] = {
			"BarFooter4": {
				"loadings": {
					"autoMorph": true,
					"path": "common",
					"fileName": "bar-footer4a",
					"rootNode": "div",
				}
			}
		};

		return settings;
	};

	document.body.innerHTML = "<bar-footer></bar-footer>";
	var barFooter = document.querySelector("bar-footer");

	window.document.dispatchEvent(new Event("DOMContentLoaded"));

	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-footer4"}]);
	expect(barFooter).toBeInstanceOf(BarFooter);
	expect(barFooter.innerHTML).toBe("<div><bar-footer4 bm-powered=\"\"><div>bar-footer4a</div></bar-footer4>bar-footer</div>");
	expect(document.querySelector("bar-footer4")).toBeInstanceOf(BarFooter4);
});

// ----------------------------------------------------------------------------

test('Auto Morphing Test - bm-automorph should use a existing specified class', async () => {
	BarFooter.prototype._getSettings = function() {
		let settings = this.__getSettings.call(this);
		settings["components"] = {
			"BarFooter5": {
				"loadings": {
					"autoMorph": "BarMain",
					"rootNode": "div",
				}
			}
		};

		return settings;
	};

	document.body.innerHTML = "<bar-footer></bar-footer>";
	var barFooter = document.querySelector("bar-footer");

	window.document.dispatchEvent(new Event("DOMContentLoaded"));

	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-footer5"}]);
	expect(barFooter).toBeInstanceOf(BarFooter);
	expect(barFooter.innerHTML).toBe("<div><bar-footer5 bm-powered=\"\"><div>bar-footer5</div></bar-footer5>bar-footer</div>");
	expect(document.querySelector("bar-footer5")).toBeInstanceOf(BarFooter5);
});

// ----------------------------------------------------------------------------

test('Auto Morphing Test - bm-automorph and bm-autoload should load a specified class and morph from it', async () => {
	BarFooter.prototype._getSettings = function() {
		let settings = this.__getSettings.call(this);
		settings["components"] = {
			"BarFooter6": {
				"loadings": {
					"autoLoad": "http://test.bitsmist.com/bar-footer6a.js",
					"autoMorph": "BarFooter6a",
					"rootNode": "div",
				}
			}
		};

		return settings;
	};

	document.body.innerHTML = "<bar-footer></bar-footer>";
	var barFooter = document.querySelector("bar-footer");

	window.document.dispatchEvent(new Event("DOMContentLoaded"));

	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-footer6"}]);
	expect(barFooter.innerHTML).toBe("<div><bar-footer6 bm-powered=\"\"><div>bar-footer6a</div></bar-footer6>bar-footer</div>");
	expect(document.querySelector("bar-footer6")).toBeInstanceOf(BarFooter6a);
});

// ----------------------------------------------------------------------------

test('Auto Morphing Test - bm-automorph and bm-autoload should load a specified template file and morph from existing class', async () => {
	BarFooter.prototype._getSettings = function() {
		let settings = this.__getSettings.call(this);
		settings["components"] = {
			"BarFooter7": {
				"loadings": {
					"autoLoad": "http://test.bitsmist.com/bar-footer7a.html",
					"autoMorph": "BarMain",
					"rootNode": "div",
				}
			}
		};

		return settings;
	};

	document.body.innerHTML = "<bar-footer></bar-footer>";
	var barFooter = document.querySelector("bar-footer");

	window.document.dispatchEvent(new Event("DOMContentLoaded"));

	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-footer7"}]);
	expect(barFooter.innerHTML).toBe("<div><bar-footer7 bm-powered=\"\"><div>bar-footer7a</div></bar-footer7>bar-footer</div>");
	expect(document.querySelector("bar-footer7")).toBeInstanceOf(BarMain);
});

// ----------------------------------------------------------------------------

test('Auto Morphing Test - bm-automorph and bm-filename should load a specified template HTML', async () => {
	BarFooter.prototype._getSettings = function() {
		let settings = this.__getSettings.call(this);
		settings["components"] = {
			"BarFooter8": {
				"loadings": {
					"autoMorph": "BarMain",
					"fileName": "bar-footer8a",
					"rootNode": "div",
				}
			}
		};

		return settings;
	};

	document.body.innerHTML = "<bar-footer></bar-footer>";
	var barFooter = document.querySelector("bar-footer");

	window.document.dispatchEvent(new Event("DOMContentLoaded"));

	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-footer8"}]);
	expect(barFooter.innerHTML).toBe("<div><bar-footer8 bm-powered=\"\"><div>bar-footer8a</div></bar-footer8>bar-footer</div>");
	expect(document.querySelector("bar-footer8")).toBeInstanceOf(BarMain);
});

// ----------------------------------------------------------------------------

test('Auto Morphing Test - bm-automorph and bm-path should load a template HTML file from the specified path', async () => {
	BarFooter.prototype._getSettings = function() {
		let settings = this.__getSettings.call(this);
		settings["components"] = {
			"BarFooter9": {
				"loadings": {
					"autoMorph": "BarMain",
					"path": "common",
					"rootNode": "div",
				}
			}
		};

		return settings;
	};

	document.body.innerHTML = "<bar-footer></bar-footer>";
	var barFooter = document.querySelector("bar-footer");

	window.document.dispatchEvent(new Event("DOMContentLoaded"));

	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-footer9"}]);
	expect(barFooter.innerHTML).toBe("<div><bar-footer9 bm-powered=\"\"><div>bar-footer9</div></bar-footer9>bar-footer</div>");
	expect(document.querySelector("bar-footer9")).toBeInstanceOf(BarMain);
});

// ----------------------------------------------------------------------------

test('Auto Morphing Test - bm-automorph and bm-path and bm-filename should load a specified template HTML file from the specified path', async () => {
	BarFooter.prototype._getSettings = function() {
		let settings = this.__getSettings.call(this);
		settings["components"] = {
			"BarFooter10": {
				"loadings": {
					"autoMorph": "BarMain",
					"path": "common",
					"fileName": "bar-footer10a",
					"rootNode": "div",
				}
			}
		};

		return settings;
	};

	document.body.innerHTML = "<bar-footer></bar-footer>";
	var barFooter = document.querySelector("bar-footer");

	window.document.dispatchEvent(new Event("DOMContentLoaded"));

	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-footer10"}]);
	expect(barFooter.innerHTML).toBe("<div><bar-footer10 bm-powered=\"\"><div>bar-footer10a</div></bar-footer10>bar-footer</div>");
	expect(document.querySelector("bar-footer10")).toBeInstanceOf(BarMain);
});

// ----------------------------------------------------------------------------

test('Auto Loading Test - bm-autoload should load a default class file', async () => {
	BarMain.prototype._getSettings = function() {
		let settings = this.__getSettings.call(this);
		settings["components"] = {
			"BarMain1": {
				"loadings": {
					"rootNode": "div",
				}
			}
		};

		return settings;
	};

	document.body.innerHTML = "<bar-main></bar-main>";
	var barMain = document.querySelector("bar-main");

	window.document.dispatchEvent(new Event("DOMContentLoaded"));

	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-main1"}]);
	expect(barMain.innerHTML).toBe("<div><bar-main1 bm-powered=\"\"><div>bar-main1</div></bar-main1>bar-main</div>");
	expect(document.querySelector("bar-main1")).toBeInstanceOf(BarMain1);
});

// ----------------------------------------------------------------------------

test('Auto Loading Test - bm-split should load two class files', async () => {
	BarMain.prototype._getSettings = function() {
		let settings = this.__getSettings.call(this);
		settings["components"] = {
			"BarMain2": {
				"loadings": {
					"splitComponent": true,
					"rootNode": "div",
				}
			}
		};

		return settings;
	};

	document.body.innerHTML = "<bar-main></bar-main>";
	var barMain = document.querySelector("bar-main");

	window.document.dispatchEvent(new Event("DOMContentLoaded"));

	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-main2"}]);
	expect(barMain.innerHTML).toBe("<div><bar-main2 bm-powered=\"\"><div>bar-main2</div></bar-main2>bar-main</div>");
	expect(document.querySelector("bar-main2")).toBeInstanceOf(BarMain2);
});

// ----------------------------------------------------------------------------

test('Auto Loading Test - bm-autoload should load a specified class file when URL is specified', async () => {
	BarMain.prototype._getSettings = function() {
		let settings = this.__getSettings.call(this);
		settings["components"] = {
			"BarMain3": {
				"loadings": {
					"autoLoad": "http://test.bitsmist.com/bar-main3a.js",
					"rootNode": "div",
				}
			}
		};

		return settings;
	};

	document.body.innerHTML = "<bar-main></bar-main>";
	var barMain = document.querySelector("bar-main");

	window.document.dispatchEvent(new Event("DOMContentLoaded"));

	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-main3"}]);
	expect(barMain.innerHTML).toBe("<div><bar-main3 bm-powered=\"\"><div>bar-main3</div></bar-main3>bar-main</div>");
	expect(document.querySelector("bar-main3")).toBeInstanceOf(BarMain3);
});

// ----------------------------------------------------------------------------

test('Auto Loading Test - bm-autoload and bm-path should load a class file from the specified path', async () => {
	BarMain.prototype._getSettings = function() {
		let settings = this.__getSettings.call(this);
		settings["components"] = {
			"BarMain4": {
				"loadings": {
					"path": "common",
					"rootNode": "div",
				}
			}
		};

		return settings;
	};

	document.body.innerHTML = "<bar-main></bar-main>";
	var barMain = document.querySelector("bar-main");

	window.document.dispatchEvent(new Event("DOMContentLoaded"));

	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-main4"}]);
	expect(barMain.innerHTML).toBe("<div><bar-main4 bm-powered=\"\"><div>bar-main4</div></bar-main4>bar-main</div>");
	expect(document.querySelector("bar-main4")).toBeInstanceOf(BarMain4);
});

// ----------------------------------------------------------------------------

test('Auto Loading Test - bm-filename should load a specified class file', async () => {
	BarMain.prototype._getSettings = function() {
		let settings = this.__getSettings.call(this);
		settings["components"] = {
			"BarMain5": {
				"loadings": {
					"fileName": "bar-main5a",
					"rootNode": "div",
				}
			}
		};

		return settings;
	};

	document.body.innerHTML = "<bar-main></bar-main>";
	var barMain = document.querySelector("bar-main");

	window.document.dispatchEvent(new Event("DOMContentLoaded"));

	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-main5"}]);
	expect(barMain.innerHTML).toBe("<div><bar-main5 bm-powered=\"\"><div>bar-main5a</div></bar-main5>bar-main</div>");
	expect(document.querySelector("bar-main5")).toBeInstanceOf(BarMain5);
});

// ----------------------------------------------------------------------------

test('Auto Loading Test - bm-path and bm-filename should load a specified class file from the specified path', async () => {
	BarMain.prototype._getSettings = function() {
		let settings = this.__getSettings.call(this);
		settings["components"] = {
			"BarMain6": {
				"loadings": {
					"path": "common",
					"fileName": "bar-main6a",
					"rootNode": "div",
				}
			}
		};

		return settings;
	};

	document.body.innerHTML = "<bar-main></bar-main>";
	var barMain = document.querySelector("bar-main");

	window.document.dispatchEvent(new Event("DOMContentLoaded"));

	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-main6"}]);
	expect(barMain.innerHTML).toBe("<div><bar-main6 bm-powered=\"\"><div>bar-main6a</div></bar-main6>bar-main</div>");
	expect(document.querySelector("bar-main6")).toBeInstanceOf(BarMain6);
});
