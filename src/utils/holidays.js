// Beregner påskedag via Meeus/Jones/Butcher-algoritmen
function easter(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function add(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function iso(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// Returnerer objekt: { "YYYY-MM-DD": "Helligdagsnavn" }
// HK-overenskomst: alle officielle danske helligdage + Grundlovsdag + Juleaften
export function getHolidays(year) {
  const e = easter(year);
  return {
    [iso(new Date(year, 0, 1))]:   'Nytårsdag',
    [iso(add(e, -3))]:             'Skærtorsdag',
    [iso(add(e, -2))]:             'Langfredag',
    [iso(e)]:                      '1. Påskedag',
    [iso(add(e, 1))]:              '2. Påskedag',
    [iso(add(e, 39))]:             'Kristi Himmelfartsdag',
    [iso(add(e, 49))]:             '1. Pinsedag',
    [iso(add(e, 50))]:             '2. Pinsedag',
    [iso(new Date(year, 5, 5))]:   'Grundlovsdag',
    [iso(new Date(year, 11, 24))]: 'Juleaften',
    [iso(new Date(year, 11, 25))]: '1. Juledag',
    [iso(new Date(year, 11, 26))]: '2. Juledag',
  };
}
