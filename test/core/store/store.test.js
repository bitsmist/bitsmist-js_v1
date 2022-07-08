import './_common.js';

// -----------------------------------------------------------------------------

test('Set Test (Array <--- Primitive) - Should overwrite an array with a primitive value - single level', () => {
	let store = new BITSMIST.v1.Store({
		"items": {
			"key1": ["a","b","c"],
		}
	});

	store.set("key1", "value1");

	expect(Object.keys(store.items).length).toBe(1);
	expect(store.items["key1"]).toBe("value1");
});

// -----------------------------------------------------------------------------

test('Set Test (Array <--- Object) - Should overwrite an object with an array - single level', () => {
	let store = new BITSMIST.v1.Store({
		"items": {
			"key1": ["a","b","c"],
		}
	});

	store.set("key1", {"d":"value1d"});

	expect(Object.keys(store.items).length).toBe(1);
	expect(Object.keys(store.items["key1"]).length).toBe(1);
	expect(Array.isArray(store.key1)).toBe(false);
	expect(store.items["key1"]["d"]).toBe("value1d");
});

// -----------------------------------------------------------------------------

test('Set Test (Array <--- Array) - Should overwrite an array with an array - single level', () => {
	let store = new BITSMIST.v1.Store({
		"items": {
			"key1": ["a","b","c"],
		}
	});

	store.set("key1", ["d","e","f"]);

	expect(Object.keys(store.items).length).toBe(1);
	expect(Array.isArray(store.items["key1"])).toBe(true);
	expect(store.items["key1"].length).toBe(3);
	expect(store.items["key1"][0]).toBe("d");
	expect(store.items["key1"][1]).toBe("e");
	expect(store.items["key1"][2]).toBe("f");
	expect(store.items["key1"][3]).toBe(undefined);
	expect(store.items["key1"][4]).toBe(undefined);
	expect(store.items["key1"][5]).toBe(undefined);
});

// -----------------------------------------------------------------------------

test('Set Test - Should add a value - single level', () => {
	let store = new BITSMIST.v1.Store();

	store.set("key1", "value1");

	expect(Object.keys(store.items).length).toBe(1);
	expect(store.items["key1"]).toBe("value1");
});

// -----------------------------------------------------------------------------

test('Set Test - Should add a value - multi level', () => {
	let store = new BITSMIST.v1.Store();

	store.set("key1.key1-1", "value1-1");

	expect(Object.keys(store.items).length).toBe(1);
	expect(store.items["key1"]["key1-1"]).toBe("value1-1");
});

// -----------------------------------------------------------------------------

test('Set Test - Should overwrite a primitive value with primitive value - single level', () => {
	let store = new BITSMIST.v1.Store({
		"items": {
			"key1": "value1"
		}
	});

	store.set("key1", "value1a");

	expect(Object.keys(store.items).length).toBe(1);
	expect(store.items["key1"]).toBe("value1a");
});

// -----------------------------------------------------------------------------

test('Set Test - Should overwrite a primitive value with primitive value - multi level', () => {
	let store = new BITSMIST.v1.Store({
		"items": {
			"key1": {
				"key1-1": "value1-1"
			}
		}
	});

	store.set("key1.key1-1", "value1-1a");

	expect(Object.keys(store.items).length).toBe(1);
	expect(store.items["key1"]["key1-1"]).toBe("value1-1a");
});

test('Set Test - Should overwrite a primitive value with object - single level', () => {
	let store = new BITSMIST.v1.Store({
		"items": {
			"key1": "value1",
		}
	});

	store.set("key1", {"b":"value1b"});

	expect(Object.keys(store.items).length).toBe(1);
	expect(typeof store.items["key1"]).toBe("object");
	expect(store.items["key1"]["b"]).toBe("value1b");
});

// -----------------------------------------------------------------------------

test('Set Test - Should overwrite a primitive value with array - single level', () => {
	let store = new BITSMIST.v1.Store({
		"items": {
			"key1": "value1",
		}
	});

	store.set("key1", ["a", "b", "c"]);

	expect(Object.keys(store.items).length).toBe(1);
	expect(Array.isArray(store.items["key1"])).toBe(true);
	expect(store.items["key1"].length).toBe(3);
	expect(store.items["key1"][0]).toBe("a");
	expect(store.items["key1"][1]).toBe("b");
	expect(store.items["key1"][2]).toBe("c");
});

// -----------------------------------------------------------------------------

test('Set Test - Should overwrite an object with a primitive value - single level', () => {
	let store = new BITSMIST.v1.Store({
		"items": {
			"key1": {"a":"value1a"},
		}
	});

	store.set("key1", "value1b");

	expect(Object.keys(store.items).length).toBe(1);
	expect(store.items["key1"]).toBe("value1b");
});

// -----------------------------------------------------------------------------

test('Set Test - Should overwrite an object with an object - single level', () => {
	let store = new BITSMIST.v1.Store({
		"items": {
			"key1": {"a":"value1a"},
		}
	});

	store.set("key1", {"b":"value1b"});

	expect(Object.keys(store.items).length).toBe(1);
	expect(Object.keys(store.items["key1"]).length).toBe(1);
	expect(store.items["key1"]["a"]).toBe(undefined);
	expect(store.items["key1"]["b"]).toBe("value1b");
});

// -----------------------------------------------------------------------------

test('Set Test - Should overwrite an array with an object - single level', () => {
	let store = new BITSMIST.v1.Store({
		"items": {
			"key1": {"a":"value1a"},
		}
	});

	store.set("key1", ["a", "b", "c"]);

	expect(Object.keys(store.items).length).toBe(1);
	expect(store.items["key1"].length).toBe(3);
	expect(store.items["key1"]["a"]).toBe(undefined);
	expect(store.items["key1"][0]).toBe("a");
	expect(store.items["key1"][1]).toBe("b");
	expect(store.items["key1"][2]).toBe("c");
});

// -----------------------------------------------------------------------------

test('Set Test - Should be an error when an intermediate value is not an object - single level', () => {
	let store = new BITSMIST.v1.Store({
		"items": {
			"key1": {
				"key1-1": "value1-1"
			}
		}
	});

	expect(() => {store.set("key1.key1-1.key1-1-1", "value1-1-1")}).toThrow(TypeError);
});

// -----------------------------------------------------------------------------

test('Set Test - Should be an error when an intermediate value is not an object - multi level', () => {
	let store = new BITSMIST.v1.Store({
		"items": {
			"key1": {
				"key1-1": "value1-1"
			}
		}
	});

	expect(() => {store.set("key1.key1-1.key1-1-1.key1-1-1-1", "value1-1-1-1")}).toThrow(TypeError);
});

// -----------------------------------------------------------------------------

test('Remove Test - specified key should removed from the store - single level"', () => {
	let store = new BITSMIST.v1.Store({
		"items": {
			"test1": "test1",
			"test2": "test2"
		}
	});

	store.remove("test1");

	expect(Object.keys(store.items).length).toBe(1);
	expect(store.items["test1"]).toBe(undefined);
	expect(store.items["test2"]).toBe("test2");
});

// -----------------------------------------------------------------------------

test('Remove Test - specified key should removed from the store - multi level"', () => {
	let store = new BITSMIST.v1.Store({
		"items": {
			"test1": {
				"test1-1": {
					"test1-1-1": "test1-1-1",
					"test1-1-2": "test1-1-2",
				},
				"test1-2": "test1-2"
			},
			"test2": "test2"
		}
	});

	store.remove("test1.test1-1.test1-1-1");

	expect(store.items["test1"]["test1-1"]["test1-1-1"]).toBe(undefined);
	expect(store.items["test1"]["test1-1"]["test1-1-2"]).toBe("test1-1-2");
	expect(store.items["test1"]["test1-2"]).toBe("test1-2");
	expect(store.items["test2"]).toBe("test2");
});

// -----------------------------------------------------------------------------

test('Remove Test (Non Existent Key) - Should remove nothing - single level"', () => {
	let store = new BITSMIST.v1.Store({
		"items": {
			"test1": "test1",
			"test2": "test2"
		}
	});

	store.remove("test3");

	expect(Object.keys(store.items).length).toBe(2);
	expect(store.items["test1"]).toBe("test1");
	expect(store.items["test2"]).toBe("test2");
});

// -----------------------------------------------------------------------------

test('Remove Test (Non Existent Key) - Should remove nothing - multi level"', () => {
	let store = new BITSMIST.v1.Store({
		"items": {
			"test1": {
				"test1-1": {
					"test1-1-1": "test1-1-1",
					"test1-1-2": "test1-1-2",
				},
				"test1-2": "test1-2"
			},
			"test2": "test2"
		}
	});

	store.remove("test1.test1-1.test1-1-3");
	store.remove("test1.test1-3");

	expect(store.items["test1"]["test1-1"]["test1-1-1"]).toBe("test1-1-1");
	expect(store.items["test1"]["test1-1"]["test1-1-2"]).toBe("test1-1-2");
	expect(store.items["test1"]["test1-2"]).toBe("test1-2");
	expect(store.items["test2"]).toBe("test2");
});
