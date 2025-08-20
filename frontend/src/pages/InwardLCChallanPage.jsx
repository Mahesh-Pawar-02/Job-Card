import { useEffect, useState } from 'react'
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
        setRows(Array.isArray(list) ? list : [])
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

  async function handleSubmit(payload) {
    try {
      setSubmitting(true)
      if (editingRow?.id) {
        const updated = await updateInwardLC(editingRow.id, payload)
        setRows(prev => prev.map(r => r.id === editingRow.id ? updated : r).sort((a,b)=>Number(a.grn_no)-Number(b.grn_no)))
        setEditingRow(null)
        setIsFormOpen(false)
      } else {
        const created = await createInwardLC(payload)
        setRows(prev => [...prev, created].sort((a,b)=>Number(a.grn_no)-Number(b.grn_no)))
        setIsFormOpen(false)
      }
    } catch (e) {
      setError(e?.message || 'Failed to save')
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

  if (loading) return <div>Loading...</div>
  if (error) return <div style={{ color: 'red' }}>{error}</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ margin: 0 }}>Inward Challan for L/C</h2>
        <button type="button" className="btn btn-primary" onClick={() => { setEditingRow(null); setIsFormOpen(true) }}>Create</button>
      </div>

      {isFormOpen && (
        <InwardLCChallanForm
          parties={parties}
          items={items}
          processes={processes}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={submitting}
          submitLabel={editingRow ? 'Update' : 'Save'}
          initialValues={editingRow || {}}
        />
      )}
      <div style={{ marginTop: '16px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['GRN No','GRN Date','Supplier','Challan No','Challan Date','Item','Process','Qty','Actions'].map(h => (
                <th key={h} style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '8px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={9} style={{ padding: '12px', textAlign: 'center' }}>No records</td></tr>
            ) : (
              rows.map(r => (
                <tr key={r.id}>
                  <td style={{ borderBottom: '1px solid #f0f0f0', padding: '8px' }}>{r.grn_no}</td>
                  <td style={{ borderBottom: '1px solid #f0f0f0', padding: '8px' }}>{r.grn_date?.slice?.(0,10)}</td>
                  <td style={{ borderBottom: '1px solid #f0f0f0', padding: '8px' }}>{(parties.find(p => (p.id||p._id) == r.supplier_id)?.party_name) || r.supplier_id}</td>
                  <td style={{ borderBottom: '1px solid #f0f0f0', padding: '8px' }}>{r.challan_no}</td>
                  <td style={{ borderBottom: '1px solid #f0f0f0', padding: '8px' }}>{r.challan_date?.slice?.(0,10)}</td>
                  <td style={{ borderBottom: '1px solid #f0f0f0', padding: '8px' }}>{(items.find(i => (i.id||i._id) == r.item_id)?.part_number) || r.item_id}</td>
                  <td style={{ borderBottom: '1px solid #f0f0f0', padding: '8px' }}>{(processes.find(p => (p.id||p._id) == r.process_id)?.process_name) || ''}</td>
                  <td style={{ borderBottom: '1px solid #f0f0f0', padding: '8px' }}>{r.qty}</td>
                  <td style={{ borderBottom: '1px solid #f0f0f0', padding: '8px' }}>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button type="button" className="btn btn-info btn-sm" onClick={() => setViewRow(r)}>View</button>
                      <button type="button" className="btn btn-warning btn-sm" onClick={() => { setEditingRow(r); setIsFormOpen(true) }}>Edit</button>
                      <button type="button" className="btn btn-danger btn-sm" onClick={async () => { if (window.confirm('Delete this entry?')) { await deleteInwardLC(r.id); setRows(prev => prev.filter(x => x.id !== r.id)) }}}>Delete</button>
                      <button type="button" className="btn btn-primary btn-sm" onClick={() => handlePrint(r)}>Print</button>
                    </div>
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



