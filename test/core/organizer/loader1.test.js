/**
 * @jest-environment jsdom
 */
import { BarMain } from './_common.js';
window.BarMain = BarMain;

// -----------------------------------------------------------------------------

test('Auto Morphing Test - bm-automorph should load a default template HTML file', async () => {
	document.body.innerHTML = "<bar-footer1 bm-automorph></bar-footer1>";
	var barFooter = document.querySelector("bar-footer1");

	window.document.dispatchEvent(new Event("DOMContentLoaded"));

	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-footer1"}]);
	expect(barFooter.innerHTML).toBe("<div>bar-footer1</div>");
});

// ----------------------------------------------------------------------------

test('Auto Morphing Test - bm-automorph and bm-filename should load a specified template HTML', async () => {
	document.body.innerHTML = "<bar-footer2 bm-automorph bm-filename='bar-footer2a'></bar-footer2>";
	var barFooter = document.querySelector("bar-footer2");

	window.document.dispatchEvent(new Event("DOMContentLoaded"));

	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-footer2"}]);
	expect(barFooter.innerHTML).toBe("<div>bar-footer2a</div>");
});

// ----------------------------------------------------------------------------

test('Auto Morphing Test - bm-automorph and bm-path should load a template HTML file from the specified path', async () => {
	document.body.innerHTML = "<bar-footer3 bm-automorph bm-path='common'></bar-footer3>";
	var barFooter = document.querySelector("bar-footer3");

	window.document.dispatchEvent(new Event("DOMContentLoaded"));

	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-footer3"}]);
	expect(barFooter.innerHTML).toBe("<div>bar-footer3</div>");
});

// ----------------------------------------------------------------------------

test('Auto Morphing Test - bm-automorph and bm-path and bm-filename should load a specified template HTML file from the specified path', async () => {
	document.body.innerHTML = "<bar-footer4 bm-automorph bm-path='common' bm-filename='bar-footer4a'></bar-footer4>";
	var barFooter = document.querySelector("bar-footer4");

	window.document.dispatchEvent(new Event("DOMContentLoaded"));

	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-footer4"}]);
	expect(barFooter.innerHTML).toBe("<div>bar-footer4a</div>");
});

// ----------------------------------------------------------------------------

test('Auto Morphing Test - bm-automorph should use a existing specified class', async () => {
	document.body.innerHTML = "<bar-footer5 bm-automorph='BarMain'></bar-footer5>";
	var barFooter = document.querySelector("bar-footer5");

	window.document.dispatchEvent(new Event("DOMContentLoaded"));

	//await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-main5"}]);
	await BITSMIST.v1.StateOrganizer.waitFor([{"name":"BarFooter5"}]);
	expect(barFooter.name).toBe("BarFooter5");
	expect(barFooter.innerHTML).toBe("<div>bar-footer5</div>");
	expect(barFooter).toBeInstanceOf(BarMain);
});

// ----------------------------------------------------------------------------

test('Auto Morphing Test - bm-automorph and bm-autoload should load a specified class and morph from it', async () => {
	document.body.innerHTML = "<bar-footer6 bm-autoload='http://test.bitsmist.com/bar-footer6a.js' bm-automorph='BarFooter6a'></bar-footer6>";
	var barFooter = document.querySelector("bar-footer6");

	window.document.dispatchEvent(new Event("DOMContentLoaded"));

	//await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-main6"}]);
	await BITSMIST.v1.StateOrganizer.waitFor([{"name":"BarFooter6"}]);
	expect(barFooter.name).toBe("BarFooter6");
	expect(barFooter.innerHTML).toBe("<div>bar-footer6a</div>");
	expect(barFooter).toBeInstanceOf(BarFooter6a);
});

// ----------------------------------------------------------------------------

test('Auto Morphing Test - bm-automorph and bm-autoload should load a specified template file and morph from existing class', async () => {
	document.body.innerHTML = "<bar-footer7 bm-autoload='http://test.bitsmist.com/bar-footer7a.html' bm-automorph='BarMain'></bar-footer6>";
	var barFooter = document.querySelector("bar-footer7");

	window.document.dispatchEvent(new Event("DOMContentLoaded"));

	//await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-main6"}]);
	await BITSMIST.v1.StateOrganizer.waitFor([{"name":"BarFooter7"}]);
	expect(barFooter.name).toBe("BarFooter7");
	expect(barFooter.innerHTML).toBe("<div>bar-footer7a</div>");
	expect(barFooter).toBeInstanceOf(BarMain);
});

// ----------------------------------------------------------------------------

test('Auto Morphing Test - bm-automorph and bm-filename should load a specified template HTML', async () => {
	document.body.innerHTML = "<bar-footer8 bm-automorph='BarMain' bm-filename='bar-footer8a'></bar-footer8>";
	var barFooter = document.querySelector("bar-footer8");

	window.document.dispatchEvent(new Event("DOMContentLoaded"));

	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-footer8"}]);
	expect(barFooter.innerHTML).toBe("<div>bar-footer8a</div>");
	expect(barFooter).toBeInstanceOf(BarMain);
});

// ----------------------------------------------------------------------------

test('Auto Morphing Test - bm-automorph and bm-path should load a template HTML file from the specified path', async () => {
	document.body.innerHTML = "<bar-footer9 bm-automorph='BarMain' bm-path='common'></bar-footer9>";
	var barFooter = document.querySelector("bar-footer9");

	window.document.dispatchEvent(new Event("DOMContentLoaded"));

	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-footer9"}]);
	expect(barFooter.innerHTML).toBe("<div>bar-footer9</div>");
	expect(barFooter).toBeInstanceOf(BarMain);
});

// ----------------------------------------------------------------------------

test('Auto Morphing Test - bm-automorph and bm-path and bm-filename should load a specified template HTML file from the specified path', async () => {
	document.body.innerHTML = "<bar-footer10 bm-automorph='BarMain' bm-path='common' bm-filename='bar-footer10a'></bar-footer10>";
	var barFooter = document.querySelector("bar-footer10");

	window.document.dispatchEvent(new Event("DOMContentLoaded"));

	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-footer10"}]);
	expect(barFooter.innerHTML).toBe("<div>bar-footer10a</div>");
	expect(barFooter).toBeInstanceOf(BarMain);
});

// ----------------------------------------------------------------------------

test('Auto Loading Test - bm-autoload should load a default class file', async () => {
	document.body.innerHTML = "<bar-main1 bm-autoload></bar-main1>";
	var barMain = document.querySelector("bar-main1");

	window.document.dispatchEvent(new Event("DOMContentLoaded"));

	//await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-main1"}]);
	await BITSMIST.v1.StateOrganizer.waitFor([{"name":"BarMain1"}]);
	expect(barMain.name).toBe("BarMain1");
	expect(barMain.innerHTML).toBe("<div>bar-main1</div>");
});

// ----------------------------------------------------------------------------

test('Auto Loading Test - bm-split should load two class files', async () => {
	document.body.innerHTML = "<bar-main2 bm-autoload bm-split></bar-main2>";
	var barMain = document.querySelector("bar-main2");

	window.document.dispatchEvent(new Event("DOMContentLoaded"));

	//await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-main2"}]);
	await BITSMIST.v1.StateOrganizer.waitFor([{"name":"BarMain2"}]);
	expect(barMain.name).toBe("BarMain2");
	expect(barMain.innerHTML).toBe("<div>bar-main2</div>");
});

// ----------------------------------------------------------------------------

test('Auto Loading Test - bm-autoload should load a specified class file when URL is specified', async () => {
	document.body.innerHTML = "<bar-main3 bm-autoload='http://test.bitsmist.com/bar-main3a.js'></bar-main3>";
	var barMain = document.querySelector("bar-main3");

	window.document.dispatchEvent(new Event("DOMContentLoaded"));

	//await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-main5"}]);
	await BITSMIST.v1.StateOrganizer.waitFor([{"name":"BarMain3"}]);
	expect(barMain.name).toBe("BarMain3");
	expect(barMain.innerHTML).toBe("<div>bar-main3</div>");
});

// ----------------------------------------------------------------------------

test('Auto Loading Test - bm-autoload and bm-path should load a class file from the specified path', async () => {
	document.body.innerHTML = "<bar-main4 bm-autoload bm-path='common'></bar-main4>";
	var barMain = document.querySelector("bar-main4");

	window.document.dispatchEvent(new Event("DOMContentLoaded"));

	//await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-main4"}]);
	await BITSMIST.v1.StateOrganizer.waitFor([{"name":"BarMain4"}]);
	expect(barMain.name).toBe("BarMain4");
	expect(barMain.innerHTML).toBe("<div>bar-main4</div>");
});

// ----------------------------------------------------------------------------

test('Auto Loading Test - bm-filename should load a specified class file', async () => {
	document.body.innerHTML = "<bar-main5 bm-autoload bm-filename='bar-main5a'></bar-main5>";
	var barMain = document.querySelector("bar-main5");

	window.document.dispatchEvent(new Event("DOMContentLoaded"));

	//await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-main5"}]);
	await BITSMIST.v1.StateOrganizer.waitFor([{"name":"BarMain5"}]);
	expect(barMain.name).toBe("BarMain5");
	expect(barMain.innerHTML).toBe("<div>bar-main5a</div>");
});

// ----------------------------------------------------------------------------

test('Auto Loading Test - bm-path and bm-filename should load a specified class file from the specified path', async () => {
	document.body.innerHTML = "<bar-main6 bm-autoload bm-path='common' bm-filename='bar-main6a'></bar-main6>";
	var barMain = document.querySelector("bar-main6");

	window.document.dispatchEvent(new Event("DOMContentLoaded"));

	//await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-main6"}]);
	await BITSMIST.v1.StateOrganizer.waitFor([{"name":"BarMain6"}]);
	expect(barMain.name).toBe("BarMain6");
	expect(barMain.innerHTML).toBe("<div>bar-main6a</div>");
});
