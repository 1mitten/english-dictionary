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
import vehicles from "./data/vehicles.json";
import { WordDescription } from "./Dictionary";

type DatasetConfig = {
  [key: string]: { data: string[]; tags: string[] };
};

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
    };
  }

  public loadDatasets(): Map<string, WordDescription> {
    const data = new Map<string, WordDescription>();

    Object.keys(this.datasetConfig).forEach((datasetKey: string) => {
      const { data: words, tags } = this.datasetConfig[datasetKey];
      this.applyTagsToWords(words, tags, data);
    });

    return data;
  }

  // Apply tags to each word and populate the data map
  private applyTagsToWords(
    words: string[],
    tags: string[],
    data: Map<string, WordDescription>
  ): void {
    words.forEach((word) => {
      const normalizedWord = word.toLowerCase();

      if (data.has(normalizedWord)) {
        // If the word already exists, append the new tags
        const wordDescription = data.get(normalizedWord);
        if (wordDescription) {
          wordDescription.tags = [...(wordDescription.tags || []), ...tags];
          data.set(normalizedWord, wordDescription); // Update the data
        }
      } else {
        // If the word doesn't exist, create a new entry with all the tags
        data.set(normalizedWord, {
          word: normalizedWord,
          description: `Tagged with ${tags.join(", ")}`,
          isDictionaryWord: false,
          tags: [...tags],
        });
      }
    });
  }
  
}
