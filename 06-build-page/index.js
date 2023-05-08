const fs = require('fs');
const path = require('path');
const { basename } = require('path');
const util = require('util');
const rm = util.promisify(fs.rm);
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
const cssArr = [];
const componentsPath = path.join(__dirname, 'components');

async function createIndexFile() {
  try {
    try {
      await fs.promises.access(projectDistPath);
      console.log(`${basename(projectDistPath)} folder already exists!`);
    } catch {
      await fs.promises.mkdir(projectDistPath);
      console.log(`${basename(projectDistPath)} folder successfully created!`);
    }

    let template = await fs.promises.readFile(templatePath, 'utf-8');
    const header = await fs.promises.readFile(headerPath, 'utf-8');
    const articles = await fs.promises.readFile(articlesPath, 'utf-8');
    const footer = await fs.promises.readFile(footerPath, 'utf-8');

    const headerLines = header.split('\n');
    const headerFirstLine = headerLines[0];
    const headerWithoutFirst = headerLines.slice(1).map(line => '    ' + line).join('\n');

    const articlesLines = articles.split('\n');
    const articlesFirstLine = articlesLines[0];
    const articlesWithoutFirst = articlesLines.slice(1).map(line => '      ' + line).join('\n');
    
    const footerLines = footer.split('\n');
    const footerFirstLine = footerLines[0];
    const footerWithoutFirst = footerLines.slice(1).map(line => '    ' + line).join('\n');

    template = template.replace('{{header}}', headerFirstLine + '\n' + headerWithoutFirst);
    template = template.replace('{{articles}}', articlesFirstLine + '\n' + articlesWithoutFirst);
    template = template.replace('{{footer}}', footerFirstLine + '\n' + footerWithoutFirst);

    const componentFiles = await fs.promises.readdir(componentsPath);

    let isFirstComponent = true;
    for (const componentFile of componentFiles) {
      const componentName = path.basename(componentFile, '.html');
      const componentContent = await fs.promises.readFile(path.join(componentsPath, componentFile), 'utf-8');
      let startIndex = 0;

      while (true) {
        startIndex = template.indexOf(`{{${componentName}}}`, startIndex);
        if (startIndex === -1) break;

        const endIndex = startIndex + `{{${componentName}}}`.length;
        const indentedComponentContent = componentContent.split('\n').map(line => `    ${line}`).join('\n');

        if (isFirstComponent) {
          template = `${template.slice(0, startIndex)}${indentedComponentContent.slice(4, indentedComponentContent.length - 6)}${template.slice(endIndex)}`;
          isFirstComponent = false;
        } else {
          template = `${template.slice(0, startIndex - 1)}\n${indentedComponentContent}${template.slice(endIndex)}`;
        }
      }
    }
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
    console.log(`All css files have been merged into ${basename(styleBundle)}!`);
  } catch (error) {
    console.error(error);
  }
}

// copy 

async function removeFolder() {
  try {
    await rm(to, { recursive: true });
    console.log(`Folder ${to} removed`);
  } catch (error) {
    console.error(`The removing folder ${to} wasn\`t completed: ${error}`);
  }
}

async () => {
  await removeFolder();
}

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
