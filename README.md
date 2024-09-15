[**english-dictionary**](../../README.md) • **Docs**

***

[english-dictionary](../../README.md) / [Dictionary](../README.md) / Dictionary

# Class: Dictionary

Creating a default instance will load an existing English Dictionary with descriptions,
Datasets are preloaded that tag the dictionary against existing words.

```ts
Note: Case insensitive, everything is lowercased

const dictionary = new Dictionary() 

dictionary.find('monkey')                   // Simple lookup, 
dictionary.findMany(['ApPle','MONKEY'])     // Multiple lookup
dictionary.findByPrefix('pre').get()        // can be chained, uses in memory filtered data
dictionary.findBySubstring('pot').get()     // can be chained, uses in memory filtered data
dictionary.findBySuffix('ing').get()        // can be chained, uses in memory filtered data
dictionary.findByWordLengthRange(3,5).get() // can be chained, The min and max length of the words

// example chain
dictionary.findBySuffix('ing').findByWordLengthRange(1,5).get();


dictionary.reset()                          // reset the filtered data
// Accepts multiple tags    default:true sets to AND behaviour, false to OR behaviour
dictionary.findWordsByTags(['objects','animals'],true)

['verb','noun','adjectives','adverbs',
'common','stopwords',
'objects','vehicles','animals','weapon','fabrics','flower','passages','rooms','vegetables'] are some examples

'countries' is also included by default

```



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

## Constructors

### new Dictionary()

> **new Dictionary**(`options`, `words`?): [`Dictionary`](Dictionary.md)

#### Parameters

• **options**: [`Options`](../../types/Options.type/type-aliases/Options.md) = `defaultOptions`

Options

• **words?**: [`WordMetadata`](../../types/WordMetadata.type/type-aliases/WordMetadata.md)[]

WordMetadata[] that requires { word: 'apple', description: 'something' } minimum

#### Returns

[`Dictionary`](Dictionary.md)

#### Defined in

Dictionary.ts:44

## Properties

### options

> **options**: [`Options`](../../types/Options.type/type-aliases/Options.md) = `defaultOptions`

Options

#### Defined in

Dictionary.ts:45

***

### words?

> `optional` **words**: [`WordMetadata`](../../types/WordMetadata.type/type-aliases/WordMetadata.md)[]

WordMetadata[] that requires { word: 'apple', description: 'something' } minimum

#### Defined in

Dictionary.ts:46

## Methods

### exportToJsonString()

> **exportToJsonString**(`removeNullValues`): `string`

Exports to stringed JSON

#### Parameters

• **removeNullValues**: `boolean` = `true`

default = true, set to false to retain null values

#### Returns

`string`

stringified JSON

#### Defined in

Dictionary.ts:346

***

### filter()

> **filter**(`regex`): `this`

Filtering in memory using a regex, call get() for data

#### Parameters

• **regex**: `RegExp`

#### Returns

`this`

this for chaining

#### Defined in

Dictionary.ts:173

***

### find()

> **find**(`word`): `undefined` \| [`WordMetadata`](../../types/WordMetadata.type/type-aliases/WordMetadata.md)

Find a single word

#### Parameters

• **word**: `string`

#### Returns

`undefined` \| [`WordMetadata`](../../types/WordMetadata.type/type-aliases/WordMetadata.md)

WordMetadata | undefined

#### Defined in

Dictionary.ts:188

***

### findByPrefix()

> **findByPrefix**(`prefix`): `this`

Filter words by prefix, IE 'pra' will return pray, prayer and prat.

#### Parameters

• **prefix**: `string`

#### Returns

`this`

this for chaining

#### Defined in

Dictionary.ts:236

***

### findBySubstring()

> **findBySubstring**(`substring`): `this`

Filter words by a substring, For example pot will return pot, spot and spotty.

#### Parameters

• **substring**: `string`

#### Returns

`this`

this for chaining

#### Defined in

Dictionary.ts:265

***

### findBySuffix()

> **findBySuffix**(`suffix`): `this`

Filter words by suffix, For example 'ing' will return returning, praying and running.

#### Parameters

• **suffix**: `string`

#### Returns

`this`

this for chaining

#### Defined in

Dictionary.ts:251

***

### findByWordLengthRange()

> **findByWordLengthRange**(`min`, `max`): `this`

Find words based on their length range, applies to filtered data

#### Parameters

• **min**: `number`

• **max**: `number`

#### Returns

`this`

this for chaining

#### Defined in

Dictionary.ts:281

***

### findMany()

> **findMany**(`words`): [`WordMetadata`](../../types/WordMetadata.type/type-aliases/WordMetadata.md)[]

For finding multiple entries at once with a range of words

#### Parameters

• **words**: `string`[]

#### Returns

[`WordMetadata`](../../types/WordMetadata.type/type-aliases/WordMetadata.md)[]

WordMetadata[]

#### Defined in

Dictionary.ts:198

***

### findWordsByTags()

> **findWordsByTags**(`tags`, `matchAll`): [`WordMetadata`](../../types/WordMetadata.type/type-aliases/WordMetadata.md)[]

Finds words by an array of tags, using OR or AND

#### Parameters

• **tags**: `string`[]

An array of tags

• **matchAll**: `boolean` = `true`

If set to true, will enforce AND but if set to false will enforce an OR

#### Returns

[`WordMetadata`](../../types/WordMetadata.type/type-aliases/WordMetadata.md)[]

WordMetadata[]

#### Defined in

Dictionary.ts:308

***

### findWordsWithClues()

> **findWordsWithClues**(): [`WordMetadata`](../../types/WordMetadata.type/type-aliases/WordMetadata.md)[]

Finds words that have clues, for use in games

#### Returns

[`WordMetadata`](../../types/WordMetadata.type/type-aliases/WordMetadata.md)[]

WordMetadata[]

#### Defined in

Dictionary.ts:290

***

### get()

> **get**(): [`WordMetadata`](../../types/WordMetadata.type/type-aliases/WordMetadata.md)[]

To get filtered data based on previous chained functions

#### Returns

[`WordMetadata`](../../types/WordMetadata.type/type-aliases/WordMetadata.md)[]

WordMetadata[]

#### Defined in

Dictionary.ts:208

***

### getArray()

> **getArray**(): `string`[]

To retrieve filtered data as a single list of words

#### Returns

`string`[]

string[]

#### Defined in

Dictionary.ts:216

***

### getRandomWords()

> **getRandomWords**(`count`): [`WordMetadata`](../../types/WordMetadata.type/type-aliases/WordMetadata.md)[]

Retrieve random words from filtered values

#### Parameters

• **count**: `number`

#### Returns

[`WordMetadata`](../../types/WordMetadata.type/type-aliases/WordMetadata.md)[]

WordMetadata[]

#### Defined in

Dictionary.ts:225

***

### reset()

> **reset**(): `this`

Reset the filtered data

#### Returns

`this`

this

#### Defined in

Dictionary.ts:365
