import { WordMetadata } from './types/WordMetadata.type';
export interface Provider {
    filter(reg: RegExp): this | WordMetadata[];
    find(word: string): WordMetadata | undefined;
    findByPrefix(prefix: string): this | WordMetadata[];
    findBySuffix(suffix: string): this | WordMetadata[];
    findBySubstring(substring: string): this | WordMetadata[];
    findByDescription(text: string): WordMetadata[];
    findByWordLengthRange(min: number, max: number): this | WordMetadata[];
    findWordsByTags(tags: string[], matchAll: boolean): WordMetadata[]
    findMany(words: string[]): WordMetadata[];
    getRandomWords(count: number): WordMetadata[];
}