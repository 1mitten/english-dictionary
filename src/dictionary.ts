import dictionaryData from "./data/dictionary_compact.json";

export type WordDescription = {
  word: string;
  description: string;
};

export type Options = {
  wordInDescriptionChar?: string;
  wordMinLength?: number,
  wordMaxLength?: number
};

export class Dictionary {
    private data: Record<string, string>;
    private filteredData: Record<string, string>; // Filtered data is initialized based on options
    private static readonly MIN_WORD_LENGTH = 3; // Maximum reasonable word length
    private static readonly MAX_WORD_LENGTH = 50; // Maximum reasonable word length
  
    constructor(public options?: Options) {
      this.data = this.transformData(dictionaryData as Record<string, string>);
      
      const minLength = options?.wordMinLength ?? Dictionary.MIN_WORD_LENGTH;
      const maxLength = options?.wordMaxLength ?? Dictionary.MAX_WORD_LENGTH;
      this.filteredData = this.filterByLengthRange(minLength, maxLength);
  
      if (options?.wordInDescriptionChar) {
        this.transformDescriptions(options.wordInDescriptionChar);
      }
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
        const regex = new RegExp(`\\b${word}[-\\w]*`, "gi");
        const updatedDescription = description.replace(regex, char);
        this.data[word] = updatedDescription;
      });
    }
  
    private filterByLengthRange(min: number, max: number): Record<string, string> {
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
        if(!word) return;
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
  
    public reset(): this {
      const minLength = this.options?.wordMinLength ?? Dictionary.MIN_WORD_LENGTH;
      const maxLength = this.options?.wordMaxLength ?? Dictionary.MAX_WORD_LENGTH;
      this.filteredData = this.filterByLengthRange(minLength, maxLength);
      return this;
    }
  }
  