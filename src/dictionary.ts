import dictionaryData from "./data/dictionary_compact.json";

export type WordDescription = {
  word: string;
  description: string;
};

export type Options = {
  /**
   * Need to hide the word appearing in the description, mask it.  Maybe for gaming or guessing purposes
   */
  maskWordInDescription?: string;
  /**
   * the minimum length of words to return
   */
  wordMinLength?: number;
  /**
   * the maximum length of words to return
   */
  wordMaxLength?: number;
};

export class Dictionary {
  private data: Record<string, string>;
  private filteredData: Record<string, string>; // Filtered data is initialized based on options
  private static readonly MIN_WORD_LENGTH = 3; // Maximum reasonable word length
  private static readonly MAX_WORD_LENGTH = 50; // Maximum reasonable word length

  constructor(public options?: Options, public words?: WordDescription[]) {
    // inject your own words
    if (words) {
      this.data = this.toRecord(words);
    } else {
      this.data = this.transformData(dictionaryData as Record<string, string>);
    }
    if (options?.maskWordInDescription) {
        this.transformDescriptions(options.maskWordInDescription);
      }
    const minLength = options?.wordMinLength ?? Dictionary.MIN_WORD_LENGTH;
    const maxLength = options?.wordMaxLength ?? Dictionary.MAX_WORD_LENGTH;
    this.filteredData = this.filterByLengthRange(minLength, maxLength);


  }

  private transformData(
    jsonData: Record<string, string>
  ): Record<string, string> {
    const transformed: Record<string, string> = {};

    Object.entries(jsonData).forEach(([key, value]) => {
      const normalizedKey = key.toLowerCase().replace(/-/g, "");
      if (!/\s/.test(normalizedKey)) {
        transformed[normalizedKey] = value;
      }
    });

    return transformed;
  }

  private transformDescriptions(char: string): void {
    Object.entries(this.data).forEach(([word, description]) => {
      const regex = new RegExp(`\\b${word}\\b`, "gi");
      const updatedDescription = description.replace(regex, char);
      this.data[word] = updatedDescription;
    });
  }
  private filterByLengthRange(
    min: number,
    max: number
  ): Record<string, string> {
    return Object.fromEntries(
      Object.entries(this.data).filter(
        ([key]) => key.length >= min && key.length <= max
      )
    );
  }

  public filter(regex: RegExp): this {
    this.filteredData = Object.fromEntries(
      Object.entries(this.filteredData).filter(([key]) => regex.test(key))
    );
    return this;
  }

  public wordsByLength(length: number): this {
    this.filteredData = Object.fromEntries(
      Object.entries(this.filteredData).filter(([key]) => key.length === length)
    );
    return this;
  }

  public find(word: string): WordDescription | undefined {
    if (!word) return;
    const normalizedWord = word.toLowerCase();
    const description = this.data[normalizedWord];

    if (description) {
      return { word: normalizedWord, description };
    }
    return undefined;
  }

  public get(): WordDescription[] {
    return Object.entries(this.filteredData).map(([word, description]) => ({
      word,
      description,
    }));
  }
  public getArray(): string[] {
    return Object.entries(this.filteredData).map(([word]) => word);
  }

  public getRandomWords(count: number): WordDescription[] {
    const words = Object.entries(this.filteredData).map(
      ([word, description]) => ({
        word,
        description,
      })
    );
    const shuffled = [...words].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  public wordsByPrefix(prefix: string): this {
    this.filteredData = Object.fromEntries(
      Object.entries(this.filteredData).filter(([key]) =>
        key.startsWith(prefix.toLowerCase())
      )
    );
    return this;
  }

  public wordsBySuffix(suffix: string): this {
    this.filteredData = Object.fromEntries(
      Object.entries(this.filteredData).filter(([key]) =>
        key.endsWith(suffix.toLowerCase())
      )
    );
    return this;
  }

  public wordsBySubstring(substring: string): this {
    this.filteredData = Object.fromEntries(
      Object.entries(this.filteredData).filter(([key]) =>
        key.includes(substring.toLowerCase())
      )
    );
    return this;
  }

  public wordsByLengthRange(min: number, max: number): this {
    this.filteredData = Object.fromEntries(
      Object.entries(this.filteredData).filter(
        ([key]) => key.length >= min && key.length <= max
      )
    );
    return this;
  }

  // Function to transform WordDescription[] to Record<string, string>
  public toRecord(wordDescriptions: WordDescription[]): Record<string, string> {
    return wordDescriptions.reduce((acc, { word, description }) => {
      acc[word] = description; // Add each word-description pair to the accumulator
      return acc;
    }, {} as Record<string, string>); // Initialize with an empty object
  }

  public reset(): this {
    const minLength = this.options?.wordMinLength ?? Dictionary.MIN_WORD_LENGTH;
    const maxLength = this.options?.wordMaxLength ?? Dictionary.MAX_WORD_LENGTH;
    this.filteredData = this.filterByLengthRange(minLength, maxLength);
    return this;
  }
}
