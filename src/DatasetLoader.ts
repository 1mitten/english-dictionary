import animals from "./data/animals.json";
import common from "./data/common.json";
import nouns from "./data/nouns.json";
import adverbs from "./data/adverbs.json";
import adjectives from "./data/adjectives.json";
import stopwords from "./data/stopwords.json";
import clothing from "./data/clothing.json";
import containers from "./data/containers.json";
import objects from "./data/objects.json";
import moods from "./data/moods.json";
import monsters from "./data/monsters.json";
import body_parts from "./data/body_parts.json";
import musical_instruments from "./data/musical_instruments.json";
import countries from "./data/countries.json";
import passages from "./data/passages.json";
import rooms from "./data/rooms.json";
import flowers from "./data/flowers.json";
import fabrics from "./data/fabrics.json";
import vegetables from "./data/vegetables.json";
import verbs from "./data/verbs.json";
import vehicles from "./data/vehicles.json";
import { WordDescription } from "./Dictionary";

// More flexible DatasetConfig type without enforcing a rigid schema
type DatasetConfig = {
  [key: string]: { data: any; tags: string[] };
};

export class DatasetLoader {
  private datasetConfig: DatasetConfig;

  constructor() {
    // Define the dataset configurations without specifying the exact data type
    this.datasetConfig = {
      adjectives: { data: adjectives.words, tags: ["adjective"] },
      animals: { data: animals.words, tags: ["animal"] },
      common: { data: common.words, tags: ["common"] },
      containers: { data: containers.words, tags: ["container"] },
      countries: { data: countries.words, tags: ["country"] },
      clothing: { data: clothing.words, tags: ["clothing"] },
      fabrics: { data: fabrics.words, tags: ["fabric"] },
      flowers: { data: flowers.words, tags: ["flower"] },
      monsters: { data: monsters.words, tags: ["monster"] },
      musical_instruments: {
        data: musical_instruments.words,
        tags: ["music:instruments"],
      },
      objects: { data: objects.words, tags: ["object"] },
      passages: { data: passages.words, tags: ["passage"] },
      nouns: { data: nouns.words, tags: ["noun"] },
      adverbs: { data: adverbs.words, tags: ["adverb"] },
      stopwords: { data: stopwords.words, tags: ["stopword"] },
      moods: { data: moods.words, tags: ["mood"] },
      body_parts: {
        data: body_parts.words,
        tags: ["body", "human", "anatomy"],
      },
      rooms: { data: rooms.words, tags: ["room", "place"] },
      vegetables: { data: vegetables.words, tags: ["vegetable", "food"] },
      vehicles: { data: vehicles.words, tags: ["vehicle", "transport"] },
      verbs: { data: verbs.verbs, tags: ["verb"] },
    };
  }

  // This method will dynamically handle various dataset types
  public loadDatasets(): Map<string, WordDescription> {
    const data = new Map<string, WordDescription>();

    Object.keys(this.datasetConfig).forEach((datasetKey: string) => {
      const { data: words, tags } = this.datasetConfig[datasetKey];
      this.applyTagsToWords(words, tags, data);
    });

    return data;
  }

  // Dynamically apply tags based on the data structure (arrays, objects, etc.)
  private applyTagsToWords(
    words: any, // Allow any type of data here
    baseTags: string[],
    dictionary: Map<string, WordDescription>
  ): void {
    if (Array.isArray(words)) {
      words.forEach((entry) => {
        if (typeof entry === "object" && entry !== null) {
          // Handle complex object structures (e.g., verbs with "present" and "past")
          Object.keys(entry).forEach((key) => {
            const word = entry[key].toLowerCase();
            const specificTag = `${baseTags[0]}:${key}`; // e.g., verb:present, verb:past
            this.addWordToDictionary(word, [specificTag], dictionary);
          });
        } else if (typeof entry === "string") {
          // Handle simple arrays of strings (e.g., nouns, adjectives)
          const normalizedWord = entry.toLowerCase();
          this.addWordToDictionary(normalizedWord, baseTags, dictionary);
        }
      });
    } else if (typeof words === "object" && words !== null) {
      // If words is a single object, apply tags dynamically based on its keys
      // This assumption may need to change or be further flexible
      Object.keys(words).forEach((key) => {
        const wordGroup = words[key];
        if (Array.isArray(wordGroup)) {
          wordGroup.forEach((word) => {
            const normalizedWord = word.toLowerCase();
            this.addWordToDictionary(
              normalizedWord,
              [`${baseTags[0]}:${key}`],
              dictionary
            );
          });
        }
      });
    }
  }

  // Helper function to add words to the dictionary with appropriate tags
  private addWordToDictionary(
    word: string,
    tags: string[],
    dictionary: Map<string, WordDescription>
  ): void {
    const existingWord = dictionary.get(word);
    if (existingWord) {
      // If the word exists, merge the tags
      existingWord.tags = [...(existingWord.tags || []), ...tags];
      dictionary.set(word, existingWord);
    } else {
      // Otherwise, create a new word entry in the dictionary
      dictionary.set(word, {
        word,
        description: `Tagged with ${tags.join(", ")}`,
        isDictionaryWord: false,
        tags,
      });
    }
  }
}
