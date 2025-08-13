import { useMemo, useState } from 'react'

function PartyMasterForm({ initialValues = {}, onSubmit, onCancel, submitLabel = 'Save', isSubmitting = false }) {
  const defaultValues = useMemo(
    () => ({
      party_name: '',
      party_type: '',
      vendor_code: '',
      email: '',
      contact_person: '',
      state: '',
      gstin: '',
      address: '',
    }),
    []
  )

  const [form, setForm] = useState({ ...defaultValues, ...initialValues })
  const [errors, setErrors] = useState({})

  function updateField(name, value) {
    setForm(prev => ({ ...prev, [name]: value }))
  }

  function validate() {
    const nextErrors = {}
    if (!form.party_name?.trim()) nextErrors.party_name = 'Required'
    if (!form.party_type?.trim()) nextErrors.party_type = 'Required'
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = 'Invalid email'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    await onSubmit?.(form)
  }

  return (
    <form onSubmit={handleSubmit} className="card">
      <div className="card-header">
        <h3 className="card-title" style={{ margin: 0 }}>{submitLabel} Party</h3>
        <p className="card-subtitle">Tip: Use Tab key to jump to the next field quickly. Use Shift+Tab to go to previous fields.</p>
      </div>

      <div className="form-grid">
        <div className="field">
          <label>Party Name</label>
          <input className="input" value={form.party_name} onChange={e => updateField('party_name', e.target.value)} placeholder="Party Name" />
          {errors.party_name && <div className="error">{errors.party_name}</div>}
        </div>
        <div className="field">
          <label>Party Type</label>
          <input className="input" value={form.party_type} onChange={e => updateField('party_type', e.target.value)} placeholder="Party Type" />
          {errors.party_type && <div className="error">{errors.party_type}</div>}
        </div>
        <div className="field">
          <label>Vendor Code</label>
          <input className="input" value={form.vendor_code} onChange={e => updateField('vendor_code', e.target.value)} placeholder="Vendor Code" />
        </div>
        <div className="field">
          <label>Email</label>
          <input className="input" value={form.email} onChange={e => updateField('email', e.target.value)} placeholder="Email" />
          {errors.email && <div className="error">{errors.email}</div>}
        </div>
        <div className="field">
          <label>Contact Person</label>
          <input className="input" value={form.contact_person} onChange={e => updateField('contact_person', e.target.value)} placeholder="Contact Person" />
        </div>
        <div className="field">
          <label>State</label>
          <input className="input" value={form.state} onChange={e => updateField('state', e.target.value)} placeholder="State" />
        </div>
        <div className="field">
          <label>GSTIN</label>
          <input className="input" value={form.gstin} onChange={e => updateField('gstin', e.target.value)} placeholder="GSTIN" />
        </div>
        <div className="field" style={{ gridColumn: '1 / -1' }}>
          <label>Address</label>
          <input className="input" value={form.address} onChange={e => updateField('address', e.target.value)} placeholder="Address" />
        </div>
      </div>

      <div className="form-actions">
        <button className="btn btn-success" type="submit" disabled={isSubmitting}>{submitLabel}</button>
        <button className="btn btn-secondary" type="button" onClick={onCancel} disabled={isSubmitting}>Cancel</button>
      </div>
    </form>
  )
}

export default PartyMasterForm


