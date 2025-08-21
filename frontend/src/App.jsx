<<<<<<< Updated upstream
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
=======
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import HomePage from './pages/HomePage.jsx'
import PartyMasterPage from './pages/PartyMasterPage.jsx'
import ProcessMasterPage from './pages/ProcessMasterPage.jsx'
import ItemMasterPage from './pages/ItemMasterPage.jsx'
import UnitMasterPage from './pages/UnitMasterPage.jsx'
import StateMasterPage from './pages/StateMasterPage.jsx'
import TaxMasterPage from './pages/TaxMasterPage.jsx'
import CategoryMasterPage from './pages/CategoryMasterPage.jsx'
import InwardLCChallanPage from './pages/InwardLCChallanPage.jsx'

function App() {
  return (
    <BrowserRouter>
      <div>
        <Navbar />
        <div style={{ padding: '1rem' }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/masters/party" element={<PartyMasterPage />} />
            <Route path="/masters/process" element={<ProcessMasterPage />} />
            <Route path="/masters/item" element={<ItemMasterPage />} />
            <Route path="/masters/unit" element={<UnitMasterPage />} />
            <Route path="/masters/state" element={<StateMasterPage />} />
            <Route path="/masters/tax" element={<TaxMasterPage />} />
            <Route path="/masters/category" element={<CategoryMasterPage />} />
            <Route path="/masters/items" element={<div>Items Master Page</div>} />
            <Route path="/masters/accounts" element={<div>Accounts Master Page</div>} />
            <Route path="/inward" element={<div>Inward Page</div>} />
            <Route path="/inward/lc-challan" element={<InwardLCChallanPage />} />
            <Route path="/outward" element={<div>Outward Page</div>} />
            <Route path="/reports" element={<div>Reports Page</div>} />
            <Route path="/gst-reports" element={<div>GST Reports Page</div>} />
            <Route path="/outstanding" element={<div>Outstanding Page</div>} />
            <Route path="/utilities" element={<div>Utilities Page</div>} />
            <Route path="/exit" element={<div>Exit Page</div>} />
          </Routes>
>>>>>>> Stashed changes
        </div>
      </main>
    </div>
  )
}

export default App
