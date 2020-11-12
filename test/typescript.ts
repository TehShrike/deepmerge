import merge, { deepmergeAll, Options } from '../';

const x = {
	foo: 'abc',
	bar: 'def',
	wat: 42,
}

const y = {
	foo: 'cba',
	bar: 'fed',
	wat: 42,
}

const z = {
	baz: '123',
	quux: '456',
	wat: 42,
}

let merged1 = merge(x, y);
let merged2 = merge(x, z);
let merged3 = deepmergeAll([ x, y, z ]);

merged1.foo;
merged1.bar;
merged2.foo;
merged2.baz;
merged3.wat;


const options1: Options = {
	clone: true,
	isMergeable (obj) {
		return false;
	},
};

const options2: Options = {
	arrayMerge (target, source, options) {
		target.length;
		source.length;
		options.isMergeable(target);

		return [];
	},
	clone: true,
	isMergeable (obj) {
		return false;
	},
};

const options3: Options = {
    customMerge: (key) => {
        if (key === 'foo') {
          return (target, source) => target + source;
        }
    }
}

merged1 = merge(x, y, options1);
merged2 = merge(x, z, options2);
merged3 = deepmergeAll([x, y, z], options1);

const merged4 = merge(x, y, options3);
