/**
 * Fetch real drug data from the OpenFDA NDC API and insert into MongoDB.
 *
 * Usage:
 *   node src/seed/fetchMedicines.js               # add up to 80 medicines (10/category)
 *   node src/seed/fetchMedicines.js --limit 5     # add up to 40 medicines (5/category)
 *   node src/seed/fetchMedicines.js --clear       # clear existing medicines first, then fetch
 */
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import Medicine from '../models/Medicine.js';
import { FACILITIES } from '../constants/medicineOptions.js';

dotenv.config();

// --- CLI args ---
const argv = process.argv.slice(2);
const limitIdx = argv.indexOf('--limit');
const PER_CATEGORY = limitIdx !== -1 ? parseInt(argv[limitIdx + 1], 10) || 10 : 10;
const CLEAR_FIRST = argv.includes('--clear');

// --- OpenFDA NDC endpoint ---
const OPENFDA_NDC = 'https://api.fda.gov/drug/ndc.json';

// One OpenFDA pharm_class search term per category
const CATEGORY_QUERIES = [
  { category: 'Antibiotics',    term: 'antibacterial' },
  { category: 'Analgesics',     term: 'analgesic' },
  { category: 'Cardiovascular', term: 'cardiovascular' },
  { category: 'Endocrine',      term: 'antidiabetic' },
  { category: 'Respiratory',    term: 'bronchodilator' },
  { category: 'Vaccines',       term: 'vaccine' },
  { category: 'Neurology',      term: 'antiepileptic' },
  { category: 'Other',          term: 'antihistamine' },
];

// Map OpenFDA dosage_form → Medicine.unitType enum
const FORM_TO_UNIT = {
  TABLET:     'Tablets (bx)',
  TABLETS:    'Tablets (bx)',
  CAPSULE:    'Capsules (bx)',
  CAPSULES:   'Capsules (bx)',
  SUSPENSION: 'Suspension (btl)',
  SOLUTION:   'Bottles (btl)',
  SYRUP:      'Bottles (btl)',
  LIQUID:     'Bottles (btl)',
  INJECTION:  'Vials (vial)',
  INJECTABLE: 'Vials (vial)',
  VIAL:       'Vials (vial)',
  INHALATION: 'Inhalers (unit)',
  INHALER:    'Inhalers (unit)',
  AEROSOL:    'Inhalers (unit)',
  SPRAY:      'Inhalers (unit)',
  BLISTER:    'Blisters (bls)',
};

function mapUnitType(dosageForm = '') {
  const key = dosageForm.toUpperCase().split(/[\s,/]+/)[0];
  return FORM_TO_UNIT[key] ?? 'Tablets (bx)';
}

function mapStorageNote(dosageForm = '', category = '') {
  const f = dosageForm.toUpperCase();
  if (category === 'Vaccines' || f.includes('INJECT') || f.includes('VIAL')) {
    return 'Refrigerate between 2-8°C. Do not freeze.';
  }
  if (f.includes('INHAL') || f.includes('AEROSOL') || f.includes('SPRAY')) {
    return 'Store below 25°C. Do not puncture or incinerate.';
  }
  return 'Store below 25°C, protect from moisture.';
}

function toTitleCase(str) {
  return (str || '').toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase());
}

// Generate a short code from the generic name + strength (e.g. "AMX-500")
function genCode(genericName, strength) {
  const letters = (genericName || '').replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase() || 'MED';
  const digits = (strength || '').match(/\d+/)?.[0];
  return digits ? `${letters}-${digits}` : letters;
}

// Distribute stock randomly across the 3 facilities
function randomStock() {
  const total = Math.floor(Math.random() * 4500) + 500; // 500–5000
  const reorderLevel = Math.floor(total * (0.2 + Math.random() * 0.3));
  const a = Math.floor(total * 0.5);
  const b = Math.floor(total * 0.3);
  const c = total - a - b;
  return {
    totalStock: total,
    reorderLevel,
    stockByFacility: FACILITIES.map((facility, i) => ({ facility, stock: [a, b, c][i] })),
  };
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchCategory({ category, term }, limit) {
  const url = `${OPENFDA_NDC}?search=pharm_class:${encodeURIComponent(term)}&limit=${limit}`;
  try {
    const resp = await fetch(url);
    // OpenFDA returns 404 JSON when no results found — not an error we need to crash on
    if (resp.status === 404) {
      console.warn(`  [warn] ${category}: no results for term "${term}"`);
      return [];
    }
    if (!resp.ok) {
      console.warn(`  [warn] ${category}: HTTP ${resp.status} from OpenFDA`);
      return [];
    }
    const json = await resp.json();
    if (json.error) {
      console.warn(`  [warn] ${category}: ${json.error.message}`);
      return [];
    }
    return (json.results || []).map((item) => {
      const genericName = item.generic_name || item.brand_name || 'Unknown';
      const strength = item.active_ingredients?.[0]?.strength || '';
      return {
        code: genCode(genericName, strength),
        name: strength ? `${toTitleCase(genericName)} ${strength}` : toTitleCase(genericName),
        category,
        manufacturer: item.labeler_name || 'Unknown Manufacturer',
        unitType: mapUnitType(item.dosage_form),
        unitPrice: +(Math.random() * 45 + 1).toFixed(2),
        storageNotes: mapStorageNote(item.dosage_form, category),
        ...randomStock(),
      };
    });
  } catch (err) {
    console.warn(`  [warn] ${category}: fetch error — ${err.message}`);
    return [];
  }
}

async function main() {
  await connectDB();

  if (CLEAR_FIRST) {
    console.log('Clearing existing medicines...');
    await Medicine.deleteMany({});
  }

  // Load existing names + codes so we can skip duplicates
  const existing = await Medicine.find({}, { name: 1, code: 1 }).lean();
  const existingNames = new Set(existing.map((m) => m.name.toLowerCase()));
  const usedCodes = new Set(existing.map((m) => m.code));

  console.log(`Fetching ${PER_CATEGORY} drugs/category from OpenFDA NDC API...\n`);

  const raw = [];
  for (const q of CATEGORY_QUERIES) {
    process.stdout.write(`  ${q.category}...`);
    const results = await fetchCategory(q, PER_CATEGORY);
    console.log(` ${results.length} results`);
    raw.push(...results);
    await sleep(200); // stay well within 240 req/min rate limit
  }

  // 1. Deduplicate by lowercase name (skip names already in DB)
  const seenNames = new Set();
  const deduped = raw.filter((m) => {
    const key = m.name.toLowerCase();
    if (seenNames.has(key) || existingNames.has(key)) return false;
    seenNames.add(key);
    return true;
  });

  // 2. Ensure every code is unique (append -2, -3 … on collision)
  for (const m of deduped) {
    const base = m.code;
    let code = base;
    let suffix = 2;
    while (usedCodes.has(code)) {
      code = `${base}-${suffix++}`;
    }
    m.code = code;
    usedCodes.add(code);
  }

  console.log(`\nInserting ${deduped.length} new medicines into MongoDB...`);
  let inserted = 0;
  for (const med of deduped) {
    try {
      await Medicine.create(med);
      inserted++;
    } catch (err) {
      console.warn(`  [skip] ${med.name} (${med.code}) — ${err.message}`);
    }
  }

  console.log(`\nDone. Inserted ${inserted} / ${deduped.length} medicines.`);
  if (existing.length > 0 && !CLEAR_FIRST) {
    console.log(`(${existing.length} existing medicines were preserved)`);
  }

  await mongoose.connection.close();
  process.exit(0);
}

main().catch((err) => {
  console.error('fetchMedicines failed:', err);
  process.exit(1);
});
