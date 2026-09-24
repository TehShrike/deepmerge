import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import pkg from './package.json'

export default {
	input: `index.js`,
	plugins: [
		commonjs(),
		resolve(),
	],
	output: [
		{
			name: 'deepmerge',
			file: pkg.main,
			exports: 'named',
			format: `cjs`
		},
		{
			name: 'deepmerge',
			file: pkg.module,
			format: `es`
		},
		{
			name: 'deepmerge',
			file: 'dist/deepmerge.umd.js',
			format: `umd`
		},
	],
}
