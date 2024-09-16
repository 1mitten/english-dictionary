import { WordMetadata } from "./types/WordMetadata.type";

export const wordDescs: WordMetadata[] = [
    {
      word: "apple",
      description: "A fruit",
      clues: ["It can be red or green, a apple"],
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
      description: "A type of date fruit",
      isDictionaryWord: true,
    },
    {
      word: "elephant",
      description: "A large animal elephant",
      isDictionaryWord: true,
    }
  ];

export function createRandomData(count: number = 10000): WordMetadata[] {
    const data: WordMetadata[] = [];

    for(let i=0;i < count;i++){
        const randomString =  
        data.push({
            word: getRandomString(),
            description: `${getRandomString()} placeholder ${getRandomString} `,
            isDictionaryWord: true,
        });
    }
    return data;
}

export function getRandomString(length: number = 6): string{
   return Math.random().toString(36).substring(2, 2 + length);
}