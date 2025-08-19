import { useMemo, useState } from 'react'

function UnitMasterForm({ initialValues = {}, onSubmit, onCancel, submitLabel = 'Save', isSubmitting = false }) {
  const defaultValues = useMemo(
    () => ({ unit_code: '', unit_name: '' }),
    []
  )
  const [form, setForm] = useState({ ...defaultValues, ...initialValues })
  const [errors, setErrors] = useState({})

  function updateField(name, value) {
    setForm(prev => ({ ...prev, [name]: value }))
  }

  function validate() {
    const nextErrors = {}
    if (!form.unit_code?.trim()) nextErrors.unit_code = 'Required'
    if (!form.unit_name?.trim()) nextErrors.unit_name = 'Required'
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
        <h3 className="card-title" style={{ margin: 0 }}>{submitLabel} Unit</h3>
      </div>

      <div className="form-grid">
        <div className="field">
          <label>Unit Code</label>
          <input className="input" value={form.unit_code} onChange={e => updateField('unit_code', e.target.value)} placeholder="e.g., KG, NOS" />
          {errors.unit_code && <div className="error">{errors.unit_code}</div>}
        </div>
        <div className="field" style={{ gridColumn: '1 / -1' }}>
          <label>Unit Name</label>
          <input className="input" value={form.unit_name} onChange={e => updateField('unit_name', e.target.value)} placeholder="e.g., Kilograms" />
          {errors.unit_name && <div className="error">{errors.unit_name}</div>}
        </div>
      </div>

      <div className="card-actions">
        <button className="btn btn-primary" type="submit" disabled={isSubmitting}>{submitLabel}</button>
        <button className="btn btn-secondary" type="button" onClick={onCancel} disabled={isSubmitting}>Cancel</button>
      </div>
    </form>
  )
}

export default UnitMasterForm


