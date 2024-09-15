import { Dictionary } from "./Dictionary";

export { Dictionary } from "./Dictionary";
export { Options } from "./types/Options.type";
export { WordMetadata } from "./types/WordMetadata.type";


const test = new Dictionary();
console.log(test.find('disaster'));