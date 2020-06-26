import babel from '@rollup/plugin-babel'
import buble from '@rollup/plugin-buble'
import commonjs from '@rollup/plugin-commonjs'
import nodeResolve from '@rollup/plugin-node-resolve';
import {uglify} from 'rollup-plugin-uglify';
import {terser} from 'rollup-plugin-terser';

export default {
	input: 'src/js/bundle.js',
	output: {
		file: 'dist/bitsmist-webview_v1.bundle.js',
		format: 'iife',
	},
	plugins: [
		nodeResolve(),
		commonjs(),
		buble({
			target:{
				ie:11
			}
		}),
		/*
		babel({
			babelrc: false,
			exclude: 'node_modules/**',
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
		}),
		*/
		uglify(),
//		terser(),
	],
}
