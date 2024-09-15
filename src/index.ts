import { Dictionary } from "./Dictionary";

const dictionary = new Dictionary({
  wordMinLength: 5,
  wordMaxLength: 7,
  maskWordInDescription: "*",
  includeDataFromDatasets: true
});

const words = dictionary.wordsByTags(["vehicle"]);
console.log(words);
