const fs = require('fs');
const path = require('path');
const { basename } = require('path');
const stylesPath = path.join(__dirname, 'styles');
const projectDist = path.join(__dirname, 'project-dist');
const bundle = path.join(projectDist, 'bundle.css');
const cssArr = [];

fs.unlink(bundle, (error) => {
  if (error){};
  makeBundle();
});

async function makeBundle() {
  const writeStream = fs.createWriteStream(bundle);
  try {
    const files = await fs.promises.readdir(stylesPath);
    for (const file of files) {
      const filePath = path.join(stylesPath, file);
      const fileInfo = await fs.promises.stat(filePath);
      if (fileInfo.isFile() && path.extname(filePath) === '.css') {
        cssArr.push(filePath);
      }
    }
    for (const cssFile of cssArr) {
      const readStream = fs.createReadStream(cssFile);
      for await (const chunk of readStream) {
        const firstLine = chunk.toString().split('\n')[0];
        if (firstLine.trim() === '') {
          chunk = chunk.slice(chunk.indexOf('\n') + 1);
        }
        writeStream.write(chunk);
      }
      if (cssFile !== cssArr[cssArr.length - 1]) {
        writeStream.write('\n');
      }
    }
    console.log(`All css files have been merged into ${basename(bundle)}!`);
  } catch (error) {
    console.error(error);
  }
}
