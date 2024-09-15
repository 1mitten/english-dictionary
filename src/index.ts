import { Dictionary } from "./Dictionary";

const dictionary = new Dictionary({
  wordMinLength: 5,
  wordMaxLength: 7,
  maskWordInDescription: "*",
  includeDataFromDatasets: false,
  loadCluesDataset: true
});

const words = dictionary.find('waking')

console.log(words);

