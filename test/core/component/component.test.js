/**
 * @jest-environment jsdom
 */
import './_common.js';

document.body.innerHTML = "<bar-main></bar-main>";
var barMain = document.querySelector("bar-main");

// -----------------------------------------------------------------------------

test('Component Name Test - Component name should be "BarMain"', () => {
	expect(barMain.name).toBe("BarMain");
});

// -----------------------------------------------------------------------------

test('Inheritance Test - Component instance should be an instance of HTMLElement', () => {
	expect(barMain).toBeInstanceOf(HTMLElement);
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
