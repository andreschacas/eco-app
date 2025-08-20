import fs from 'fs';
import path from 'path';

function listFilesAndFolders(dirPath) {
  const excludeFolders = ['node_modules', '.git']; // Lista de carpetas a excluir
  const items = fs.readdirSync(dirPath);
  items.forEach((item) => {
    const fullPath = path.join(dirPath, item);
    const stats = fs.statSync(fullPath);
    if (stats.isDirectory()) {
      if (!excludeFolders.includes(item)) {
        listFilesAndFolders(fullPath); // Recursively list subfolders
      }
    } else {
      console.log(`File: ${item}`);
    }
  });
}

// Start from the current directory
listFilesAndFolders(process.cwd());