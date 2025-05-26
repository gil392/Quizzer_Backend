import { complement, isNil, pickBy } from "ramda";

export const removeEndingSlash = (str: string) => str.replace(/\/+$/, "");

export const removeStartingSlash = (str: string) => str.replace(/^\/+/, "");

const isDefined = complement(isNil);

export const pickDefinedValues = pickBy((val, _key) => isDefined(val));
