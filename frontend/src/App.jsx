import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Navbar from './components/Navbar.jsx'
import HomePage from './pages/HomePage.jsx'
import CustomerPage from './pages/CustomerPage.jsx'
import ProcessMasterPage from './pages/ProcessMasterPage.jsx'
import PartPage from './pages/PartPage.jsx'
import UnitMasterPage from './pages/UnitMasterPage.jsx'
import StateMasterPage from './pages/StateMasterPage.jsx'
import TaxMasterPage from './pages/TaxMasterPage.jsx'
import CategoryMasterPage from './pages/CategoryMasterPage.jsx'
import InwardsPage from './pages/InwardsPage.jsx'

function App() {
  return (
    <BrowserRouter>
      <div>
        <Navbar />
        <div style={{ padding: '1rem' }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/masters/customer" element={<CustomerPage />} />
            <Route path="/masters/process" element={<ProcessMasterPage />} />
            <Route path="/masters/part" element={<PartPage />} />
            <Route path="/masters/unit" element={<UnitMasterPage />} />
            <Route path="/masters/state" element={<StateMasterPage />} />
            <Route path="/masters/tax" element={<TaxMasterPage />} />
            <Route path="/masters/category" element={<CategoryMasterPage />} />
            <Route path="/masters/items" element={<div>Items Master Page</div>} />
            <Route path="/masters/accounts" element={<div>Accounts Master Page</div>} />
            <Route path="/inward" element={<div>Inward Page</div>} />
            <Route path="/inward/lc-challan" element={<InwardsPage />} />
            <Route path="/outward" element={<div>Outward Page</div>} />
            <Route path="/reports" element={<div>Reports Page</div>} />
            <Route path="/gst-reports" element={<div>GST Reports Page</div>} />
            <Route path="/outstanding" element={<div>Outstanding Page</div>} />
            <Route path="/utilities" element={<div>Utilities Page</div>} />
            <Route path="/exit" element={<div>Exit Page</div>} />
          </Routes>
        </div>
        
        {/* Toast Container for notifications */}
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </BrowserRouter>
  )
}

export default App
