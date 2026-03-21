const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');

function readDb(filename) {
  const filePath = path.join(DATA_DIR, `${filename}.json`);
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function writeDb(filename, data) {
  ensureDir(); // 👈 add this

  const filePath = path.join(DATA_DIR, `${filename}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

module.exports = { readDb, writeDb };
