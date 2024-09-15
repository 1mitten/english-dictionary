import dictionaryData from "./data/dictionary_compact.json";
import animals from "./data/animals.json"; // Import your JSON file with animals or other taggable words
import clues_five from "./data/clues_five.json"; // Import your JSON file with 5-letter word clues
import clues_four from "./data/clues_four.json"; // Import your JSON file with 4-letter word clues
import clues_six from "./data/clues_six.json"; // Import your JSON file with 6-letter word clues
import common from "./data/common.json"; // Import your JSON file with 6-letter word clues
import nouns from "./data/nouns.json"; // Import your JSON file with 6-letter word clues
import verbs from "./data/verbs.json"; // Import your JSON file with 6-letter word clues#
import adverbs from "./data/adverbs.json"; // Import your JSON file with 6-letter word clues
import adjectives from "./data/adjectives.json"; // Import your JSON file with 6-letter word clues
import stopwords from "./data/stopwords.json";
import clothing from "./data/clothing.json";
import containers from "./data/containers.json";
import old_weapons from "./data/old_weapons.json";
import objects from "./data/objects.json";
import moods from "./data/moods.json"
import monsters from "./data/monsters.json"
import body_parts from "./data/body_parts.json"
import musical_instruments from "./data/musical_instruments.json"
import countries from "./data/countries.json"
import passages from "./data/passages.json"
import rooms from "./data/rooms.json"

export type WordDescription = {
  word: string;
  description: string;
  isDictionaryWord: boolean;
  clues?: string[];
  tags?: string[]; // Allow tags to be optional
};

export type Options = {
  maskWordInDescription?: string;
  wordMinLength?: number;
  wordMaxLength?: number;
};

export class Dictionary {
  private data: Map<string, WordDescription>;
  private filteredData: Map<string, WordDescription>;
  private static readonly MIN_WORD_LENGTH = 3;
  private static readonly MAX_WORD_LENGTH = 50;

  constructor(public options?: Options, public words?: WordDescription[]) {
    this.data = new Map();
    this.filteredData = new Map();

    if (words) {
      this.loadWords(words);
    } else {
      this.loadWords(this.transformData(dictionaryData as Record<string, string>));
    }

    // Load multiple datasets with clues and tags
    this.loadDatasets({
      animals: { data: animals.animals, tags: ['animal'] },
      common: { data: common.words, tags: ['common'] },
      containers: { data: containers.words, tags: ['container'] },
      countries: { data: countries.words, tags: ['country'] },
      clothing: { data: clothing.words, tags: ['clothing'] },
      monsters: { data: monsters.words, tags: ['monster'] },
      musical_instruments: { data: musical_instruments.words, tags: ['music:instruments',]
      },
      objects: { data: objects.words, tags: ['object'] },
      passages: { data: passages.words, tags: ['passage'] },
      nouns: { data: nouns.words, tags: ['noun'] },
      adverbs: { data: adverbs.words, tags: ['adverb'] },
      adjectives: { data: adjectives.adjs, tags: ['adjective']},
      stopwords: { data: stopwords.words, tags: ['stopword'] },
      moods: { data: moods.words, tags: ['mood'] },
      body_parts: { data: body_parts.words, tags: ['body','human','anatomy']},
      rooms: { data: rooms.words, tags: ['room','place']}
    });

    this.loadVerbs(verbs.verbs);
    this.loadWeapons(old_weapons.data);

    this.loadClueDatasets([
      clues_four.clues,
      clues_five.clues,
      clues_six.clues
    ]);

    if (options?.maskWordInDescription) {
      this.maskWordsInDescriptions(options.maskWordInDescription);
    }

    const minLength = options?.wordMinLength ?? Dictionary.MIN_WORD_LENGTH;
    const maxLength = options?.wordMaxLength ?? Dictionary.MAX_WORD_LENGTH;
    this.filteredData = this.filterByLengthRange(minLength, maxLength);
  }

  // Transform raw data into WordDescription objects
  private transformData(jsonData: Record<string, string>): WordDescription[] {
    return Object.entries(jsonData).map(([word, description]) => ({
      word: word.toLowerCase().replace(/-/g, ""),
      description,
      isDictionaryWord: true
    }));
  }

  // Load words into the data map
  private loadWords(wordDescriptions: WordDescription[]): void {
    wordDescriptions.forEach(({ word, description, tags }) => {
      this.data.set(word, { word, description, tags, isDictionaryWord: true });
    });
  }

  private loadWeapons(weaponData: { melee: string[], ranged: string[] }): void {
    // Process melee weapons
    this.applyTagToWords(weaponData.melee, 'weapons:old:melee');
  
    // Process ranged weapons
    this.applyTagToWords(weaponData.ranged, 'weapons:old:ranged');
  }

  // Mask words in their descriptions
  private maskWordsInDescriptions(maskChar: string): void {
    this.data.forEach((wordDescription, word) => {
      const regex = new RegExp(`\\b${word}\\b`, "gi");
      wordDescription.description = wordDescription.description.replace(regex, maskChar);
      this.data.set(word, wordDescription);
    });
  }

  // Filter by word length range
  private filterByLengthRange(min: number, max: number): Map<string, WordDescription> {
    const filteredMap = new Map<string, WordDescription>();
    this.data.forEach((wordDescription) => {
      if (wordDescription.word.length >= min && wordDescription.word.length <= max) {
        filteredMap.set(wordDescription.word, wordDescription);
      }
    });
    return filteredMap;
  }

  private loadDatasets(datasets: { [key: string]: { data: string[], tags: string[] } }): void {
    Object.keys(datasets).forEach((key) => {
      const { data, tags } = datasets[key];
      this.applyMultipleTagsToWords(data, tags);
    });
  }
  // Apply multiple tags to a list of words
private applyMultipleTagsToWords(words: string[], tags: string[]): void {
  words.forEach((word) => {
    const normalizedWord = word.toLowerCase();
    const wordDescription = this.data.get(normalizedWord);
    
    if (wordDescription) {
      // If the word already exists, append the new tags
      wordDescription.tags = [...(wordDescription.tags || []), ...tags];
      this.data.set(normalizedWord, wordDescription); // Update the data
    } else {
      // If the word doesn't exist, create a new entry with all the tags
      this.data.set(normalizedWord, {
        word: normalizedWord,
        description: `Tagged with ${tags.join(', ')}`,
        isDictionaryWord: false,
        tags: [...tags],
      });
    }
  });
}

  // Apply a specific tag to a list of words
  private applyTagToWords(words: string[], tag: string): void {
    words.forEach((word) => {
      const normalizedWord = word.toLowerCase();
      const wordDescription = this.data.get(normalizedWord);
      if (wordDescription) {
        wordDescription.tags = [...(wordDescription.tags || []), tag];
        this.data.set(normalizedWord, wordDescription); // Update the data
      }
    });
  }

  // Load multiple clue datasets at once
  private loadClueDatasets(clueDatasets: { [word: string]: string[] }[]): void {
    clueDatasets.forEach((clueData) => {
      this.loadClues(clueData);
    });
  }

  // Load clues for specific words
  public loadClues(clueData: { [word: string]: string[] }): void {
    Object.entries(clueData).forEach(([word, clues]) => {
      const normalizedWord = word.toLowerCase();
      const wordDescription = this.data.get(normalizedWord);
      if (wordDescription) {
        wordDescription.clues = clues; // Add the array of clues to the word
        this.data.set(normalizedWord, wordDescription); // Update the data
      }
    });
  }


private loadVerbs(verbData: { present: string, past: string }[]): void {
  verbData.forEach(({ present, past }) => {
    const normalizedPresent = present.toLowerCase();
    const normalizedPast = past.toLowerCase();

    // Add present form with 'verb:present' tag
    this.addVerbToDictionary(normalizedPresent, 'verb:present');

    // Add past form with 'verb:past' tag
    this.addVerbToDictionary(normalizedPast, 'verb:past');
  });
}

// Helper method to add verb forms with appropriate tags
private addVerbToDictionary(word: string, tag: 'verb:present' | 'verb:past'): void {
  const existingWord = this.data.get(word);
  
  if (existingWord) {
    // If the word exists, add the new tag to its tags array
    existingWord.tags = [...(existingWord.tags || []), tag];
    this.data.set(word, existingWord);
  } else {
    // Otherwise, create a new WordDescription with the tag
    this.data.set(word, {
      word,
      description: `A ${tag.split(':')[1]} form of the verb.`,
      isDictionaryWord: false,
      tags: [tag],
    });
  }
}

  // Search and filtering functions
  public filter(regex: RegExp): this {
    this.filteredData = new Map<string, WordDescription>();
    this.data.forEach((wordDescription) => {
      if (regex.test(wordDescription.word)) {
        this.filteredData.set(wordDescription.word, wordDescription);
      }
    });
    return this;
  }

  public find(word: string): WordDescription | undefined {
    return this.data.get(word.toLowerCase());
  }

  public findMany(words: string[]): WordDescription[] {
    return words
      .map((word) => this.find(word))
      .filter((wordDesc): wordDesc is WordDescription => !!wordDesc);
  }

  // Retrieve filtered data
  public get(): WordDescription[] {
    return Array.from(this.filteredData.values());
  }

  public getArray(): string[] {
    return Array.from(this.filteredData.keys());
  }

  // Random word retrieval
  public getRandomWords(count: number): WordDescription[] {
    const words = Array.from(this.filteredData.values());
    const shuffled = [...words].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  // Filter by prefix, suffix, or substring
  public wordsByPrefix(prefix: string): this {
    this.filteredData = new Map();
    this.data.forEach((wordDescription) => {
      if (wordDescription.word.startsWith(prefix.toLowerCase())) {
        this.filteredData.set(wordDescription.word, wordDescription);
      }
    });
    return this;
  }

  public wordsBySuffix(suffix: string): this {
    this.filteredData = new Map();
    this.data.forEach((wordDescription) => {
      if (wordDescription.word.endsWith(suffix.toLowerCase())) {
        this.filteredData.set(wordDescription.word, wordDescription);
      }
    });
    return this;
  }

  public wordsBySubstring(substring: string): this {
    this.filteredData = new Map();
    this.data.forEach((wordDescription) => {
      if (wordDescription.word.includes(substring.toLowerCase())) {
        this.filteredData.set(wordDescription.word, wordDescription);
      }
    });
    return this;
  }

  public wordsByLengthRange(min: number, max: number): this {
    this.filteredData = this.filterByLengthRange(min, max);
    return this;
  }

  public wordsByTags(tags: string[], matchAll: boolean = true): WordDescription[] {
    const taggedWords: WordDescription[] = [];
  
    // Iterate through the data Map and filter words by tags
    this.data.forEach((wordDescription) => {
      if (wordDescription.tags) {
        if (matchAll) {
          // Check if word contains all tags (prefix match)
          if (tags.every(tag => wordDescription.tags!.some(wordTag => wordTag.startsWith(tag)))) {
            taggedWords.push(wordDescription);
          }
        } else {
          // Check if word contains at least one of the tags (prefix match)
          if (tags.some(tag => wordDescription.tags!.some(wordTag => wordTag.startsWith(tag)))) {
            taggedWords.push(wordDescription);
          }
        }
      }
    });
  
    return taggedWords;
  }

  // Reset filtering
  public reset(): this {
    const minLength = this.options?.wordMinLength ?? Dictionary.MIN_WORD_LENGTH;
    const maxLength = this.options?.wordMaxLength ?? Dictionary.MAX_WORD_LENGTH;
    this.filteredData = this.filterByLengthRange(minLength, maxLength);
    return this;
  }
}
