export const TEACHER_COLORS = {
  Bruno: '#3b82f6',
  Kamilla: '#a855f7',
  Oliver: '#22c55e',
  Alexander: '#f97316',
  Selvstudie: '#64748b',
};

export const TEACHERS = ['Bruno', 'Kamilla', 'Oliver', 'Alexander', 'Selvstudie'];
export const LOCATIONS = ['Fysisk', 'Lokale 1', 'Lokale 2', 'Lokale 3'];

export default function ModuleChip({ module, onClick }) {
  const color = TEACHER_COLORS[module.teacher] || '#6b7280';

  return (
    <div
      className="module-chip"
      style={{ borderLeft: `4px solid ${color}`, backgroundColor: `${color}18` }}
      onClick={(e) => {
        e.stopPropagation();
        onClick(module);
      }}
      title={`${module.title} — ${module.teacher} — ${module.location}`}
    >
      <span className="chip-title">{module.title || '(ingen titel)'}</span>
      <span className="chip-teacher" style={{ color }}>
        {module.teacher}
      </span>
      <span className="chip-location">{module.location}</span>
    </div>
  );
}
