const webpack = require("webpack");
const path = require("path");
const TerserPlugin = require('terser-webpack-plugin');

const config = {
	mode: "production",
	entry:{
		"bitsmist-webview_v1": path.resolve(__dirname, "./src/js/bundle.js"),
	},
	output: {
		path: path.resolve(__dirname, "./public/js/"),
		filename: "[name].bundle.js"
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: [
					{
						loader: 'babel-loader',
						options: {
							presets: [
								[
									'@babel/preset-env',
									{
										"targets": {
											"ie": 11
										},
										"corejs": 3,
										"useBuiltIns": "usage"
									}
								]
							]
						}
					}
				]
			}
		]
	}
};

module.exports = (env, argv) => {
	if (argv.mode === 'development')
	{
		config.devtool = 'source-map';
	}
	else
	{
		config.devtool = 'none';
		config.optimization = {
			minimizer: [
				new TerserPlugin({
					terserOptions: {
						compress: {
							drop_console: true
						}
					},
					extractComments: true,
				})
			]
		};
	}

	return config;
};
