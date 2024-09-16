export type Metrics = {
  totalWords: number;
  dictionaryWords: number;
  nonDictionaryWords: number;
  wordsByLength: { length: number; count: number; }[];  // Changed to array
  tags: { tag: string; count: number; }[];  
};
