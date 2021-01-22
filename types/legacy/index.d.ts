/**
 * @file
 *
 * These types are a more simplified version of this library's types
 * designed to work with versions of TypeScript < 4.1
 */

/**
 * Deeply merge two objects.
 *
 * @param target The first object.
 * @param source The second object.
 * @param options Deep merge options.
 */
export default function deepmerge<T1 extends object, T2 extends object>(target: T1, source: T2, options?: Options): T1 & T2;

/**
 * Deeply merge two or more objects.
 *
 * @param objects An tuple of the objects to merge.
 * @param options Deep merge options.
 */
export function deepmergeAll<T1 extends object, T2 extends object>(objects: [T1, T2], options?: Options): T1 & T2;
export function deepmergeAll<T1 extends object, T2 extends object, T3 extends object>(objects: [T1, T2, T3], options?: Options): T1 & T2 & T3;
export function deepmergeAll<T1 extends object, T2 extends object, T3 extends object, T4 extends object>(objects: [T1, T2, T3, T4], options?: Options): T1 & T2 & T3 & T4;
export function deepmergeAll<T1 extends object, T2 extends object, T3 extends object, T4 extends object, T5 extends object>(objects: [T1, T2, T3, T4, T5], options?: Options): T1 & T2 & T3 & T4 & T5;
export function deepmergeAll<T extends object>(objects: ReadonlyArray<T>, options?: Options): T;

/**
 * Deep merge options.
 */
export type Options = {
	arrayMerge?: (target: object[], source: object[], options: Options) => any;
	clone?: boolean;
	customMerge?: (key: string) => ((target: object, source: object, options: Options) => any) | undefined;
	isMergeable?: (value: object) => boolean;
}
