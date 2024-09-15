import dictionaryData from "./data/dictionary_compact.json";
import clues_five from "./data/clues_five.json";
import clues_four from "./data/clues_four.json";
import clues_six from "./data/clues_six.json";
import verbs from "./data/verbs.json";
import old_weapons from "./data/old_weapons.json";
import { DatasetLoader } from "./DatasetLoader"; // Import the DatasetLoader class

export type WordDescription = {
  word: string;
  description: string;
  isDictionaryWord: boolean;
  clues?: string[];
  tags?: string[]; // Allow tags to be optional
};

export type Options = {
  maskWordInDescription?: string;
  wordMinLength?: number;
  wordMaxLength?: number;
  includeDataFromDatasets?: boolean;
};

export class Dictionary {
  private data: Map<string, WordDescription>;
  private filteredData: Map<string, WordDescription>;
  private static readonly MIN_WORD_LENGTH = 3;
  private static readonly MAX_WORD_LENGTH = 50;

  constructor(public options?: Options, public words?: WordDescription[]) {
    this.data = new Map();
    this.filteredData = new Map();

    if (words) {
      this.loadWords(words);
    } else {
      this.loadWords(
        this.transformData(dictionaryData as Record<string, string>)
      );
    }

    const datasetLoader = new DatasetLoader();
    const datasetData = datasetLoader.loadDatasets();
    this.data = new Map([...this.data, ...datasetData]);

    this.loadVerbs(verbs.verbs);
    this.loadWeapons(old_weapons.data);

    this.loadClueDatasets([
      clues_four.clues,
      clues_five.clues,
      clues_six.clues,
    ]);

    if (options?.maskWordInDescription) {
      this.maskWordsInDescriptions(options.maskWordInDescription);
    }

    const minLength = options?.wordMinLength ?? Dictionary.MIN_WORD_LENGTH;
    const maxLength = options?.wordMaxLength ?? Dictionary.MAX_WORD_LENGTH;
    this.filteredData = this.filterByLengthRange(minLength, maxLength);
  }

  // Transform raw data into WordDescription objects
  private transformData(jsonData: Record<string, string>): WordDescription[] {
    return Object.entries(jsonData).map(([word, description]) => ({
      word: word.toLowerCase().replace(/-/g, ""),
      description,
      isDictionaryWord: true,
    }));
  }

  // Load words into the data map
  private loadWords(wordDescriptions: WordDescription[]): void {
    wordDescriptions.forEach(({ word, description, tags }) => {
      this.data.set(word, { word, description, tags, isDictionaryWord: true });
    });
  }

  private loadWeapons(weaponData: { melee: string[]; ranged: string[] }): void {
    // Process melee weapons
    this.applyTagToWords(weaponData.melee, "weapons:old:melee");

    // Process ranged weapons
    this.applyTagToWords(weaponData.ranged, "weapons:old:ranged");
  }

  // Mask words in their descriptions
  private maskWordsInDescriptions(maskChar: string): void {
    this.data.forEach((wordDescription, word) => {
      const regex = new RegExp(`\\b${word}\\b`, "gi");
      wordDescription.description = wordDescription.description.replace(
        regex,
        maskChar
      );
      this.data.set(word, wordDescription);
    });
  }

  // Filter by word length range
  private filterByLengthRange(
    min: number,
    max: number
  ): Map<string, WordDescription> {
    const filteredMap = new Map<string, WordDescription>();
    this.data.forEach((wordDescription) => {
      if (
        wordDescription.word.length >= min &&
        wordDescription.word.length <= max
      ) {
        filteredMap.set(wordDescription.word, wordDescription);
      }
    });
    return filteredMap;
  }

  // Apply a specific tag to a list of words
  private applyTagToWords(words: string[], tag: string): void {
    words.forEach((word) => {
      const normalizedWord = word.toLowerCase();
      const wordDescription = this.data.get(normalizedWord);
      if (wordDescription) {
        wordDescription.tags = [...(wordDescription.tags || []), tag];
        this.data.set(normalizedWord, wordDescription); // Update the data
      }
    });
  }

  // Load multiple clue datasets at once
  private loadClueDatasets(clueDatasets: { [word: string]: string[] }[]): void {
    clueDatasets.forEach((clueData) => {
      this.loadClues(clueData);
    });
  }

  // Load clues for specific words
  public loadClues(clueData: { [word: string]: string[] }): void {
    Object.entries(clueData).forEach(([word, clues]) => {
      const normalizedWord = word.toLowerCase();
      const wordDescription = this.data.get(normalizedWord);
      if (wordDescription) {
        wordDescription.clues = clues; // Add the array of clues to the word
        this.data.set(normalizedWord, wordDescription); // Update the data
      }
    });
  }

  private loadVerbs(verbData: { present: string; past: string }[]): void {
    this.loadWordsWithTags(verbData, "verb");
  }

  private loadWordsWithTags(data: any, baseTag: string): void {
    if (Array.isArray(data)) {
      // If data is an array, check if the elements are objects or strings
      data.forEach((entry) => {
        if (typeof entry === "object") {
          // If the entry is an object, loop over its keys and add tags
          Object.keys(entry).forEach((key) => {
            const word = entry[key].toLowerCase();
            this.addWordToDictionary(word, [`${baseTag}:${key}`]);
          });
        } else if (typeof entry === "string") {
          // If the entry is a string, just add the base tag
          const normalizedWord = entry.toLowerCase();
          this.addWordToDictionary(normalizedWord, [baseTag]);
        }
      });
    } else if (typeof data === "object") {
      // If data is a single object, apply specific tags based on the keys
      Object.keys(data).forEach((key) => {
        const wordGroup = data[key];
        if (Array.isArray(wordGroup)) {
          wordGroup.forEach((word) => {
            const normalizedWord = word.toLowerCase();
            this.addWordToDictionary(normalizedWord, [`${baseTag}:${key}`]);
          });
        }
      });
    }
  }
  

  private addWordToDictionary(word: string, tags: string[]): void {
    const existingWord = this.data.get(word);
    if (existingWord) {
      // If the word exists, merge the tags
      existingWord.tags = [...(existingWord.tags || []), ...tags];
      this.data.set(word, existingWord);
    } else {
      // Otherwise, add it as a new entry with the tags
      this.data.set(word, {
        word,
        description: `Tagged with ${tags.join(", ")}`,
        isDictionaryWord: false,
        tags,
      });
    }
  }

  // Search and filtering functions
  public filter(regex: RegExp): this {
    this.filteredData = new Map<string, WordDescription>();
    this.data.forEach((wordDescription) => {
      if (regex.test(wordDescription.word)) {
        this.filteredData.set(wordDescription.word, wordDescription);
      }
    });
    return this;
  }

  public find(word: string): WordDescription | undefined {
    if (!word) return;
    return this.data.get(word.toLowerCase());
  }

  public findMany(words: string[]): WordDescription[] {
    return words
      .map((word) => this.find(word))
      .filter((wordDesc): wordDesc is WordDescription => !!wordDesc);
  }

  // Retrieve filtered data
  public get(): WordDescription[] {
    return Array.from(this.filteredData.values());
  }

  public getArray(): string[] {
    return Array.from(this.filteredData.keys());
  }

  // Random word retrieval
  public getRandomWords(count: number): WordDescription[] {
    const words = Array.from(this.filteredData.values());
    const shuffled = [...words].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  // Filter by prefix, suffix, or substring
  public wordsByPrefix(prefix: string): this {
    this.filteredData = new Map();
    this.data.forEach((wordDescription) => {
      if (wordDescription.word.startsWith(prefix.toLowerCase())) {
        this.filteredData.set(wordDescription.word, wordDescription);
      }
    });
    return this;
  }

  public wordsBySuffix(suffix: string): this {
    this.filteredData = new Map();
    this.data.forEach((wordDescription) => {
      if (wordDescription.word.endsWith(suffix.toLowerCase())) {
        this.filteredData.set(wordDescription.word, wordDescription);
      }
    });
    return this;
  }

  public wordsBySubstring(substring: string): this {
    this.filteredData = new Map();
    this.data.forEach((wordDescription) => {
      if (wordDescription.word.includes(substring.toLowerCase())) {
        this.filteredData.set(wordDescription.word, wordDescription);
      }
    });
    return this;
  }

  public wordsByLengthRange(min: number, max: number): this {
    this.filteredData = this.filterByLengthRange(min, max);
    return this;
  }

  public wordsByTags(
    tags: string[],
    matchAll: boolean = true
  ): WordDescription[] {
    const taggedWords: WordDescription[] = [];

    // Iterate through the data Map and filter words by tags
    this.data.forEach((wordDescription) => {
      if (wordDescription.tags) {
        if (matchAll) {
          // Check if word contains all tags (prefix match)
          if (
            tags.every((tag) =>
              wordDescription.tags!.some((wordTag) => wordTag.startsWith(tag))
            )
          ) {
            taggedWords.push(wordDescription);
          }
        } else {
          // Check if word contains at least one of the tags (prefix match)
          if (
            tags.some((tag) =>
              wordDescription.tags!.some((wordTag) => wordTag.startsWith(tag))
            )
          ) {
            taggedWords.push(wordDescription);
          }
        }
      }
    });

    return taggedWords;
  }

  // Reset filtering
  public reset(): this {
    const minLength = this.options?.wordMinLength ?? Dictionary.MIN_WORD_LENGTH;
    const maxLength = this.options?.wordMaxLength ?? Dictionary.MAX_WORD_LENGTH;
    this.filteredData = this.filterByLengthRange(minLength, maxLength);
    return this;
  }
}
