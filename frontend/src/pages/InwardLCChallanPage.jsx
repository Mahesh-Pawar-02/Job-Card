import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import InwardLCChallanForm from '../components/InwardLCChallanForm.jsx'
import { fetchAllParties } from '../services/partyMasterApi.js'
import { fetchAllItems } from '../services/itemMasterApi.js'
import { fetchAllProcesses } from '../services/processMasterApi.js'
import { createInwardLC, fetchInwardLCList, deleteInwardLC, updateInwardLC } from '../services/inwardLCChallanApi.js'

function InwardLCChallanPage() {
  const navigate = useNavigate()
  const [parties, setParties] = useState([])
  const [items, setItems] = useState([])
  const [processes, setProcesses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [rows, setRows] = useState([])
  const [viewRow, setViewRow] = useState(null)
  const [editingRow, setEditingRow] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [printRow, setPrintRow] = useState(null)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [grnSearch, setGrnSearch] = useState('')
  const tableContainerRef = useRef(null)

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError('')
    Promise.all([fetchAllParties(), fetchAllItems(), fetchAllProcesses(), fetchInwardLCList()])
      .then(([p, i, pr, list]) => {
        if (!isMounted) return
        setParties(Array.isArray(p) ? p : [])
        setItems(Array.isArray(i) ? i : [])
        setProcesses(Array.isArray(pr) ? pr : [])
        const arr = Array.isArray(list) ? list : []
        setRows(arr)
        setSelectedIndex(arr.length > 0 ? 0 : -1)
      })
      .catch(err => {
        if (!isMounted) return
        setError(err?.message || 'Failed to load data')
      })
      .finally(() => {
        if (!isMounted) return
        setLoading(false)
      })
    return () => { isMounted = false }
  }, [])

  // Keyboard navigation for row selection
  useEffect(() => {
    const el = tableContainerRef.current
    if (!el) return
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => {
          if (rows.length === 0) return -1
          const next = Math.min((prev < 0 ? -1 : prev) + 1, rows.length - 1)
          return next
        })
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => {
          if (rows.length === 0) return -1
          const next = Math.max((prev < 0 ? 0 : prev) - 1, 0)
          return next
        })
      }
    }
    el.addEventListener('keydown', handleKeyDown)
    return () => el.removeEventListener('keydown', handleKeyDown)
  }, [rows.length])

  async function handleSubmit(payload) {
    try {
      setSubmitting(true)
      if (editingRow?.id) {
        // Update existing inward
        const updated = await updateInwardLC(editingRow.id, payload)
        const refreshedList = await fetchInwardLCList()
        setRows(refreshedList)
        setEditingRow(null)
        setIsFormOpen(false)
      } else {
        // Create new inward, user provides GRN No
        const created = await createInwardLC(payload)
        const refreshedList = await fetchInwardLCList()
        setRows(refreshedList)
        setIsFormOpen(false)
      }
    } catch (e) {
      setError(e?.message || 'Failed to save')
    } finally {
      setSubmitting(false)
    }
  }

  function handleInsert() {
    // If you use this for adding parts, make sure it does NOT call createInwardLC for new GRN
    // Or remove this function if not needed
  }

  function handleCancel() {
    setIsFormOpen(false)
    setEditingRow(null)
  }

  function handlePrint(row) {
    setPrintRow(row)
    setTimeout(() => window.print(), 0)
  }

  useEffect(() => {
    function onAfterPrint() { setPrintRow(null) }
    window.addEventListener('afterprint', onAfterPrint)
    return () => window.removeEventListener('afterprint', onAfterPrint)
  }, [])

  function handleSearchGrn() {
    const q = grnSearch.trim()
    if (!q) return
    const idx = rows.findIndex(r => String(r.grn_no).toLowerCase() === q.toLowerCase())
    if (idx >= 0) setSelectedIndex(idx)
  }

  const selectedRow = selectedIndex >= 0 ? rows[selectedIndex] : null

  if (loading) return <div>Loading...</div>
  if (error) return <div style={{ color: 'red' }}>{error}</div>

  return (
    <div>
      <div style={{
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-end',
  marginBottom: '1.5rem',
  flexWrap: 'wrap'
}}>
  <h2 style={{ margin: 0, fontWeight: 700, color: '#2c3e50', letterSpacing: 1 }}>Inward Challan for L/C</h2>
  <div style={{
    display: 'flex',
    gap: 12,
    alignItems: 'center',
    background: '#f8f9fa',
    padding: '12px 18px',
    borderRadius: 8,
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
  }}>
    <input
      className="input"
      placeholder="Search GRN No"
      value={grnSearch}
      onChange={e => setGrnSearch(e.target.value)}
      onKeyDown={e => { if (e.key === 'Enter') handleSearchGrn() }}
      style={{
        width: 180,
        padding: '8px 12px',
        border: '1px solid #d1d5db',
        borderRadius: 6,
        fontSize: 15
      }}
    />
    <button
      className="btn btn-outline-secondary btn-sm"
      type="button"
      onClick={handleSearchGrn}
      style={{
        padding: '6px 18px',
        fontSize: 15,
        borderRadius: 6,
        border: '1px solid #6c757d',
        background: '#fff',
        color: '#2c3e50',
        fontWeight: 500
      }}
    >
      Search
    </button>
    <button
      className="btn btn-primary"
      title="New"
      onClick={() => { setEditingRow(null); setIsFormOpen(true) }}
      style={{
        padding: '8px 22px',
        fontSize: 16,
        borderRadius: 6,
        background: 'linear-gradient(90deg,#007bff 60%,#0056b3 100%)',
        color: '#fff',
        fontWeight: 600,
        boxShadow: '0 2px 8px rgba(0,123,255,0.08)',
        border: 'none'
      }}
    >
      + New
    </button>
  </div>
</div>

      {isFormOpen && (
        <InwardLCChallanForm
          parties={parties}
          items={items}
          processes={processes}
          onSubmit={handleSubmit}
          onInsert={handleInsert}
          onCancel={handleCancel}
          isSubmitting={submitting}
          submitLabel={editingRow ? 'Update' : 'Save'}
          initialValues={editingRow || {}}
        />
      )}
      <div className="card" ref={tableContainerRef} tabIndex="0" style={{ marginTop: '16px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '8px' }}>GRN No</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '8px' }}>Date</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '8px' }}>Supplier Name</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '8px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: '12px', textAlign: 'center' }}>No records</td>
              </tr>
            ) : (
              rows.map((r, idx) => (
                <tr key={r.grn_no} style={{ cursor: 'pointer', background: selectedIndex === idx ? '#f8f9fa' : 'transparent' }}>
                  <td style={{ borderBottom: '1px solid #f0f0f0', padding: '8px' }}>{r.grn_no}</td>
                  <td style={{ borderBottom: '1px solid #f0f0f0', padding: '8px' }}>{r.grn_date?.slice?.(0,10)}</td>
                  <td style={{ borderBottom: '1px solid #f0f0f0', padding: '8px' }}>
                    {(parties.find(p => (p.id||p._id) == r.supplier_id)?.party_name) || r.supplier_id}
                  </td>
                  <td style={{ borderBottom: '1px solid #f0f0f0', padding: '8px', minWidth: 180 }}>
                    <button className="btn btn-outline-warning btn-sm" title="Edit" onClick={() => { setSelectedIndex(idx); setEditingRow(r); setIsFormOpen(true); }}>Edit</button>{' '}
                    <button className="btn btn-outline-danger btn-sm" title="Delete" onClick={async () => { 
                      if (window.confirm('Delete this GRN and all its parts?')) { 
                        const response = await fetch(`/api/inward-lc-challan/grn/${r.grn_no}`, { method: 'DELETE' });
                        if (response.ok) {
                          setRows(prev => prev.filter(x => x.grn_no !== r.grn_no));
                          setSelectedIndex(-1);
                        }
                      }
                    }}>Delete</button>{' '}
                    <button className="btn btn-outline-secondary btn-sm" title="View" onClick={() => { setSelectedIndex(idx); setViewRow(r); }}>View</button>{' '}
                    <button className="btn btn-outline-primary btn-sm" title="Print" onClick={() => { setSelectedIndex(idx); handlePrint(r); }}>Print</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {viewRow && (
        <div style={{ marginTop: '16px', border: '1px solid #e5e5e5', borderRadius: 6, padding: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>Inward L/C Challan</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => setViewRow(null)}>Close</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(260px, 1fr))', gap: '8px', marginTop: '8px' }}>
            {[
              ['grn_no', 'GRN No'],
              ['grn_date', 'GRN Date'],
              ['supplier_id', 'Supplier'],
              ['challan_no', 'Challan No'],
              ['challan_date', 'Challan Date'],
              ['item_id', 'Item'],
              ['item_name', 'Item Name'],
              ['process_id', 'Process'],
              ['qty', 'Qty'],
            ].map(([key, label]) => (
              <div key={key} style={{ display: 'flex', gap: '8px' }}>
                <div style={{ width: 180, color: '#555' }}>{label}</div>
                <div style={{ flex: 1, fontWeight: 500 }}>
                  {key === 'supplier_id' ? (parties.find(p => (p.id||p._id) == viewRow.supplier_id)?.party_name || viewRow.supplier_id)
                    : key === 'item_id' ? (items.find(i => (i.id||i._id) == viewRow.item_id)?.part_number || viewRow.item_id)
                    : key === 'process_id' ? (processes.find(p => (p.id||p._id) == viewRow.process_id)?.process_name || '')
                    : (String(viewRow?.[key] ?? '').slice(0, 10))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Print-only content */}
      {printRow && (
        <>
          <style>{`@media print { body * { visibility: hidden; } #print-area, #print-area * { visibility: visible; } #print-area { position: absolute; left: 0; top: 0; width: 100%; padding: 16px; } }`}</style>
          <div id="print-area">
            <h2 style={{ marginTop: 0 }}>Inward Challan for L/C</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(260px, 1fr))', gap: '8px' }}>
              {[
                ['grn_no', 'GRN No'],
                ['grn_date', 'GRN Date'],
                ['supplier_id', 'Supplier'],
                ['challan_no', 'Challan No'],
                ['challan_date', 'Challan Date'],
                ['item_id', 'Item No'],
                ['item_name', 'Item Name'],
                ['process_id', 'Process'],
                ['qty', 'Quantity'],
              ].map(([key, label]) => (
                <div key={key} style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ width: 180 }}>{label}</div>
                  <div style={{ flex: 1, fontWeight: 600 }}>
                    {key === 'supplier_id' ? (parties.find(p => (p.id||p._id) == printRow.supplier_id)?.party_name || printRow.supplier_id)
                      : key === 'item_id' ? (items.find(i => (i.id||i._id) == printRow.item_id)?.part_number || printRow.item_id)
                      : key === 'process_id' ? (processes.find(p => (p.id||p._id) == printRow.process_id)?.process_name || '')
                      : String(printRow?.[key] ?? '').slice(0, 10)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default InwardLCChallanPage



