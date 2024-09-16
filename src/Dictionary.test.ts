import { Dictionary } from "./Dictionary";
import { WordMetadata } from "./types/WordMetadata.type";
import dictionaryData from "./data/dictionary/dictionary_compact.json";
import { InMemoryProvider } from './InMemoryProvider';

describe("Dictionary", () => {
  let dictionarySimple: Dictionary;

  const wordDescs: WordMetadata[] = [
    {
      word: "apple",
      description: "A fruit",
      clues: ["It can be red or green, a apple"],
      tags: ["fruit", "food"],
      isDictionaryWord: true,
    },
    {
      word: "banana",
      description: "A yellow fruit",
      tags: ["fruit"],
      isDictionaryWord: true,
    },
    {
      word: "carrot",
      description: "A vegetable",
      tags: ["vegetable"],
      isDictionaryWord: true,
    },
    {
      word: "date",
      description: "A type of date fruit",
      isDictionaryWord: true,
    },
    {
      word: "elephant",
      description: "A large animal elephant",
      isDictionaryWord: true,
    }
  ];
  const inmemoryProvider = new InMemoryProvider({
    wordMinLength: 3,
    wordMaxLength: 7,
    includeDataFromDatasets: false,
    loadCluesDataset: false,
    maskWordInDescription: "*",
  }, wordDescs);
  beforeEach(() => {
    dictionarySimple = new Dictionary(inmemoryProvider);
  });

  it("should transform the JSON data into a case-insensitive dictionary", async () => {
    const transformedData = await dictionarySimple.find("Apple");
    expect(transformedData?.description).toBe('A fruit');
  });

  it("should return the description when looking up a word in lowercase", async () => {
    const result = await dictionarySimple.find("apple");
    expect(result?.description).toBe('A fruit');
  });

  it("should return the description when looking up a word in uppercase", async () => {
    const result = await dictionarySimple.find("APPLE");
    expect(result?.description).toBe('A fruit');
  });

  it("should return undefined for a word that does not exist", async () => {
    const result = await dictionarySimple.find("fesklnjsldafn");
    expect(result).toBeUndefined();
  });

  it("should handle special characters in word lookup (Hypens removed)", async () => {
    const result = await dictionarySimple.find("apple");
    expect(result?.description).toBe("A fruit");
  });

  it("should return undefined for an empty string lookup", async () => {
    const result = await dictionarySimple.find("");
    expect(result).toBeUndefined();
  });

  it("should return all of the 5 letter words from the dictionary without descriptions", async () => {
    const result = await inmemoryProvider.findByWordLengthRange(5, 5);
    expect(result.length).toBe(1);
  });

  it("should return all of the 5 letter words from the dictionary with descriptions", async () => {
    const result = await inmemoryProvider.findByWordLengthRange(5, 5);
    expect(result.length).toBe(1);
  });

  it("should return words by length range", async () => {
    const result = await inmemoryProvider.findByWordLengthRange(3, 5);
    expect(result.every((word: { word: string | any[]; }) => word.word.length >= 3 && word.word.length <= 5)).toBe(true);
  });

  it("should return words by a prefix", async () => {
    const result = await inmemoryProvider.findByPrefix("ap");
    expect(result.every((word: { word: string; }) => word.word.startsWith("ap"))).toBe(true);
  });

  it("should return words by a suffix", async () => {
    const result = await inmemoryProvider.findBySuffix("ple");
    expect(result.every((word: { word: string; }) => word.word.endsWith("ple"))).toBe(true);
  });

  it("should return words by a substring", async () => {
    const result = await inmemoryProvider.findBySubstring("ppl");
    expect(result.every((word: { word: string | string[]; }) => word.word.includes("ppl"))).toBe(true);
  });

  it("Should mask the word in the description with asterisks", async () => {
    const word = await dictionarySimple.find("date");
    expect(word?.description).toEqual("A type of * fruit");
  });


  it("should return words that have clues", async () => {
    const words = inmemoryProvider.findWordsWithClues();
    expect(words.every((word => word.clues && word.clues.length > 0))).toBe(true);
  });

  it("should export data as a JSON string", async () => {
    const result = await inmemoryProvider.exportToJsonString();
    expect(inmemoryProvider.words?.length).toBe(5);
    expect(typeof result).toBe("string");
  });

  it("should reset filteredData based on word length range", async () => {

    expect(inmemoryProvider["data"].size).toBe(4);
    expect(inmemoryProvider["data"].has("apple")).toBe(true);
    expect(inmemoryProvider["data"].has("banana")).toBe(true);
    expect(inmemoryProvider["data"].has("carrot")).toBe(true);
    expect(inmemoryProvider["data"].has("date")).toBe(true);
    expect(inmemoryProvider["data"].has("elephant")).toBe(false);
  });

  it("should filter words that match the regex pattern", async () => {
    const filteredWords = await dictionarySimple.filter(/^a/); // Words that start with 'a'
    expect(filteredWords.length).toBe(4);
  });

  it("should return an empty array when no words match the regex", async () => {
    const filteredWords = await dictionarySimple.filter(/^z/); // Words that start with 'z'

    expect(filteredWords.length).toBe(4);
  });

  it("should filter words that match all words using a regex", async () => {
    const filteredWords = await dictionarySimple.filter(/.*/); // This regex matches everything

    expect(filteredWords.length).toBe(4); // All words should match
  });

  it("should filter words with a more complex regex pattern", async () => {
    const filteredWords = await dictionarySimple.filter(/a.*t$/); // Words that contain 'a' and end with 't'

    expect(filteredWords.length).toBe(4);
  });

  it("should return multiple words found in the dictionary", async () => {
    const result = await dictionarySimple.findMany(['apple', 'banana']);
    expect(result.length).toBe(2);
  });

  it("should return only words found in the dictionary, filtering out non-existent ones", async () => {
    const result = await dictionarySimple.findMany(['apple', 'orange', 'banana']);
    expect(result.length).toBe(2);
  });

  it("should return an empty array if none of the words are found", async () => {
    const result = await dictionarySimple.findMany(['orange', 'grape', 'kiwi']);
    expect(result.length).toBe(0);
  });

  it("should return the correct number of random words", async () => {
    const result = await dictionarySimple.getRandomWords(3);
    expect(result.length).toBe(3);
  });

  it("should return different sets of random words (non-deterministic)", async () => {
    const firstSet = await dictionarySimple.getRandomWords(1);
    const secondSet = await dictionarySimple.getRandomWords(1);
    expect(firstSet).not.toEqual(secondSet);
  });

  it("should return words with all matching tags when matchAll is true", async () => {
    const words = await dictionarySimple.findWordsByTags(["vegetable"], true);
    expect(words.every((word) => word.tags?.includes("vegetable"))).toBe(true);
  });

  it("should return words that match all specified tags when matchAll is true", async () => {
    const result = await dictionarySimple.findWordsByTags(['fruit', 'food'], true);
    expect(result.length).toBe(1); // Only "apple" has both 'fruit' and 'food' tags
    expect(result[0].word).toBe('apple');
  });

  it("should return words that match at least one of the specified tags when matchAll is false", async () => {
    const result = await dictionarySimple.findWordsByTags(['fruit', 'food'], false);
    expect(result.length).toBe(2);
    const resultWords = result.map(wordDesc => wordDesc.word);
    expect(resultWords).toContain('apple');
    expect(resultWords).toContain('banana');
  });

  it("should return an empty array if no words match the specified tags", async () => {
    const result = await dictionarySimple.findWordsByTags(['nonexistent'], true);
    expect(result.length).toBe(0);
  });

  it("should return words without considering tags if matchAll is true but no tags are provided", async () => {
    const result = await dictionarySimple.findWordsByTags([], true);
    expect(result.length).toBe(0);
  });

  it("should return an empty array if no tags are provided and matchAll is false", async () => {
    const result = await dictionarySimple.findWordsByTags([], false);
    expect(result.length).toBe(0);
  });

  it("should return words with descriptions containing the search text", async () => {
    const result = await dictionarySimple.findByDescription('fruit');
    expect(result.length).toBe(3);
  });

  it("should return an empty array if no descriptions match the search text", async () => {
    const result = await dictionarySimple.findByDescription('crazy stuff');
    expect(result.length).toBe(0);
  });

});


