import { useState } from 'react';

export default function DeleteModal({ modules, onDeleteHoldnavn, onDeleteAll, onClose }) {
  const [confirming, setConfirming] = useState(null); // 'all' | holdnavn-string
  const [busy, setBusy] = useState(false);

  // Grupper moduler per holdnavn
  const groups = Object.entries(
    modules.reduce((acc, m) => {
      const key = m.holdnavn || '(intet holdnavn)';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {})
  ).sort((a, b) => a[0].localeCompare(b[0]));

  const handleConfirm = async () => {
    setBusy(true);
    if (confirming === 'all') {
      await onDeleteAll();
    } else {
      await onDeleteHoldnavn(confirming);
    }
    setBusy(false);
    setConfirming(null);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !busy) onClose();
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal delete-modal">
        <div className="modal-header">
          <h2>Slet data</h2>
          <button className="modal-close" onClick={onClose} disabled={busy} aria-label="Luk">✕</button>
        </div>

        {confirming ? (
          <div className="delete-confirm">
            <p>
              {confirming === 'all'
                ? 'Er du sikker på at du vil slette AL data? Dette kan ikke fortrydes.'
                : `Er du sikker på at du vil slette alle moduler for "${confirming}"? Dette kan ikke fortrydes.`}
            </p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setConfirming(null)} disabled={busy}>
                Annuller
              </button>
              <button className="btn btn-danger" onClick={handleConfirm} disabled={busy}>
                {busy ? 'Sletter…' : 'Ja, slet'}
              </button>
            </div>
          </div>
        ) : (
          <>
            {groups.length === 0 ? (
              <p className="delete-empty">Der er ingen data at slette.</p>
            ) : (
              <div className="delete-list">
                {groups.map(([name, count]) => (
                  <div key={name} className="delete-row">
                    <div className="delete-row-info">
                      <span className="delete-holdnavn">{name}</span>
                      <span className="delete-count">{count} modul{count !== 1 ? 'er' : ''}</span>
                    </div>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => setConfirming(name === '(intet holdnavn)' ? name : name)}
                    >
                      Slet kursus
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="delete-footer">
              <button className="btn btn-secondary" onClick={onClose}>Luk</button>
              {groups.length > 0 && (
                <button className="btn btn-danger" onClick={() => setConfirming('all')}>
                  Slet alt
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
