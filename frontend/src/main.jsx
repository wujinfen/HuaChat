import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "stream-chat-react/dist/css/v2/index.css"
import './index.css'
import App from './App.jsx'

import { BrowserRouter } from 'react-router'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient() //create tanstack query client

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}> {/* wrap app in tanstack query's global query client provider*/}
        <App />
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
)
