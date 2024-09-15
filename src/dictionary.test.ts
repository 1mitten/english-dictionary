import { DatasetLoader } from "./DatasetLoader";
import { Dictionary, WordDescription } from "./Dictionary";
import dictionaryData from "./data/dictionary_compact.json";

describe("Dictionary", () => {
  let dictionary: Dictionary;
  let dictionaryMasked: Dictionary;
  let dictionarySimple: Dictionary;
  const dictSource = dictionaryData as Record<string, string>;
  const wordDescs: WordDescription[] = [
    {
      word: "apple",
      description: "A fruit",
      clues: ["It can be red or green"],
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
      tags: ["animal"],
      isDictionaryWord: true,
    }
  ];

  beforeAll(() => {
    dictionary = new Dictionary();
    dictionaryMasked = new Dictionary({
      maskWordInDescription: "*",
      wordMinLength: 3,
      wordMaxLength: 5,
    });
    dictionarySimple = new Dictionary(
      {
        wordMinLength: 3,
        wordMaxLength: 7,
        includeDataFromDatasets: false,
        loadCluesDataset: false,
      },
      wordDescs
    );
  });

  it("should transform the JSON data into a case-insensitive dictionary", () => {
    // Test that the JSON is loaded and transformed correctly
    const transformedData = dictionary.find("anopheles");
    expect(transformedData?.description).toBe(dictSource["anopheles"]);
  });

  it("should return the description when looking up a word in lowercase", () => {
    const result = dictionary.find("anopheles");
    expect(result?.description).toBe(dictSource["anopheles"]);
  });

  it("should return the description when looking up a word in uppercase", () => {
    const result = dictionary.find("ANOPHELES");
    expect(result?.description).toBe(dictSource["anopheles"]);
  });

  it("should return undefined for a word that does not exist", () => {
    const result = dictionary.find("fesklnjsldafn");
    expect(result).toBeUndefined();
  });

  it("should handle special characters in word lookup (Hypens removed)", () => {
    const result = dictionary.find("self-murder");
    expect(result?.description).toBe(dictSource["selfmurder"]);
  });

  it("should return undefined for an empty string lookup", () => {
    const result = dictionary.find("");
    expect(result).toBeUndefined();
  });
  it("should return all of the 5 letter words from the dictionary without descriptions", () => {
    const result = dictionary.wordsByLengthRange(5, 5).get();
    expect(result.length).toBeGreaterThan(100);
  });

  it("should return all of the 5 letter words from the dictionary with descriptions", () => {
    const result = dictionary.wordsByLengthRange(5, 5).get();
    expect(result[0].word.length).toBeGreaterThan(0);
    expect(result.length).toBeGreaterThan(100);
  });

  it("should return words by length range", () => {
    const result = dictionary.wordsByLengthRange(3, 5).get();
    expect(
      result.every((word) => word.word.length >= 3 && word.word.length <= 5)
    ).toBe(true);
  });

  it("should return words by a prefix", () => {
    const result = dictionary.wordsByPrefix("pre").get();
    expect(result.every((word) => word.word.startsWith("pre"))).toBe(true);
  });

  it("should return words by a suffix", () => {
    const result = dictionary.wordsBySuffix("ing").get();
    expect(result.every((word) => word.word.endsWith("ing"))).toBe(true);
  });

  it("should return words by a substring", () => {
    const result = dictionary.wordsBySubstring("cat").get();
    expect(result.every((word) => word.word.includes("cat"))).toBe(true);
  });

  it("Should mask the word in the description with asterix", () => {
    const test =
      "The quality of being admissible; admissibleness; as, the admissibility of evidence.";
    const word = dictionaryMasked.find("admissibility");
    expect(word?.description).toEqual(
      "The quality of being admissible; admissibleness; as, the * of evidence."
    );
  });

  it("Should mask the word in the description with asterix", () => {
    const test =
      "1. Of or pertaining to an arrow; resembling an arrow; furnished with an arowlike appendage. 2. (Anat.) (a) Of or pertaining to the sagittal suture; in the region of the sagittal suture; rabdoidal; as, the sagittal furrow, or groove, on the inner surface of the roof of the skull. (b) In the mesial plane; as, a sagittal section of an animal. Sagittal suture (Anat.), the suture between the two parietal bones in the top of the skull; -- called also rabdoidal suture, and interparietal suture.";
    const word = dictionaryMasked.find("sagittal");
    const expected =
      "1. Of or pertaining to an arrow; resembling an arrow; furnished with an arowlike appendage. 2. (Anat.) (a) Of or pertaining to the * suture; in the region of the * suture; rabdoidal; as, the * furrow, or groove, on the inner surface of the roof of the skull. (b) In the mesial plane; as, a * section of an animal. * suture (Anat.), the suture between the two parietal bones in the top of the skull; -- called also rabdoidal suture, and interparietal suture.";
    expect(word?.description).toEqual(expected);
  });

  it("Should mask the word in the description with asterix", () => {
    const test =
      "1. Of or pertaining to an arrow; resembling an arrow; furnished with an arowlike appendage. 2. (Anat.) (a) Of or pertaining to the sagittal suture; in the region of the sagittal suture; rabdoidal; as, the sagittal furrow, or groove, on the inner surface of the roof of the skull. (b) In the mesial plane; as, a sagittal section of an animal. Sagittal suture (Anat.), the suture between the two parietal bones in the top of the skull; -- called also rabdoidal suture, and interparietal suture.";
    const word = dictionaryMasked.find("sagittal");
    const expected =
      "1. Of or pertaining to an arrow; resembling an arrow; furnished with an arowlike appendage. 2. (Anat.) (a) Of or pertaining to the * suture; in the region of the * suture; rabdoidal; as, the * furrow, or groove, on the inner surface of the roof of the skull. (b) In the mesial plane; as, a * section of an animal. * suture (Anat.), the suture between the two parietal bones in the top of the skull; -- called also rabdoidal suture, and interparietal suture.";
    expect(word?.description).toEqual(expected);
  });
  it("should return words that have clues", () => {
    const words = dictionary.wordsWithClues();

    let result = true;

    for (const word of words) {
      if (!word.clues || word.clues.length === 0) {
        result = false;
        break;
      }
    }

    expect(result).toBe(true);
  });
  it("should return words with all matching tags when matchAll is true", () => {
    const words = dictionary.wordsByTags(["vegetable"], true);

    let result = true;

    for (const word of words) {
      if (
        !word.tags ||
        word.tags.length === 0 ||
        !word.tags.includes("vegetable")
      ) {
        result = false;
        break;
      }

      expect(result).toBe(true);
    }
  });
  it("should export data as a JSON string", () => {

    const result = dictionarySimple.exportToJsonString();

    expect(dictionarySimple.words?.length).toBe(5);
    expect(typeof result).toBe("string");
  });
  it("should reset filteredData based on word length range", () => {
    dictionarySimple.reset();
     console.log(dictionarySimple);
    expect(dictionarySimple["filteredData"].size).toBe(4);
    expect(dictionarySimple["filteredData"].has("apple")).toBe(true);
    expect(dictionarySimple["filteredData"].has("banana")).toBe(true);
    expect(dictionarySimple["filteredData"].has("carrot")).toBe(true);
    expect(dictionarySimple["filteredData"].has("date")).toBe(true);
    expect(dictionarySimple["filteredData"].has("elephant")).toBe(false);
  });
  it("should filter words that match the regex pattern", () => {
    dictionarySimple.filter(/^a/); // Words that start with 'a'
    const filteredWords = dictionarySimple.getArray(); // Get the filtered words

    expect(filteredWords.length).toBe(1); // Only "apple" matches
    expect(filteredWords).toContain("apple");
    expect(filteredWords).not.toContain("banana");
    expect(filteredWords).not.toContain("carrot");
    expect(filteredWords).not.toContain("elephant");
  });

  it("should return an empty array when no words match the regex", () => {
    dictionarySimple.filter(/^z/); // Words that start with 'z'
    const filteredWords = dictionarySimple.getArray();

    expect(filteredWords.length).toBe(0); // No words should match
  });

  it("should filter words that match all words using a regex", () => {
    dictionarySimple.filter(/.*/); // This regex matches everything
    const filteredWords = dictionarySimple.getArray();

    expect(filteredWords.length).toBe(5); // All words should match
    expect(filteredWords).toContain("apple");
    expect(filteredWords).toContain("banana");
    expect(filteredWords).toContain("carrot");
    expect(filteredWords).toContain("date");
    expect(filteredWords).toContain("elephant");
  });

  it("should filter words with a more complex regex pattern", () => {
    dictionarySimple.filter(/a.*t$/); // Words that contain 'a' and end with 't'
    const filteredWords = dictionarySimple.getArray();

    expect(filteredWords.length).toBe(2);
    expect(filteredWords).toContain("carrot"); // carrot matches
    expect(filteredWords).toContain("elephant"); // elephant matches
    expect(filteredWords).not.toContain("apple");
    expect(filteredWords).not.toContain("banana");
  });

  it("should filter words that match words with length constraints", () => {
    dictionarySimple.filter(/^.{5}$/); // Words that are exactly 5 characters long
    const filteredWords = dictionarySimple.getArray();

    expect(filteredWords.length).toBe(1);
    expect(filteredWords).toContain("apple"); // 'apple' is 5 letters
    expect(filteredWords).not.toContain("banana");
    expect(filteredWords).not.toContain("carrot");
    expect(filteredWords).not.toContain("date");
    expect(filteredWords).not.toContain("elephant");
  });
});
