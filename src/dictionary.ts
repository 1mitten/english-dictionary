import dictionaryData from "./data/dictionary_compact.json";
import clues_five from "./data/clues_five.json";
import clues_four from "./data/clues_four.json";
import clues_six from "./data/clues_six.json";
import { DatasetLoader } from "./DatasetLoader"; // Import the DatasetLoader class

export type WordDescription = {
  word: string;
  description: string;
  isDictionaryWord: boolean;
  clues?: string[];
  tags?: string[]; 
};

export type Options = {
  maskWordInDescription?: string;
  wordMinLength: number;
  wordMaxLength: number;
  includeDataFromDatasets?: boolean;
  loadCluesDataset?: boolean;
};

const defaultOptions: Options = {
  wordMinLength: 3,
  wordMaxLength: 50,
  includeDataFromDatasets: true,
  loadCluesDataset: true,
};

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

    const datasetLoader = new DatasetLoader();
    const datasetData = datasetLoader.loadDatasets();
    this.data = new Map([...this.data, ...datasetData]);

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

  public wordsWithClues(): WordDescription[] {
    const wordsWithClues: WordDescription[] = [];

    this.data.forEach((wordDescription) => {
      if (wordDescription.clues && wordDescription.clues.length > 0) {
        wordsWithClues.push(wordDescription);
      }
    });

    return wordsWithClues;
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

  public exportToJson(): string {
    const dataObject = Object.fromEntries(this.data);
    const jsonString = JSON.stringify(dataObject, null, 2);
    return jsonString;
  }

  // Reset filtering
  public reset(): this {
    this.filteredData = this.filterByLengthRange(
      this.options.wordMinLength,
      this.options.wordMaxLength
    );
    return this;
  }
}
