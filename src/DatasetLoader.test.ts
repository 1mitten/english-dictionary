import { DatasetLoader } from './DatasetLoader';
import { WordMetadata } from "./types/WordMetadata.type";

describe('DatasetLoader', () => {
  let datasetLoader: DatasetLoader;
  let dictionary: Map<string, WordMetadata>;

  beforeEach(() => {
    datasetLoader = new DatasetLoader();
    dictionary = new Map<string, WordMetadata>();
  });

  it('should handle simple arrays of words and apply base tags', () => {
    const words = ['dog', 'cat', 'elephant'];
    const baseTags = ['animal'];

    datasetLoader.applyTagsToWords(words, baseTags, dictionary);

    expect(dictionary.get('dog')).toEqual({
      word: 'dog',
      description: 'Tagged with animal',
      isDictionaryWord: false,
      tags: ['animal'],
    });

    expect(dictionary.get('cat')).toEqual({
      word: 'cat',
      description: 'Tagged with animal',
      isDictionaryWord: false,
      tags: ['animal'],
    });

    expect(dictionary.get('elephant')).toEqual({
      word: 'elephant',
      description: 'Tagged with animal',
      isDictionaryWord: false,
      tags: ['animal'],
    });
  });

  it('should handle objects with string values (e.g., { present: "accept", past: "accepted" })', () => {
    const words = { present: 'accept', past: 'accepted' };
    const baseTags = ['verb'];

    datasetLoader.applyTagsToWords(words, baseTags, dictionary);

    expect(dictionary.get('accept')).toEqual({
      word: 'accept',
      description: 'Tagged with verb:present',
      isDictionaryWord: false,
      tags: ['verb:present'],
    });

    expect(dictionary.get('accepted')).toEqual({
      word: 'accepted',
      description: 'Tagged with verb:past',
      isDictionaryWord: false,
      tags: ['verb:past'],
    });
  });

  it('should handle objects with array values (e.g., { melee: ["sword", "dagger"] })', () => {
    const words = { melee: ['sword', 'dagger'], ranged: ['bow', 'crossbow'] };
    const baseTags = ['weapons:old'];

    datasetLoader.applyTagsToWords(words, baseTags, dictionary);

    expect(dictionary.get('sword')).toEqual({
      word: 'sword',
      description: 'Tagged with weapons:old:melee',
      isDictionaryWord: false,
      tags: ['weapons:old:melee'],
    });

    expect(dictionary.get('dagger')).toEqual({
      word: 'dagger',
      description: 'Tagged with weapons:old:melee',
      isDictionaryWord: false,
      tags: ['weapons:old:melee'],
    });

    expect(dictionary.get('bow')).toEqual({
      word: 'bow',
      description: 'Tagged with weapons:old:ranged',
      isDictionaryWord: false,
      tags: ['weapons:old:ranged'],
    });

    expect(dictionary.get('crossbow')).toEqual({
      word: 'crossbow',
      description: 'Tagged with weapons:old:ranged',
      isDictionaryWord: false,
      tags: ['weapons:old:ranged'],
    });
  });

  it('should merge tags if the word already exists in the dictionary', () => {
    const words = ['dog'];
    const baseTags = ['animal'];

    datasetLoader.applyTagsToWords(words, baseTags, dictionary);

    const additionalTags = ['pet'];
    datasetLoader.applyTagsToWords(words, additionalTags, dictionary);

    expect(dictionary.get('dog')?.tags?.includes('animal')).toBe(true);
    expect(dictionary.get('dog')?.tags?.includes('pet')).toBe(true);
  });

  it('should handle non-string values by ignoring them', () => {
    const words = { present: 123, past: 'accepted' }; // `present` is invalid (non-string)
    const baseTags = ['verb'];

    datasetLoader.applyTagsToWords(words, baseTags, dictionary);

    expect(dictionary.get('accepted')?.tags?.includes('verb:past')).toBe(true);
  });
});
