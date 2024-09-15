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
import old_weapons from "./data/old_weapons.json";
import { WordDescription } from "./types/WordDescription.type";

type DatasetConfig = {
  [key: string]: { data: any; tags: string[] };
};

/**
 * Used to handle the loading of datasets into dictionary
 */
export class DatasetLoader {
  private datasetConfig: DatasetConfig;

  constructor() {
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
      old_weapons: { data: old_weapons.data, tags: ["weapon:old"] },
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

  /**
   * Loads all datasets and applies tagging
   * @returns 
   */
  public loadDatasets(): Map<string, WordDescription> {
    const data = new Map<string, WordDescription>();

    Object.keys(this.datasetConfig).forEach((datasetKey: string) => {
      const { data: words, tags } = this.datasetConfig[datasetKey];
      this.applyTagsToWords(words, tags, data);
    });

    return data;
  }

  /**
   *  Dynamically apply tags based on the data structure (arrays, objects, etc.)
   * @param words 
   * @param baseTags 
   * @param dictionary 
   */
  public applyTagsToWords(
    words: any, // Any type of dataset
    baseTags: string[],
    dictionary: Map<string, WordDescription>
  ): void {
    if (Array.isArray(words)) {
      // Handle simple arrays of strings (e.g., ["dog", "cat"])
      words.forEach((word) => {
        if (typeof word === "string") {
          this.addWordToDictionary(word.toLowerCase(), baseTags, dictionary);
        }
      });
    } else if (typeof words === "object" && words !== null) {
      // Iterate over object keys (e.g., { present: "accept", past: "accepted" })
      Object.keys(words).forEach((key) => {
        const word = words[key];

        if (typeof word === "string") {
          // Handle key-value pairs where the value is a string (e.g., { present: "accept" })
          const specificTag = `${baseTags[0]}:${key}`; // E.g., verb:present or verb:past
          this.addWordToDictionary(
            word.toLowerCase(),
            [specificTag],
            dictionary
          );
        } else if (Array.isArray(word)) {
          // Handle cases where the value is an array (e.g., { melee: ["sword", "dagger"] })
          const specificTag = `${baseTags[0]}:${key}`; // E.g., weapons:old:melee
          word.forEach((item: string) => {
            this.addWordToDictionary(
              item.toLowerCase(),
              [specificTag],
              dictionary
            );
          });
        }
      });
    }
  }

  /**
   * Used to merge tags into dictionary and also handles additional words
   * @param word 
   * @param tags 
   * @param dictionary 
   */
  private addWordToDictionary(
    word: string,
    tags: string[],
    dictionary: Map<string, WordDescription>
  ): void {
    const existingWord = dictionary.get(word);
    if (existingWord) {
      // If the word already exists, merge the tags
      existingWord.tags = [...(existingWord.tags || []), ...tags];
      dictionary.set(word, existingWord);
    } else {
      // Otherwise, create a new entry for the word in the dictionary
      dictionary.set(word, {
        word,
        description: `Tagged with ${tags.join(", ")}`,
        isDictionaryWord: false,
        tags,
      });
    }
  }
}
