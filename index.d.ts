declare function deepmerge(target: Object, source: (Array<Object>|Object), optionsArgument?: deepmerge.OptionsArgument): Object;

declare namespace deepmerge {

    interface OptionsArgument {
        arrayMerge?: (destinationArray: Array<any>, sourceArray: Array<any>, mergeOptions?: OptionsArgument) => Array<any>;
        clone?: boolean;
    }

}

export = deepmerge;
