const fs = require('fs');
const path = require('path');
const { basename } = require('path');
const headerPath = path.join(__dirname, 'components', 'header.html');
const articlesPath = path.join(__dirname, 'components', 'articles.html');
const footerPath = path.join(__dirname, 'components', 'footer.html');
const indexPath = path.join(__dirname, 'project-dist', 'index.html');
const templatePath = path.join(__dirname, 'template.html');
const projectDistPath = path.join(__dirname, 'project-dist');
const stylesPath = path.join(__dirname, 'styles');
const styleBundle = path.join(projectDistPath, 'style.css');
const from = path.join(__dirname, 'assets');
const to = path.join(__dirname, 'project-dist', 'assets');

async function createIndexFile() {
  try {
    await fs.promises.mkdir(projectDistPath);
    console.log(`${basename(projectDistPath)} folder successfully created!`);

    const header = await fs.promises.readFile(headerPath, 'utf-8');
    const articles = await fs.promises.readFile(articlesPath, 'utf-8');
    const footer = await fs.promises.readFile(footerPath, 'utf-8');
    let template = await fs.promises.readFile(templatePath, 'utf-8');

    const headerLines = header.split('\n');
    const headerFirstLine = headerLines[0];
    const headerWithoutFirst = headerLines.slice(1).map(line => '    ' + line).join('\n');

    const articlesLines = articles.split('\n');
    const articlesFirstLine = articlesLines[0];
    const articlesWithoutFirst = articlesLines.slice(1).map(line => '    ' + line).join('\n');
    
    const footerLines = footer.split('\n');
    const footerFirstLine = footerLines[0];
    const footerWithoutFirst = footerLines.slice(1).map(line => '    ' + line).join('\n');

    template = template.replace('{{header}}', headerFirstLine + '\n' + headerWithoutFirst);
    template = template.replace('{{articles}}', articlesFirstLine + '\n' + articlesWithoutFirst);
    template = template.replace('{{footer}}', footerFirstLine + '\n' + footerWithoutFirst);

    await fs.promises.writeFile(indexPath, template);
    console.log(`${basename(indexPath)} file successfully created!`);
  } catch (error) {
    console.error(error);
  }
}

createIndexFile();

// bundle

fs.unlink(styleBundle, (error) => {
  if (error){};
  makeBundle();
});

async function makeBundle() {
  const writeStream = fs.createWriteStream(styleBundle);
  try {
    const cssArr = ['header.css', 'main.css', 'footer.css'];
    for (const cssFile of cssArr) {
      const filePath = path.join(stylesPath, cssFile);
      const readStream = fs.createReadStream(filePath);
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
    console.log(`All css files have been merged into ${basename(styleBundle)}!`);
  } catch (error) {
    console.error(error);
  }
}

// copy 

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
