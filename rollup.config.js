// @ts-check

import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'

import pkg from './package.json'

export default {
	input: `src/index.ts`,

	plugins: [
		resolve(),
		commonjs(),
		typescript(),
	],

	output: [
		{
			file: pkg.exports.import,
			format: `esm`,
		},
		{
			file: pkg.exports.node.require,
			format: `cjs`,
		},
		{
			name: pkg.name,
			file: pkg.exports.default,
			format: `umd`,
		},
	],
}
