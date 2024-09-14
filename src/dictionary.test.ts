import { Dictionary } from "./Dictionary";
import dictionaryData from "./data/dictionary_compact.json";

describe("Dictionary", () => {
  let dictionary: Dictionary;
  const dictSource = dictionaryData as Record<string, string>;

  beforeAll(() => {
    dictionary = new Dictionary();
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
    const result = dictionary.wordsByLength(5).get();
    expect(result.length).toBeGreaterThan(100);
  });

  it("should return all of the 5 letter words from the dictionary with descriptions", () => {
    const result = dictionary.wordsByLength(5).get();
    expect(result[0].word.length).toBeGreaterThan(0);
    expect(result.length).toBeGreaterThan(100);
  });

  it('should return words by length range', () => {
    const result = dictionary.wordsByLengthRange(3, 5).get();
    expect(result.every(word => word.word.length >= 3 && word.word.length <= 5)).toBe(true);
  });

  it('should return words by a prefix', () => {
    const result = dictionary.wordsByPrefix('pre').get();
    expect(result.every(word => word.word.startsWith('pre'))).toBe(true);
  });

  it('should return words by a suffix', () => {
    const result = dictionary.wordsBySuffix('ing').get();
    expect(result.every(word => word.word.endsWith('ing'))).toBe(true);
  });

  it('should return words by a substring', () => {
    const result = dictionary.wordsBySubstring('cat').get();
    expect(result.every(word => word.word.includes('cat'))).toBe(true);
  });


  it('', () => {
    const dict = new Dictionary({
        maskWordInDescription: '*'
      });
    const test = "The quality of being admissible; admissibleness; as, the admissibility of evidence."
    const word = dict.find('admissibility');
    expect(word?.description).toEqual('The quality of being admissible; admissibleness; as, the * of evidence.')
  });

  it('', () => {

    const dict = new Dictionary({
        maskWordInDescription: '*'
      });
      const test = "1. Of or pertaining to an arrow; resembling an arrow; furnished with an arowlike appendage. 2. (Anat.) (a) Of or pertaining to the sagittal suture; in the region of the sagittal suture; rabdoidal; as, the sagittal furrow, or groove, on the inner surface of the roof of the skull. (b) In the mesial plane; as, a sagittal section of an animal. Sagittal suture (Anat.), the suture between the two parietal bones in the top of the skull; -- called also rabdoidal suture, and interparietal suture.";
      const word = dict.find('sagittal');
    const expected = "1. Of or pertaining to an arrow; resembling an arrow; furnished with an arowlike appendage. 2. (Anat.) (a) Of or pertaining to the * suture; in the region of the * suture; rabdoidal; as, the * furrow, or groove, on the inner surface of the roof of the skull. (b) In the mesial plane; as, a * section of an animal. * suture (Anat.), the suture between the two parietal bones in the top of the skull; -- called also rabdoidal suture, and interparietal suture.";
    expect(word?.description).toEqual(expected);
  });




});
