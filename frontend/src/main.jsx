import './index.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import axios from 'axios';

axios.defaults.baseURL = 'https://interview-portal-project-1.onrender.com';

// Attach token from localStorage on every request if it exists
const token = localStorage.getItem('token');
if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
