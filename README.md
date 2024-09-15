# english-dictionary

[![english-dictionary](https://github.com/1mitten/english-dictionary/actions/workflows/ci.yml/badge.svg)](https://github.com/1mitten/english-dictionary/actions/workflows/ci.yml)

This package provides a queryable English dictionary with descriptions, enriched by tags for various use cases. It comes preloaded with datasets that are cross-referenced to tag existing words and allowing for flexible querying.

Key Features:
- Word Lookup: Search for words with detailed descriptions.
- Tagging System: Filter and query words using predefined tags (e.g., verbs, nouns, adjectives).
- Custom Data: Inject your own word metadata and tags for custom use cases.
- Export Data: Generate exports or migrations of the dictionary and associated tags.
Use Cases:
- Word Games: Create games by querying words with specific tags.
- Content Generation: Use tags and word data to generate content.
- Dictionary Lookup: Perform traditional English dictionary lookups.
- Custom Datasets: Inject and use your own datasets to extend functionality.

<h5>Create new instance and perform a simple word find</h5>

```ts
const dictionary = new Dictionary();
dictionary.find('cat');
```

Returns
```ts
{
  word: 'cat',
  description: 'Tagged with animal',
  isDictionaryWord: false,
  tags: [ 'animal', 'common', 'object' ]
}
```

<h5>Multiple Lookup for words</h5>

```ts
dictionary.findMany(['apple','cat']);
```

<h5>Find by multiple tags, true = AND behaviour, false = OR behaviour</h5>

```ts
dictionary.findWordsByTags(['objects','animals'],true);
```

<h5>By Prefix (chainable)</h5>

```ts
dictionary.findByPrefix('pre').get();
```

<h5>Substring (chainable)</h5>

```ts
dictionary.findBySubstring('pot').get()  
```

<h5>Suffix  (chainable)</h5>

```ts
dictionary.findBySuffix('ing').get()        // can be chained, uses in memory filtered data
```

<h5>Chainable methods</h5>

```ts
dictionary.findBySuffix('ing').findByWordLengthRange(1,5).get();
```

<h5>Regex </h5>

```ts
dictionary.filter('^').get();
```

<h6>Example Tags with default dataset</h5>

```ts
['verb','noun','adjectives','adverbs','common','stopwords','objects','vehicles','animals','weapon'
,'fabrics','flower','passages','rooms','vegetables']

'country' is also included by default
```

<h5>Injecting your own data</h5>                 

Creating an instance using your WordMetadata[] will require ```{ word, description }``` as a minimum, you can also send ```tags[]``` and ```clues[]```, 
```ts
const wordsMetadata = [{
 word: 'apple',
 description 'Green thang'
}]
const dictionary = new Dictionary({ 
  wordMinLength: number;                // Minimum length of words
  wordMaxLength: number;                // Maximum length of words
  includeDataFromDatasets?: boolean;    // (Optional) Preloaded datasets that tag data as best possible (verb,noun,adjectives,adverbs,common)
  loadCluesDataset?: boolean;           // (Optional) To include Clues[] for words 3 to 6 in length, for gaming purposes mainly
  maskWordInDescription: '*',           // (Optional) Masks the word within the description, for gaming purposes mainly
 },
 wordsMetadata)
```
