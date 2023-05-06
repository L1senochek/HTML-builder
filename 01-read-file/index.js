const fs = require('fs');
const path = require('path');
const pathFile = path.join(__dirname, 'text.txt');
const createReadStream = fs.createReadStream(pathFile, 'utf-8');

createReadStream.pipe(process.stdout);
