import { analyzeWord } from "./Analysis";
import readline from 'readline';
import { Dictionary } from "./Dictionary";

const dictionary = new Dictionary({
  wordMinLength: 5,
  wordMaxLength: 7,
  maskWordInDescription: '*'
});

 async function start(){


  const words = dictionary.wordsByTags(['mood']);
  console.log(words);
  // const anal = analyzeWord(words[1].word);
  // const wordDesc = words[1];
  // const displayWord = wordDesc.word.slice(0, 3) + '_'.repeat(wordDesc.word.length - 3);

  // console.log(``);
  // console.log(`********************`);
  // console.log(``);
  // console.log('Complexity', anal.complexityScore);
  // console.log(`Length: ${wordDesc.word.length}`)
  // console.log(``);
  // console.log(wordDesc.description);
  // console.log();
  // console.log(displayWord);
  // await awaitKeyPress();
  // console.log(anal.word)
  // await awaitKeyPress();
  // start();

}

start();

async function awaitKeyPress(): Promise<string> {
  return new Promise((resolve) => {
    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);

    const onKeyPress = (str: string) => {
      process.stdin.setRawMode(false);
      process.stdin.removeListener('data', onKeyPress);
      resolve(str); // Resolve the promise with the key pressed
    };

    process.stdin.on('data', onKeyPress);
  });
}



