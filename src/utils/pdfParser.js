import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).href;

const DANISH_MONTHS = {
  januar: 1, februar: 2, marts: 3, april: 4, maj: 5, juni: 6,
  juli: 7, august: 8, september: 9, oktober: 10, november: 11, december: 12,
};

function parseDateString(raw) {
  // dd.mm.yyyy or dd/mm/yyyy
  const numMatch = raw.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})$/);
  if (numMatch) {
    const d = parseInt(numMatch[1]);
    const m = parseInt(numMatch[2]);
    const y = parseInt(numMatch[3]);
    if (m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }
  }

  // dd. månedsnavn yyyy
  const nameMatch = raw.match(
    /^(\d{1,2})\.\s*(januar|februar|marts|april|maj|juni|juli|august|september|oktober|november|december)\s*(\d{4})$/i
  );
  if (nameMatch) {
    const d = parseInt(nameMatch[1]);
    const m = DANISH_MONTHS[nameMatch[2].toLowerCase()];
    const y = parseInt(nameMatch[3]);
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }

  return null;
}

export async function extractDatesFromPDF(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const seen = new Set();
  const results = [];

  const numPatterns = /\d{1,2}[./]\d{1,2}[./]\d{4}/g;
  const namePattern =
    /\d{1,2}\.\s*(?:januar|februar|marts|april|maj|juni|juli|august|september|oktober|november|december)\s*\d{4}/gi;

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const text = content.items.map(item => item.str).join(' ');

    for (const pattern of [numPatterns, namePattern]) {
      pattern.lastIndex = 0;
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const raw = match[0].trim();
        const dateStr = parseDateString(raw);
        if (dateStr && !seen.has(dateStr)) {
          seen.add(dateStr);
          results.push({ date: dateStr, raw });
        }
      }
    }
  }

  return results.sort((a, b) => a.date.localeCompare(b.date));
}
