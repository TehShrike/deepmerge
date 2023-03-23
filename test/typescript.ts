import * as merge from '../';

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
let merged3 = merge.all<{wat: number}>([ x, y, z ]);

merged1.foo;
merged1.bar;
merged2.foo;
merged2.baz;
merged3.wat;


const options1: merge.Options = {
	clone: true,
	isMergeableObject (obj) {
		return false;
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
		return false;
	},
};

const options3: merge.Options = {
    customMerge: (key) => {
        if (key === 'foo') {
          return (target, source) => target + source;
        }
    }
}

merged1 = merge(x, y, options1);
merged2 = merge(x, z, options2);
merged3 = merge.all<{wat: number}>([x, y, z], options1);

const merged4 = merge(x, y, options3);

const t1 = {
	key1: 'key1-val',
	key2: {
			key2key1: [false, 'true']
	},
	key3: {
			key3key1: {
				key3key1key1: 'key3key1key1-val',
				key3key1key2: true,
				key3key1key3: ['key3key1key3-val']
			},
			key3key2: ['key3key2-val']
	}
};

const t2 = {
	key1: ['key1-val'],
	key2: {
			key2key1: {
					key2key1key1: () => 'key2key1key1-val',
					key2key1key2: true,
					key2key1key3: ['key2key1key3-val']
			}
	},
	key3: {
			key3key1: () => false,
			key3key2: ['key3key2-val', true]
	}
};

const merged5: {
	key1: string | string[];
	key2: {
			key2key1: (string | boolean)[] | {
					key2key1key1: () => string;
					key2key1key2: boolean;
					key2key1key3: string[];
			};
	};
	key3: {
			key3key1: {
					key3key1key1: string;key3key1key2: boolean;
					key3key1key3: string[];
			};
			key3key2: (string | boolean)[] | string[];
	};
} = merge(t1, t2);
