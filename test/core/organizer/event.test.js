/**
 * @jest-environment jsdom
 */
import {BarMain} from './_common.js';

// -----------------------------------------------------------------------------

test('Event Trigger Test - All events should be triggered', async () => {
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

test('Event Order Test - All events should be triggered in order', async () => {
	BarMain.prototype._getSettings = function() {
		let settings = this.__getSettings.call(this);
		settings["events"]["this"]["handlers"]["beforeStart"].push(this.onBeforeStart);
		settings["events"]["this"]["handlers"]["beforeSetup"].push(this.onEvent2);
		settings["events"]["this"]["handlers"]["doSetup"].push(this.onEvent2);
		settings["events"]["this"]["handlers"]["afterSetup"].push(this.onEvent2);
		settings["events"]["this"]["handlers"]["afterAppend"].push(this.onEvent2);
		settings["events"]["this"]["handlers"]["beforeRefresh"].push(this.onEvent2);
		settings["events"]["this"]["handlers"]["doRefresh"].push(this.onEvent2);
		settings["events"]["this"]["handlers"]["afterRefresh"].push(this.onEvent2);
		settings["events"]["this"]["handlers"]["doTarget"].push(this.onEvent2);
		settings["events"]["this"]["handlers"]["beforeFetch"].push(this.onEvent2);
		settings["events"]["this"]["handlers"]["doFetch"].push(this.onEvent2);
		settings["events"]["this"]["handlers"]["afterFetch"].push(this.onEvent2);
		settings["events"]["this"]["handlers"]["beforeFill"].push(this.onEvent2);
		settings["events"]["this"]["handlers"]["doFill"].push(this.onEvent2);
		settings["events"]["this"]["handlers"]["afterFill"].push(this.onEvent2);

		return settings;
	};

	BarMain.prototype.onBeforeStart = function() {
		this.testVars["eventOrder"] = [];
		this.testVars["eventOrder"].push("beforeStart");
	};

	BarMain.prototype.onEvent2 = function(sender, e, ex) {
		this.testVars["eventOrder"].push(e.type);
	}

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

test('Event Order Test - All events should be triggered in reverse order - Asynchronous without promises', async () => {
	BarMain.prototype._getSettings = function() {
		let settings = this.__getSettings.call(this);
		settings["events"]["this"]["handlers"]["beforeStart"].push(this.onBeforeStart);
		settings["events"]["this"]["handlers"]["beforeSetup"].push(this.onBeforeSetup);
		settings["events"]["this"]["handlers"]["doSetup"].push(this.onDoSetup);
		settings["events"]["this"]["handlers"]["afterSetup"].push(this.onAfterSetup);
		settings["events"]["this"]["handlers"]["afterAppend"].push(this.onAfterAppend);
		settings["events"]["this"]["handlers"]["beforeRefresh"].push(this.onBeforeRefresh);
		settings["events"]["this"]["handlers"]["doRefresh"].push(this.onDoRefresh);
		settings["events"]["this"]["handlers"]["afterRefresh"].push(this.onAfterRefresh);
		settings["events"]["this"]["handlers"]["doTarget"].push(this.onDoTarget);
		settings["events"]["this"]["handlers"]["beforeFetch"].push(this.onBeforeFetch);
		settings["events"]["this"]["handlers"]["doFetch"].push(this.onDoFetch);
		settings["events"]["this"]["handlers"]["afterFetch"].push(this.onAfterFetch);
		settings["events"]["this"]["handlers"]["beforeFill"].push(this.onBeforeFill);
		settings["events"]["this"]["handlers"]["doFill"].push(this.onDoFill);
		settings["events"]["this"]["handlers"]["afterFill"].push(this.onAfterFill);

		return settings;
	};

	BarMain.prototype.onBeforeStart = function() {
		this.testVars["eventOrder"] = [];
		this.testVars["promise"] = {};
		this.testVars["promise"]["promise"] = new Promise((resolve, reject) => {
			this.testVars["promise"]["resolve"] = resolve;
		});

		setTimeout(() => {
			this.testVars["eventOrder"].push("beforeStart");
			this.testVars["promise"]["resolve"]();
		}, 2000);
	};

	BarMain.prototype.onBeforeSetup = function() {
		setTimeout(() => {
			this.testVars["eventOrder"].push("beforeSetup");
		}, 180);
	};

	BarMain.prototype.onDoSetup = function() {
		setTimeout(() => {
			this.testVars["eventOrder"].push("doSetup");
		}, 160);
	};

	BarMain.prototype.onAfterSetup = function() {
		setTimeout(() => {
			this.testVars["eventOrder"].push("afterSetup");
		}, 140);
	};

	BarMain.prototype.onAfterAppend = function() {
		setTimeout(() => {
			this.testVars["eventOrder"].push("afterAppend");
		}, 120);
	};

	BarMain.prototype.onBeforeRefresh = function() {
		setTimeout(() => {
			this.testVars["eventOrder"].push("beforeRefresh");
		}, 100);
	};

	BarMain.prototype.onDoTarget = function() {
		setTimeout(() => {
			this.testVars["eventOrder"].push("doTarget");
		}, 90);
	};

	BarMain.prototype.onBeforeFetch = function() {
		setTimeout(() => {
			this.testVars["eventOrder"].push("beforeFetch");
		}, 80);
	};

	BarMain.prototype.onDoFetch = function() {
		setTimeout(() => {
			this.testVars["eventOrder"].push("doFetch");
		}, 70);
	};

	BarMain.prototype.onAfterFetch = function() {
		setTimeout(() => {
			this.testVars["eventOrder"].push("afterFetch");
		}, 60);
	};

	BarMain.prototype.onBeforeFill = function() {
		setTimeout(() => {
			this.testVars["eventOrder"].push("beforeFill");
		}, 50);
	};

	BarMain.prototype.onDoFill = function() {
		setTimeout(() => {
			this.testVars["eventOrder"].push("doFill");
		}, 40);
	};

	BarMain.prototype.onAfterFill = function() {
		setTimeout(() => {
			this.testVars["eventOrder"].push("afterFill");
		}, 30);
	};

	BarMain.prototype.onDoRefresh = function() {
		setTimeout(() => {
			this.testVars["eventOrder"].push("doRefresh");
		}, 20);
	};

	BarMain.prototype.onAfterRefresh = function() {
		setTimeout(() => {
			this.testVars["eventOrder"].push("afterRefresh");
		}, 10);
	};

	document.body.innerHTML = "<bar-main></bar-main>";
	var barMain = document.querySelector("bar-main");

	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-main"}]);
	return barMain.testVars["promise"]["promise"].then(() => {
		expect(barMain.testVars["eventOrder"][14]).toBe("beforeStart");
		expect(barMain.testVars["eventOrder"][13]).toBe("beforeSetup");
		expect(barMain.testVars["eventOrder"][12]).toBe("doSetup");
		expect(barMain.testVars["eventOrder"][11]).toBe("afterSetup");
		expect(barMain.testVars["eventOrder"][10]).toBe("afterAppend");
		expect(barMain.testVars["eventOrder"][9]).toBe("beforeRefresh");
		expect(barMain.testVars["eventOrder"][8]).toBe("doTarget");
		expect(barMain.testVars["eventOrder"][7]).toBe("beforeFetch");
		expect(barMain.testVars["eventOrder"][6]).toBe("doFetch");
		expect(barMain.testVars["eventOrder"][5]).toBe("afterFetch");
		expect(barMain.testVars["eventOrder"][4]).toBe("beforeFill");
		expect(barMain.testVars["eventOrder"][3]).toBe("doFill");
		expect(barMain.testVars["eventOrder"][2]).toBe("afterFill");
		expect(barMain.testVars["eventOrder"][1]).toBe("doRefresh");
		expect(barMain.testVars["eventOrder"][0]).toBe("afterRefresh");
	});
});

// -----------------------------------------------------------------------------

test('Event Order Test - All events should be triggered in order - Asynchronous with promises', async () => {
	BarMain.prototype._getSettings = function() {
		let settings = this.__getSettings.call(this);
		settings["events"]["this"]["handlers"]["beforeStart"].push(this.onBeforeStart);
		settings["events"]["this"]["handlers"]["beforeSetup"].push(this.onBeforeSetup);
		settings["events"]["this"]["handlers"]["doSetup"].push(this.onDoSetup);
		settings["events"]["this"]["handlers"]["afterSetup"].push(this.onAfterSetup);
		settings["events"]["this"]["handlers"]["afterAppend"].push(this.onAfterAppend);
		settings["events"]["this"]["handlers"]["beforeRefresh"].push(this.onBeforeRefresh);
		settings["events"]["this"]["handlers"]["doRefresh"].push(this.onDoRefresh);
		settings["events"]["this"]["handlers"]["afterRefresh"].push(this.onAfterRefresh);
		settings["events"]["this"]["handlers"]["doTarget"].push(this.onDoTarget);
		settings["events"]["this"]["handlers"]["beforeFetch"].push(this.onBeforeFetch);
		settings["events"]["this"]["handlers"]["doFetch"].push(this.onDoFetch);
		settings["events"]["this"]["handlers"]["afterFetch"].push(this.onAfterFetch);
		settings["events"]["this"]["handlers"]["beforeFill"].push(this.onBeforeFill);
		settings["events"]["this"]["handlers"]["doFill"].push(this.onDoFill);
		settings["events"]["this"]["handlers"]["afterFill"].push(this.onAfterFill);

		return settings;
	};

	BarMain.prototype.onBeforeStart = function() {
		this.testVars["eventOrder"] = [];
		 return new Promise((resolve, reject) => {
		 	setTimeout(() => {
				this.testVars["eventOrder"].push("beforeStart");
				resolve();
			 }, 150);
		 });
	};

	BarMain.prototype.onBeforeSetup = function() {
		 return new Promise((resolve, reject) => {
		 	setTimeout(() => {
				this.testVars["eventOrder"].push("beforeSetup");
				resolve();
			 }, 140);
		 });
	};

	BarMain.prototype.onDoSetup = function() {
		 return new Promise((resolve, reject) => {
		 	setTimeout(() => {
				this.testVars["eventOrder"].push("doSetup");
				resolve();
			 }, 130);
		 });
	};

	BarMain.prototype.onAfterSetup = function() {
		 return new Promise((resolve, reject) => {
		 	setTimeout(() => {
				this.testVars["eventOrder"].push("afterSetup");
				resolve();
			 }, 120);
		 });
	};

	BarMain.prototype.onAfterAppend = function() {
		 return new Promise((resolve, reject) => {
		 	setTimeout(() => {
				this.testVars["eventOrder"].push("afterAppend");
				resolve();
			 }, 110);
		 });
	};

	BarMain.prototype.onBeforeRefresh = function() {
		 return new Promise((resolve, reject) => {
		 	setTimeout(() => {
				this.testVars["eventOrder"].push("beforeRefresh");
				resolve();
			 }, 100);
		 });
	};

	BarMain.prototype.onDoTarget = function() {
		 return new Promise((resolve, reject) => {
		 	setTimeout(() => {
				this.testVars["eventOrder"].push("doTarget");
				resolve();
			 }, 90);
		 });
	};

	BarMain.prototype.onBeforeFetch = function() {
		 return new Promise((resolve, reject) => {
		 	setTimeout(() => {
				this.testVars["eventOrder"].push("beforeFetch");
				resolve();
			 }, 80);
		 });
	};

	BarMain.prototype.onDoFetch = function() {
		 return new Promise((resolve, reject) => {
		 	setTimeout(() => {
				this.testVars["eventOrder"].push("doFetch");
				resolve();
			 }, 70);
		 });
	};

	BarMain.prototype.onAfterFetch = function() {
		 return new Promise((resolve, reject) => {
		 	setTimeout(() => {
				this.testVars["eventOrder"].push("afterFetch");
				resolve();
			 }, 60);
		 });
	};

	BarMain.prototype.onBeforeFill = function() {
		 return new Promise((resolve, reject) => {
		 	setTimeout(() => {
				this.testVars["eventOrder"].push("beforeFill");
				resolve();
			 }, 50);
		 });
	};

	BarMain.prototype.onDoFill = function() {
		 return new Promise((resolve, reject) => {
		 	setTimeout(() => {
				this.testVars["eventOrder"].push("doFill");
				resolve();
			 }, 40);
		 });
	};

	BarMain.prototype.onAfterFill = function() {
		 return new Promise((resolve, reject) => {
		 	setTimeout(() => {
				this.testVars["eventOrder"].push("afterFill");
				resolve();
			 }, 30);
		 });
	};

	BarMain.prototype.onDoRefresh = function() {
		 return new Promise((resolve, reject) => {
		 	setTimeout(() => {
				this.testVars["eventOrder"].push("doRefresh");
				resolve();
			 }, 20);
		 });
	};

	BarMain.prototype.onAfterRefresh = function() {
		 return new Promise((resolve, reject) => {
		 	setTimeout(() => {
				this.testVars["eventOrder"].push("afterRefresh");
				resolve();
			 }, 10);
		 });
	};

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

test('Event Order Test - Two event handlers on one event should be triggered in order', async () => {
	BarMain.prototype._getSettings = function() {
		let settings = this.__getSettings.call(this);
		settings["events"]["this"]["handlers"]["beforeStart"].push(this.onBeforeStart1);
		settings["events"]["this"]["handlers"]["beforeStart"].push(this.onBeforeStart2);

		return settings;
	};

	BarMain.prototype.onBeforeStart1 = function() {
		this.testVars["eventOrder"] = [];
		this.testVars["eventOrder"].push("beforeStart1");
	};

	BarMain.prototype.onBeforeStart2 = function() {
		this.testVars["eventOrder"].push("beforeStart2");
	};

	document.body.innerHTML = "<bar-main></bar-main>";
	var barMain = document.querySelector("bar-main");

	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-main"}]);
	expect(barMain.testVars["eventOrder"][0]).toBe("beforeStart1");
	expect(barMain.testVars["eventOrder"][1]).toBe("beforeStart2");
});

// -----------------------------------------------------------------------------

test('Event Order Test - Two event handlers on one event should be triggered in reverse order - Asynchronous without promises', async () => {
	BarMain.prototype._getSettings = function() {
		let settings = this.__getSettings.call(this);
		settings["events"]["this"]["handlers"]["beforeStart"].push(this.onBeforeStart1);
		settings["events"]["this"]["handlers"]["beforeStart"].push(this.onBeforeStart2);

		return settings;
	};

	BarMain.prototype.onBeforeStart1 = function() {
		this.testVars["eventOrder"] = [];
		this.testVars["promise"] = {};
		this.testVars["promise"]["promise"] = new Promise((resolve, reject) => {
			this.testVars["promise"]["resolve"] = resolve;
		});

		setTimeout(() => {
			this.testVars["eventOrder"].push("beforeStart1");
			this.testVars["promise"]["resolve"]();
		}, 200);
	};
	BarMain.prototype.onBeforeStart2 = function() {
		this.testVars["eventOrder"].push("beforeStart2");
	};

	document.body.innerHTML = "<bar-main></bar-main>";
	var barMain = document.querySelector("bar-main");

	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-main"}]);
	return barMain.testVars["promise"]["promise"].then(() => {
		expect(barMain.testVars["eventOrder"][0]).toBe("beforeStart2");
		expect(barMain.testVars["eventOrder"][1]).toBe("beforeStart1");
	});
});

// -----------------------------------------------------------------------------

test('Event Order Test - Two event handlers on one event should be triggered in order - Asynchronous with promises', async () => {
	BarMain.prototype._getSettings = function() {
		let settings = this.__getSettings.call(this);
		settings["events"]["this"]["handlers"]["beforeStart"].push(this.onBeforeStart1);
		settings["events"]["this"]["handlers"]["beforeStart"].push(this.onBeforeStart2);

		return settings;
	};

	BarMain.prototype.onBeforeStart1 = function() {
		this.testVars["eventOrder"] = [];
		 return new Promise((resolve, reject) => {
		 	setTimeout(() => {
				this.testVars["eventOrder"].push("beforeStart1");
				resolve();
			 }, 1000);
		 });
	};

	BarMain.prototype.onBeforeStart2 = function() {
		this.testVars["eventOrder"].push("beforeStart2");
	};

	document.body.innerHTML = "<bar-main></bar-main>";
	var barMain = document.querySelector("bar-main");

	await BITSMIST.v1.StateOrganizer.waitFor([{"rootNode":"bar-main"}]);
	expect(barMain.testVars["eventOrder"][0]).toBe("beforeStart1");
	expect(barMain.testVars["eventOrder"][1]).toBe("beforeStart2");
});
