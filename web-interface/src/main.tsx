import React from 'react';
import ReactDOM from 'react-dom/client';
import ArcaneaInterface from './ArcaneaInterface';
import './index.css';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <ArcaneaInterface />
  </React.StrictMode>
);
