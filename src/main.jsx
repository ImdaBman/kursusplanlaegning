import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase'
import './index.css'
import App from './App.jsx'

// Log ind anonymt — venter med at rendere til auth er klar
onAuthStateChanged(auth, (user) => {
  if (!user) {
    signInAnonymously(auth).catch(console.error);
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
