// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { TimerProvider } from './context/TimerContext';
import { VideoProvider } from './context/VideoContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <VideoProvider>
      <TimerProvider>
        <App />
      </TimerProvider>
    </VideoProvider>
  </React.StrictMode>,
)