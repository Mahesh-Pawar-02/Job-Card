import React, { Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LoadingSpinner from '../components/common/LoadingSpinner'

// Lazy load components for better performance
const Home = React.lazy(() => import('../components/Home/Home'))
const Masters = React.lazy(() => import('../components/Masters/Masters'))
const Inward = React.lazy(() => import('../components/Inward/Inward'))
const Outward = React.lazy(() => import('../components/Outward/Outward'))
const JobCard = React.lazy(() => import('../components/JobCard/JobCard'))
const GST_Reports = React.lazy(() => import('../components/GST_Reports/GST_Reports'))
const Outstanding = React.lazy(() => import('../components/Outstanding/Outstanding'))
const Utilities = React.lazy(() => import('../components/Utilities/Utilities'))

// Masters sub-components
const Customers = React.lazy(() => import('../components/Masters/Customers'))
const PartMaster = React.lazy(() => import('../components/Masters/PartMaster'))
const ProcessMaster = React.lazy(() => import('../components/Masters/ProcessMaster'))
const UnitMaster = React.lazy(() => import('../components/Masters/UnitMaster'))
const TaxMaster = React.lazy(() => import('../components/Masters/TaxMaster'))
const HSNMaster = React.lazy(() => import('../components/Masters/HSNMaster'))
const StateMaster = React.lazy(() => import('../components/Masters/StateMaster'))

const AppRouter = () => {
  return (
    <Router>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Home Route */}
          <Route path="/" element={<Home />} />
          
          {/* Main Module Routes */}
          <Route path="/masters" element={<Masters />} />
          <Route path="/inward" element={<Inward />} />
          <Route path="/outward" element={<Outward />} />
          <Route path="/job-card" element={<JobCard />} />
          <Route path="/gst-reports" element={<GST_Reports />} />
          <Route path="/outstanding" element={<Outstanding />} />
          <Route path="/utilities" element={<Utilities />} />
          
          {/* Masters Sub-routes */}
          <Route path="/masters/customers" element={<Customers />} />
          <Route path="/masters/part-master" element={<PartMaster />} />
          <Route path="/masters/process-master" element={<ProcessMaster />} />
          <Route path="/masters/unit-master" element={<UnitMaster />} />
          <Route path="/masters/tax-master" element={<TaxMaster />} />
          <Route path="/masters/hsn-master" element={<HSNMaster />} />
          <Route path="/masters/state-master" element={<StateMaster />} />
          
          {/* Catch all route - 404 */}
          <Route path="*" element={<Home />} />
        </Routes>
      </Suspense>
    </Router>
  )
}

export default AppRouter
