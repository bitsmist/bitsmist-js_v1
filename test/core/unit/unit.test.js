/**
 * @jest-environment jsdom
 */

import {Unit} from '../../../src/core/index';
import {BarMain} from './unit.env.js';

// =============================================================================
// 	Setters/Getters Test
// =============================================================================

// uniqueId static/instance
// tagName static/instance
// assets static/instance
// ready

// =============================================================================
// 	Methods Test
// =============================================================================

// get() static/instance
// set() static/instance
// has() static/instance
// upgrade() static/instance

// =============================================================================
// 	Initialization Test
// =============================================================================

test('Initialization Test: Test if a unit is an instance of Unit', async () => {
	document.body.innerHTML = "<bar-main></bar-main>";
	var barMain = document.querySelector("bar-main");
	await Unit.cast("status.wait",[{"object":barMain, "status":"ready"}]);

	expect(barMain).toBeInstanceOf(Unit);
});

test('Initialization Test: Test if a unit is initialized only once.', async () => {
	document.body.innerHTML = "<div id='div1'><bar-main></bar-main></div><div id='div2'></div>";
	var barMain = document.querySelector("bar-main");
	await Unit.cast("status.wait",[{"object":barMain, "status":"ready"}]);

	var oldId = document.querySelector("bar-main").uniqueId;
	document.getElementById('div2').insertAdjacentElement('afterbegin', document.querySelector('bar-main'));
	var newId = document.querySelector("bar-main").uniqueId;
	expect(oldId).toBe(newId);
});

// =============================================================================
// 	State Transition Test
// =============================================================================

test('State Transition Test: Test if a unit does not stop while starting.', async () => {
	// Start
	document.body.innerHTML = "<bar-main @bm-settingsref='/bar-main.settings1.js'></bar-main>";
	var barMain = document.querySelector("bar-main");

	// Stop
	document.body.innerHTML = "";
	await Unit.cast("status.wait",[{"object":barMain, "status":"stopped"}]);

	let index = barMain.testVars["eventOrder"].indexOf("afterReady");
	expect(barMain.testVars["eventOrder"][index]).toBe("afterReady");
	expect(barMain.testVars["eventOrder"][index + 1]).toBe("beforeStop");
});
