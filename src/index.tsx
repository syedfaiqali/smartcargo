import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import './data/masterDataService';
import './data/financeSetupService';
import './data/demoDataService';

const container = document.getElementById('root') as HTMLElement;
const root = ReactDOM.createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
