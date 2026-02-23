import { useState, useEffect } from 'react';
import { TEACHERS, LOCATIONS } from './ModuleChip';

const DANISH_MONTHS = [
  'januar', 'februar', 'marts', 'april', 'maj', 'juni',
  'juli', 'august', 'september', 'oktober', 'november', 'december',
];

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-');
  return `${parseInt(d)}. ${DANISH_MONTHS[parseInt(m) - 1]} ${y}`;
}

export default function ModuleModal({ date, module, onSave, onDelete, onClose }) {
  const [title, setTitle] = useState('');
  const [teacher, setTeacher] = useState(TEACHERS[0]);
  const [location, setLocation] = useState(LOCATIONS[0]);

  useEffect(() => {
    if (module) {
      setTitle(module.title || '');
      setTeacher(module.teacher || TEACHERS[0]);
      setLocation(module.location || LOCATIONS[0]);
    } else {
      setTitle('');
      setTeacher(TEACHERS[0]);
      setLocation(LOCATIONS[0]);
    }
  }, [module, date]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ date, title: title.trim(), teacher, location });
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal">
        <div className="modal-header">
          <h2>{module ? 'Rediger modul' : 'Nyt modul'}</h2>
          <span className="modal-date">{formatDate(date)}</span>
          <button className="modal-close" onClick={onClose} aria-label="Luk">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <label>
            Titel
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Kursusnavn eller beskrivelse"
              autoFocus
            />
          </label>

          <label>
            Underviser
            <select value={teacher} onChange={e => setTeacher(e.target.value)}>
              {TEACHERS.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </label>

          <label>
            Lokation
            <select value={location} onChange={e => setLocation(e.target.value)}>
              {LOCATIONS.map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </label>

          <div className="modal-actions">
            {module && (
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => onDelete(module.id)}
              >
                Slet
              </button>
            )}
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Annuller
            </button>
            <button type="submit" className="btn btn-primary">
              {module ? 'Gem ændringer' : 'Tilføj modul'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
