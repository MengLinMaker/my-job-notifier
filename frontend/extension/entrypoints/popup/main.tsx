import React from 'react'
import ReactDOM from 'react-dom/client'
import '@lib/lib-ui/globals.css'
import App from './App.tsx'
import './style.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
