import merge from '../';

const x = {
	foo: 'abc',
	bar: 'def',
}

const y = {
	foo: 'cba',
	bar: 'fed',
}

const z = {
	baz: '123',
	quux: '456',
}

let merged1 = merge(x, y);
let merged2 = merge(x, z);
let merged3 = merge.all([ x, y, z ]);

merged1.foo;
merged1.bar;
merged2.foo;
merged2.baz;

const options1: merge.Options = {
	clone: true,
	isMergeableObject (obj) {
		return true;
	},
};

const options2: merge.Options = {
	arrayMerge (target, source, options) {
		target.length;
		source.length;
		options.isMergeableObject(target);

		return [];
	},
	clone: true,
	isMergeableObject (obj) {
		return true;
	},
};

merged1 = merge(x, y, options1);
merged2 = merge(x, z, options2);
merged3 = merge([x, y, z], options1);
