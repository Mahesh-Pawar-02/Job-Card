import { useState } from 'react'
import Navbar from './components/Navbar'
import './App.css'

function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <div className="container">
          <h1>Welcome to ERP System</h1>
          <p>Select an option from the navigation menu above to get started.</p>
        </div>
      </main>
    </div>
  )
}

export default App
