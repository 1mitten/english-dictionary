import { Dictionary } from "./Dictionary";

const dictionary = new Dictionary({
  wordMinLength: 5,
  wordMaxLength: 7,
  maskWordInDescription: "*",
  includeDataFromDatasets: true,
  loadCluesDataset: true
});

let words;



 words = dictionary.getRandomWords(3);

console.log(words);

