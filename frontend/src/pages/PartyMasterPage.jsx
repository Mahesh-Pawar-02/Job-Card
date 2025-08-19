import { useEffect, useMemo, useState } from 'react'
import { createParty, deleteParty, fetchAllParties, updateParty } from '../services/partyMasterApi'
import PartyMasterForm from '../components/PartyMasterForm.jsx'

function PartyMasterPage() {
  const [parties, setParties] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingRow, setEditingRow] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [query, setQuery] = useState('')

  async function loadParties() {
    setIsLoading(true)
    setError('')
    try {
      const data = await fetchAllParties()
      setParties(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err?.message || 'Failed to load parties')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadParties()
  }, [])

  const columns = useMemo(
    () => [
      { key: 'party_name', label: 'Party Name' },
      { key: 'party_type', label: 'Type' },
      { key: 'vendor_code', label: 'Vendor Code' },
      { key: 'email', label: 'Email' },
    ],
    []
  )

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return parties
    return parties.filter(row =>
      String(row.party_name || '').toLowerCase().includes(q)
      || String(row.party_type || '').toLowerCase().includes(q)
      || String(row.vendor_code || '').toLowerCase().includes(q)
      || String(row.email || '').toLowerCase().includes(q)
      || String(row.gstin || '').toLowerCase().includes(q)
      || String(row.state || '').toLowerCase().includes(q)
      || String(row.contact_person || '').toLowerCase().includes(q)
    )
  }, [parties, query])

  async function handleDelete(id) {
    const confirmed = window.confirm('Are you sure you want to delete this party?')
    if (!confirmed) return
    try {
      await deleteParty(id)
      await loadParties()
    } catch (err) {
      alert(err?.message || 'Delete failed')
    }
  }

  const [viewRow, setViewRow] = useState(null)

  function openCreate() {
    setEditingRow(null)
    setIsFormOpen(true)
  }

  function openEdit(row) {
    setEditingRow(row)
    setIsFormOpen(true)
  }

  async function handleSubmit(form) {
    setIsSubmitting(true)
    try {
      if (editingRow?.id) {
        await updateParty(editingRow.id, form)
      } else {
        await createParty(form)
      }
      await loadParties()
      setIsFormOpen(false)
      setEditingRow(null)
    } catch (err) {
      alert(err?.message || 'Save failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ margin: 0 }}>Party Master</h2>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            className="input"
            placeholder="Search by name, type, vendor, email, GSTIN, state, contact"
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{ minWidth: 360 }}
          />
          <button className="btn btn-primary" onClick={openCreate}>
            Create Party
          </button>
        </div>
      </div>

      {isFormOpen && (
        <PartyMasterForm
          initialValues={editingRow || {}}
          submitLabel={editingRow ? 'Update' : 'Create'}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          onCancel={() => { setIsFormOpen(false); setEditingRow(null) }}
        />
      )}

      {isLoading && <p>Loading...</p>}
      {error && (
        <p style={{ color: 'red' }}>
          {error}
        </p>
      )}

      {!isLoading && !error && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {columns.map(col => (
                  <th key={col.key} style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '8px' }}>
                    {col.label}
                  </th>
                ))}
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '8px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} style={{ padding: '12px', textAlign: 'center' }}>
                    No records found
                  </td>
                </tr>
              ) : (
                filteredRows.map(row => (
                  <tr key={row.id}>
                    {columns.map(col => (
                      <td key={col.key} style={{ borderBottom: '1px solid #f0f0f0', padding: '8px' }}>
                        {row[col.key] ?? ''}
                      </td>
                    ))}
                    <td style={{ borderBottom: '1px solid #f0f0f0', padding: '8px' }}>
                      <button className="btn btn-info btn-sm" style={{ marginRight: '8px' }} onClick={() => setViewRow(row)}>
                        View
                      </button>
                      <button className="btn btn-warning btn-sm" style={{ marginRight: '8px' }} onClick={() => openEdit(row)}>
                        Edit
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(row.id)}>
                        Delete
                      </button>
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
            <h3 style={{ margin: 0 }}>Party Details</h3>
            <button className="btn btn-secondary" onClick={() => setViewRow(null)}>Close</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(260px, 1fr))', gap: '8px', marginTop: '8px' }}>
            {[
              ['id', 'ID'],
              ['party_name', 'Party Name'],
              ['party_type', 'Party Type'],
              ['vendor_code', 'Vendor Code'],
              ['address', 'Address'],
              ['telephone_nos', 'Telephone Nos'],
              ['email', 'Email'],
              ['contact_person', 'Contact Person'],
              ['legal_name', 'Legal Name'],
              ['trade_name', 'Trade Name'],
              ['pan', 'PAN'],
              ['tcs_applicable', 'TCS Applicable'],
              ['trans_catg', 'Transaction Category'],
              ['gstin', 'GSTIN'],
              ['state', 'State'],
              ['ac_ledger_name', 'A/C Ledger Name'],
              ['place', 'Place'],
              ['pin', 'PIN'],
              ['distance_km', 'Distance (km)'],
              ['country_code', 'Country Code'],
              ['port_code', 'Port Code'],
              ['currency_code', 'Currency Code'],
              ['ledger_name_tally', 'Ledger Name (Tally)'],
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

export default PartyMasterPage


