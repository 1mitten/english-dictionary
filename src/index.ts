import { analyzeWord } from "./Analysis";
import { Dictionary, WordDescription } from "./Dictionary";


async function start(){
  const dictionary = new Dictionary({
    maskWordInDescription: '*'
  });
  
  const words = dictionary.getRandomWords(3);
  
  console.log(analyzeWord(words[1].description));
  console.log(words[1].description);
  console.log(words[1].word[0].toUpperCase() + words[1].word[1].toUpperCase());
  console.log(words[1].word.length)
  await pause(10000);
  console.log(words[1].word);

}

start();

async function pause(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}




