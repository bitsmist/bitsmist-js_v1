/**
 * @jest-environment jsdom
 */
import { BarMain } from './_common.js';

// -----------------------------------------------------------------------------

/*
test('Wait Test - waitFor() default to state=ready', async () => {
	document.body.innerHTML = "<bar-main></bar-main>";
	var barMain = document.querySelector("bar-main");

	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-main"}]);
	expect(barMain.state).toBe("ready");
});
*/

/*
test('Wait Test - Wait for a component to become specific states by specifying the root node', async () => {
	document.body.innerHTML = "<bar-main></bar-main>";
	var barMain = document.querySelector("bar-main");

	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-main", "state":"starting"}]);
	expect(barMain.state).toBe("starting");
	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-main", "state":"started"}]);
	expect(barMain.state).toBe("started");
	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-main", "state":"ready"}]);
	expect(barMain.state).toBe("ready");
});
*/

test('Wait Test - Wait for a component to become specific states by specifying the id', async () => {
	document.body.innerHTML = "<bar-main></bar-main>";
	var barMain = document.querySelector("bar-main");

	// You can't wait "starting" by specifying the unique id since the unique id is not issued before "starting"
//	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-main", "state":"starting"}]);

	// Now you can use the unique id.
	await BITSMIST.v1.StateOrganizer.waitFor([{"id":barMain.uniqueId, "state":"starting"}]);
	expect(barMain.state).toBe("starting");
	await BITSMIST.v1.StateOrganizer.waitFor([{"id":barMain.uniqueId, "state":"started"}]);
	expect(barMain.state).toBe("started");
	await BITSMIST.v1.StateOrganizer.waitFor([{"id":barMain.uniqueId, "state":"ready"}]);
	expect(barMain.state).toBe("ready");

	document.body.innerHTML = "";

	await BITSMIST.v1.StateOrganizer.waitFor([{"id":barMain.uniqueId, "state":"stopping"}]);
	expect(barMain.state).toBe("stopping");
	await BITSMIST.v1.StateOrganizer.waitFor([{"id":barMain.uniqueId, "state":"stopped"}]);
	expect(barMain.state).toBe("stopped");
});

/*
test('Wait Test - Wait for a component to become specific states by specifying the name', async () => {
	document.body.innerHTML = "<bar-main></bar-main>";
	var barMain = document.querySelector("bar-main");

	await BITSMIST.v1.StateOrganizer.waitFor([{"name":"BarMain", "state":"starting"}]);
	expect(barMain.state).toBe("starting");
	await BITSMIST.v1.StateOrganizer.waitFor([{"name":"BarMain", "state":"started"}]);
	expect(barMain.state).toBe("started");
	await BITSMIST.v1.StateOrganizer.waitFor([{"name":"BarMain", "state":"ready"}]);
	expect(barMain.state).toBe("ready");

	document.body.innerHTML = "";

	await BITSMIST.v1.StateOrganizer.waitFor([{"name":"BarMain", "state":"stopping"}]);
	expect(barMain.state).toBe("stopping");
	await BITSMIST.v1.StateOrganizer.waitFor([{"name":"BarMain", "state":"stopped"}]);
	expect(barMain.state).toBe("stopped");
});
*/
