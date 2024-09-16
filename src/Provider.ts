import { WordMetadata } from './types/WordMetadata.type';
import { ResourceData } from './types/ResourceData.type';
import { Metrics } from './types/Metrics.type';
export interface Provider {
    filter(regex: RegExp): Promise<WordMetadata[]>;
    find(word: string): Promise<WordMetadata | undefined>;
    findByPrefix(prefix: string): Promise<WordMetadata[]>;
    findBySuffix(suffix: string): Promise<WordMetadata[]>;
    findBySubstring(substring: string): Promise<WordMetadata[]>;
    findByDescription(text: string): Promise<WordMetadata[]>;
    findByWordLengthRange(min: number, max: number): Promise<WordMetadata[]>;
    findWordsByTags(tags: string[], matchAll: boolean): Promise<WordMetadata[]>
    findMany(words: string[]): Promise<WordMetadata[]>;
    getRandomWords(count: number): Promise<WordMetadata[]>;
    getResourceData(): Promise<ResourceData>;
    getMetrics(): Promise<Metrics>;
}