import MonthGrid from './MonthGrid';

export default function YearCalendar({ year, modules, onAddModule, onEditModule }) {
  return (
    <div className="year-calendar">
      {Array.from({ length: 12 }, (_, month) => {
        const monthModules = modules.filter(m => {
          const [y, mo] = m.date.split('-');
          return parseInt(y) === year && parseInt(mo) - 1 === month;
        });
        return (
          <MonthGrid
            key={month}
            year={year}
            month={month}
            modules={monthModules}
            onAddModule={onAddModule}
            onEditModule={onEditModule}
          />
        );
      })}
    </div>
  );
}
