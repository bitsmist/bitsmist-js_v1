/**
 * @jest-environment jsdom
 */
import { BarMain } from './_common.js';

// -----------------------------------------------------------------------------

test('Wait Test - waitFor() default to state=ready', async () => {
	document.body.innerHTML = "<bar-main></bar-main>";
	var barMain = document.querySelector("bar-main");

	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-main"}]);
	expect(barMain.state).toBe("ready");
});

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

test('Wait Test - Wait for a component to become specific states by specifying the id', async () => {
	document.body.innerHTML = "<bar-main></bar-main>";
	var barMain = document.querySelector("bar-main");

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

test('Wait Test - Wait for a component state that is already passed the specified states - ready', async () => {
	document.body.innerHTML = "<bar-main></bar-main>";
	var barMain = document.querySelector("bar-main");

	await BITSMIST.v1.StateOrganizer.waitFor([{"name":"BarMain", "state":"ready"}]);

	expect(barMain.state).toBe("ready");
	await BITSMIST.v1.StateOrganizer.waitFor([{"name":"BarMain", "state":"started"}]);
	expect(barMain.state).toBe("ready");
	await BITSMIST.v1.StateOrganizer.waitFor([{"name":"BarMain", "state":"ready"}]);
	expect(barMain.state).toBe("ready");

	document.body.innerHTML = "";
});

test('Wait Test - Wait for a component state that is already passed the specified states - started', async () => {
	document.body.innerHTML = "<bar-main></bar-main>";
	var barMain = document.querySelector("bar-main");

	await BITSMIST.v1.StateOrganizer.waitFor([{"name":"BarMain", "state":"started"}]);

	await BITSMIST.v1.StateOrganizer.waitFor([{"name":"BarMain", "state":"starting"}]);
	expect(barMain.state).toBe("started");

	document.body.innerHTML = "";
});

test('Wait Test - Wait for a component state that is already passed the specified states - stopped', async () => {
	document.body.innerHTML = "<bar-main></bar-main>";
	var barMain = document.querySelector("bar-main");

	await BITSMIST.v1.StateOrganizer.waitFor([{"name":"BarMain", "state":"ready"}]);

	document.body.innerHTML = "";

	await BITSMIST.v1.StateOrganizer.waitFor([{"name":"BarMain", "state":"stopped"}]);

	await BITSMIST.v1.StateOrganizer.waitFor([{"name":"BarMain", "state":"stopping"}]);
	expect(barMain.state).toBe("stopped");
});
