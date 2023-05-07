const fs = require('fs');
const path = require('path');
const pathFile = path.join(__dirname, 'text.txt');
const readline = require('node:readline');
const { stdin: input, stdout: output, } = require('node:process');
const consoleReadLine = readline.createInterface({ input, output });
let text = '';

fs.truncate(pathFile, 0, (error) => {
  if (error) return;
});

function saveTextToFile() {
  fs.appendFile(pathFile, text, (error) => {
    if (error) throw error;
    if (text) console.log(`\nAdded to file: ${text}`);
  });
}
saveTextToFile();

consoleReadLine.question('\nInsert text: ', (answer) => {
  if (answer === 'exit') {
    console.log('\nBye!');
    consoleReadLine.close();
    return;
  } else {
    text = answer + '\n';
    saveTextToFile();
  }
  consoleReadLine.on('line', (line) => {
    if (line === 'exit') {
      console.log('\nBye!');
      consoleReadLine.close();
      return;
    } else {
      text = line + '\n';
      saveTextToFile();
    }
  });
});

consoleReadLine.on('SIGINT', () => {
  console.log('Bye!');
  consoleReadLine.close();
});
