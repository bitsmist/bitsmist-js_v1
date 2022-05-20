/**
 * @jest-environment jsdom
 */
import {BarMain} from './_common.js';

// -----------------------------------------------------------------------------

test('Event trigger test - All events should be triggered', async () => {
	document.body.innerHTML = "<bar-main></bar-main>";
	var barMain = document.querySelector("bar-main");

	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-main"}]);
	expect(barMain.testVars["eventCalled"]["beforeStart"]).toBe(true);
//	expect(barMain.testVars["eventCalled"]["afterStart"]).toBe(true);
	expect(barMain.testVars["eventCalled"]["beforeSetup"]).toBe(true);
	expect(barMain.testVars["eventCalled"]["doSetup"]).toBe(true);
	expect(barMain.testVars["eventCalled"]["afterSetup"]).toBe(true);
	expect(barMain.testVars["eventCalled"]["afterAppend"]).toBe(true);
	expect(barMain.testVars["eventCalled"]["beforeRefresh"]).toBe(true);
	expect(barMain.testVars["eventCalled"]["doRefresh"]).toBe(true);
	expect(barMain.testVars["eventCalled"]["afterRefresh"]).toBe(true);
	expect(barMain.testVars["eventCalled"]["doTarget"]).toBe(true);
	expect(barMain.testVars["eventCalled"]["beforeFetch"]).toBe(true);
	expect(barMain.testVars["eventCalled"]["doFetch"]).toBe(true);
	expect(barMain.testVars["eventCalled"]["afterFetch"]).toBe(true);
	expect(barMain.testVars["eventCalled"]["beforeFill"]).toBe(true);
	expect(barMain.testVars["eventCalled"]["doFill"]).toBe(true);
	expect(barMain.testVars["eventCalled"]["afterFill"]).toBe(true);

	// document.body.innerHTML = "";
	// expect(barMain.testVars["eventCalled"]["beforeStop"]).toBe(true);
	// expect(barMain.testVars["eventCalled"]["doStop"]).toBe(true);
	// expect(barMain.testVars["eventCalled"]["afterStop"]).toBe(true);
});

// -----------------------------------------------------------------------------

test('Event order test - All events should be triggered in order', async () => {
	document.body.innerHTML = "<bar-main></bar-main>";
	var barMain = document.querySelector("bar-main");

	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-main"}]);
	expect(barMain.testVars["eventOrder"][0]).toBe("beforeStart");
	expect(barMain.testVars["eventOrder"][1]).toBe("beforeSetup");
	expect(barMain.testVars["eventOrder"][2]).toBe("doSetup");
	expect(barMain.testVars["eventOrder"][3]).toBe("afterSetup");
	expect(barMain.testVars["eventOrder"][4]).toBe("afterAppend");
	expect(barMain.testVars["eventOrder"][5]).toBe("beforeRefresh");
	expect(barMain.testVars["eventOrder"][6]).toBe("doTarget");
	expect(barMain.testVars["eventOrder"][7]).toBe("beforeFetch");
	expect(barMain.testVars["eventOrder"][8]).toBe("doFetch");
	expect(barMain.testVars["eventOrder"][9]).toBe("afterFetch");
	expect(barMain.testVars["eventOrder"][10]).toBe("beforeFill");
	expect(barMain.testVars["eventOrder"][11]).toBe("doFill");
	expect(barMain.testVars["eventOrder"][12]).toBe("afterFill");
	expect(barMain.testVars["eventOrder"][13]).toBe("doRefresh");
	expect(barMain.testVars["eventOrder"][14]).toBe("afterRefresh");
});

// -----------------------------------------------------------------------------

test('Event order test - All events should be triggered in reverse order - Asynchronous without promises', async () => {
	BarMain.prototype._getSettings = function() {
		let settings = this.__getSettings.call(this);
		settings["events"]["this"]["handlers"]["beforeStart"].push(this.onBeforeStart2);
		settings["events"]["this"]["handlers"]["beforeSetup"].push(this.onBeforeSetup2);
		settings["events"]["this"]["handlers"]["doSetup"].push(this.onDoSetup2);
		settings["events"]["this"]["handlers"]["afterSetup"].push(this.onAfterSetup2);
		settings["events"]["this"]["handlers"]["afterAppend"].push(this.onAfterAppend2);
		settings["events"]["this"]["handlers"]["beforeRefresh"].push(this.onBeforeRefresh2);
		settings["events"]["this"]["handlers"]["doRefresh"].push(this.onDoRefresh2);
		settings["events"]["this"]["handlers"]["afterRefresh"].push(this.onAfterRefresh2);
		settings["events"]["this"]["handlers"]["doTarget"].push(this.onDoTarget2);
		settings["events"]["this"]["handlers"]["beforeFetch"].push(this.onBeforeFetch2);
		settings["events"]["this"]["handlers"]["doFetch"].push(this.onDoFetch2);
		settings["events"]["this"]["handlers"]["afterFetch"].push(this.onAfterFetch2);
		settings["events"]["this"]["handlers"]["beforeFill"].push(this.onBeforeFill2);
		settings["events"]["this"]["handlers"]["doFill"].push(this.onDoFill2);
		settings["events"]["this"]["handlers"]["afterFill"].push(this.onAfterFill2);

		return settings;
	};

	BarMain.prototype.onBeforeStart2 = function() {
		this.testVars["eventOrder2"] = [];
		this.testVars["promise"] = {};
		this.testVars["promise"]["promise"] = new Promise((resolve, reject) => {
			this.testVars["promise"]["resolve"] = resolve;
		});

		setTimeout(() => {
			this.testVars["eventOrder2"].push("beforeStart");
			this.testVars["promise"]["resolve"]();
		}, 2000);
	};

	BarMain.prototype.onBeforeSetup2 = function() {
		setTimeout(() => {
			this.testVars["eventOrder2"].push("beforeSetup");
		}, 180);
	};

	BarMain.prototype.onDoSetup2 = function() {
		setTimeout(() => {
			this.testVars["eventOrder2"].push("doSetup");
		}, 160);
	};

	BarMain.prototype.onAfterSetup2 = function() {
		setTimeout(() => {
			this.testVars["eventOrder2"].push("afterSetup");
		}, 140);
	};

	BarMain.prototype.onAfterAppend2 = function() {
		setTimeout(() => {
			this.testVars["eventOrder2"].push("afterAppend");
		}, 120);
	};

	BarMain.prototype.onBeforeRefresh2 = function() {
		setTimeout(() => {
			this.testVars["eventOrder2"].push("beforeRefresh");
		}, 100);
	};

	BarMain.prototype.onDoTarget2 = function() {
		setTimeout(() => {
			this.testVars["eventOrder2"].push("doTarget");
		}, 90);
	};

	BarMain.prototype.onBeforeFetch2 = function() {
		setTimeout(() => {
			this.testVars["eventOrder2"].push("beforeFetch");
		}, 80);
	};

	BarMain.prototype.onDoFetch2 = function() {
		setTimeout(() => {
			this.testVars["eventOrder2"].push("doFetch");
		}, 70);
	};

	BarMain.prototype.onAfterFetch2 = function() {
		setTimeout(() => {
			this.testVars["eventOrder2"].push("afterFetch");
		}, 60);
	};

	BarMain.prototype.onBeforeFill2 = function() {
		setTimeout(() => {
			this.testVars["eventOrder2"].push("beforeFill");
		}, 50);
	};

	BarMain.prototype.onDoFill2 = function() {
		setTimeout(() => {
			this.testVars["eventOrder2"].push("doFill");
		}, 40);
	};

	BarMain.prototype.onAfterFill2 = function() {
		setTimeout(() => {
			this.testVars["eventOrder2"].push("afterFill");
		}, 30);
	};

	BarMain.prototype.onDoRefresh2 = function() {
		setTimeout(() => {
			this.testVars["eventOrder2"].push("doRefresh");
		}, 20);
	};

	BarMain.prototype.onAfterRefresh2 = function() {
		setTimeout(() => {
			this.testVars["eventOrder2"].push("afterRefresh");
		}, 10);
	};

	document.body.innerHTML = "<bar-main></bar-main>";
	var barMain = document.querySelector("bar-main");

	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-main"}]);
	return barMain.testVars["promise"]["promise"].then(() => {
		expect(barMain.testVars["eventOrder2"][14]).toBe("beforeStart");
		expect(barMain.testVars["eventOrder2"][13]).toBe("beforeSetup");
		expect(barMain.testVars["eventOrder2"][12]).toBe("doSetup");
		expect(barMain.testVars["eventOrder2"][11]).toBe("afterSetup");
		expect(barMain.testVars["eventOrder2"][10]).toBe("afterAppend");
		expect(barMain.testVars["eventOrder2"][9]).toBe("beforeRefresh");
		expect(barMain.testVars["eventOrder2"][8]).toBe("doTarget");
		expect(barMain.testVars["eventOrder2"][7]).toBe("beforeFetch");
		expect(barMain.testVars["eventOrder2"][6]).toBe("doFetch");
		expect(barMain.testVars["eventOrder2"][5]).toBe("afterFetch");
		expect(barMain.testVars["eventOrder2"][4]).toBe("beforeFill");
		expect(barMain.testVars["eventOrder2"][3]).toBe("doFill");
		expect(barMain.testVars["eventOrder2"][2]).toBe("afterFill");
		expect(barMain.testVars["eventOrder2"][1]).toBe("doRefresh");
		expect(barMain.testVars["eventOrder2"][0]).toBe("afterRefresh");
	});
});

// -----------------------------------------------------------------------------

test('Event order test - All events should be triggered in order - Asynchronous with promises', async () => {
	BarMain.prototype._getSettings = function() {
		let settings = this.__getSettings.call(this);
		settings["events"]["this"]["handlers"]["beforeStart"].push(this.onBeforeStart2);
		settings["events"]["this"]["handlers"]["beforeSetup"].push(this.onBeforeSetup2);
		settings["events"]["this"]["handlers"]["doSetup"].push(this.onDoSetup2);
		settings["events"]["this"]["handlers"]["afterSetup"].push(this.onAfterSetup2);
		settings["events"]["this"]["handlers"]["afterAppend"].push(this.onAfterAppend2);
		settings["events"]["this"]["handlers"]["beforeRefresh"].push(this.onBeforeRefresh2);
		settings["events"]["this"]["handlers"]["doRefresh"].push(this.onDoRefresh2);
		settings["events"]["this"]["handlers"]["afterRefresh"].push(this.onAfterRefresh2);
		settings["events"]["this"]["handlers"]["doTarget"].push(this.onDoTarget2);
		settings["events"]["this"]["handlers"]["beforeFetch"].push(this.onBeforeFetch2);
		settings["events"]["this"]["handlers"]["doFetch"].push(this.onDoFetch2);
		settings["events"]["this"]["handlers"]["afterFetch"].push(this.onAfterFetch2);
		settings["events"]["this"]["handlers"]["beforeFill"].push(this.onBeforeFill2);
		settings["events"]["this"]["handlers"]["doFill"].push(this.onDoFill2);
		settings["events"]["this"]["handlers"]["afterFill"].push(this.onAfterFill2);

		return settings;
	};

	BarMain.prototype.onBeforeStart2 = function() {
		this.testVars["eventOrder2"] = [];
		 return new Promise((resolve, reject) => {
		 	setTimeout(() => {
				this.testVars["eventOrder2"].push("beforeStart");
				resolve();
			 }, 150);
		 });
	};

	BarMain.prototype.onBeforeSetup2 = function() {
		 return new Promise((resolve, reject) => {
		 	setTimeout(() => {
				this.testVars["eventOrder2"].push("beforeSetup");
				resolve();
			 }, 140);
		 });
	};

	BarMain.prototype.onDoSetup2 = function() {
		 return new Promise((resolve, reject) => {
		 	setTimeout(() => {
				this.testVars["eventOrder2"].push("doSetup");
				resolve();
			 }, 130);
		 });
	};

	BarMain.prototype.onAfterSetup2 = function() {
		 return new Promise((resolve, reject) => {
		 	setTimeout(() => {
				this.testVars["eventOrder2"].push("afterSetup");
				resolve();
			 }, 120);
		 });
	};

	BarMain.prototype.onAfterAppend2 = function() {
		 return new Promise((resolve, reject) => {
		 	setTimeout(() => {
				this.testVars["eventOrder2"].push("afterAppend");
				resolve();
			 }, 110);
		 });
	};

	BarMain.prototype.onBeforeRefresh2 = function() {
		 return new Promise((resolve, reject) => {
		 	setTimeout(() => {
				this.testVars["eventOrder2"].push("beforeRefresh");
				resolve();
			 }, 100);
		 });
	};

	BarMain.prototype.onDoTarget2 = function() {
		 return new Promise((resolve, reject) => {
		 	setTimeout(() => {
				this.testVars["eventOrder2"].push("doTarget");
				resolve();
			 }, 90);
		 });
	};

	BarMain.prototype.onBeforeFetch2 = function() {
		 return new Promise((resolve, reject) => {
		 	setTimeout(() => {
				this.testVars["eventOrder2"].push("beforeFetch");
				resolve();
			 }, 80);
		 });
	};

	BarMain.prototype.onDoFetch2 = function() {
		 return new Promise((resolve, reject) => {
		 	setTimeout(() => {
				this.testVars["eventOrder2"].push("doFetch");
				resolve();
			 }, 70);
		 });
	};

	BarMain.prototype.onAfterFetch2 = function() {
		 return new Promise((resolve, reject) => {
		 	setTimeout(() => {
				this.testVars["eventOrder2"].push("afterFetch");
				resolve();
			 }, 60);
		 });
	};

	BarMain.prototype.onBeforeFill2 = function() {
		 return new Promise((resolve, reject) => {
		 	setTimeout(() => {
				this.testVars["eventOrder2"].push("beforeFill");
				resolve();
			 }, 50);
		 });
	};

	BarMain.prototype.onDoFill2 = function() {
		 return new Promise((resolve, reject) => {
		 	setTimeout(() => {
				this.testVars["eventOrder2"].push("doFill");
				resolve();
			 }, 40);
		 });
	};

	BarMain.prototype.onAfterFill2 = function() {
		 return new Promise((resolve, reject) => {
		 	setTimeout(() => {
				this.testVars["eventOrder2"].push("afterFill");
				resolve();
			 }, 30);
		 });
	};

	BarMain.prototype.onDoRefresh2 = function() {
		 return new Promise((resolve, reject) => {
		 	setTimeout(() => {
				this.testVars["eventOrder2"].push("doRefresh");
				resolve();
			 }, 20);
		 });
	};

	BarMain.prototype.onAfterRefresh2 = function() {
		 return new Promise((resolve, reject) => {
		 	setTimeout(() => {
				this.testVars["eventOrder2"].push("afterRefresh");
				resolve();
			 }, 10);
		 });
	};

	document.body.innerHTML = "<bar-main></bar-main>";
	var barMain = document.querySelector("bar-main");

	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-main"}]);
	expect(barMain.testVars["eventOrder2"][0]).toBe("beforeStart");
	expect(barMain.testVars["eventOrder2"][1]).toBe("beforeSetup");
	expect(barMain.testVars["eventOrder2"][2]).toBe("doSetup");
	expect(barMain.testVars["eventOrder2"][3]).toBe("afterSetup");
	expect(barMain.testVars["eventOrder2"][4]).toBe("afterAppend");
	expect(barMain.testVars["eventOrder2"][5]).toBe("beforeRefresh");
	expect(barMain.testVars["eventOrder2"][6]).toBe("doTarget");
	expect(barMain.testVars["eventOrder2"][7]).toBe("beforeFetch");
	expect(barMain.testVars["eventOrder2"][8]).toBe("doFetch");
	expect(barMain.testVars["eventOrder2"][9]).toBe("afterFetch");
	expect(barMain.testVars["eventOrder2"][10]).toBe("beforeFill");
	expect(barMain.testVars["eventOrder2"][11]).toBe("doFill");
	expect(barMain.testVars["eventOrder2"][12]).toBe("afterFill");
	expect(barMain.testVars["eventOrder2"][13]).toBe("doRefresh");
	expect(barMain.testVars["eventOrder2"][14]).toBe("afterRefresh");
});

// -----------------------------------------------------------------------------

test('Event order test - Two event handlers on one event should be triggered in order', async () => {
	BarMain.prototype._getSettings = function() {
		let settings = this.__getSettings.call(this);
		settings["events"]["this"]["handlers"]["beforeStart"].push(this.onBeforeStart2);
		settings["events"]["this"]["handlers"]["beforeStart"].push(this.onBeforeStart3);

		return settings;
	};

	BarMain.prototype.onBeforeStart2 = function() {
		this.testVars["eventOrder2"] = [];
		this.testVars["eventOrder2"].push("beforeStart2");
	};

	BarMain.prototype.onBeforeStart3 = function() {
		this.testVars["eventOrder2"].push("beforeStart3");
	};

	document.body.innerHTML = "<bar-main></bar-main>";
	var barMain = document.querySelector("bar-main");

	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-main"}]);
	expect(barMain.testVars["eventOrder2"][0]).toBe("beforeStart2");
	expect(barMain.testVars["eventOrder2"][1]).toBe("beforeStart3");
});

// -----------------------------------------------------------------------------

test('Event order test - Two event handlers on one event should be triggered in reverse order - Asynchronous without promises', async () => {
	BarMain.prototype._getSettings = function() {
		let settings = this.__getSettings.call(this);
		settings["events"]["this"]["handlers"]["beforeStart"].push(this.onBeforeStart2);
		settings["events"]["this"]["handlers"]["beforeStart"].push(this.onBeforeStart3);

		return settings;
	};

	BarMain.prototype.onBeforeStart2 = function() {
		this.testVars["eventOrder2"] = [];
		this.testVars["promise"] = {};
		this.testVars["promise"]["promise"] = new Promise((resolve, reject) => {
			this.testVars["promise"]["resolve"] = resolve;
		});

		setTimeout(() => {
			this.testVars["eventOrder2"].push("beforeStart2");
			this.testVars["promise"]["resolve"]();
		}, 200);
	};
	BarMain.prototype.onBeforeStart3 = function() {
		this.testVars["eventOrder2"].push("beforeStart3");
	};

	document.body.innerHTML = "<bar-main></bar-main>";
	var barMain = document.querySelector("bar-main");

	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-main"}]);
	return barMain.testVars["promise"]["promise"].then(() => {
		expect(barMain.testVars["eventOrder2"][0]).toBe("beforeStart3");
		expect(barMain.testVars["eventOrder2"][1]).toBe("beforeStart2");
	});
});

// -----------------------------------------------------------------------------

test('Event order test - Two event handlers on one event should be triggered in order - Asynchronous with promises', async () => {
	BarMain.prototype._getSettings = function() {
		let settings = this.__getSettings.call(this);
		settings["events"]["this"]["handlers"]["beforeStart"].push(this.onBeforeStart2);
		settings["events"]["this"]["handlers"]["beforeStart"].push(this.onBeforeStart3);

		return settings;
	};

	BarMain.prototype.onBeforeStart2 = function() {
		this.testVars["eventOrder2"] = [];
		 return new Promise((resolve, reject) => {
		 	setTimeout(() => {
				this.testVars["eventOrder2"].push("beforeStart2");
				resolve();
			 }, 1000);
		 });
	};

	BarMain.prototype.onBeforeStart3 = function() {
		this.testVars["eventOrder2"].push("beforeStart3");
	};

	document.body.innerHTML = "<bar-main></bar-main>";
	var barMain = document.querySelector("bar-main");

	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-main"}]);
	expect(barMain.testVars["eventOrder2"][0]).toBe("beforeStart2");
	expect(barMain.testVars["eventOrder2"][1]).toBe("beforeStart3");
});
