import { useState, useMemo } from 'react';
import MonthGrid from './components/MonthGrid';
import ModuleModal from './components/ModuleModal';
import PDFUploader from './components/PDFUploader';
import { useModules } from './hooks/useModules';
import { TEACHER_COLORS, TEACHERS } from './components/ModuleChip';
import { getHolidays } from './utils/holidays';
import './App.css';

const MONTH_NAMES = [
  'Januar', 'Februar', 'Marts', 'April', 'Maj', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'December',
];

export default function App() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const { modules, loading, addModule, updateModule, deleteModule, addModules, resetModules } = useModules();
  const [resetting, setResetting] = useState(false);

  const handleReset = async () => {
    if (!window.confirm('Er du sikker på at du vil slette AL data? Dette kan ikke fortrydes.')) return;
    setResetting(true);
    await resetModules();
    setResetting(false);
  };

  const [modal, setModal] = useState(null);
  const [showPDF, setShowPDF] = useState(false);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const openAdd = (date) => setModal({ date, module: null });
  const openEdit = (module) => setModal({ date: module.date, module });
  const closeModal = () => setModal(null);

  const handleSave = ({ date, title, teacher, location }) => {
    if (modal.module) {
      updateModule(modal.module.id, { title, teacher, location });
    } else {
      addModule({ date, title, teacher, location });
    }
    closeModal();
  };

  const handleDelete = (id) => {
    deleteModule(id);
    closeModal();
  };

  const holidays = useMemo(() => getHolidays(year), [year]);

  const visibleModules = modules.filter(m => {
    const [y, mo] = m.date.split('-');
    return parseInt(y) === year && parseInt(mo) - 1 === month;
  });

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <h1>Kursusplanlægger</h1>
          <div className="legend">
            {TEACHERS.map(t => (
              <span key={t} className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: TEACHER_COLORS[t] }} />
                {t}
              </span>
            ))}
          </div>
        </div>
        <div className="header-right">
          <button className="btn btn-pdf" onClick={() => setShowPDF(true)}>
            Importer Excel / CSV
          </button>
          <button className="btn btn-reset" onClick={handleReset} disabled={resetting}>
            {resetting ? 'Nulstiller…' : 'Nulstil alt'}
          </button>
          <div className="month-nav">
            <button onClick={prevMonth} aria-label="Forrige måned">‹</button>
            <span className="month-label">
              {MONTH_NAMES[month]} <span className="month-year">{year}</span>
            </span>
            <button onClick={nextMonth} aria-label="Næste måned">›</button>
          </div>
        </div>
      </header>

      <main className="main-single">
        {loading && <div className="loading-bar">Henter data…</div>}
        <MonthGrid
          year={year}
          month={month}
          modules={visibleModules}
          holidays={holidays}
          onAddModule={openAdd}
          onEditModule={openEdit}
          large
        />
      </main>

      {modal && (
        <ModuleModal
          date={modal.date}
          module={modal.module}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={closeModal}
        />
      )}

      {showPDF && (
        <PDFUploader
          onImport={addModules}
          onClose={() => setShowPDF(false)}
        />
      )}
    </div>
  );
}
