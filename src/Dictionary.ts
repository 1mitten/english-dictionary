import { WordMetadata } from './types/WordMetadata.type';
import { Provider } from './Provider';
import { InMemoryProvider } from './InMemoryProvider';
import { ResourceData } from './types/ResourceData.type';
import { Metrics } from './types/Metrics.type';


export class Dictionary implements Provider {
  private provider: Provider;

  constructor(provider: Provider = new InMemoryProvider()) {
    this.provider = provider;
  }
  getResourceData(): Promise<ResourceData> {
    return this.provider.getResourceData();
  }
  find(word: string): Promise<WordMetadata | undefined> {
    return this.provider.find(word);
  }
  findByPrefix(prefix: string): Promise<WordMetadata[]> {
    return this.provider.findByPrefix(prefix);

  }
  findBySuffix(suffix: string): Promise<WordMetadata[]> {
    return this.provider.findBySuffix(suffix);
  }
  findBySubstring(substring: string): Promise<WordMetadata[]> {
    return this.provider.findBySubstring(substring);

  }
  findByDescription(text: string): Promise<WordMetadata[]> {
    return this.provider.findByDescription(text);

  }
  findByWordLengthRange(min: number, max: number): Promise<WordMetadata[]> {
    return this.provider.findByWordLengthRange(min, max);
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
  filter(regex: RegExp): Promise<WordMetadata[]> {
    return this.provider.filter(regex);
  }
  getMetrics(): Promise<Metrics> {
    return this.provider.getMetrics();
  }

}
