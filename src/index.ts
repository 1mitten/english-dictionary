import { Dictionary } from "./Dictionary";

export { Dictionary } from "./Dictionary";
export { Options } from "./types/Options.type";
export { WordMetadata } from "./types/WordMetadata.type";

const dictionary = new Dictionary();
const result = dictionary.findMany(['turnip','ice','cat','dog']);;
console.log(result);