import { useMemo, useState } from 'react'

function TaxMasterForm({ initialValues = {}, onSubmit, onCancel, submitLabel = 'Save', isSubmitting = false }) {
  const defaultValues = useMemo(
    () => ({ tax_name: '', cgst_per: '', sgst_per: '', igst_per: '', cess_per: '' }),
    []
  )
  const [form, setForm] = useState({ ...defaultValues, ...initialValues })
  const [errors, setErrors] = useState({})

  function updateField(name, value) {
    setForm(prev => ({ ...prev, [name]: value }))
  }

  function validate() {
    const nextErrors = {}
    if (!form.tax_name?.trim()) nextErrors.tax_name = 'Required'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    await onSubmit?.({
      ...form,
      cgst_per: form.cgst_per === '' ? 0 : Number(form.cgst_per),
      sgst_per: form.sgst_per === '' ? 0 : Number(form.sgst_per),
      igst_per: form.igst_per === '' ? 0 : Number(form.igst_per),
      cess_per: form.cess_per === '' ? 0 : Number(form.cess_per),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="card">
      <div className="card-header">
        <h3 className="card-title" style={{ margin: 0 }}>{submitLabel} Tax</h3>
      </div>

      <div className="form-grid">
        <div className="field" style={{ gridColumn: '1 / -1' }}>
          <label>Tax Name</label>
          <input className="input" value={form.tax_name} onChange={e => updateField('tax_name', e.target.value)} placeholder="e.g., GST 18%" />
          {errors.tax_name && <div className="error">{errors.tax_name}</div>}
        </div>
        <div className="field">
          <label>CGST %</label>
          <input className="input" type="number" step="0.01" value={form.cgst_per} onChange={e => updateField('cgst_per', e.target.value)} placeholder="0.00" />
        </div>
        <div className="field">
          <label>SGST %</label>
          <input className="input" type="number" step="0.01" value={form.sgst_per} onChange={e => updateField('sgst_per', e.target.value)} placeholder="0.00" />
        </div>
        <div className="field">
          <label>IGST %</label>
          <input className="input" type="number" step="0.01" value={form.igst_per} onChange={e => updateField('igst_per', e.target.value)} placeholder="0.00" />
        </div>
        <div className="field">
          <label>Cess %</label>
          <input className="input" type="number" step="0.01" value={form.cess_per} onChange={e => updateField('cess_per', e.target.value)} placeholder="0.00" />
        </div>
      </div>

      <div className="card-actions">
        <button className="btn btn-primary" type="submit" disabled={isSubmitting}>{submitLabel}</button>
        <button className="btn btn-secondary" type="button" onClick={onCancel} disabled={isSubmitting}>Cancel</button>
      </div>
    </form>
  )
}

export default TaxMasterForm


