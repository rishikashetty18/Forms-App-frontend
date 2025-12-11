import React, { useState } from 'react';
import Modal from './Modal';

export default function FormRenderer({ config, backendBase }) {
  const initialAnswers = {};
  config.questions.forEach(q => (initialAnswers[q.id] = ''));

  const [answers, setAnswers] = useState(initialAnswers);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  // modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [savedId, setSavedId] = useState(null);

  const handleChange = (id, value) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  const validate = () => {
    for (const q of config.questions) {
      if (q.required && (!answers[q.id] || answers[q.id].toString().trim() === '')) {
        return { ok: false, msg: `Please fill: ${q.label}` };
      }
    }
    return { ok: true };
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    const v = validate();
    if (!v.ok) {
      setStatus({ error: true, message: v.msg });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${backendBase}/api/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers })
      });

      const text = await res.text();
      let data;
      try { data = text ? JSON.parse(text) : null; } catch (err) {
        throw new Error(`Server returned non-JSON (status ${res.status}): ${text.slice(0,200)}`);
      }

      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);

      // success: show modal with ID
      setSavedId(data?.id || '(no id)');
      setModalOpen(true);

      setStatus({ ok: true, message: 'Submission saved!' });
      setAnswers(initialAnswers);
    } catch (err) {
      setStatus({ error: true, message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const copyId = async () => {
    if (!savedId) return;
    try {
      await navigator.clipboard.writeText(savedId);
      setStatus({ ok: true, message: 'Submission ID copied to clipboard.' });
    } catch {
      setStatus({ ok: true, message: 'Copied (fallback).' });
    }
  };

  return (
    <>
      <form onSubmit={onSubmit} style={{ marginTop: 6 }}>
        <div className="form-grid">
          {config.questions.map(q => (
            <div key={q.id} className={`row ${q.full ? 'full' : ''}`}>
              <label className="label">{q.label}{q.required ? ' *' : ''}</label>

              {q.type === 'short_text' && (
                <input
                  className="input"
                  type="text"
                  placeholder={q.placeholder || ''}
                  value={answers[q.id]}
                  onChange={e => handleChange(q.id, e.target.value)}
                />
              )}

              {q.type === 'single_choice' && (
                <div className="choices">
                  {q.options.map(opt => (
                    <label key={opt} className="choice">
                      <input
                        type="radio"
                        name={q.id}
                        value={opt}
                        checked={answers[q.id] === opt}
                        onChange={() => handleChange(q.id, opt)}
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="footer">
          <div>
            {status && (
              <div className={`msg ${status.error ? 'err' : 'ok'}`} style={{ marginTop: 6 }}>
                {status.message}
              </div>
            )}
          </div>

          <div>
            <button className="submit btn-primary submit" type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Submit'}
            </button>
          </div>
        </div>
      </form>

      {/* Modal */}
      <Modal open={modalOpen} title="Submission received" onClose={() => setModalOpen(false)}>
        <div style={{ marginBottom: 12 }}>
          <p style={{ margin: 0, fontWeight: 700 }}>Thanks — your response has been recorded.</p>
          <p style={{ marginTop: 8, color: '#374151' }}>Submission ID:</p>
          <div style={{
            display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'space-between',
            marginTop: 8, padding: '10px 12px', borderRadius: 10, background: '#f3faf5', border: '1px solid #dff0e4'
          }}>
            <code style={{ fontSize: 13, color: '#064e3b' }}>{savedId}</code>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn" onClick={copyId}>Copy ID</button>
              <a className="btn" href={`${backendBase}/api/responses`} target="_blank" rel="noreferrer">View all</a>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
