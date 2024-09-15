# english-dictionary

Contains a queryable english dictionary with descriptions, and also to pull data using tags.

Datasets are preloaded with default tagging and is cross referenced to tag the dictionary against existing words.  
for a variety of use cases such as:-

- Word Games
- For English Dictionary lookup
- To inject your own data and use
- To create an export or migration of data 
- Use of a taggable word

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

'countries' is also included by default
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
