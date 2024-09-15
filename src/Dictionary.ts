import dictionaryData from "./data/dictionary/dictionary_compact.json";
import clues_five from "./data/clues/clues_five.json";
import clues_four from "./data/clues/clues_four.json";
import clues_six from "./data/clues/clues_six.json";
import { DatasetLoader } from "./DatasetLoader";
import { WordMetadata } from "./types/WordMetadata.type";
import { Options } from "./types/Options.type";

/**
 *  Default options that is suitable enough for a decent base
 */
const defaultOptions: Options = {
  wordMinLength: 1,
  wordMaxLength: 50,
  includeDataFromDatasets: true,
  loadCluesDataset: true,
};

/**
 * Creating a default instance will load an existing English Dictionary with descriptions,
 * Also datasets are loaded in to tag the dictionary such as 'verb','noun','adjectives','adverbs','common','stopwords','objects','vehicles','animals' and whole host more
 * ```ts
 * const dictionary = new Dictionary()
 *  ```
 *
 * Creating an instance using your WordMetadata[] will require { word, description } as a minimum, you can also send tags[] and clues[]
 * ```ts
 * const wordsMetadata = [{
 *  word: 'apple',
 *  description 'Green thang'
 * }]
 * const dictionary = new Dictionary({})
 * ```
 */
export class Dictionary {
  private data: Map<string, WordMetadata>;
  private filteredData: Map<string, WordMetadata>;

  /**
   * 
   * @param options Options 
   * @param words WordMetadata[] that requires { word: 'apple', description: 'something' } minimum
   */
  constructor(
    public options: Options = defaultOptions,
    public words?: WordMetadata[]
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
      const datasetData = datasetLoader.loadDatasets(this.data);
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
   * Clean up any words in terms of casing or characters such as hypthen
   * @param jsonData
   * @returns WordMetadata[]
   */
  private transformData(jsonData: Record<string, string>): WordMetadata[] {
    return Object.entries(jsonData).map(([word, description]) => ({
      word: word.toLowerCase().replace(/-/g, ""),
      description,
      isDictionaryWord: true,
    }));
  }

  /**
   * For an array of WordMetadatas to be loaded
   * @param WordMetadatas
   */
  private loadWords(WordMetadatas: WordMetadata[]): void {
    WordMetadatas.forEach(({ word, description, tags }) => {
      this.data.set(word, { word, description, tags, isDictionaryWord: true });
    });
  }
  /**
   * This is used to mask any descriptions containing the word using the maskChar
   * Suitable for gaming / guessing or quizzes for example, can be set in options
   * @param maskChar
   */
  private maskWordsInDescriptions(maskChar: string): void {
    this.data.forEach((WordMetadata, word) => {
      const regex = new RegExp(`\\b${word}\\b`, "gi");
      WordMetadata.description = WordMetadata.description.replace(
        regex,
        maskChar
      );
      this.data.set(word, WordMetadata);
    });
  }

  /**
   * For filtering based on the length of the word to help reduce the subset
   * @param min
   * @param max
   * @returns Map<string, WordMetadata>
   */
  private filterByLengthRange(
    min: number,
    max: number
  ): Map<string, WordMetadata> {
    const filteredMap = new Map<string, WordMetadata>();
    this.data.forEach((WordMetadata) => {
      if (
        WordMetadata.word.length >= min &&
        WordMetadata.word.length <= max
      ) {
        filteredMap.set(WordMetadata.word, WordMetadata);
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
  private loadClues(clueData: { [word: string]: string[] }): void {
    Object.entries(clueData).forEach(([word, clues]) => {
      const normalizedWord = word.toLowerCase();
      const WordMetadata = this.data.get(normalizedWord);
      if (WordMetadata) {
        WordMetadata.clues = clues;
        this.data.set(normalizedWord, WordMetadata);
      }
    });
  }

  /**
   * Filtering in memory using a regex, call get() for data 
   * @param regex
   * @returns this for chaining
   */
  public filter(regex: RegExp): this {
    this.filteredData = new Map<string, WordMetadata>();
    this.data.forEach((WordMetadata) => {
      if (regex.test(WordMetadata.word)) {
        this.filteredData.set(WordMetadata.word, WordMetadata);
      }
    });
    return this;
  }
  /**
   * Find a single word
   * @param word
   * @returns WordMetadata | undefined 
   */
  public find(word: string): WordMetadata | undefined {
    if (!word) return;
    return this.data.get(word.toLowerCase());
  }

  /**
   * For finding multiple entries at once with a range of words
   * @param words
   * @returns WordMetadata[]
   */
  public findMany(words: string[]): WordMetadata[] {
    return words
      .map((word) => this.find(word))
      .filter((wordDesc): wordDesc is WordMetadata => !!wordDesc);
  }

  /**
   * To get filtered data based on previous chained functions
   * @returns WordMetadata[]
   */
  public get(): WordMetadata[] {
    const wordMetadatas = Array.from(this.filteredData.values());
    this.filteredData = new Map();
    return wordMetadatas;
  }

  /**
   * To retrieve filtered data as a single list of words
   * @returns string[]
   */
  public getArray(): string[] {
    return Array.from(this.filteredData.keys());
  }

  /**
   * Retrieve random words
   * @param count
   * @returns WordMetadata[]
   */
  public getRandomWords(count: number): WordMetadata[] {
    const words = Array.from(this.data.values());
    const shuffled = [...words].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  /**
   * Filter words by prefix, IE 'pra' will return pray, prayer and prat.
   * @param prefix
   * @returns this for chaining
   */
  public findByPrefix(prefix: string): this {
    const currentData = this.filteredData.size ? this.filteredData : this.data; // Use filteredData if it exists
    this.filteredData = new Map();
    currentData.forEach((WordMetadata) => {
      if (WordMetadata.word.startsWith(prefix.toLowerCase())) {
        this.filteredData.set(WordMetadata.word, WordMetadata);
      }
    });
    return this;
  }
  

  /**
   * Filter words by suffix, For example 'ing' will return returning, praying and running.
   * @param suffix
   * @returns this for chaining
   */
  public findBySuffix(suffix: string): this {
    const currentData = this.filteredData.size ? this.filteredData : this.data; // Use filteredData if it exists
    this.filteredData = new Map();
    currentData.forEach((WordMetadata) => {
      if (WordMetadata.word.endsWith(suffix.toLowerCase())) {
        this.filteredData.set(WordMetadata.word, WordMetadata);
      }
    });
    return this;
  }
  /**
   * Filter words by a substring, For example pot will return pot, spot and spotty.
   * @param substring
   * @returns this for chaining
   */
  public findBySubstring(substring: string): this {
    const currentData = this.filteredData.size ? this.filteredData : this.data; // Use filteredData if it exists
    this.filteredData = new Map();
    currentData.forEach((WordMetadata) => {
      if (WordMetadata.word.includes(substring.toLowerCase())) {
        this.filteredData.set(WordMetadata.word, WordMetadata);
      }
    });
    return this;
  }

  /**
   * Find words based on their length range, applies to filtered data
   * @param min
   * @param max
   * @returns this for chaining
   */
  public findByWordLengthRange(min: number, max: number): this {
    const currentData = this.filteredData.size ? this.filteredData : this.data; // Use filteredData if it exists
    this.filteredData = new Map();
    currentData.forEach((WordMetadata) => {
      if (
        WordMetadata.word.length >= min &&
        WordMetadata.word.length <= max
      ) {
        this.filteredData.set(WordMetadata.word, WordMetadata);
      }
    });
    return this;
  }

  /**
   * Finds words that have clues, for use in games
   * @returns WordMetadata[]
   */
  public findWordsWithClues(): WordMetadata[] {
    const wordsWithClues: WordMetadata[] = [];

    this.data.forEach((WordMetadata) => {
      if (WordMetadata.clues && WordMetadata.clues.length > 0) {
        wordsWithClues.push(WordMetadata);
      }
    });

    return wordsWithClues;
  }

  /**
   * Finds words by an array of tags, using OR or AND
   * @param tags An array of tags
   * @param matchAll If set to true, will enforce AND but if set to false will enforce an OR
   * @returns WordMetadata[]
   */
  public findWordsByTags(
    tags: string[],
    matchAll: boolean = true
  ): WordMetadata[] {
    const taggedWords: WordMetadata[] = [];
    if (!tags || tags.length === 0) return taggedWords;

    // Iterate through the data Map and filter words by tags
    this.data.forEach((WordMetadata) => {
      if (WordMetadata.tags) {
        if (matchAll) {
          // Check if word contains all specified tags (exact match)
          const hasAllTags = tags.every((tag) =>
            WordMetadata.tags!.includes(tag)
          );
          if (hasAllTags) {
            taggedWords.push(WordMetadata);
          }
        } else {
          // Check if word contains at least one of the specified tags (exact match)
          const hasAnyTag = tags.some((tag) =>
            WordMetadata.tags!.includes(tag)
          );
          if (hasAnyTag) {
            taggedWords.push(WordMetadata);
          }
        }
      }
    });

    return taggedWords;
  }

  /**
   * Exports to stringed JSON
   * @param removeNullValues default = true, set to false to retain null values
   * @returns stringified JSON
   */
  public exportToJsonString(removeNullValues = true): string {
    const dataObject = Object.fromEntries(this.data);

    if (removeNullValues) {
      for (const key in dataObject) {
        if (dataObject[key] === null) {
          delete dataObject[key];
        }
      }
    }

    const jsonString = JSON.stringify(dataObject, null, 2);
    return jsonString;
  }

  /**
   * Reset the filtered data
   * @returns this
   */
  public reset(): this {
    this.filteredData = this.filterByLengthRange(
      this.options.wordMinLength,
      this.options.wordMaxLength
    );
    return this;
  }
}
