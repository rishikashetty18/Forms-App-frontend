import React, { useEffect, useState } from 'react';

export default function AdminResponses({ config, backendBase }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchResponses = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${backendBase}/api/responses`);
      const data = await res.json();
      setRows(data);
    } catch (err) {
      console.error(err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchResponses(); }, []);

  const headers = config.questions.map(q => ({ id: q.id, label: q.label }));

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
        <div style={{ color:'#374151', fontWeight:700 }}>{rows.length} responses</div>
        <div>
          <button className="btn" onClick={fetchResponses}>Refresh</button>
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Submission ID</th>
              <th>Timestamp</th>
              {headers.map(h => <th key={h.id}>{h.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={2 + headers.length} style={{ padding: 18 }}>No responses yet</td></tr>
            )}

            {rows.map(row => (
              <tr key={row.id}>
                <td className="row-id">{row.id}</td>
                <td>{new Date(row.timestamp).toLocaleString()}</td>
                {headers.map(h => (
                  <td key={h.id}>{row.answers && row.answers[h.id] ? row.answers[h.id].toString() : ''}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
