import dictionaryData from "./data/dictionary_compact.json";
import clues_five from "./data/clues_five.json";
import clues_four from "./data/clues_four.json";
import clues_six from "./data/clues_six.json";
import { DatasetLoader } from "./DatasetLoader"; // Import the DatasetLoader class
import { WordDescription } from "./types/WordDescription.type";
import { Options } from "./types/Options.type";

/**
 *  Reasonable default settings here
 */
const defaultOptions: Options = {
  wordMinLength: 3,
  wordMaxLength: 50,
  includeDataFromDatasets: true,
  loadCluesDataset: true,
};

/**
 * Main class for containing Dictionary data and related functionality,
 * constructor will load up default dictionary for us
 */
export class Dictionary {
  private data: Map<string, WordDescription>;
  private filteredData: Map<string, WordDescription>;

  constructor(
    public options: Options = defaultOptions,
    public words?: WordDescription[]
  ) {
    this.data = new Map();
    this.filteredData = new Map();

    if (words) {
      this.loadWords(words);
    } else {
      this.loadWords(
        this.transformData(dictionaryData as Record<string, string>)
      );
    }

    if (this.options.includeDataFromDatasets) {
      const datasetLoader = new DatasetLoader();
      const datasetData = datasetLoader.loadDatasets();
      this.data = new Map([...this.data, ...datasetData]);
    }

    if (this.options.loadCluesDataset) {
      this.loadClueDatasets([
        clues_four.clues,
        clues_five.clues,
        clues_six.clues,
      ]);
    }

    if (options?.maskWordInDescription) {
      this.maskWordsInDescriptions(options.maskWordInDescription);
    }

    this.filteredData = this.filterByLengthRange(
      this.options.wordMinLength,
      this.options.wordMaxLength
    );
  }

  /**
   * This is function to clean up any words in terms of casing or characters such as hypthen
   * @param jsonData 
   * @returns 
   */
  private transformData(jsonData: Record<string, string>): WordDescription[] {
    return Object.entries(jsonData).map(([word, description]) => ({
      word: word.toLowerCase().replace(/-/g, ""),
      description,
      isDictionaryWord: true,
    }));
  }

  /**
   * For an array of WordDescriptions to be loaded
   * @param wordDescriptions 
   */
  private loadWords(wordDescriptions: WordDescription[]): void {
    wordDescriptions.forEach(({ word, description, tags }) => {
      this.data.set(word, { word, description, tags, isDictionaryWord: true });
    });
  }
  /**
   * This is used to mask any descriptions containing the word using the maskChar
   * Suitable for gaming / guessing or quizzes for example, can be set in options
   * @param maskChar 
   */
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

  /**
   * For filtering based on the length of the word to help reduce the subset
   * @param min 
   * @param max 
   * @returns 
   */
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

  /**
   * Load the clue datasets for gamifying purposes
   * @param clueDatasets 
   */
  private loadClueDatasets(clueDatasets: { [word: string]: string[] }[]): void {
    clueDatasets.forEach((clueData) => {
      this.loadClues(clueData);
    });
  }

  /**
   * How the clue data is loaded in, which exists on it's own property
   * @param clueData 
   */
  public loadClues(clueData: { [word: string]: string[] }): void {
    Object.entries(clueData).forEach(([word, clues]) => {
      const normalizedWord = word.toLowerCase();
      const wordDescription = this.data.get(normalizedWord);
      if (wordDescription) {
        wordDescription.clues = clues;
        this.data.set(normalizedWord, wordDescription);
      }
    });
  }

  /**
   * For regex functionality!, remember to call get() after
   * @param regex 
   * @returns 
   */
  public filter(regex: RegExp): this {
    this.filteredData = new Map<string, WordDescription>();
    this.data.forEach((wordDescription) => {
      if (regex.test(wordDescription.word)) {
        this.filteredData.set(wordDescription.word, wordDescription);
      }
    });
    return this;
  }

  /**
   * For finding a single word
   * @param word 
   * @returns 
   */
  public find(word: string): WordDescription | undefined {
    if (!word) return;
    return this.data.get(word.toLowerCase());
  }

  /**
   * For finding multiples at once
   * @param words
   * @returns 
   */
  public findMany(words: string[]): WordDescription[] {
    return words
      .map((word) => this.find(word))
      .filter((wordDesc): wordDesc is WordDescription => !!wordDesc);
  }

  /**
   * Chain method to be called
   * @returns 
   */
  public get(): WordDescription[] {
    return Array.from(this.filteredData.values());
  }

  /**
   * If you need the keys based on array, ideally for a list of string[] words..
   * @returns 
   */
  public getArray(): string[] {
    return Array.from(this.filteredData.keys());
  }

  /**
   * Retrieve random words for gaming purposes maybe or testing
   * @param count 
   * @returns 
   */
  public getRandomWords(count: number): WordDescription[] {
    const words = Array.from(this.filteredData.values());
    const shuffled = [...words].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  /**
   * Filter words by prefix, IE pra will return pray, prayer, prat etc
   * @param prefix
   * @returns 
   */
  public findByPrefix(prefix: string): this {
    this.filteredData = new Map();
    this.data.forEach((wordDescription) => {
      if (wordDescription.word.startsWith(prefix.toLowerCase())) {
        this.filteredData.set(wordDescription.word, wordDescription);
      }
    });
    return this;
  }

  /**
   * Filter words by suffix, For example ing will return returning, praying, running etc
   * @param suffix 
   * @returns 
   */
  public findBySuffix(suffix: string): this {
    this.filteredData = new Map();
    this.data.forEach((wordDescription) => {
      if (wordDescription.word.endsWith(suffix.toLowerCase())) {
        this.filteredData.set(wordDescription.word, wordDescription);
      }
    });
    return this;
  }
  /**
   * Filter words by a substring, For example pot will return pot, spot and spotty
   * @param substring 
   * @returns 
   */
  public findBySubstring(substring: string): this {
    this.filteredData = new Map();
    this.data.forEach((wordDescription) => {
      if (wordDescription.word.includes(substring.toLowerCase())) {
        this.filteredData.set(wordDescription.word, wordDescription);
      }
    });
    return this;
  }

  /**
   * Used to filter words based on their length range
   * @param min 
   * @param max 
   * @returns 
   */
  public findByWordLengthRange(min: number, max: number): this {
    this.filteredData = this.filterByLengthRange(min, max);
    return this;
  }

  /**
   * Grabs all of the words with clues associated
   * @returns 
   */
  public findWordsWithClues(): WordDescription[] {
    const wordsWithClues: WordDescription[] = [];

    this.data.forEach((wordDescription) => {
      if (wordDescription.clues && wordDescription.clues.length > 0) {
        wordsWithClues.push(wordDescription);
      }
    });

    return wordsWithClues;
  }

  /**
   * Grabs the words by an array of tags
   * @param tags An array of tags
   * @param matchAll If set to true, will enforce AND but if set to false will enforce an OR 
   * @returns 
   */
  public findWordsByTags(
    tags: string[],
    matchAll: boolean = true
  ): WordDescription[] {
    const taggedWords: WordDescription[] = [];
    if(!tags || tags.length === 0) return taggedWords;
  
    // Iterate through the data Map and filter words by tags
    this.data.forEach((wordDescription) => {
      if (wordDescription.tags) {
        if (matchAll) {
          // Check if word contains all specified tags (exact match)
          const hasAllTags = tags.every(tag => wordDescription.tags!.includes(tag));
          if (hasAllTags) {
            taggedWords.push(wordDescription);
          }
        } else {
          // Check if word contains at least one of the specified tags (exact match)
          const hasAnyTag = tags.some(tag => wordDescription.tags!.includes(tag));
          if (hasAnyTag) {
            taggedWords.push(wordDescription);
          }
        }
      }
    });
  
    return taggedWords;
  }
  
  
  /**
   * Basic function for stringifying data for exporting purposes
   * @returns stringified JSON
   */
  public exportToJsonString(): string {
    const dataObject = Object.fromEntries(this.data);
    const jsonString = JSON.stringify(dataObject, null, 2);
    return jsonString;
  }

  /**
   * Reset the filtering
   * @returns 
   */
  public reset(): this {
    this.filteredData = this.filterByLengthRange(
      this.options.wordMinLength,
      this.options.wordMaxLength
    );
    return this;
  }
}
