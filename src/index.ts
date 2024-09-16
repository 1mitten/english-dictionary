import { Dictionary } from "./Dictionary";
import { InMemoryProvider } from "./InMemoryProvider";

export { Dictionary } from "./Dictionary";
export { Options } from "./types/Options.type";
export { WordMetadata } from "./types/WordMetadata.type";

const dict = new Dictionary();
async function start() {
    const words = await dict.findMany(['jesus', 'democracy', 'flabbergasted']);
    console.log(words);
}


start();