import commonjs from '@rollup/plugin-commonjs'
import nodeResolve from '@rollup/plugin-node-resolve';
import terser from "@rollup/plugin-terser";

export default [
	{
		input: 'src/core/index.js',
		output: [
			{
				file: 'dist/bitsmist-js_v1.min.js',
				name: "BITSMIST.v1",
				format: 'iife',
				sourcemap: false,
				plugins: [
					terser({
						format:				{comments:false},
						compress:			{drop_console:true},
						keep_classnames:	true,
					})
				],
			},
			{
				file: 'dist/bitsmist-js_v1.js',
				name: "BITSMIST.v1",
				format: 'iife',
				sourcemap: true
			}
		],
		plugins: [
			nodeResolve(),
			commonjs()
		]
	},
]
