/**
 * @jest-environment jsdom
 */
import './_common.js';

document.body.innerHTML = "<bar-main></bar-main>";
var barMain = document.querySelector("bar-main");

// -----------------------------------------------------------------------------

test('Component name test - Component name should be "BarMain"', async () => {
	expect(barMain.name).toBe("BarMain");
});

// -----------------------------------------------------------------------------

test('Inheritance test - Component instance should be instance of HTMLElement', async () => {
	expect(barMain).toBeInstanceOf(HTMLElement);
});

/*
// -----------------------------------------------------------------------------

test('Default root element test - Default root element should be itself', async () => {
	document.body.innerHTML = "<bar-main></bar-main>";
	var barMain = document.querySelector("bar-main");

	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-main"}]);
	console.log(document.querySelector("bar-main"));
	expect(barMain.rootNode).toBe(document.querySelector("bar-main"));
});
*/
