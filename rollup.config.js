import buble from '@rollup/plugin-buble'
import commonjs from '@rollup/plugin-commonjs'
import nodeResolve from '@rollup/plugin-node-resolve';
import terser from "@rollup/plugin-terser";

export default [
	{
		input: 'src/core/index.js',
		output: [
			{
				file: 'dist/bitsmist-js_v1.min.js',
				format: 'iife',
				sourcemap: false,
				plugins: [terser({format:{comments:false},compress:{drop_console:true}})],
			},
			{
				file: 'dist/bitsmist-js_v1.js',
				format: 'iife',
				sourcemap: true
			}
		],
		plugins: [
			nodeResolve(),
			commonjs()
		]
	},
	{
		input: 'src/core/index.js',
		output: [
			{
				file: 'dist/bitsmist-js_v1.bubled.min.js',
				format: 'iife',
				sourcemap: false,
				plugins: [terser({format:{comments:false},compress:{drop_console:true}})],
			},
		],
		plugins: [
			nodeResolve(),
			commonjs(),
			buble()
		]
	}
]
