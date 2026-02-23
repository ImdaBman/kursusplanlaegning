import ModuleChip from './ModuleChip';

export default function DayCell({ date, modules, holiday, onAddModule, onEditModule }) {
  const isToday = date === new Date().toISOString().split('T')[0];

  return (
    <div
      className={`day-cell${isToday ? ' today' : ''}${holiday ? ' holiday' : ''}`}
      onClick={() => onAddModule(date)}
      title={holiday || undefined}
    >
      <div className="day-header">
        <span className="day-number">{parseInt(date.split('-')[2])}</span>
        {holiday && <span className="holiday-name">{holiday}</span>}
      </div>
      <div className="day-modules">
        {modules.map(m => (
          <ModuleChip key={m.id} module={m} onClick={onEditModule} />
        ))}
      </div>
    </div>
  );
}
