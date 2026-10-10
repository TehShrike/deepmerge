const merge = require(`..`)
const test = require(`tape`)

// Use element-shaped fixtures so the tests do not require a particular React
// release (and its Node version requirements) to exercise the merge contract.
function element(marker, type, props) {
	return { $$typeof: marker, type, key: null, props, _owner: null }
}

test(`React 19 elements retain their identity in objects and arrays`, t => {
	const marker = Symbol.for(`react.transitional.element`)
	const targetElement = element(marker, `div`, { children: `old` })
	const sourceElement = element(marker, `button`, { children: `new` })
	const output = merge({ targetElement }, { sourceElement })
	const arrayOutput = merge([targetElement], [sourceElement])

	t.equal(output.targetElement, targetElement, `target element is not cloned`)
	t.equal(output.sourceElement, sourceElement, `source element is not cloned`)
	t.equal(arrayOutput[0], targetElement, `target array element is not cloned`)
	t.equal(arrayOutput[1], sourceElement, `source array element is not cloned`)
	t.end()
})

test(`React 19 elements replace earlier elements without inheriting their props`, t => {
	const marker = Symbol.for(`react.transitional.element`)
	const oldChild = element(marker, `div`, { className: `old-only`, children: `old` })
	const child = element(marker, `button`, { children: `new` })
	const output = merge({ child: oldChild }, { child })

	t.equal(output.child, child, `source element replaces the target element`)
	t.deepEqual(output.child.props, { children: `new` }, `target props are not merged into the source`)
	t.end()
})

test(`legacy React elements are still preserved`, t => {
	const marker = Symbol.for(`react.element`)
	const oldChild = element(marker, `div`, { className: `old-only` })
	const child = element(marker, `button`, { children: `new` })

	t.equal(merge({}, { child }).child, child)
	t.equal(merge({ child: oldChild }, { child }).child, child)
	t.equal(merge([], [child])[0], child)
	t.end()
})

test(`a custom mergeability predicate still controls React 19 elements`, t => {
	const marker = Symbol.for(`react.transitional.element`)
	const oldChild = element(marker, `div`, { className: `old-only` })
	const child = element(marker, `button`, { children: `new` })
	const output = merge({ child: oldChild }, { child }, {
		isMergeableObject: value => value !== null && typeof value === `object`,
	})

	t.notEqual(output.child, child, `custom predicate can opt into recursive merging`)
	t.equal(output.child.props.className, `old-only`)
	t.equal(output.child.props.children, `new`)
	t.end()
})
