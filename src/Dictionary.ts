import { WordMetadata } from './types/WordMetadata.type';
import { Provider } from './Provider';
import { InMemoryProvider } from './InMemoryProvider';


export class Dictionary implements Provider {
  private provider: Provider;

  constructor(provider: Provider = new InMemoryProvider()) {
    this.provider = provider;
  }
  find(word: string): Promise<WordMetadata | undefined> {
    return this.provider.find(word);
  }
  findByPrefix(prefix: string): Promise<WordMetadata[]> | this {
    const result = this.provider.findByPrefix(prefix);
    if (result instanceof Promise) {
      return result;
    }
    return this;

  }
  findBySuffix(suffix: string): Promise<WordMetadata[]> | this {
    const result = this.provider.findBySuffix(suffix);
    if (result instanceof Promise) {
      return result;
    }
    return this;
  }
  findBySubstring(substring: string): Promise<WordMetadata[]> | this {
    const result = this.provider.findBySubstring(substring);
    if (result instanceof Promise) {
      return result;
    }
    return this;
  }
  findByDescription(text: string): Promise<WordMetadata[]> {
    return this.provider.findByDescription(text);

  }
  findByWordLengthRange(min: number, max: number): Promise<WordMetadata[]> | this {
    const result = this.provider.findByWordLengthRange(min, max);
    if (result instanceof Promise) {
      return result;
    }
    return this;
  }
  findWordsByTags(tags: string[], matchAll: boolean): Promise<WordMetadata[]> {
    return this.provider.findWordsByTags(tags, matchAll);

  }
  findMany(words: string[]): Promise<WordMetadata[]> {
    return this.provider.findMany(words);

  }
  getRandomWords(count: number): Promise<WordMetadata[]> {
    return this.provider.getRandomWords(count);

  }
  filter(regex: RegExp): this | Promise<WordMetadata[]> {
    const result = this.provider.filter(regex);
    if (result instanceof Promise) {
      return result;
    }
    return this;
  }

}
