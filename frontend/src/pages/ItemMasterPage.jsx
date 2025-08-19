import { useEffect, useMemo, useState } from 'react'
import { createItem, deleteItem, fetchAllItems, updateItem } from '../services/itemMasterApi'
import ItemMasterForm from '../components/ItemMasterForm.jsx'

function ItemMasterPage() {
  const [rows, setRows] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingRow, setEditingRow] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [viewRow, setViewRow] = useState(null)
  const [query, setQuery] = useState('')

  async function load() {
    setIsLoading(true)
    setError('')
    try {
      const data = await fetchAllItems()
      setRows(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err?.message || 'Failed to load items')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const columns = useMemo(() => ([
    { key: 'part_number', label: 'Part Number' },
    { key: 'part_name', label: 'Part Name' },
    { key: 'stock_unit', label: 'Stock Unit' },
    { key: 'rate_per_kg', label: 'Rate/Kg' },
    { key: 'weight', label: 'Weight' },
  ]), [])

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rows
    return rows.filter(row =>
      String(row.part_number || '').toLowerCase().includes(q)
      || String(row.part_name || '').toLowerCase().includes(q)
      || String(row.case_depth || '').toLowerCase().includes(q)
      || String(row.material || '').toLowerCase().includes(q)
    )
  }, [rows, query])

  function openCreate() { setEditingRow(null); setIsFormOpen(true) }
  function openEdit(row) { setEditingRow(row); setIsFormOpen(true) }

  async function handleSubmit(form) {
    setIsSubmitting(true)
    try {
      if (editingRow?.id) await updateItem(editingRow.id, form)
      else await createItem(form)
      await load()
      setIsFormOpen(false)
      setEditingRow(null)
    } catch (err) {
      alert(err?.message || 'Save failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm('Delete this item?')
    if (!confirmed) return
    try { await deleteItem(id); await load() } catch (err) { alert(err?.message || 'Delete failed') }
  }

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ margin: 0 }}>Item Master</h2>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            className="input"
            placeholder="Search by part no., name, case depth, material"
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{ minWidth: 320 }}
          />
          <button className="btn btn-primary" onClick={openCreate}>Create Item</button>
        </div>
      </div>

      {isFormOpen && (
        <ItemMasterForm
          initialValues={editingRow || {}}
          submitLabel={editingRow ? 'Update' : 'Create'}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          onCancel={() => { setIsFormOpen(false); setEditingRow(null) }}
        />
      )}

      {isLoading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!isLoading && !error && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {columns.map(col => (
                  <th key={col.key} style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '8px' }}>{col.label}</th>
                ))}
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '8px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr><td colSpan={columns.length + 1} style={{ padding: '12px', textAlign: 'center' }}>No records found</td></tr>
              ) : (
                filteredRows.map(row => (
                  <tr key={row.id}>
                    {columns.map(col => (
                      <td key={col.key} style={{ borderBottom: '1px solid #f0f0f0', padding: '8px' }}>{row[col.key] ?? ''}</td>
                    ))}
                    <td style={{ borderBottom: '1px solid #f0f0f0', padding: '8px' }}>
                      <button className="btn btn-info btn-sm" style={{ marginRight: '8px' }} onClick={() => setViewRow(row)}>View</button>
                      <button className="btn btn-warning btn-sm" style={{ marginRight: '8px' }} onClick={() => openEdit(row)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(row.id)}>Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {viewRow && (
        <div style={{ marginTop: '16px', border: '1px solid #e5e5e5', borderRadius: 6, padding: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>Item Details</h3>
            <button className="btn btn-secondary" onClick={() => setViewRow(null)}>Close</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(260px, 1fr))', gap: '8px', marginTop: '8px' }}>
            {[
              ['id', 'ID'],
              ['part_number', 'Part Number'],
              ['part_name', 'Part Name'],
              ['stock_unit', 'Stock Unit'],
              ['rate_per_kg', 'Rate/Kg'],
              ['weight', 'Weight'],
              ['surface_hardness', 'Surface Hardness'],
              ['core_hardness', 'Core Hardness'],
              ['case_depth', 'Case Depth'],
              ['material', 'Material'],
              ['batch_qty', 'Batch Qty'],
              ['loading', 'Loading'],
              ['broach_spline', 'Broach/Spline'],
              ['anti_carb_paste', 'Anti Carb Paste'],
              ['pattern_no', 'Pattern No'],
              ['rpm', 'RPM'],
              ['shot_blasting', 'Shot Blasting'],
              ['punching', 'Punching'],
            ].map(([key, label]) => (
              <div key={key} style={{ display: 'flex', gap: '8px' }}>
                <div style={{ width: 180, color: '#555' }}>{label}</div>
                <div style={{ flex: 1, fontWeight: 500 }}>{viewRow?.[key] ?? ''}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ItemMasterPage


