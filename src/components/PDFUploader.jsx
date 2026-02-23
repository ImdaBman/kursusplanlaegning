import { useState, useRef } from 'react';
import { extractDatesFromFile } from '../utils/csvParser';
import { TEACHERS, LOCATIONS } from './ModuleChip';

const DANISH_MONTHS = [
  'jan', 'feb', 'mar', 'apr', 'maj', 'jun',
  'jul', 'aug', 'sep', 'okt', 'nov', 'dec',
];

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-');
  return `${parseInt(d)}. ${DANISH_MONTHS[parseInt(m) - 1]} ${y}`;
}

export default function PDFUploader({ onImport, onClose }) {
  const [step, setStep] = useState('upload');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [foundDates, setFoundDates] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [holdnavn, setHoldnavn] = useState('');
  const [defaultTeacher, setDefaultTeacher] = useState(TEACHERS[0]);
  const [defaultLocation, setDefaultLocation] = useState(LOCATIONS[0]);
  const [title, setTitle] = useState('');
  const fileRef = useRef();

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setLoading(true);
    try {
      const { dates, preview } = await extractDatesFromFile(file);
      if (dates.length === 0) {
        setError(
          `Ingen datoer fundet. Første værdier i kolonne A: ${preview.length > 0 ? preview.map(v => `"${v}"`).join(', ') : '(ingen)'}`
        );
        setLoading(false);
        return;
      }
      setFoundDates(dates);
      setSelected(new Set(dates.map(d => d.date)));
      // Pre-fill title from first suggestedTitle if present
      const firstTitle = dates.find(d => d.suggestedTitle)?.suggestedTitle;
      if (firstTitle) setTitle(firstTitle);
      setStep('preview');
    } catch (err) {
      setError('Kunne ikke læse filen: ' + err.message);
    }
    setLoading(false);
  };

  const toggleDate = (dateStr) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(dateStr)) next.delete(dateStr);
      else next.add(dateStr);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === foundDates.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(foundDates.map(d => d.date)));
    }
  };

  const handleImport = () => {
    const modules = foundDates
      .filter(d => selected.has(d.date))
      .map(d => {
        const resolvedTitle = d.suggestedTitle || title.trim() || 'Kursusdag';
        const resolvedTeacher = /refleksion/i.test(resolvedTitle) ? 'Selvstudie' : defaultTeacher;
        return {
          date: d.date,
          holdnavn: holdnavn.trim(),
          title: resolvedTitle,
          teacher: resolvedTeacher,
          location: defaultLocation,
        };
      });
    onImport(modules);
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal pdf-modal">
        <div className="modal-header">
          <h2>Importer fra Excel / CSV</h2>
          <button className="modal-close" onClick={onClose} aria-label="Luk">✕</button>
        </div>

        {step === 'upload' && (
          <div className="pdf-upload-area">
            <p>Upload en Excel- eller CSV-fil med kursusdatoer.</p>
            {error && <div className="error-msg">{error}</div>}
            <label className="file-label">
              {loading ? 'Læser fil…' : 'Vælg Excel / CSV-fil'}
              <input
                ref={fileRef}
                type="file"
                accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                onChange={handleFile}
                disabled={loading}
                style={{ display: 'none' }}
              />
            </label>
            <p className="hint">
              Understøtter .xlsx, .xls og .csv · Datoformater: dd.mm.åååå, dd/mm/åååå, åååå-mm-dd
            </p>
            <p className="hint">
              Tip: Navngiv kolonnen "Dato" for bedre genkendelse
            </p>
          </div>
        )}

        {step === 'preview' && (
          <>
            <div className="pdf-defaults">
              <label>
                Holdnavn
                <input
                  type="text"
                  value={holdnavn}
                  onChange={e => setHoldnavn(e.target.value)}
                  placeholder="F.eks. Hold A..."
                  autoFocus
                />
              </label>
              <label>
                Fallback-titel (bruges hvis ingen titel i fil)
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Kursusdag"
                />
              </label>
              <label>
                Underviser
                <select value={defaultTeacher} onChange={e => setDefaultTeacher(e.target.value)}>
                  {TEACHERS.map(t => <option key={t}>{t}</option>)}
                </select>
              </label>
              <label>
                Lokation
                <select value={defaultLocation} onChange={e => setDefaultLocation(e.target.value)}>
                  {LOCATIONS.map(l => <option key={l}>{l}</option>)}
                </select>
              </label>
            </div>

            <div className="pdf-date-list">
              <div className="pdf-date-list-header">
                <span>{foundDates.length} datoer fundet</span>
                <button className="btn-link" onClick={toggleAll}>
                  {selected.size === foundDates.length ? 'Fravælg alle' : 'Vælg alle'}
                </button>
              </div>
              {foundDates.map(({ date, raw, suggestedTitle }) => (
                <label key={date} className="date-row">
                  <input
                    type="checkbox"
                    checked={selected.has(date)}
                    onChange={() => toggleDate(date)}
                  />
                  <span className="date-formatted">{formatDate(date)}</span>
                  {suggestedTitle && (
                    <span className="date-suggested-title">{suggestedTitle}</span>
                  )}
                  <span className="date-raw">({raw})</span>
                </label>
              ))}
            </div>

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => { setStep('upload'); setError(null); if (fileRef.current) fileRef.current.value = ''; }}>
                Tilbage
              </button>
              <button
                className="btn btn-primary"
                onClick={handleImport}
                disabled={selected.size === 0}
              >
                Importer {selected.size} dag{selected.size !== 1 ? 'e' : ''}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
