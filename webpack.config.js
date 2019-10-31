const webpack = require("webpack");
const path = require("path");

module.exports = (env, argv) => ({
	mode: "production",
	entry:{
		"bitsmist-webview_v1": path.resolve(__dirname, "./src/js/bundle.mjs"),
	},
	output: {
		path: path.resolve(__dirname, "./public/js/"),
		filename: "[name].bundle.js"
	},
	devtool: argv.mode === 'development' ? 'source-map' : 'none'
});
