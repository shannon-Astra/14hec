#!/usr/bin/env node
// Adds ailment associations to plants in plants.json
// Usage: node scripts/add-ailment-associations.js < batch.json

const fs = require('fs');
const path = require('path');

const plantsPath = path.join(__dirname, '../src/seed/plants.json');
const plants = JSON.parse(fs.readFileSync(plantsPath, 'utf-8'));

// Read batch data from stdin or from file argument
let batchData;
if (process.argv[2]) {
  batchData = JSON.parse(fs.readFileSync(process.argv[2], 'utf-8'));
} else {
  batchData = JSON.parse(fs.readFileSync('/dev/stdin', 'utf-8'));
}

// batchData is an array of { plant: "Plant Name", associations: [...] }
let added = 0;
let notFound = [];

for (const entry of batchData) {
  const plant = plants.find(p => p.common_name === entry.plant);
  if (!plant) {
    notFound.push(entry.plant);
    continue;
  }
  if (!plant.ailment_associations) {
    plant.ailment_associations = [];
  }
  for (const assoc of entry.associations) {
    // Check for duplicates
    const exists = plant.ailment_associations.some(
      a => a.ailment === assoc.ailment
    );
    if (!exists) {
      plant.ailment_associations.push(assoc);
      added++;
    }
  }
}

fs.writeFileSync(plantsPath, JSON.stringify(plants, null, 2) + '\n');
console.log(`Added ${added} associations. Not found: ${notFound.length ? notFound.join(', ') : 'none'}`);
