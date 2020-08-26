import buble from '@rollup/plugin-buble'
import commonjs from '@rollup/plugin-commonjs'
import nodeResolve from '@rollup/plugin-node-resolve';
import {uglify} from 'rollup-plugin-uglify';

export default {
	input: 'src/js/index.js',
	output: {
		file: 'dist/bitsmist-js_v1.bundle.js',
		format: 'iife',
		sourcemap: ( process.env.BUILD === 'prod' ? false : true )
	},
	plugins: [
		nodeResolve(),
		commonjs(),
		buble(),
		( process.env.BUILD === 'prod' && uglify({compress:{drop_console: true}}) ),
	],
}
