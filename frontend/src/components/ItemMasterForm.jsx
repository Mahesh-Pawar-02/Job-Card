import { useMemo, useState } from 'react'

function ItemMasterForm({ initialValues = {}, onSubmit, onCancel, submitLabel = 'Save', isSubmitting = false }) {
  const defaultValues = useMemo(
    () => ({
      part_number: '',
      part_name: '',
      stock_unit: '',
      rate_per_kg: '',
      weight: '',
      surface_hardness: '',
      core_hardness: '',
      case_depth: '',
      material: '',
      batch_qty: '',
      loading: '',
      broach_spline: '',
      anti_carb_paste: '',
      pattern_no: '',
      rpm: '',
      shot_blasting: '',
      punching: '',
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
    if (!form.part_number?.trim()) nextErrors.part_number = 'Required'
    if (!form.part_name?.trim()) nextErrors.part_name = 'Required'
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
        <h3 className="card-title" style={{ margin: 0 }}>{submitLabel} Item</h3>
      </div>

      <div className="form-grid">
        <div className="field">
          <label>Part Number</label>
          <input className="input" value={form.part_number} onChange={e => updateField('part_number', e.target.value)} placeholder="Part Number" />
          {errors.part_number && <div className="error">{errors.part_number}</div>}
        </div>
        <div className="field" style={{ gridColumn: '1 / -1' }}>
          <label>Part Name</label>
          <input className="input" value={form.part_name} onChange={e => updateField('part_name', e.target.value)} placeholder="Part Name" />
          {errors.part_name && <div className="error">{errors.part_name}</div>}
        </div>
        <div className="field">
          <label>Stock Unit</label>
          <input className="input" value={form.stock_unit} onChange={e => updateField('stock_unit', e.target.value)} placeholder="e.g., NOS, KG" />
        </div>
        <div className="field">
          <label>Rate per KG</label>
          <input className="input" type="number" step="0.01" value={form.rate_per_kg} onChange={e => updateField('rate_per_kg', e.target.value)} placeholder="0.00" />
        </div>
        <div className="field">
          <label>Weight</label>
          <input className="input" type="number" step="0.001" value={form.weight} onChange={e => updateField('weight', e.target.value)} placeholder="0.000" />
        </div>

        <div className="field">
          <label>Surface Hardness</label>
          <input className="input" value={form.surface_hardness} onChange={e => updateField('surface_hardness', e.target.value)} placeholder="Surface Hardness" />
        </div>
        <div className="field">
          <label>Core Hardness</label>
          <input className="input" value={form.core_hardness} onChange={e => updateField('core_hardness', e.target.value)} placeholder="Core Hardness" />
        </div>
        <div className="field">
          <label>Case Depth</label>
          <input className="input" value={form.case_depth} onChange={e => updateField('case_depth', e.target.value)} placeholder="Case Depth" />
        </div>
        <div className="field">
          <label>Material</label>
          <input className="input" value={form.material} onChange={e => updateField('material', e.target.value)} placeholder="Material" />
        </div>

        <div className="field">
          <label>Batch Qty</label>
          <input className="input" type="number" value={form.batch_qty} onChange={e => updateField('batch_qty', e.target.value)} placeholder="0" />
        </div>
        <div className="field">
          <label>Loading</label>
          <input className="input" value={form.loading} onChange={e => updateField('loading', e.target.value)} placeholder="Loading" />
        </div>
        <div className="field">
          <label>Broach/Spline</label>
          <input className="input" value={form.broach_spline} onChange={e => updateField('broach_spline', e.target.value)} placeholder="Broach or Spline" />
        </div>
        <div className="field">
          <label>Anti Carb Paste</label>
          <input className="input" value={form.anti_carb_paste} onChange={e => updateField('anti_carb_paste', e.target.value)} placeholder="Anti Carb Paste" />
        </div>
        <div className="field">
          <label>Pattern No</label>
          <input className="input" value={form.pattern_no} onChange={e => updateField('pattern_no', e.target.value)} placeholder="Pattern No" />
        </div>
        <div className="field">
          <label>RPM</label>
          <input className="input" type="number" value={form.rpm} onChange={e => updateField('rpm', e.target.value)} placeholder="RPM" />
        </div>
        <div className="field">
          <label>Shot Blasting</label>
          <input className="input" value={form.shot_blasting} onChange={e => updateField('shot_blasting', e.target.value)} placeholder="Yes/No or Details" />
        </div>
        <div className="field">
          <label>Punching</label>
          <input className="input" value={form.punching} onChange={e => updateField('punching', e.target.value)} placeholder="Yes/No or Details" />
        </div>
      </div>

      <div className="card-actions">
        <button className="btn btn-primary" type="submit" disabled={isSubmitting}>{submitLabel}</button>
        <button className="btn btn-secondary" type="button" onClick={onCancel} disabled={isSubmitting}>Cancel</button>
      </div>
    </form>
  )
}

export default ItemMasterForm


