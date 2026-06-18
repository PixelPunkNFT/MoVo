import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

// Nascondi splash screen
const splash = document.getElementById('splash');
if (splash) splash.classList.add('hide');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
