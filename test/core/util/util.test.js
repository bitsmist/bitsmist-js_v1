import {Util, Unit} from '../../../src/core/index'

// =============================================================================
// 	Methods Test
// =============================================================================

// safeGet()

// safeSet()

test('safeSet() Test: Set a value in an object at the top Level.', () => {
	let store = {};

	Util.safeSet(store, "key1", "value1");

	expect(Object.keys(store).length).toBe(1);
	expect(store["key1"]).toBe("value1");
});

test('safeSet() Test: Set a value in an object at the second level', () => {
	let store = {};

	Util.safeSet(store, "key1.key1-1", "value1-1");

	expect(Object.keys(store).length).toBe(1);
	expect(store["key1"]["key1-1"]).toBe("value1-1");
});

test('safeSet() Test: Set a value in an object where a non-object value already exists at the second level.', () => {
	let store = {
		"key1": {
			"key1-1": "value1-1"
		}
	};

	expect(() => {Util.safeSet(store, "key1.key1-1.key1-1-1", "value1-1-1")}).toThrow(TypeError);
});

// safeRemove()

test('safeRemove() Test: Remove an item from an object at the top level.', () => {
	let store = {
		"key1": "value1",
		"key2": "value2"
	};

	Util.safeRemove(store, "key1");

	expect(Object.keys(store).length).toBe(1);
	expect(store["key1"]).toBe(undefined);
	expect(store["key2"]).toBe("value2");
});

test('safeRemove() Test: Remove an item from an object at the second level.', () => {
	let store = {
		"key1": {
			"key1-1": "value1-1",
			"key1-2": "value1-2"
		},
	};

	Util.safeRemove(store, "key1.key1-1");

	expect(Object.keys(store["key1"]).length).toBe(1);
	expect(store["key1"]["key1-1"]).toBe(undefined);
	expect(store["key1"]["key1-2"]).toBe("value1-2");
});

test('safeRemove() Test: Remove an item from an object where the item does not exist at the top level.', () => {
	let store = {
		"key1": "value1",
		"key2": "value2"
	};

	Util.safeRemove(store, "key3");

	expect(Object.keys(store).length).toBe(2);
	expect(store["key1"]).toBe("value1");
	expect(store["key2"]).toBe("value2");
});

test('safeRemove() Test: Remove an item from an object where the item does not exist at the second level.', () => {
	let store = {
		"key1": {
			"key1-1": "value1-1",
			"key1-2": "value1-2"
		},
	};

	Util.safeRemove(store, "key1.key1-3");

	expect(Object.keys(store["key1"]).length).toBe(2);
	expect(store["key1"]["key1-1"]).toBe("value1-1");
	expect(store["key1"]["key1-2"]).toBe("value1-2");
});

// safeMerge()

test('safeMerge() Test: Merge a value to an object where a non-object value already exists at the second level.', () => {
	let store = {
		"key1": {
			"key1-1": "value1-1"
		}
	};

	expect(() => {Util.safeMerge(store, "key1.key1-1.key1-1-1.key1-1-1-1", "value1-1-1-1")}).toThrow(TypeError);
});

// safeHas()

test('safeHas() Test: Test if an item exists in an object at the first level.', () => {
	let store = {
		"key1": "value1"
	};

	expect(Util.safeHas(store, "key1")).toBe(true);
	expect(Util.safeHas(store, "key2")).toBe(false);
});

test('safeHas() Test: Test if an item exists in an object at the second level', () => {
	let store = {
		"key1": {
			"key1-1": "value1-1"
		},
	};

	expect(Util.safeHas(store, "key1.key1-1")).toBe(true);
	expect(Util.safeHas(store, "key1.key1-2")).toBe(false);
});

// deepMerge()

test('deepMerge() Test: Merge a primitive value into a primitive value at the top level.', () => {
	let store1 = {
		"key1": "value1"
	};

	let store2 = {
		"key1": "value2"
	};

	let result = Util.deepMerge(store1, store2);

	expect(Object.keys(result).length).toBe(1);
	expect(result["key1"]).toBe("value2");
});

test('deepMerge() Test: Merge an object into a primitive value at the top level.', () => {
	let store1 = {
		"key1": "value1",
	};

	let store2 = {
		"key1": {"a": "value1a"}
	};

	let result = Util.deepMerge(store1, store2);

	expect(Object.keys(result).length).toBe(1);
	expect(typeof result["key1"]).toBe("object");
	expect(result["key1"]["a"]).toBe("value1a");
});

test('deepMerge() Test: Merge an array into a primitive value. at the top level.', () => {
	let store1 = {
		"key1": "value1",
	};

	let store2 = {
		"key1": ["a", "b", "c"],
	};

	let result = Util.deepMerge(store1, store2);

	expect(Object.keys(result).length).toBe(1);
	expect(Array.isArray(result["key1"])).toBe(true);
	expect(result["key1"].length).toBe(3);
	expect(result["key1"][0]).toBe("a");
	expect(result["key1"][1]).toBe("b");
	expect(result["key1"][2]).toBe("c");
});

test('deepMerge() Test: Merge a primitive value into an object at the top level.', () => {
	let store1 = {
		"key1": {"a":"value1a"},
	};

	let store2 = {
		"key1": "value1b",
	};

	let result = Util.deepMerge(store1, store2);

	expect(Object.keys(result).length).toBe(1);
	expect(result["key1"]).toBe("value1b");
});

test('deepMerge() Test: Merge an object into an object at the top level.', () => {
	let store1 = {
		"a":"valueA",
	};

	let store2 = {
		"b":"valueB",
	};

	let result = Util.deepMerge(store1, store2);

	expect(Object.keys(result).length).toBe(2);
	expect(result["a"]).toBe("valueA");
	expect(result["b"]).toBe("valueB");
});

test('deepMerge() Test: Merge an object into an object at the second level.', () => {
	let store1 = {
		"key1": {"a":"value1a"},
	};

	let store2 = {
		"key1": {"b":"value1b"},
	};

	let result = Util.deepMerge(store1, store2);

	expect(Object.keys(result).length).toBe(1);
	expect(Object.keys(result["key1"]).length).toBe(2);
	expect(result["key1"]["a"]).toBe("value1a");
	expect(result["key1"]["b"]).toBe("value1b");
});

test('deepMerge() Test: Merge an array into an object at the top level.', () => {
	let store1 = {
		"a":"value1a",
	};

	let store2 = ["a", "b", "c"];

	let result = Util.deepMerge(store1, store2);

	expect(Object.keys(result).length).toBe(4);
	expect(result["0"]).toBe("a");
	expect(result["1"]).toBe("b");
	expect(result["2"]).toBe("c");
	expect(result["a"]).toBe("value1a");
});

test('deepMerge() Test: Merge an array into an object at the second level.', () => {
	let store1 = {
		"key1": {"a":"value1a"},
	};

	let store2 = {
		"key1": ["a", "b", "c"]
	};

	let result = Util.deepMerge(store1, store2);

	expect(Object.keys(result).length).toBe(1);
	expect(Object.keys(result["key1"]).length).toBe(4);
	expect(result["key1"]["0"]).toBe("a");
	expect(result["key1"]["1"]).toBe("b");
	expect(result["key1"]["2"]).toBe("c");
	expect(result["key1"]["a"]).toBe("value1a");
});

test('deepMerge() Test: Merge a primitive value into an array at the top level.', () => {
	let store1 = ["a","b","c"];
	let store2 = "value1";

	let result = Util.deepMerge(store1, store2);

	expect(Object.keys(result).length).toBe(4);
	expect(result[0]).toBe("a");
	expect(result[1]).toBe("b");
	expect(result[2]).toBe("c");
	expect(result[3]).toBe("value1");
});

test('deepMerge() Test: Merge a primitive value into an array at the second level.', () => {
	let store1 = {
		"key1": ["a","b","c"],
	};

	let store2 = {
		"key1": "value1",
	};

	let result = Util.deepMerge(store1, store2);

	expect(Object.keys(result).length).toBe(1);
	expect(result["key1"][0]).toBe("a");
	expect(result["key1"][1]).toBe("b");
	expect(result["key1"][2]).toBe("c");
	expect(result["key1"][3]).toBe("value1");
});

test('deepMerge() Test: Merge an object into an array at the top level.', () => {
	let store1 = ["a","b","c"];
	let store2 = {
		"d": "valueD",
	};

	let result = Util.deepMerge(store1, store2);

	expect(Object.keys(result).length).toBe(4);
	expect(result[0]).toBe("a");
	expect(result[1]).toBe("b");
	expect(result[2]).toBe("c");
	expect(typeof result[3]).toBe("object");
	expect(result[3]["d"]).toBe("valueD");
});

test('deepMerge() Test: Merge an object into an array at the second level.', () => {
	let store1 = {
		"key1": ["a","b","c"],
	};

	let store2 = {
		"key1": {"d": "valueD"},
	};

	let result = Util.deepMerge(store1, store2);

	expect(Object.keys(result).length).toBe(1);
	expect(Object.keys(result["key1"]).length).toBe(4);
	expect(result["key1"][0]).toBe("a");
	expect(result["key1"][1]).toBe("b");
	expect(result["key1"][2]).toBe("c");
	expect(typeof result["key1"][3]).toBe("object");
	expect(result["key1"][3]["d"]).toBe("valueD");
});

test('deepMerge() Test: Merge an array into an array at the top level.', () => {
	let store1 = ["a","b","c"];
	let store2 = ["d", "e", "f"];

	let result = Util.deepMerge(store1, store2);

	expect(Object.keys(result).length).toBe(6);
	expect(result[0]).toBe("a");
	expect(result[1]).toBe("b");
	expect(result[2]).toBe("c");
	expect(result[3]).toBe("d");
	expect(result[4]).toBe("e");
	expect(result[5]).toBe("f");
});

test('deepMerge() Test: Merge an array into an array at the second level.', () => {
	let store1 = {
		"key1": ["a","b","c"],
	};

	let store2 = {
		"key1": ["d", "e", "f"],
	}

	let result = Util.deepMerge(store1, store2);

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

test('deepMerge() Test: Test if the first object is mutated and the second object is deep cloned.', () => {
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

	let result = Util.deepMerge(store1, store2);

	expect(store1 === result).toBe(true);
	expect(store1["foo"] === result["foo"]).toBe(true);
	expect(store1["array"] === result["array"]).toBe(true);
	expect(store1["array"]["too"] === result["array"]["too"]).toBe(true);
	expect(store2["foo"] === result["foo"]).toBe(false);
	expect(store2["array"] === result["array"]).toBe(false);
	expect(store2["array"][0]["too"] === result["array"][1]["too"]).toBe(false);
});

test('deepMerge() Test: Test if the first object is mutated and the second object is deep cloned except complicated objects.', () => {
	let store1 = {};
	let store2 = {
		"key1": "value1",
		"Unit1": Unit,
		"Promise": new Promise(() => {}),
	};

	let result = Util.deepMerge(store1, store2);

	expect(Object.keys(result).length).toBe(3);
	expect(result["key1"]).toBe("value1");
	expect(store1 === result).toBe(true);
	expect(store2["Unit1"] === result["Unit1"]).toBe(true);
	expect(store2["Promise"] === result["Promise"]).toBe(true);
});

// #__isObject()

/*
test('#__isObject() Test: Test if the given values are objects.', () => {
	expect(Util.__isObject({})).toBe(true);
	expect(Util.__isObject(Object.create(null))).toBe(true);
	expect(Util.__isObject([])).toBe(false);
	expect(Util.__isObject(function(){return})).toBe(false);
	expect(Util.__isObject(null)).toBe(false);
	expect(Util.__isObject(undefined)).toBe(false);
});
*/

// #__isMergeable()

/*
test('#__isMergeable() Test: Test if the given values are mergeable.', () => {
	expect(Util.__isMergeable({})).toBe(true);
	expect(Util.__isMergeable(Object.create(null))).toBe(true);
	expect(Util.__isMergeable([])).toBe(true);
	expect(Util.__isMergeable(function(){return})).toBe(false);
	expect(Util.__isMergeable(null)).toBe(false);
	expect(Util.__isMergeable(undefined)).toBe(false);
	expect(Util.__isMergeable(1)).toBe(false);
	expect(Util.__isMergeable("string")).toBe(false);
	expect(Util.__isMergeable(false)).toBe(false);
});
*/
