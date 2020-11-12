// @ts-check

import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript';
import pkg from './package.json'

export default {
	input: `src/index.ts`,
	plugins: [
		resolve(),
		commonjs(),
		typescript()
	],
	output: [
		{
			file: pkg.main,
			format: `cjs`
		},
		{
			name: 'deepmerge',
			file: 'dist/umd.js',
			format: `umd`
		},
	],
}
