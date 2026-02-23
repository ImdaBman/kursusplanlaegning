import * as XLSX from 'xlsx';

// ── Konstanter ────────────────────────────────────────────────
const DANISH_WEEKDAYS = {
  mandag: 1, tirsdag: 2, onsdag: 3, torsdag: 4,
  fredag: 5, lørdag: 6, søndag: 0,
};

const DANISH_MONTHS_SHORT = {
  jan: 1, feb: 2, mar: 3, apr: 4, maj: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, okt: 10, nov: 11, dec: 12,
};

const DANISH_MONTHS_FULL = {
  januar: 1, februar: 2, marts: 3, april: 4, maj: 5, juni: 6,
  juli: 7, august: 8, september: 9, oktober: 10, november: 11, december: 12,
};

// ── Hjælpefunktioner ──────────────────────────────────────────

function toISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Returnerer ugedagsnummer (JS-format: 0=søndag, 1=mandag …) eller null
function getDanishWeekday(str) {
  const s = str.trim().toLowerCase();
  for (const [name, jsDay] of Object.entries(DANISH_WEEKDAYS)) {
    if (s.startsWith(name)) return jsDay;
  }
  return null;
}

// Finder næste forekomst af ugedag *efter* fromDate
function nextWeekdayAfter(fromDate, targetJsDay) {
  const d = new Date(fromDate);
  d.setDate(d.getDate() + 1);
  while (d.getDay() !== targetJsDay) {
    d.setDate(d.getDate() + 1);
  }
  return d;
}

// Parser "24. feb." / "24. februar" / "24.02.2025" / "2025-02-24"
// Returnerer Date-objekt eller null
function parseStartDate(str) {
  if (!str) return null;
  const s = str.trim();

  // ISO: 2025-02-24
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return new Date(parseInt(iso[1]), parseInt(iso[2]) - 1, parseInt(iso[3]));

  // dd.mm.yyyy eller dd/mm/yyyy (4-cifret år, dag først)
  const ddmmyyyy = s.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})/);
  if (ddmmyyyy) return new Date(parseInt(ddmmyyyy[3]), parseInt(ddmmyyyy[2]) - 1, parseInt(ddmmyyyy[1]));

  // M/D/YY eller M/D/YYYY (Excel US-format: måned/dag/år)
  const us = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
  if (us) {
    const m = parseInt(us[1]);
    const d = parseInt(us[2]);
    let y = parseInt(us[3]);
    if (y < 100) y += 2000;
    if (m >= 1 && m <= 12 && d >= 1 && d <= 31) return new Date(y, m - 1, d);
  }

  // "24. feb." eller "24. februar"
  const shortMatch = s.match(
    /(\d{1,2})\.\s*(jan|feb|mar|apr|maj|jun|jul|aug|sep|okt|nov|dec)\.?/i
  );
  if (shortMatch) {
    const d = parseInt(shortMatch[1]);
    const m = DANISH_MONTHS_SHORT[shortMatch[2].toLowerCase()];
    // Brug explicit årstal hvis til stede, ellers infer
    const yearMatch = s.match(/\b(20\d{2})\b/);
    const now = new Date();
    let y = now.getFullYear();
    if (yearMatch) {
      y = parseInt(yearMatch[1]);
    } else {
      // Hvis måneden allerede er passeret i år, brug næste år
      const candidate = new Date(y, m - 1, d);
      if (candidate < now && (now - candidate) > 7 * 24 * 3600 * 1000) {
        y = now.getFullYear() + 1;
      }
    }
    return new Date(y, m - 1, d);
  }

  // "24. januar 2025"
  const fullMatch = s.match(
    /(\d{1,2})\.\s*(januar|februar|marts|april|maj|juni|juli|august|september|oktober|november|december)\s*(\d{4})?/i
  );
  if (fullMatch) {
    const d = parseInt(fullMatch[1]);
    const m = DANISH_MONTHS_FULL[fullMatch[2].toLowerCase()];
    const now = new Date();
    let y = fullMatch[3] ? parseInt(fullMatch[3]) : now.getFullYear();
    return new Date(y, m - 1, d);
  }

  return null;
}

// ── Hoved-eksport ─────────────────────────────────────────────

export async function extractDatesFromFile(file) {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });
  let preview = [];

  const seen = new Set();
  const results = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    // Læs som 2D-array, alle celler som tekst
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: '' });

    // Saml rækker med kolonne A og B
    const entries = rows.map(row => ({
      a: String(row[0] || '').trim(),
      b: String(row[1] || '').trim(),
    })).filter(e => e.a.length > 0);

    const colA = entries.map(e => e.a);
    console.log('[csvParser] Kolonne A (første 10):', colA.slice(0, 10));
    if (preview.length === 0) preview = colA.slice(0, 5);

    if (colA.length === 0) continue;

    // ── Forsøg 1: startdato + ugedagssekvens ──────────────────
    const startDate = parseStartDate(entries[0].a);

    if (startDate) {
      let currentDate = startDate;
      const dateStr = toISO(currentDate);
      if (!seen.has(dateStr)) {
        seen.add(dateStr);
        results.push({ date: dateStr, raw: entries[0].a, suggestedTitle: entries[0].b || null });
      }

      for (let i = 1; i < entries.length; i++) {
        const { a: cell, b: titleCell } = entries[i];
        const weekdayJsDay = getDanishWeekday(cell);
        if (weekdayJsDay !== null) {
          currentDate = nextWeekdayAfter(currentDate, weekdayJsDay);
          const ds = toISO(currentDate);
          if (!seen.has(ds)) {
            seen.add(ds);
            results.push({ date: ds, raw: cell, suggestedTitle: titleCell || null });
          }
        } else {
          // Ny startdato midt i listen?
          const newStart = parseStartDate(cell);
          if (newStart) {
            currentDate = newStart;
            const ds = toISO(currentDate);
            if (!seen.has(ds)) {
              seen.add(ds);
              results.push({ date: ds, raw: cell, suggestedTitle: titleCell || null });
            }
          }
        }
      }

      if (results.length > 0) continue; // Fandt datoer — hop videre til næste ark
    }

    // ── Forsøg 2: scan alle celler for eksplicitte datoer ─────
    for (const row of rows) {
      for (const cell of row) {
        const s = String(cell || '').trim();
        const d = parseStartDate(s);
        if (d) {
          const ds = toISO(d);
          if (!seen.has(ds)) {
            seen.add(ds);
            results.push({ date: ds, raw: s, suggestedTitle: null });
          }
        }
      }
    }
  }

  return {
    dates: results.sort((a, b) => a.date.localeCompare(b.date)),
    preview,
  };
}
