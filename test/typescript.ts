import * as merge from '../';

let x: {
	foo: string,
	bar: string,
}

let y: {
	foo: string,
	baz: string,
	wat: string,
}

let z: {
	bar: string,
	baz: string,
	qux?: string,
}

let merged1: {foo: string, bar: string, baz: string, wat: string} = merge(x, y);
let merged2: {foo: string, bar: string, baz: string, qux?: string} = merge(x, z);

let mergedAll1: {t1: string} = merge.all([
	{t1: 'a'},
])

let mergedAll2: {t1: string, t2: string} = merge.all([
	{t1: 'a'},
	{t2: 'a'},
])

let mergedAll3: {t1: string, t2: string, t3: string} = merge.all([
	{t1: 'a'},
	{t2: 'a'},
	{t3: 'a'},
])

let mergedAll4: {t1: string, t2: string, t3: string, t4: string} = merge.all([
	{t1: 'a'},
	{t2: 'a'},
	{t3: 'a'},
	{t4: 'a'},
])

let mergedAll5: {t1: string, t2: string, t3: string, t4: string, t5: string} = merge.all([
	{t1: 'a'},
	{t2: 'a'},
	{t3: 'a'},
	{t4: 'a'},
	{t5: 'a'},
])

let merged6: {t1: string} = merge.all([
	{t1: 'a'},
	{t1: 'a'},
	{t1: 'a'},
	{t1: 'a'},
	{t1: 'a'},
	{t1: 'a'},
])

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
mergedAll3 = merge.all([
	{t1: 'a'},
	{t2: 'a'},
	{t3: 'a'},
], options1)

merged1 = merge(x, y, options3);
