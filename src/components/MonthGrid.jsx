import DayCell from './DayCell';

const WEEKDAYS = ['Man', 'Tir', 'Ons', 'Tor', 'Fre'];

const MONTH_NAMES = [
  'Januar', 'Februar', 'Marts', 'April', 'Maj', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'December',
];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

// Finder den første hverdag i måneden og returnerer dens kolonne (0=Man … 4=Fre)
function getWeekdayOffset(year, month) {
  for (let d = 1; d <= 7; d++) {
    const jsDay = new Date(year, month, d).getDay(); // 0=Sun, 1=Mon…
    if (jsDay >= 1 && jsDay <= 5) return jsDay - 1;
  }
  return 0;
}

function pad(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export default function MonthGrid({ year, month, modules, holidays = {}, onAddModule, onEditModule, large }) {
  const daysInMonth = getDaysInMonth(year, month);
  const startOffset = getWeekdayOffset(year, month);

  const modulesByDate = {};
  for (const m of modules) {
    if (!modulesByDate[m.date]) modulesByDate[m.date] = [];
    modulesByDate[m.date].push(m);
  }

  const cells = [];
  // Tom-celler til at skubbe første hverdag ind i rigtig kolonne
  for (let i = 0; i < startOffset; i++) {
    cells.push(<div key={`empty-${i}`} className="day-cell empty" />);
  }
  // Kun hverdage (Man–Fre)
  for (let d = 1; d <= daysInMonth; d++) {
    const jsDay = new Date(year, month, d).getDay();
    if (jsDay === 0 || jsDay === 6) continue; // spring weekend over
    const dateStr = pad(year, month, d);
    cells.push(
      <DayCell
        key={dateStr}
        date={dateStr}
        modules={modulesByDate[dateStr] || []}
        holiday={holidays[dateStr] || null}
        onAddModule={onAddModule}
        onEditModule={onEditModule}
      />
    );
  }

  return (
    <div className={`month-grid${large ? ' month-grid-large' : ''}`}>
      {!large && <h3 className="month-name">{MONTH_NAMES[month]}</h3>}
      <div className="weekday-headers">
        {WEEKDAYS.map(wd => (
          <div key={wd} className="weekday-header">{wd}</div>
        ))}
      </div>
      <div className="day-cells">
        {cells}
      </div>
    </div>
  );
}
