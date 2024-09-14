// Define the structure for Word Analysis result
type WordAnalysis = {
    word: string;
    syllableCount: number;
    length: number;
    containsRareLetters: boolean;
    complexityScore: number; // Aggregate of other factors
  };
  
  // Set of rare letters that are less commonly used in English
  const rareLetters = new Set(['q', 'x', 'z', 'j', 'k']);
  
  // Function to count syllables in a word
  function countSyllables(word: string): number {
    word = word.toLowerCase();
    const syllablePattern = /[aeiouy]+/g;
    const syllables = word.match(syllablePattern) || [];
    return syllables.length;
  }
  
  // Function to return the length of a word
  function wordLength(word: string): number {
    return word.length;
  }
  
  // Function to check if the word contains any rare letters
  function containsRareLetters(word: string): boolean {
    return word.split('').some(letter => rareLetters.has(letter.toLowerCase()));
  }
  
  // Function to analyze a word's complexity based on syllables, length, and rare letters
  export function analyzeWord(word: string): WordAnalysis {
    const syllables = countSyllables(word);
    const length = wordLength(word);
    const rareLettersPresent = containsRareLetters(word);
  
    // Define a complexity score combining syllables, length, and rare letters
    let complexityScore = syllables;
  
    // Add to complexity if the word length is more than 7 characters
    if (length > 7) {
      complexityScore += 1;
    }
  
    // Add to complexity if the word contains rare letters
    if (rareLettersPresent) {
      complexityScore += 1;
    }
  
    return {
      word,
      syllableCount: syllables,
      length,
      containsRareLetters: rareLettersPresent,
      complexityScore
    };
  }

  