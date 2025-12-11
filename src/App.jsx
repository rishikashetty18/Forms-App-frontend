import React, { useState } from 'react';
import FormRenderer from './components/FormRenderer';
import AdminResponses from './components/AdminResponses';
import config from './config/formConfig.json';

export default function App(){
  const [view, setView] = useState('form'); // 'form' | 'admin'
  const backendBase = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

  return (
    <div className="container">
      <div className="header">
        <div>
          <h1 className="title">{config.title}</h1>
          {/* <p className="sub">A simple, responsive "Google Forms-lite" for your assignment</p> */}
        </div>

        <div className="actions">
          <button className="btn" onClick={() => setView('form')}>Form</button>
          <button className="btn" onClick={() => setView('admin')}>Admin / Responses</button>
        </div>
      </div>

      <div>
        {view === 'form' ? (
          <FormRenderer config={config} backendBase={backendBase} />
        ) : (
          <AdminResponses config={config} backendBase={backendBase} />
        )}
      </div>
    </div>
  );
}
