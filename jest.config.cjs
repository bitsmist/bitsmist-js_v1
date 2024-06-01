module.exports = {
	"moduleNameMapper": {
		  "^uuid$": require.resolve("uuid")
	},
	"setupFiles": [
		'./jest.polyfills.cjs'
	],
    "setupFilesAfterEnv": [
      "./test/core/setup.js"
    ],
    "testEnvironment": "jsdom",
    "testEnvironmentOptions": {
      "resources": "usable",
      "runScripts": "dangerously",
      "customExportConditions": ['']
    },
    "roots": [
        "<rootDir>/test"
    ]
}
