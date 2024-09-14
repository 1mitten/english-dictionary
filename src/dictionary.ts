import dictionaryData from "./data/dictionary_compact.json";

export type WordDescription = {
  word: string;
  description: string;
};

export class Dictionary {
  private data: Record<string, string>;

  constructor() {
    this.data = this.transformData(dictionaryData as Record<string, string>);
  }

  private transformData(
    jsonData: Record<string, string>
  ): Record<string, string> {
    const transformed: Record<string, string> = {};

    Object.entries(jsonData).forEach(([key, value]) => {
      const normalizedKey = key.toLowerCase();
      transformed[normalizedKey] = value;
    });

    return transformed;
  }

  public find(word: string): string | undefined {
    return this.data[word.toLowerCase()];
  }

  public words(length: number): string[] {
    return Object.keys(this.data).filter((key) => key.length === length);
  }

  public wordsAndDesc(length: number): WordDescription[] {
    return Object.entries(this.data)
      .filter(([key]) => key.length === length)
      .map(
        ([key, value]) => ({ word: key, description: value } as WordDescription)
      );
  }
}
