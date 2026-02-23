import { useState, useRef } from 'react';
import { TEACHER_COLORS } from './ModuleChip';

const UGEDAGE = ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'];

const DANISH_MONTHS_LONG = [
  'januar', 'februar', 'marts', 'april', 'maj', 'juni',
  'juli', 'august', 'september', 'oktober', 'november', 'december',
];

function formatDateLong(dateStr) {
  const [y, m, d] = dateStr.split('-');
  const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
  const ugedag = UGEDAGE[date.getDay()];
  return {
    ugedag,
    dato: `${parseInt(d)}. ${DANISH_MONTHS_LONG[parseInt(m) - 1]} ${y}`,
  };
}

function todayFormatted() {
  const d = new Date();
  return `${d.getDate()}. ${DANISH_MONTHS_LONG[d.getMonth()]} ${d.getFullYear()}`;
}

export default function KursusplanView({ modules, onClose }) {
  // Find alle unikke holdnavne
  const holdnavne = [...new Set(modules.map(m => m.holdnavn || '(intet holdnavn)'))].sort();
  const [valgtHold, setValgtHold] = useState(holdnavne[0] || '');
  const printRef = useRef();

  const kursusModules = modules
    .filter(m => (m.holdnavn || '(intet holdnavn)') === valgtHold)
    .sort((a, b) => a.date.localeCompare(b.date));

  const handlePrint = () => window.print();

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="modal-backdrop kursusplan-backdrop" onClick={handleBackdropClick}>
      <div className="modal kursusplan-modal">

        {/* ── Kontroller (skjules ved print) ── */}
        <div className="kursusplan-controls no-print">
          <div className="modal-header" style={{ marginBottom: 0 }}>
            <h2>Kursusplan</h2>
            <button className="modal-close" onClick={onClose} aria-label="Luk">✕</button>
          </div>

          <div className="kursusplan-picker">
            <label>
              Vælg hold
              <select value={valgtHold} onChange={e => setValgtHold(e.target.value)}>
                {holdnavne.map(h => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </label>
            <button className="btn btn-primary" onClick={handlePrint}>
              Udskriv / Gem som PDF
            </button>
          </div>
        </div>

        {/* ── Printbar kursusplan ── */}
        <div className="kursusplan-document" ref={printRef}>
          <div className="kursusplan-header">
            <div>
              <h1 className="kursusplan-title">{valgtHold}</h1>
              <p className="kursusplan-subtitle">Kursusplan · {kursusModules.length} undervisningsdage</p>
            </div>
            <div className="kursusplan-meta">
              <span>Udskrevet: {todayFormatted()}</span>
            </div>
          </div>

          {kursusModules.length === 0 ? (
            <p className="kursusplan-empty">Ingen moduler registreret for dette hold.</p>
          ) : (
            <table className="kursusplan-table">
              <thead>
                <tr>
                  <th className="col-nr">#</th>
                  <th className="col-ugedag">Dag</th>
                  <th className="col-dato">Dato</th>
                  <th className="col-titel">Titel</th>
                  <th className="col-underviser">Underviser</th>
                  <th className="col-lokation">Lokation</th>
                </tr>
              </thead>
              <tbody>
                {kursusModules.map((m, i) => {
                  const { ugedag, dato } = formatDateLong(m.date);
                  const color = TEACHER_COLORS[m.teacher] || '#6b7280';
                  return (
                    <tr key={m.id} className={i % 2 === 0 ? 'row-even' : 'row-odd'}>
                      <td className="col-nr">{i + 1}</td>
                      <td className="col-ugedag">{ugedag}</td>
                      <td className="col-dato">{dato}</td>
                      <td className="col-titel">{m.title || '—'}</td>
                      <td className="col-underviser">
                        <span className="plan-teacher" style={{ color }}>
                          {m.teacher || '—'}
                        </span>
                      </td>
                      <td className="col-lokation">{m.location || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          <div className="kursusplan-footer">
            Kursusplanlægger · Genereret {todayFormatted()}
          </div>
        </div>
      </div>
    </div>
  );
}
