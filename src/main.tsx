import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Importar el interceptor de autenticación
import './services/auth.interceptor';

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);