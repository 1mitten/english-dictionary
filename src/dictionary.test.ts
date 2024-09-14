import { Dictionary } from './dictionary';
import dictionaryData from './data/dictionary_compact.json';

describe('Dictionary', () => {
  let dictionary: Dictionary;
  const dictSource = dictionaryData as Record<string,string>;

  beforeAll(() => {
    dictionary = new Dictionary();
  });

  it('should transform the JSON data into a case-insensitive dictionary', () => {
    // Test that the JSON is loaded and transformed correctly
    const transformedData = dictionary.find('anopheles');
    expect(transformedData).toBe(dictSource['anopheles']);
  });

  it('should return the definition when looking up a word in lowercase', () => {
    const result = dictionary.find('anopheles');
    expect(result).toBe(dictSource['anopheles']);
  });

  it('should return the definition when looking up a word in uppercase', () => {
    const result = dictionary.find('ANOPHELES');
    expect(result).toBe(dictSource['anopheles']);
  });

  it('should return undefined for a word that does not exist', () => {
    const result = dictionary.find('fesklnjsldafn');
    expect(result).toBeUndefined();
  });

  it('should handle special characters in word lookup', () => {
    const result = dictionary.find('self-murder');
    expect(result).toBe(dictSource['self-murder']);
  });

  it('should return undefined for an empty string lookup', () => {
    const result = dictionary.find('');
    expect(result).toBeUndefined();
  });
  it('should return all of the 5 letter words from the dictionary without descriptions', () => {
    const result = dictionary.words(5);
    expect(result.length).toBeGreaterThan(100);
  })

  it('should return all of the 5 letter words from the dictionary with descriptions', () => {
    const result = dictionary.wordsAndDesc(5);
    expect(result[0].description.length).toBeGreaterThan(0);
    expect(result.length).toBeGreaterThan(100);
  })
});
