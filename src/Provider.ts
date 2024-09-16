import { WordMetadata } from './types/WordMetadata.type';
export interface Provider {
    filter(regex: RegExp): this | Promise<WordMetadata[]>;
    find(word: string): Promise<WordMetadata | undefined>;
    findByPrefix(prefix: string): this | Promise<WordMetadata[]>;
    findBySuffix(suffix: string): this | Promise<WordMetadata[]>;
    findBySubstring(substring: string): this | Promise<WordMetadata[]>;
    findByDescription(text: string): Promise<WordMetadata[]>;
    findByWordLengthRange(min: number, max: number): this | Promise<WordMetadata[]>;
    findWordsByTags(tags: string[], matchAll: boolean): Promise<WordMetadata[]>
    findMany(words: string[]): Promise<WordMetadata[]>;
    getRandomWords(count: number): Promise<WordMetadata[]>;
}