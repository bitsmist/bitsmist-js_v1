/**
 * @jest-environment jsdom
 */
import { BarMain } from './_common.js';

// -----------------------------------------------------------------------------

test('Organizer Attach Test - Component should attache default organizers - State/Event/Loader/TemplateOrganizer', async () => {
	document.body.innerHTML = "<bar-main></bar-main>";
	var barMain = document.querySelector("bar-main");

	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-main"}]);
	expect(Object.keys(barMain.organizers).length).toBe(4);
	expect(barMain.organizers["StateOrganizer"].object).toBeInstanceOf(Function);
	expect(barMain.organizers["EventOrganizer"].object).toBeInstanceOf(Function);
	expect(barMain.organizers["LoaderOrganizer"].object).toBeInstanceOf(Function);
	expect(barMain.organizers["TemplateOrganizer"].object).toBeInstanceOf(Function);
	/*
	expect(barMain.organizers["StateOrganizer"].object).toBeInstanceOf(BITSMIST.v1.StateOrganizer);
	expect(barMain.organizers["EventOrganizer"].object).toBeInstanceOf(BITSMIST.v1.EventOrganizer);
	expect(barMain.organizers["LoaderOrganizer"].object).toBeInstanceOf(BITSMIST.v1.LoaderOrganizer);
	expect(barMain.organizers["TemplateOrganizer"].object).toBeInstanceOf(BITSMIST.v1.TemplateOrganizer);
	*/
});

// -----------------------------------------------------------------------------

/*
test('Organizer Attach Test - Component should be attached to default organizers', async () => {
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
*/

// -----------------------------------------------------------------------------
