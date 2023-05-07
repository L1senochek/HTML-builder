const fs = require('fs');
const path = require('path');
const pathFolder = path.join(__dirname, 'secret-folder');

fs.readdir(pathFolder, { withFileTypes: true }, (error, files) => {
  if (error) {
    console.error(error);
    return;
  }

  files.forEach(async (file) => {
    if (file.isFile()) {
      const filePath = path.join(pathFolder, file.name);
      const fileStats = await fs.promises.stat(filePath);
      const fileSize = fileStats.size;
      console.log(`${file.name} - ${path.extname(file.name).slice(1)} - ${(fileSize / 1024).toFixed(2)} kb`);
    } else {
      return;
    }
  });
});
