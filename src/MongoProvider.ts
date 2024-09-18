import { WordMetadata } from './types/WordMetadata.type';
import { ResourceData } from './types/ResourceData.type';
import { Metrics } from './types/Metrics.type';
import { Provider } from './Provider'
import { MongoClient, Collection } from 'mongodb';

export class MongoProvider implements Provider {
    private client: MongoClient;
    private collection: Collection<WordMetadata>;

    constructor(private dbUri: string, private dbName: string, private collectionName: string) {
        this.client = new MongoClient(this.dbUri);
        this.connect();
        this.collection = this.client.db(this.dbName).collection<WordMetadata>(this.collectionName);
    }

    async connect(): Promise<void> {

        await this.client.connect();
        this.collection = this.client.db(this.dbName).collection<WordMetadata>(this.collectionName);

    }

    async filter(regex: RegExp): Promise<WordMetadata[]> {
        return await this.collection.find({ word: { $regex: regex } }).toArray();
    }

    async find(word: string): Promise<WordMetadata | undefined> {
        const record = await this.collection.findOne({ word });
        if (record === null) return;
        return record;
    }

    async findByPrefix(prefix: string): Promise<WordMetadata[]> {
        return await this.collection.find({ word: { $regex: `^${prefix}` } }).toArray();
    }

    async findBySuffix(suffix: string): Promise<WordMetadata[]> {
        return await this.collection.find({ word: { $regex: `${suffix}$` } }).toArray();
    }

    async findBySubstring(substring: string): Promise<WordMetadata[]> {
        return await this.collection.find({ word: { $regex: substring } }).toArray();
    }

    async findByDescription(text: string): Promise<WordMetadata[]> {
        return await this.collection.find({ description: { $regex: text, $options: 'i' } }).toArray();
    }

    async findByWordLengthRange(min: number, max: number): Promise<WordMetadata[]> {
        return await this.collection.find({ $expr: { $and: [{ $gte: [{ $strLenCP: "$word" }, min] }, { $lte: [{ $strLenCP: "$word" }, max] }] } }).toArray();
    }

    async findWordsByTags(tags: string[], matchAll: boolean): Promise<WordMetadata[]> {
        if (matchAll) {
            return await this.collection.find({ tags: { $all: tags } }).toArray();
        } else {
            return await this.collection.find({ tags: { $in: tags } }).toArray();
        }
    }

    async findMany(words: string[]): Promise<WordMetadata[]> {
        return await this.collection.find({ word: { $in: words } }).toArray();
    }

    async getRandomWords(count: number): Promise<WordMetadata[]> {
        return [{
            word: 'random not implemented',
            description: 'desc',
            isDictionaryWord: true
        }];
        // const test = await this.collection.aggregate([{ $sample: { size: count } }]).toArray();
    }

    async getResourceData(): Promise<ResourceData> {
        return {} as ResourceData;
    }

    async getMetrics(): Promise<Metrics> {
        return {} as Metrics;
    }

    async exportToJson(): Promise<string> {
        const allWords = await this.collection.find().toArray();
        return JSON.stringify(allWords, null, 2);
    }
}
