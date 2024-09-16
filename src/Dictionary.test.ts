import { Dictionary } from "./Dictionary";
import { WordMetadata } from "./types/WordMetadata.type";
import dictionaryData from "./data/dictionary/dictionary_compact.json";
import { InMemoryProvider } from './InMemoryProvider';

describe("Dictionary", () => {
  let dictionary: Dictionary;
  let dictionaryMasked: Dictionary;
  let dictionarySimple: Dictionary;
  let inmemoryProvider: InMemoryProvider;
  const dictSource = dictionaryData as Record<string, string>;
  const wordDescs: WordMetadata[] = [
    {
      word: "apple",
      description: "A fruit",
      clues: ["It can be red or green, a fruit"],
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
      description: "A type of fruit",
      isDictionaryWord: true,
    },
    {
      word: "elephant",
      description: "A large animal",
      isDictionaryWord: true,
    }
  ];

  beforeAll(() => {
    dictionary = new Dictionary(new InMemoryProvider({
      wordMinLength: 3,
      wordMaxLength: 5,
    }));
    dictionaryMasked = new Dictionary(new InMemoryProvider({
      maskWordInDescription: "*",
      wordMinLength: 3,
      wordMaxLength: 5,
    }));
    inmemoryProvider = new InMemoryProvider({
      wordMinLength: 3,
      wordMaxLength: 7,
      includeDataFromDatasets: false,
      loadCluesDataset: false,
    },
      wordDescs)
    dictionarySimple = new Dictionary(inmemoryProvider);
  });

  it("should transform the JSON data into a case-insensitive dictionary", async () => {
    const transformedData = await dictionary.find("anopheles");
    expect(transformedData?.description).toBe(dictSource["anopheles"]);
  });

  it("should return the description when looking up a word in lowercase", async () => {
    const result = await dictionary.find("anopheles");
    expect(result?.description).toBe(dictSource["anopheles"]);
  });

  it("should return the description when looking up a word in uppercase", async () => {
    const result = await dictionary.find("ANOPHELES");
    expect(result?.description).toBe(dictSource["anopheles"]);
  });

  it("should return undefined for a word that does not exist", async () => {
    const result = await dictionary.find("fesklnjsldafn");
    expect(result).toBeUndefined();
  });

  it("should handle special characters in word lookup (Hypens removed)", async () => {
    const result = await dictionary.find("self-murder");
    expect(result?.description).toBe(dictSource["selfmurder"]);
  });

  it("should return undefined for an empty string lookup", async () => {
    const result = await dictionary.find("");
    expect(result).toBeUndefined();
  });

  it("should return all of the 5 letter words from the dictionary without descriptions", async () => {
    const result = await inmemoryProvider.findByWordLengthRange(5, 5);
    expect(result.length).toBe(1);
  });

  it("should return all of the 5 letter words from the dictionary with descriptions", async () => {
    const result = await inmemoryProvider.findByWordLengthRange(5, 5);
    expect(result[0].word.length).toBeGreaterThan(0);
    expect(result.length).toBe(1);
  });

  it("should return words by length range", async () => {
    const result = await inmemoryProvider.findByWordLengthRange(3, 5);
    expect(result.every((word: { word: string | any[]; }) => word.word.length >= 3 && word.word.length <= 5)).toBe(true);
  });

  it("should return words by a prefix", async () => {
    const result = await inmemoryProvider.findByPrefix("pre");
    expect(result.every((word: { word: string; }) => word.word.startsWith("pre"))).toBe(true);
  });

  it("should return words by a suffix", async () => {
    const result = await inmemoryProvider.findBySuffix("ing");
    expect(result.every((word: { word: string; }) => word.word.endsWith("ing"))).toBe(true);
  });

  it("should return words by a substring", async () => {
    const result = await inmemoryProvider.findBySubstring("cat");
    expect(result.every((word: { word: string | string[]; }) => word.word.includes("cat"))).toBe(true);
  });

  it("Should mask the word in the description with asterisks", async () => {
    const word = await dictionaryMasked.find("admissibility");
    expect(word?.description).toEqual("The quality of being admissible; admissibleness; as, the * of evidence.");
  });

  it("Should mask the word in the description with asterisks", async () => {
    const word = await dictionaryMasked.find("sagittal");
    const expected =
      "1. Of or pertaining to an arrow; resembling an arrow; furnished with an arowlike appendage. 2. (Anat.) (a) Of or pertaining to the * suture; in the region of the * suture; rabdoidal; as, the * furrow, or groove, on the inner surface of the roof of the skull. (b) In the mesial plane; as, a * section of an animal. * suture (Anat.), the suture between the two parietal bones in the top of the skull; -- called also rabdoidal suture, and interparietal suture.";
    expect(word?.description).toEqual(expected);
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
    await inmemoryProvider.reset();
    expect(inmemoryProvider["filteredData"].size).toBe(4);
    expect(inmemoryProvider["filteredData"].has("apple")).toBe(true);
    expect(inmemoryProvider["filteredData"].has("banana")).toBe(true);
    expect(inmemoryProvider["filteredData"].has("carrot")).toBe(true);
    expect(inmemoryProvider["filteredData"].has("date")).toBe(true);
    expect(inmemoryProvider["filteredData"].has("elephant")).toBe(false);
  });

  it("should filter words that match the regex pattern", async () => {
    await dictionarySimple.filter(/^a/); // Words that start with 'a'
    const filteredWords = await inmemoryProvider.getArray();
    expect(filteredWords.length).toBe(1); // Only "apple" matches
    expect(filteredWords).toContain("apple");
  });

  it("should return an empty array when no words match the regex", async () => {
    await dictionarySimple.filter(/^z/); // Words that start with 'z'
    const filteredWords = await inmemoryProvider.getArray();
    expect(filteredWords.length).toBe(0);
  });

  it("should filter words that match all words using a regex", async () => {
    await dictionarySimple.filter(/.*/); // This regex matches everything
    const filteredWords = await inmemoryProvider.getArray();
    expect(filteredWords.length).toBe(5); // All words should match
  });

  it("should filter words with a more complex regex pattern", async () => {
    await dictionarySimple.filter(/a.*t$/); // Words that contain 'a' and end with 't'
    const filteredWords = await inmemoryProvider.getArray();
    expect(filteredWords.length).toBe(2);
    expect(filteredWords).toContain("carrot");
    expect(filteredWords).toContain("elephant");
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
    const result = await dictionary.getRandomWords(3);
    expect(result.length).toBe(3);
  });

  it("should return different sets of random words (non-deterministic)", async () => {
    const firstSet = await dictionary.getRandomWords(3);
    const secondSet = await dictionary.getRandomWords(3);
    expect(firstSet).not.toEqual(secondSet);
  });

  it("should return words with all matching tags when matchAll is true", async () => {
    const words = await dictionary.findWordsByTags(["vegetable"], true);
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
    const result = await dictionary.findByDescription('crazy stuff');
    expect(result.length).toBe(0);
  });
});
