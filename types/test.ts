import deepmerge from "deepmerge";

const a = {
	foo: "abc",
	baz: {
		quuz: ["def", "ghi"],
	},
	garply: 42,
};

const b = {
	foo: "cba",
	baz: {
		corge: 96,
	},
	grault: 42,
};

// $ExpectType { foo: string; baz: { quuz: string[]; corge: number; }; garply: number; grault: number; }
deepmerge(a, b);
// $ExpectType { foo: string; baz: { quuz: string[]; corge: number; }; garply: number; grault: number; }
deepmerge.all([a, b]);

interface T {
	readonly foo: string;
	bar?: string;
}

// TODO: Should the result really be `T`? or should it be `DeepMutable<T>`?
// $ExpectType T
deepmerge(a as T, b as T);
// $ExpectType T
deepmerge.all([a as T, b as T]);

interface U {
	bar?: string;
}

// FIXME: The type should really be: { foo: string; bar?: string; }
// $ExpectType { foo: string; bar?: string | undefined; }
deepmerge(a as T, b as U);
// $ExpectType { foo: string; bar?: string | undefined; }
deepmerge.all([a as T, b as U]);

const c = {
	bar: "123",
	quux: "456",
	garply: 42,
} as const;

// $ExpectType { foo: string; baz: { quuz: string[]; }; garply: 42; bar: "123"; quux: "456"; }
deepmerge(a, c);
// $ExpectType { foo: string; baz: { quuz: string[]; }; garply: 42; bar: "123"; quux: "456"; }
deepmerge.all([a, c]);

// $ExpectType { foo: string; baz: { corge: number; }; grault: number; bar: "123"; quux: "456"; garply: 42; }
deepmerge(b, c);
// $ExpectType { foo: string; baz: { corge: number; }; grault: number; bar: "123"; quux: "456"; garply: 42; }
deepmerge.all([b, c]);

// $ExpectType { foo: string; baz: { quuz: string[]; corge: number; }; garply: 42; grault: number; bar: "123"; quux: "456"; }
deepmerge.all([a, b, c]);

// Allow abatort arrays of objects to be passes even if we can't determine anything about the result.
const abc = [a, b, c];
// $ExpectType object
deepmerge.all(abc);

const d = {
	bar: "abc",
	quux: "def",
	garply: 5,
} as const;

// $ExpectType { bar: "abc"; quux: "def"; garply: 5; }
deepmerge(c, d);
// $ExpectType { bar: "abc"; quux: "def"; garply: 5; }
deepmerge.all([c, d]);

type E = { readonly foo: readonly number[] };
type F = { readonly foo: readonly string[] };

const e = {
	foo: [1, 2, 3],
} as const;

const f = {
	foo: ["a", "b", "c"],
} as const;

// $ExpectType { foo: [1, 2, 3, "a", "b", "c"]; }
deepmerge(e, f);
// $ExpectType { foo: [1, 2, 3, "a", "b", "c"]; }
deepmerge.all([e, f]);

// $ExpectType { foo: (string | number)[]; }
deepmerge(e as E, f as F);
// $ExpectType { foo: (string | number)[]; }
deepmerge.all([e as E, f as F]);

const g = {
	key1: "key1-val",
	key2: {
		key2key1: [false, "true"],
	},
	key3: {
		key3key1: {
			key3key1key1: "key3key1key1-val",
			key3key1key2: true,
			key3key1key3: ["key3key1key3-val"],
		},
		key3key2: ["key3key2-val"],
	},
};

const h = {
	key1: ["key1-val"],
	key2: {
		key2key1: {
			key2key1key1: () => "key2key1key1-val",
			key2key1key2: true,
			key2key1key3: ["key2key1key3-val"],
		},
	},
	key3: {
		key3key1: () => false,
		key3key2: ["key3key2-val", true],
	},
};

// $ExpectType { key1: string[]; key2: { key2key1: { key2key1key1: () => string; key2key1key2: boolean; key2key1key3: string[]; }; }; key3: { key3key1: { key3key1key1: string; key3key1key2: boolean; key3key1key3: string[]; }; key3key2: (string | boolean)[]; }; }
deepmerge(g, h);
// $ExpectType { key1: string[]; key2: { key2key1: { key2key1key1: () => string; key2key1key2: boolean; key2key1key3: string[]; }; }; key3: { key3key1: { key3key1key1: string; key3key1key2: boolean; key3key1key3: string[]; }; key3key2: (string | boolean)[]; }; }
deepmerge.all([g, h]);

// $ExpectType { foo: string; baz: unknown; garply: number; grault: number; }
deepmerge(a, b, {
	isMergeableObject: (obj: object) => {
		return false;
	},
});
// $ExpectType { foo: string; baz: unknown; garply: number; grault: number; }
deepmerge.all([a, b], {
	isMergeableObject: (obj: object) => {
		return false;
	},
});

const i = {
	baz: {
		quuz: [5, 6],
	},
};

// $ExpectType { foo: string; baz: { quuz: number; }; garply: number; }
deepmerge(a, i, {
	arrayMerge: (target: unknown[], source: unknown[]) =>
		target.length + source.length,
});
// $ExpectType { foo: string; baz: { quuz: number; }; garply: number; }
deepmerge.all([a, i], {
	arrayMerge: (target: unknown[], source: unknown[]) =>
		target.length + source.length,
});

// $ExpectType { foo: string; baz: string | { quuz: (string | number)[]; }; garply: number; }
deepmerge(a, i, {
	customMerge: (key: string) => {
		if (key === "bar") {
			return (target: string, source: string) => target + source;
		}
	},
});
// $ExpectType { foo: string; baz: string | { quuz: (string | number)[]; }; garply: number; }
deepmerge.all([a, i], {
	customMerge: (key: string) => {
		if (key === "bar") {
			return (target: string, source: string) => target + source;
		}
	},
});
