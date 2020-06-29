import buble from '@rollup/plugin-buble'
import commonjs from '@rollup/plugin-commonjs'
import nodeResolve from '@rollup/plugin-node-resolve';
import {uglify} from 'rollup-plugin-uglify';

export default {
	input: 'src/js/index.js',
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
		uglify(),
	],
}
