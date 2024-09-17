import { Provider } from "./Provider";
import { WordMetadata } from "./types/WordMetadata.type";
import dictionaryData from "./data/dictionary/dictionary_compact.json";
import clues_five from "./data/clues/clues_five.json";
import clues_four from "./data/clues/clues_four.json";
import clues_six from "./data/clues/clues_six.json";
import { Options } from "./types/Options.type";
import { DatasetLoader } from "./DatasetLoader";
import { ResourceData } from "./types/ResourceData.type";
import { Metrics } from "./types/Metrics.type";

/**
 *  Default options that is suitable enough for a decent base
 */
const defaultOptions: Options = {
  wordMinLength: 1,
  wordMaxLength: 50,
  includeDataFromDatasets: true,
  loadCluesDataset: true,
};

export class InMemoryProvider implements Provider {
  private data: Map<string, WordMetadata>;

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

    this.data = this.filterByLengthRange(
      this.options.wordMinLength,
      this.options.wordMaxLength
    );
  }
  async getResourceData(): Promise<ResourceData> {
    const tags = this.getDistinctTags();
    return {
      tags,
    };
  }

  getDistinctTags(): string[] {
    const tags = new Set<string>();

    // Iterate over the values (WordMetadata objects) in the Map
    for (const wordMetadata of this.data.values()) {
      // Check if tags exist and iterate over them
      wordMetadata.tags?.forEach((tag) => {
        tags.add(tag); // Add each tag to the Set
      });
    }

    // Return the distinct tags as an array
    return Array.from(tags);
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
      if (WordMetadata.word.length >= min && WordMetadata.word.length <= max) {
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
  public filter(regex: RegExp): Promise<WordMetadata[]> {
    this.data.forEach((WordMetadata) => {
      if (regex.test(WordMetadata.word)) {
        this.data.set(WordMetadata.word, WordMetadata);
      }
    });
    const result = Array.from(this.data.values()).sort((a, b) =>
      b.word.localeCompare(a.word)
    );
    return Promise.resolve(result);
  }
  /**
   * Find a single word
   * @param word
   * @returns WordMetadata | undefined
   */
  public async find(word: string): Promise<WordMetadata | undefined> {
    if (!word) return;
    return this.data.get(word.toLowerCase());
  }

  /**
   * For finding multiple entries at once with a range of words
   * @param words
   * @returns WordMetadata[]
   */
  public async findMany(words: string[]): Promise<WordMetadata[]> {
    const wordPromises = words.map((word) => this.find(word)); // Map words to promises
    const wordResults = await Promise.all(wordPromises); // Await all promises to resolve
    return wordResults
      .filter((wordDesc): wordDesc is WordMetadata => !!wordDesc)
      .sort((a, b) => b.word.localeCompare(a.word)); // Filter out undefined
  }

  /**
   * Retrieve random words
   * @param count
   * @returns WordMetadata[]
   */
  public async getRandomWords(count: number): Promise<WordMetadata[]> {
    const words = Array.from(this.data.values());
    const shuffled = [...words].sort(() => 0.5 - Math.random());
    return shuffled
      .slice(0, count)
      .sort((a, b) => b.word.localeCompare(a.word));
  }

  /**
   * Find by description
   * @param text
   * @returns
   */
  public async findByDescription(text: string): Promise<WordMetadata[]> {
    // Return the filtered results based on the description containing the text
    return Array.from(this.data.values())
      .filter((word) =>
        word.description.toLowerCase().includes(text.toLowerCase())
      )
      .sort((a, b) => b.word.localeCompare(a.word));
  }

  /**
   * Filter words by prefix, IE 'pra' will return pray, prayer and prat.
   * @param prefix
   * @returns this for chaining
   */
  public findByPrefix(prefix: string): Promise<WordMetadata[]> {
    let words: WordMetadata[] = [];
    this.data.forEach((WordMetadata) => {
      if (WordMetadata.word.startsWith(prefix.toLowerCase())) {
        words.push(WordMetadata);
      }
    });
    return Promise.resolve(words);
  }

  /**
   * Filter words by suffix, For example 'ing' will return returning, praying and running.
   * @param suffix
   * @returns this for chaining
   */
  public findBySuffix(suffix: string): Promise<WordMetadata[]> {
    let words: WordMetadata[] = [];
    this.data.forEach((WordMetadata) => {
      if (WordMetadata.word.endsWith(suffix.toLowerCase())) {
        words.push(WordMetadata);
      }
    });
    return Promise.resolve(words);
  }
  /**
   * Filter words by a substring, For example pot will return pot, spot and spotty.
   * @param substring
   * @returns this for chaining
   */
  public findBySubstring(substring: string): Promise<WordMetadata[]> {
    const words: WordMetadata[] = [];
    this.data.forEach((WordMetadata) => {
      if (WordMetadata.word.includes(substring.toLowerCase())) {
        words.push(WordMetadata);
      }
    });
    return Promise.resolve(words);
  }

  /**
   * Find words based on their length range, applies to filtered data
   * @param min
   * @param max
   * @returns this for chaining
   */
  public findByWordLengthRange(
    min: number,
    max: number
  ): Promise<WordMetadata[]> {
    let words: WordMetadata[] = [];
    this.data.forEach((WordMetadata) => {
      if (WordMetadata.word.length >= min && WordMetadata.word.length <= max) {
        // this.data.set(WordMetadata.word, WordMetadata);
        words.push(WordMetadata);
      }
    });
    // const result = Array.from(this.data.values()).sort((a, b) => b.word.localeCompare(a.word));
    // return Promise.resolve(result);
    return Promise.resolve(words);
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
  public async findWordsByTags(
    tags: string[],
    matchAll: boolean = true
  ): Promise<WordMetadata[]> {
    const taggedWords: WordMetadata[] = [];
    if (!tags || tags.length === 0) return taggedWords;

    // Iterate through the data Map and filter words by tags
    this.data.forEach((WordMetadata) => {
      if (WordMetadata.tags) {
        if (matchAll) {
          // Check if word contains all specified tags (if tag starts with any of the specified tags)
          const hasAllTags = tags.every((tag) =>
            WordMetadata.tags!.some((wordTag) => wordTag.startsWith(tag))
          );
          if (hasAllTags) {
            taggedWords.push(WordMetadata);
          }
        } else {
          // Check if word contains at least one of the specified tags (if tag starts with any of the specified tags)
          const hasAnyTag = tags.some((tag) =>
            WordMetadata.tags!.some((wordTag) => wordTag.startsWith(tag))
          );
          if (hasAnyTag) {
            taggedWords.push(WordMetadata);
          }
        }
      }
    });

    return taggedWords.sort((a, b) => b.word.localeCompare(a.word));
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

  async getMetrics(): Promise<Metrics> {
    let totalWords = 0;
    let dictionaryWords = 0;
    let nonDictionaryWords = 0;
    let wordsByLengthMap: Map<number, number> = new Map();
    let tagsMap: Map<string, number> = new Map();

    // Iterate over the words in the data map
    this.data.forEach((metadata) => {
      totalWords++;

      // Check if the word is in the dictionary
      if (metadata.isDictionaryWord) {
        dictionaryWords++;
      } else {
        nonDictionaryWords++;
      }

      // Count word length
      const wordLength = metadata.word.length;
      const currentCount = wordsByLengthMap.get(wordLength) || 0;
      wordsByLengthMap.set(wordLength, currentCount + 1);

      // Count tags
      if (metadata.tags) {
        metadata.tags.forEach((tag) => {
          const currentTagCount = tagsMap.get(tag) || 0;
          tagsMap.set(tag, currentTagCount + 1);
        });
      }
    });

    // Convert wordsByLengthMap to an array of objects with 'length' and 'count'
    const wordsByLength = Array.from(wordsByLengthMap.entries()).map(
      ([length, count]) => ({
        length,
        count,
      })
    ).sort((a, b) => a.length - b.length);

    // Convert tagsMap to an array of objects with 'tag' and 'count'
    const tags = Array.from(tagsMap.entries()).map(([tag, count]) => ({
      tag,
      count,
    })).sort((a,b) => b.count - a.count);

    return Promise.resolve({
      totalWords,
      dictionaryWords,
      nonDictionaryWords,
      wordsByLength,
      tags, 
    });
  }
}
