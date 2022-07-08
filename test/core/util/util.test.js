import './_common.js';

// =============================================================================
// 	safeSet()
// =============================================================================

test('safeSet() Test - Should add a value - single level', () => {
	let store = {};

	BITSMIST.v1.Util.safeSet(store, "key1", "value1");

	expect(Object.keys(store).length).toBe(1);
	expect(store["key1"]).toBe("value1");
});

// -----------------------------------------------------------------------------

test('safeSet() Test - Should add a value - multi level', () => {
	let store = {};

	BITSMIST.v1.Util.safeSet(store, "key1.key1-1", "value1-1");

	expect(Object.keys(store).length).toBe(1);
	expect(store["key1"]["key1-1"]).toBe("value1-1");
});

test('safeSet() Test - Should be an error when an intermediate value is not an object', () => {
	let store = {
		"key1": {
			"key1-1": "value1-1"
		}
	};

	expect(() => {BITSMIST.v1.Util.safeSet(store, "key1.key1-1.key1-1-1", "value1-1-1")}).toThrow(TypeError);
});

// -----------------------------------------------------------------------------

test('safeSet() Test - Should be an error when an intermediate value is not an object', () => {
	let store = {
		"key1": {
			"key1-1": "value1-1"
		}
	};

	expect(() => {BITSMIST.v1.Util.safeSet(store, "key1.key1-1.key1-1-1.key1-1-1-1", "value1-1-1-1")}).toThrow(TypeError);
});

// =============================================================================
// 	safeMerge()
// =============================================================================

// =============================================================================
// 	safeRemove()
// =============================================================================

test('safeRemove() Test - specified key should removed from the store - single level"', () => {
	let store = {
		"test1": "test1",
		"test2": "test2"
	};

	BITSMIST.v1.Util.safeRemove(store, "test1");

	expect(Object.keys(store).length).toBe(1);
	expect(store["test1"]).toBe(undefined);
	expect(store["test2"]).toBe("test2");
});

// -----------------------------------------------------------------------------

test('safeRemove() Test - specified key should removed from the store - multi level"', () => {
	let store = {
		"test1": {
			"test1-1": {
				"test1-1-1": "test1-1-1",
				"test1-1-2": "test1-1-2",
			},
			"test1-2": "test1-2"
		},
		"test2": "test2"
	};

	BITSMIST.v1.Util.safeRemove(store, "test1.test1-1.test1-1-1");

	expect(store["test1"]["test1-1"]["test1-1-1"]).toBe(undefined);
	expect(store["test1"]["test1-1"]["test1-1-2"]).toBe("test1-1-2");
	expect(store["test1"]["test1-2"]).toBe("test1-2");
	expect(store["test2"]).toBe("test2");
});

// -----------------------------------------------------------------------------

test('safeRemove() Test (Non Existent Key) - Should remove nothing - single level"', () => {
	let store = {
		"test1": "test1",
		"test2": "test2"
	};

	BITSMIST.v1.Util.safeRemove(store, "test3");

	expect(Object.keys(store).length).toBe(2);
	expect(store["test1"]).toBe("test1");
	expect(store["test2"]).toBe("test2");
});

// -----------------------------------------------------------------------------

test('safeRemove() Test (Non Existent Key) - Should remove nothing - multi level"', () => {
	let store = {
		"test1": {
			"test1-1": {
				"test1-1-1": "test1-1-1",
				"test1-1-2": "test1-1-2",
			},
			"test1-2": "test1-2"
		},
		"test2": "test2"
	};

	BITSMIST.v1.Util.safeRemove(store, "test1.test1-1.test1-1-3");
	BITSMIST.v1.Util.safeRemove(store, "test1.test1-3");

	expect(store["test1"]["test1-1"]["test1-1-1"]).toBe("test1-1-1");
	expect(store["test1"]["test1-1"]["test1-1-2"]).toBe("test1-1-2");
	expect(store["test1"]["test1-2"]).toBe("test1-2");
	expect(store["test2"]).toBe("test2");
});

// =============================================================================
// 	deepMerge()
// =============================================================================

test('deepMerge() Test (Primitive <--- Primitive) - Should overwrite a primitive value with primitive value', () => {
	let store1 = {
		"key1": "value1"
	};

	let store2 = {
		"key1": "value2"
	};

	let result = BITSMIST.v1.Util.deepMerge(store1, store2);

	expect(Object.keys(result).length).toBe(1);
	expect(result["key1"]).toBe("value2");
});

// -----------------------------------------------------------------------------

test('deepMerge() Test (Primitive <--- Object) - Should overwrite a primitive value with object', () => {
	let store1 = {
		"key1": "value1",
	};

	let store2 = {
		"key1": {"a": "value1a"}
	};

	let result = BITSMIST.v1.Util.deepMerge(store1, store2);

	expect(Object.keys(result).length).toBe(1);
	expect(typeof result["key1"]).toBe("object");
	expect(result["key1"]["a"]).toBe("value1a");
});

// -----------------------------------------------------------------------------

test('deepMerge() Test (Primitive <--- Array) - Should overwrite a primitive value with array - multi level', () => {
	let store1 = {
		"key1": "value1",
	};

	let store2 = {
		"key1": ["a", "b", "c"],
	};

	let result = BITSMIST.v1.Util.deepMerge(store1, store2);

	expect(Object.keys(result).length).toBe(1);
	expect(Array.isArray(result["key1"])).toBe(true);
	expect(result["key1"].length).toBe(3);
	expect(result["key1"][0]).toBe("a");
	expect(result["key1"][1]).toBe("b");
	expect(result["key1"][2]).toBe("c");
});

// -----------------------------------------------------------------------------

test('deepMerge() Test (Object <--- Primitive) - Should overwrite an object with a primitive value', () => {
	let store1 = {
		"key1": {"a":"value1a"},
	};

	let store2 = {
		"key1": "value1b",
	};

	let result = BITSMIST.v1.Util.deepMerge(store1, store2);

	expect(Object.keys(result).length).toBe(1);
	expect(result["key1"]).toBe("value1b");
});

// -----------------------------------------------------------------------------

test('deepMerge() Test (Object <--- Object) - Should merge an object into an object - single level', () => {
	let store1 = {
		"a":"valueA",
	};

	let store2 = {
		"b":"valueB",
	};

	let result = BITSMIST.v1.Util.deepMerge(store1, store2);

	expect(Object.keys(result).length).toBe(2);
	expect(result["a"]).toBe("valueA");
	expect(result["b"]).toBe("valueB");
});

// -----------------------------------------------------------------------------

test('deepMerge() Test (Object <--- Object) - Should merge an object into an object - multi level', () => {
	let store1 = {
		"key1": {"a":"value1a"},
	};

	let store2 = {
		"key1": {"b":"value1b"},
	};

	let result = BITSMIST.v1.Util.deepMerge(store1, store2);

	expect(Object.keys(result).length).toBe(1);
	expect(Object.keys(result["key1"]).length).toBe(2);
	expect(result["key1"]["a"]).toBe("value1a");
	expect(result["key1"]["b"]).toBe("value1b");
});

// -----------------------------------------------------------------------------

test('deepMerge() Test (Object <--- Array) - Should merge an array into an object - single level', () => {
	let store1 = {
		"a":"value1a",
	};

	let store2 = ["a", "b", "c"];

	let result = BITSMIST.v1.Util.deepMerge(store1, store2);

	expect(Object.keys(result).length).toBe(4);
	expect(result["0"]).toBe("a");
	expect(result["1"]).toBe("b");
	expect(result["2"]).toBe("c");
	expect(result["a"]).toBe("value1a");
});

// -----------------------------------------------------------------------------

test('deepMerge() Test (Object <--- Array) - Should merge an array into an object - multi level', () => {
	let store1 = {
		"key1": {"a":"value1a"},
	};

	let store2 = {
		"key1": ["a", "b", "c"]
	};

	let result = BITSMIST.v1.Util.deepMerge(store1, store2);

	expect(Object.keys(result).length).toBe(1);
	expect(Object.keys(result["key1"]).length).toBe(4);
	expect(result["key1"]["0"]).toBe("a");
	expect(result["key1"]["1"]).toBe("b");
	expect(result["key1"]["2"]).toBe("c");
	expect(result["key1"]["a"]).toBe("value1a");
});

// -----------------------------------------------------------------------------

test('deepMerge() Test (Array <--- Primitive) - Should concat a primitive value to an array - single level', () => {
	let store1 = ["a","b","c"];
	let store2 = "value1";

	let result = BITSMIST.v1.Util.deepMerge(store1, store2);

	expect(Object.keys(result).length).toBe(4);
	expect(result[0]).toBe("a");
	expect(result[1]).toBe("b");
	expect(result[2]).toBe("c");
	expect(result[3]).toBe("value1");
});

// -----------------------------------------------------------------------------

test('deepMerge() Test (Array <--- Primitive) - Should concat a primitive value to an array - multi level', () => {
	let store1 = {
		"key1": ["a","b","c"],
	};

	let store2 = {
		"key1": "value1",
	};

	let result = BITSMIST.v1.Util.deepMerge(store1, store2);

	expect(Object.keys(result).length).toBe(1);
	expect(result["key1"][0]).toBe("a");
	expect(result["key1"][1]).toBe("b");
	expect(result["key1"][2]).toBe("c");
	expect(result["key1"][3]).toBe("value1");
});

// -----------------------------------------------------------------------------

test('deepMerge() Test (Array <--- Object) - Should concat an object to an array - single level', () => {
	let store1 = ["a","b","c"];
	let store2 = {
		"d": "valueD",
	};

	let result = BITSMIST.v1.Util.deepMerge(store1, store2);

	expect(Object.keys(result).length).toBe(4);
	expect(result[0]).toBe("a");
	expect(result[1]).toBe("b");
	expect(result[2]).toBe("c");
	expect(typeof result[3]).toBe("object");
	expect(result[3]["d"]).toBe("valueD");
});

// -----------------------------------------------------------------------------

test('deepMerge() Test (Array <--- Object) - Should concat an object to an array - multi level', () => {
	let store1 = {
		"key1": ["a","b","c"],
	};

	let store2 = {
		"key1": {"d": "valueD"},
	};

	let result = BITSMIST.v1.Util.deepMerge(store1, store2);

	expect(Object.keys(result).length).toBe(1);
	expect(Object.keys(result["key1"]).length).toBe(4);
	expect(result["key1"][0]).toBe("a");
	expect(result["key1"][1]).toBe("b");
	expect(result["key1"][2]).toBe("c");
	expect(typeof result["key1"][3]).toBe("object");
	expect(result["key1"][3]["d"]).toBe("valueD");
});

test('deepMerge() Test (Array <--- Array) - Should concat an array to an array - single level', () => {
	let store1 = ["a","b","c"];
	let store2 = ["d", "e", "f"];

	let result = BITSMIST.v1.Util.deepMerge(store1, store2);

	expect(Object.keys(result).length).toBe(6);
	expect(result[0]).toBe("a");
	expect(result[1]).toBe("b");
	expect(result[2]).toBe("c");
	expect(result[3]).toBe("d");
	expect(result[4]).toBe("e");
	expect(result[5]).toBe("f");
});

// -----------------------------------------------------------------------------

test('deepMerge() Test (Array <--- Array) - Should concat an array to an array - multi level', () => {
	let store1 = {
		"key1": ["a","b","c"],
	};

	let store2 = {
		"key1": ["d", "e", "f"],
	}

	let result = BITSMIST.v1.Util.deepMerge(store1, store2);

	expect(Object.keys(result).length).toBe(1);
	expect(Array.isArray(result["key1"])).toBe(true);
	expect(result["key1"].length).toBe(6);
	expect(result["key1"][0]).toBe("a");
	expect(result["key1"][1]).toBe("b");
	expect(result["key1"][2]).toBe("c");
	expect(result["key1"][3]).toBe("d");
	expect(result["key1"][4]).toBe("e");
	expect(result["key1"][5]).toBe("f");
});

test('deepMerge() Immutability Test - The store1 should be mutated and the store2 should be deep cloned', () => {
	let store1 = {};
	let store2 = {
		"key1": "value2",
		"ErrorOrganizer": BITSMIST.v1.Component,
		"Promise": new Promise(() => {}),
	};

	let result = BITSMIST.v1.Util.deepMerge(store1, store2);

	expect(Object.keys(result).length).toBe(3);
	expect(result["key1"]).toBe("value2");
	expect(store1 === result).toBe(true);
	expect(store2["ErrorOrganizer"] === result["ErrorOrganizer"]).toBe(true);
	expect(store2["Promise"] === result["Promise"]).toBe(true);
});

// -----------------------------------------------------------------------------

test('deepMerge() Immutability Test - The store1 should be mutated and the store2 should be deep cloned', () => {
	const store1 = {
		foo: { bar: 3 },
		array: [{
			does: 'work',
			too: [ 1, 2, 3 ]
		}]
	}

	const store2 = {
		foo: { baz: 4 },
		quux: 5,
		array: [{
			does: 'work',
			too: [ 4, 5, 6 ]
		}, {
			really: 'yes'
		}]
	}

	let result = BITSMIST.v1.Util.deepMerge(store1, store2);

	expect(store1 === result).toBe(true);
	expect(store1["foo"] === result["foo"]).toBe(true);
	expect(store1["array"] === result["array"]).toBe(true);
	expect(store1["array"]["too"] === result["array"]["too"]).toBe(true);
	expect(store2["foo"] === result["foo"]).toBe(false);
	expect(store2["array"] === result["array"]).toBe(false);
	expect(store2["array"][0]["too"] === result["array"][1]["too"]).toBe(false);
});
