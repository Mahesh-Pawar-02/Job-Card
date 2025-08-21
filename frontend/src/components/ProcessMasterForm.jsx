import { useMemo, useState } from 'react'

function ProcessMasterForm({ initialValues = {}, onSubmit, onCancel, submitLabel = 'Save', isSubmitting = false }) {
  const defaultValues = useMemo(
    () => ({
      process_code: '',
      process_name: '',
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
    if (!form.process_code?.trim()) nextErrors.process_code = 'Required'
    if (!form.process_name?.trim()) nextErrors.process_name = 'Required'
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
        <h3 className="card-title" style={{ margin: 0 }}>{submitLabel} Process</h3>
      </div>

      <div className="form-grid">
        <div className="field">
          <label>Process Code</label>
          <input className="input" value={form.process_code} onChange={e => updateField('process_code', e.target.value)} placeholder="e.g., CHT" />
          {errors.process_code && <div className="error">{errors.process_code}</div>}
        </div>
        <div className="field" style={{ gridColumn: '1 / -1' }}>
          <label>Process Name</label>
          <input className="input" value={form.process_name} onChange={e => updateField('process_name', e.target.value)} placeholder="e.g., Carburizing Hardneing & Tempering" />
          {errors.process_name && <div className="error">{errors.process_name}</div>}
        </div>
      </div>

      <div className="card-actions">
        <button className="btn btn-primary" type="submit" disabled={isSubmitting}>{submitLabel}</button>
        <button className="btn btn-secondary" type="button" onClick={onCancel} disabled={isSubmitting}>Cancel</button>
      </div>
    </form>
  )
}

export default ProcessMasterForm


