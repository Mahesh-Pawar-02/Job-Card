import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import HomePage from './pages/HomePage.jsx'
import PartyMasterPage from './pages/PartyMasterPage.jsx'

function App() {
  return (
    <BrowserRouter>
      <div>
        <Navbar />
        <div style={{ padding: '1rem' }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/party-master" element={<PartyMasterPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App
