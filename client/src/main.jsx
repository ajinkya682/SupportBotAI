import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app/App.jsx'
import './index.css'
import { Provider } from 'react-redux'
import { store } from './app/store/store'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { GOOGLE_CLIENT_ID } from './shared/services/config'

// Disable console logs in production for security and privacy
if (import.meta.env.MODE === 'production') {
  console.log = () => {};
  console.error = () => {};
  console.debug = () => {};
  console.warn = () => {};
  console.info = () => {};
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Provider store={store}>
        <App />
      </Provider>
    </GoogleOAuthProvider>
  </React.StrictMode>,
)
