import { useEffect, useMemo, useRef, useState } from 'react'
import { fetchNextGrnNo } from '../services/inwardLCChallanApi.js'

function InwardLCChallanForm({ parties = [], items = [], processes = [], onSubmit, onInsert, onCancel, submitLabel = 'Save', isSubmitting = false, initialValues = {}, externalSubmitSignal, editingId }) {
  // Fetch next GRN number from backend
  const [autoGrn, setAutoGrn] = useState('')
  useEffect(() => {
    let ignore = false
    async function load() {
      try {
        const data = await fetchNextGrnNo()
        if (!ignore) setAutoGrn(data?.next_grn_no || '001')
      } catch {
        if (!ignore) setAutoGrn('001')
      }
    }
    load()
    return () => { ignore = true }
  }, [])

  // Function to get current date in YYYY-MM-DD format
  function getCurrentDate() {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  // Function to format date for backend (ensure YYYY-MM-DD format)
  function formatDateForBackend(dateValue) {
    if (!dateValue) return null
    // If it's already in YYYY-MM-DD format, return as is
    if (typeof dateValue === 'string' && dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateValue
    }
    // If it's a Date object or ISO string, convert to YYYY-MM-DD
    const date = new Date(dateValue)
    return date.toISOString().split('T')[0]
  }

  const defaultValues = useMemo(
    () => ({
      grn_no: autoGrn || '001',
      grn_date: getCurrentDate(),
      supplier_id: '',
      challan_no: '',
      challan_date: getCurrentDate(),
      item_id: '',
      item_name: '',
      process_id: '',
      qty: '',
    }),
    []
  )

  const [form, setForm] = useState({ ...defaultValues, ...initialValues })

  // When autoGrn updates (initial mount), set grn_no if not editing
  useEffect(() => {
    const isEditing = Boolean(initialValues && (initialValues.id || initialValues._id)) || Boolean(editingId)
    if (!isEditing && autoGrn) {
      setForm(prev => ({ ...prev, grn_no: autoGrn }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoGrn])
  const [errors, setErrors] = useState({})
  const [supplierQuery, setSupplierQuery] = useState('')
  const [supplierOpen, setSupplierOpen] = useState(false)
  const [supplierHighlight, setSupplierHighlight] = useState(-1)
  const supplierBlurTimer = useRef(null)

  // When item changes, auto-populate item_name
  useEffect(() => {
    const selected = items.find(i => String(i._id || i.id) === String(form.item_id))
    setForm(prev => ({ ...prev, item_name: selected ? (selected.part_name || selected.part_name?.toString() || '') : '' }))
  }, [form.item_id, items])

  function updateField(name, value) {
    setForm(prev => ({ ...prev, [name]: value }))
  }

  // Filter suppliers by query
  const filteredParties = useMemo(() => {
    const q = supplierQuery.trim().toLowerCase()
    if (!q) return parties
    return parties.filter(p => (p.party_name || '').toLowerCase().includes(q))
  }, [supplierQuery, parties])

  // Keep search box in sync when supplier is picked
  useEffect(() => {
    const selected = parties.find(p => String(p._id || p.id) === String(form.supplier_id))
    if (selected) setSupplierQuery(selected.party_name || '')
  }, [form.supplier_id, parties])

  // Sync form when initialValues change (edit mode)
  useEffect(() => {
    setForm(prev => ({ ...prev, ...initialValues }))
    if (initialValues?.supplier_id) {
      const selected = parties.find(p => String(p._id || p.id) === String(initialValues.supplier_id))
      setSupplierQuery(selected?.party_name || '')
    }
  }, [JSON.stringify(initialValues)])

  function selectSupplier(p) {
    updateField('supplier_id', p._id || p.id)
    setSupplierQuery(p.party_name || '')
    setSupplierOpen(false)
    setSupplierHighlight(-1)
  }

  function handleSupplierSearchKeyDown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSupplierOpen(true)
      setSupplierHighlight(prev => Math.min((prev < 0 ? -1 : prev) + 1, filteredParties.length - 1))
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSupplierHighlight(prev => Math.max((prev < 0 ? 0 : prev) - 1, 0))
      return
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      const pick = supplierHighlight >= 0 ? filteredParties[supplierHighlight] : filteredParties[0]
      if (pick) selectSupplier(pick)
      return
    }
    if (e.key === 'Escape') {
      setSupplierOpen(false)
      setSupplierHighlight(-1)
      return
    }
  }

  function validate() {
    const nextErrors = {}
    if (!form.grn_no?.trim()) nextErrors.grn_no = 'Required'
    if (!form.grn_date) nextErrors.grn_date = 'Required'
    if (!form.supplier_id) nextErrors.supplier_id = 'Required'
    if (!form.challan_no?.trim()) nextErrors.challan_no = 'Required'
    if (!form.challan_date) nextErrors.challan_date = 'Required'
    if (!form.item_id) nextErrors.item_id = 'Required'
    if (!form.process_id) nextErrors.process_id = 'Required'
    if (!form.qty || Number(form.qty) <= 0) nextErrors.qty = 'Must be > 0'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(e) {
    e?.preventDefault?.()
    if (!validate()) return
    // Format dates before sending to backend
    const formattedForm = {
      ...form,
      grn_date: formatDateForBackend(form.grn_date),
      challan_date: formatDateForBackend(form.challan_date)
    }
    await onSubmit?.(formattedForm)
  }

  async function handleInsert(e) {
    e?.preventDefault?.()
    if (!validate()) return
    // Format dates before sending to backend
    const formattedForm = {
      ...form,
      grn_date: formatDateForBackend(form.grn_date),
      challan_date: formatDateForBackend(form.challan_date)
    }
    await onInsert?.(formattedForm)
    // Reset only line-level fields to allow inserting next part under same challan/GRN
    setForm(prev => ({
      ...prev,
      item_id: '',
      item_name: '',
      process_id: '',
      qty: ''
    }))
    setErrors({})
  }

  // Allow parent to trigger submit (for Update action in table)
  useEffect(() => {
    if (externalSubmitSignal && editingId) {
      handleSubmit()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalSubmitSignal])

  return (
    <form onSubmit={handleSubmit} className="card">
      <div className="card-header">
        <h3 className="card-title" style={{ margin: 0 }}>{submitLabel} Inward Challan for L/C</h3>
        <p className="card-subtitle">GRN number Dates set to current. Enter supplier, challan details, item and quantity.</p>
      </div>

      <div className="form-grid">
        <div className="field">
          <label>G.R.N. No</label>
          <input className="input" value={form.grn_no} onChange={e => updateField('grn_no', e.target.value)} placeholder="G.R.N. No" />
          {errors.grn_no && <div className="error">{errors.grn_no}</div>}
        </div>
        <div className="field">
          <label>G.R.N. Date</label>
          <input className="input" type="date" value={form.grn_date} onChange={e => updateField('grn_date', e.target.value)} />
          {errors.grn_date && <div className="error">{errors.grn_date}</div>}
        </div>

        <div className="field" style={{ gridColumn: '1 / -1', position: 'relative' }}>
          <label>Supplier (type initials to search)</label>
          <input
            className="input"
            placeholder="Start typing supplier name"
            value={supplierQuery}
            onChange={e => {
              setSupplierQuery(e.target.value)
              setSupplierOpen(true)
              setSupplierHighlight(-1)
              if (form.supplier_id) updateField('supplier_id', '')
            }}
            onKeyDown={handleSupplierSearchKeyDown}
            onFocus={() => setSupplierOpen(true)}
            onBlur={() => {
              supplierBlurTimer.current = setTimeout(() => {
                setSupplierOpen(false)
                setSupplierHighlight(-1)
              }, 120)
            }}
          />
          {supplierOpen && (
            <div
              style={{
                position: 'absolute', top: '100%', left: 0, right: 0,
                background: '#fff', border: '1px solid #e1e5e9', borderRadius: 6,
                marginTop: 4, maxHeight: 220, overflowY: 'auto', zIndex: 10
              }}
              onMouseDown={() => clearTimeout(supplierBlurTimer.current)}
              onMouseUp={() => setTimeout(() => setSupplierOpen(false), 0)}
            >
              {filteredParties.length === 0 ? (
                <div style={{ padding: '0.5rem 0.75rem', color: '#b00020' }}>
                  Supplier not added in party master
                </div>
              ) : (
                filteredParties.map((p, idx) => (
                  <div
                    key={p._id || p.id}
                    onMouseEnter={() => setSupplierHighlight(idx)}
                    onClick={() => selectSupplier(p)}
                    style={{
                      padding: '0.5rem 0.75rem',
                      background: supplierHighlight === idx ? '#f8f9fa' : 'transparent',
                      cursor: 'pointer'
                    }}
                  >
                    {p.party_name}
                  </div>
                ))
              )}
            </div>
          )}
          {errors.supplier_id && <div className="error">{errors.supplier_id}</div>}
        </div>

        <div className="field">
          <label>Challan No</label>
          <input className="input" value={form.challan_no} onChange={e => updateField('challan_no', e.target.value)} placeholder="Challan No" />
          {errors.challan_no && <div className="error">{errors.challan_no}</div>}
        </div>
        <div className="field">
          <label>Challan Date</label>
          <input className="input" type="date" value={form.challan_date} onChange={e => updateField('challan_date', e.target.value)} />
          {errors.challan_date && <div className="error">{errors.challan_date}</div>}
        </div>

        <div className="field">
          <label>Item No (from Item Master)</label>
          <select className="input" value={form.item_id} onChange={e => updateField('item_id', e.target.value)}>
            <option value="">Select item</option>
            {items.map(it => (
              <option key={it._id || it.id} value={it._id || it.id}>{it.part_number}</option>
            ))}
          </select>
          {errors.item_id && <div className="error">{errors.item_id}</div>}
        </div>
        <div className="field" style={{ gridColumn: '1 / -1' }}>
          <label>Item Name</label>
          <input className="input" value={form.item_name} onChange={e => updateField('item_name', e.target.value)} placeholder="Item Name" readOnly />
        </div>

        <div className="field">
          <label>Process</label>
          <select className="input" value={form.process_id} onChange={e => updateField('process_id', e.target.value)}>
            <option value="">Select process</option>
            {processes.map(pr => (
              <option key={pr._id || pr.id} value={pr._id || pr.id}>{pr.process_name || pr.name}</option>
            ))}
          </select>
          {errors.process_id && <div className="error">{errors.process_id}</div>}
        </div>

        <div className="field">
          <label>Qty</label>
          <input className="input" type="number" step="1" value={form.qty} onChange={e => updateField('qty', e.target.value)} placeholder="0" />
          {errors.qty && <div className="error">{errors.qty}</div>}
        </div>
      </div>

      <div className="form-actions">
        <button className="btn btn-success" type="submit" disabled={isSubmitting}>{submitLabel}</button>
        {!editingId && (
          <button className="btn btn-primary" type="button" onClick={handleInsert} disabled={isSubmitting}>Insert</button>
        )}
        <button className="btn btn-secondary" type="button" onClick={onCancel} disabled={isSubmitting}>Cancel</button>
      </div>
    </form>
  )
}

export default InwardLCChallanForm



