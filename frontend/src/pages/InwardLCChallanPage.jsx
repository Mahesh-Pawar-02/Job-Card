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
        const updated = await updateInwardLC(editingRow.id, payload)
        // Refresh the entire list since we're now grouping by GRN
        const refreshedList = await fetchInwardLCList()
        setRows(refreshedList)
        setEditingRow(null)
        setIsFormOpen(false)
      } else {
        const created = await createInwardLC(payload)
        // Refresh the entire list since we're now grouping by GRN
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

  async function handleInsert(payload) {
    try {
      setSubmitting(true)
      // Ensure GRN number persists across inserts
      const created = await createInwardLC(payload)
      // Refresh the entire list since we're now grouping by GRN
      const refreshedList = await fetchInwardLCList()
      setRows(refreshedList)
      // Keep form open for next part; do not close or change editing state
    } catch (e) {
      setError(e?.message || 'Failed to insert')
    } finally {
      setSubmitting(false)
    }
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ margin: 0 }}>Inward Challan for L/C</h2>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input className="input" placeholder="Search GRN No" value={grnSearch} onChange={e => setGrnSearch(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleSearchGrn() }} style={{ width: 160 }} />
          <button className="btn btn-outline-secondary" type="button" onClick={handleSearchGrn}>Search</button>
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
              {['#','GRN No','GRN Date','Supplier','Challan No','Challan Date','Parts Details','Total Parts','Total Qty'].map(h => (
                <th key={h} style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '8px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
                         {rows.length === 0 ? (
               <tr><td colSpan={9} style={{ padding: '12px', textAlign: 'center' }}>No records</td></tr>
             ) : (
               rows.map((r, idx) => (
                 <tr key={r.grn_no} onClick={() => setSelectedIndex(idx)} style={{ cursor: 'pointer', background: selectedIndex === idx ? '#f8f9fa' : 'transparent' }}>
                   <td style={{ borderBottom: '1px solid #f0f0f0', padding: '8px', width: 60 }}>{idx + 1}</td>
                   <td style={{ borderBottom: '1px solid #f0f0f0', padding: '8px' }}>{r.grn_no}</td>
                   <td style={{ borderBottom: '1px solid #f0f0f0', padding: '8px' }}>{r.grn_date?.slice?.(0,10)}</td>
                   <td style={{ borderBottom: '1px solid #f0f0f0', padding: '8px' }}>{(parties.find(p => (p.id||p._id) == r.supplier_id)?.party_name) || r.supplier_id}</td>
                   <td style={{ borderBottom: '1px solid #f0f0f0', padding: '8px' }}>{r.challan_no}</td>
                   <td style={{ borderBottom: '1px solid #f0f0f0', padding: '8px' }}>{r.challan_date?.slice?.(0,10)}</td>
                   <td style={{ borderBottom: '1px solid #f0f0f0', padding: '8px', maxWidth: '300px', wordWrap: 'break-word' }}>{r.parts_details || 'No parts'}</td>
                   <td style={{ borderBottom: '1px solid #f0f0f0', padding: '8px' }}>{r.total_parts}</td>
                   <td style={{ borderBottom: '1px solid #f0f0f0', padding: '8px' }}>{r.total_qty}</td>
                 </tr>
               ))
             )}
          </tbody>
        </table>
        <div style={{ padding: '8px', borderTop: '1px solid #eee', display: 'flex', gap: 8 }}>
          <button className="btn btn-outline-secondary" title="New" onClick={() => { setEditingRow(null); setIsFormOpen(true) }}>
            New
          </button>
          <button className="btn btn-outline-warning" title="Edit" onClick={() => { if (selectedRow) { setEditingRow(selectedRow); setIsFormOpen(true) } }} disabled={!selectedRow}>
            Edit
          </button>
          <button className="btn btn-outline-danger" title="Delete" onClick={async () => { if (selectedRow && window.confirm('Delete this GRN and all its parts?')) { 
            // Delete all parts for this GRN
            const response = await fetch(`/api/inward-lc-challan/grn/${selectedRow.grn_no}`, { method: 'DELETE' });
            if (response.ok) {
              setRows(prev => prev.filter(x => x.grn_no !== selectedRow.grn_no));
              setSelectedIndex(prev => { const len = rows.length - 1; if (len <= 0) return -1; return Math.max(0, Math.min(prev, len - 1)) });
            }
          } }} disabled={!selectedRow}>
            Delete
          </button>
          <button className="btn btn-outline-secondary" title="View" onClick={() => selectedRow && setViewRow(selectedRow)} disabled={!selectedRow}>
            View
          </button>
          <button className="btn btn-outline-primary" title="Print" onClick={() => selectedRow && handlePrint(selectedRow)} disabled={!selectedRow}>
            Print
          </button>
        </div>
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



