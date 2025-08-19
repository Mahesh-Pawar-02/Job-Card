import { useEffect, useMemo, useMemo as memo, useState } from 'react'
import { createState, deleteState, fetchAllStates, updateState } from '../services/stateMasterApi'
import StateMasterForm from '../components/StateMasterForm.jsx'

function StateMasterPage() {
  const [rows, setRows] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingRow, setEditingRow] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [viewRow, setViewRow] = useState(null)

  async function load() {
    setIsLoading(true)
    setError('')
    try {
      const data = await fetchAllStates()
      setRows(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err?.message || 'Failed to load states')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const columns = useMemo(() => ([
    { key: 'state_code', label: 'Code' },
    { key: 'state_name', label: 'State Name' },
    { key: 'gst_state_code', label: 'GST Code' },
  ]), [])

  const [query, setQuery] = useState('')
  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rows
    return rows.filter(r =>
      String(r.state_code || '').toLowerCase().includes(q) ||
      String(r.state_name || '').toLowerCase().includes(q) ||
      String(r.gst_state_code ?? '').toLowerCase().includes(q)
    )
  }, [rows, query])

  function openCreate() { setEditingRow(null); setIsFormOpen(true) }
  function openEdit(row) { setEditingRow(row); setIsFormOpen(true) }

  async function handleSubmit(form) {
    setIsSubmitting(true)
    try {
      if (editingRow?.id) await updateState(editingRow.id, form)
      else await createState(form)
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
    const confirmed = window.confirm('Delete this state?')
    if (!confirmed) return
    try { await deleteState(id); await load() } catch (err) { alert(err?.message || 'Delete failed') }
  }

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ margin: 0 }}>State Master</h2>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            className="input"
            placeholder="Search by code, name or GST code"
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{ minWidth: 260 }}
          />
          <button className="btn btn-primary" onClick={openCreate}>Create State</button>
        </div>
      </div>

      {isFormOpen && (
        <StateMasterForm
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
            <h3 style={{ margin: 0 }}>State Details</h3>
            <button className="btn btn-secondary" onClick={() => setViewRow(null)}>Close</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(260px, 1fr))', gap: '8px', marginTop: '8px' }}>
            {[
              ['id', 'ID'],
              ['state_code', 'Code'],
              ['state_name', 'State Name'],
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

export default StateMasterPage


