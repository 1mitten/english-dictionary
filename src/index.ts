import { Dictionary } from "./Dictionary";

const dictionary = new Dictionary({
  wordMinLength: 5,
  wordMaxLength: 7,
  maskWordInDescription: "*",
  includeDataFromDatasets: true,
  loadCluesDataset: true
});

const words = dictionary.findWordsByTags(['weapon:old:melee','vegetable'], false)

console.log(words);

