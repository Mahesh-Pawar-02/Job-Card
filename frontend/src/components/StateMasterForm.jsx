import { useMemo, useState } from 'react'

function StateMasterForm({ initialValues = {}, onSubmit, onCancel, submitLabel = 'Save', isSubmitting = false }) {
  const defaultValues = useMemo(
    () => ({ state_code: '', state_name: '', gst_state_code: '' }),
    []
  )
  const [form, setForm] = useState({ ...defaultValues, ...initialValues })
  const [errors, setErrors] = useState({})

  function updateField(name, value) {
    setForm(prev => ({ ...prev, [name]: value }))
  }

  function validate() {
    const nextErrors = {}
    if (!form.state_code?.trim()) nextErrors.state_code = 'Required'
    if (!form.state_name?.trim()) nextErrors.state_name = 'Required'
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
        <h3 className="card-title" style={{ margin: 0 }}>{submitLabel} State</h3>
      </div>

      <div className="form-grid">
        <div className="field">
          <label>State Code</label>
          <input className="input" value={form.state_code} onChange={e => updateField('state_code', e.target.value)} placeholder="e.g., MH, GJ" />
          {errors.state_code && <div className="error">{errors.state_code}</div>}
        </div>
        <div className="field">
          <label>State Name</label>
          <input className="input" value={form.state_name} onChange={e => updateField('state_name', e.target.value)} placeholder="e.g., Maharashtra" />
          {errors.state_name && <div className="error">{errors.state_name}</div>}
        </div>
        <div className="field">
          <label>GST State Code</label>
          <input className="input" type="number" value={form.gst_state_code} onChange={e => updateField('gst_state_code', e.target.value)} placeholder="e.g., 27 for Maharashtra" />
        </div>
      </div>

      <div className="card-actions">
        <button className="btn btn-primary" type="submit" disabled={isSubmitting}>{submitLabel}</button>
        <button className="btn btn-secondary" type="button" onClick={onCancel} disabled={isSubmitting}>Cancel</button>
      </div>
    </form>
  )
}

export default StateMasterForm


