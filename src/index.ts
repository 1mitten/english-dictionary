import { Dictionary } from "./Dictionary";

export { Dictionary } from "./Dictionary";
export { Options } from "./types/Options.type";
export { WordMetadata } from "./types/WordMetadata.type";

const dict = new Dictionary();
const words = dict.findMany(['jesus', 'democracy', 'flabbergasted']);
console.log(words);