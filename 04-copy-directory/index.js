const fs = require('fs');
const path = require('path');
const { basename } = require('path');
const from = path.join(__dirname, 'files');
const to = path.join(__dirname, 'files-copy');

fs.rm(to, { recursive: true }, (error) => {
  if (error) return;
});

async function copyFolder(from, to) {
  try {
    await fs.promises.mkdir(to, { recursive: true });
    const files = await fs.promises.readdir(from);
    for (const file of files) {
      const fromFilePath = path.join(from, file);
      const toFilePath = path.join(to, file);
      const fileInfo = await fs.promises.stat(fromFilePath);
      if (fileInfo.isFile()) {
        await fs.promises.copyFile(fromFilePath, toFilePath);
      } else if (fileInfo.isDirectory()) {
        await copyFolder(fromFilePath, toFilePath);
      }
    }
    console.log(`Folder ${basename(from)} copied to ${basename(to)}`);
  } catch (error) {
    console.error(`The copying folder ${basename(from)} wasn\`t completed: ${error}`);
  }
}

copyFolder(from, to);
