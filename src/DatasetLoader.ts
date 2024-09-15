import animals from "./data/core/animals.json";
import common from "./data/core/common.json";
import nouns from "./data/core/nouns.json";
import adverbs from "./data/core/adverbs.json";
import adjectives from "./data/core/adjectives.json";
import stopwords from "./data/core/stopwords.json";
import clothing from "./data/core/clothing.json";
import containers from "./data/core/containers.json";
import objects from "./data/core/objects.json";
import moods from "./data/core/moods.json";
import monsters from "./data/core/monsters.json";
import body_parts from "./data/core/body_parts.json";
import musical_instruments from "./data/core/musical_instruments.json";
import countries from "./data/core/countries.json";
import passages from "./data/core/passages.json";
import rooms from "./data/core/rooms.json";
import flowers from "./data/core/flowers.json";
import fabrics from "./data/core/fabrics.json";
import vegetables from "./data/core/vegetables.json";
import verbs from "./data/core/verbs.json";
import vehicles from "./data/core/vehicles.json";
import old_weapons from "./data/core/old_weapons.json";
import { WordMetadata } from "./types/WordMetadata.type";
import fs from "fs";
import path from "path";

type DatasetConfig = {
  [key: string]: { data: any; tags: string[] };
};

/**
 * Used to handle the loading of datasets into dictionary
 */
export class DatasetLoader {
  private datasetConfig: DatasetConfig = {};

  constructor() {
    const dataPath = path.join(__dirname, 'data', 'core');
    this.loadDatasetsFromDirectory(dataPath) // Specify the directory where your JSON files are
  }

  /**
   * Load all JSON files from the given directory and infer tags from each file's content.
   * Assumes each JSON file contains a "tags" property and a "words" property.
   */
  private loadDatasetsFromDirectory(directoryPath: string): void {
    const files = fs.readdirSync(directoryPath);

    files.forEach((file) => {
      if (path.extname(file) === ".json") {
        const filePath = path.join(directoryPath, file);
        const dataset = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        if (dataset.tags && dataset.words) {
          this.datasetConfig[file] = {
            data: dataset.words,
            tags: Array.isArray(dataset.tags) ? dataset.tags : [dataset.tags], // Ensure tags are an array
          };
        } else {
          console.warn(
            `Invalid JSON format in file ${file}. Expected 'tags' and 'words' properties.`
          );
        }
      }
    });
  }

  /**
   * Get the dataset config after loading.
   */
  public getDatasetConfig(): DatasetConfig {
    return this.datasetConfig;
  }

  /**
   * Loads all datasets and applies tagging
   * @returns
   */
  public loadDatasets(
    data: Map<string, WordMetadata>
  ): Map<string, WordMetadata> {
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
    dictionary: Map<string, WordMetadata>
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
    dictionary: Map<string, WordMetadata>
  ): void {
    const existingWord = dictionary.get(word);

    if (existingWord) {
      existingWord.tags = [...new Set([...(existingWord.tags || []), ...tags])];
      dictionary.set(word, existingWord);
    } else {
      dictionary.set(word, {
        word,
        description: `Tagged with ${tags.join(", ")}`,
        isDictionaryWord: false,
        tags,
      });
    }
  }
}
