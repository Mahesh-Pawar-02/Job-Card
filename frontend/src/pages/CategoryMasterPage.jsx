import { useEffect, useMemo, useRef, useState } from 'react'
import { fetchAllCategories, createCategory, updateCategory, deleteCategory } from '../services/categoryMasterApi.js'

function CategoryMasterPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [mode, setMode] = useState('idle') // 'idle' | 'new' | 'edit'
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const tableContainerRef = useRef(null)

  const defaultCategories = useMemo(() => [
    'Bought out material',
    'Finish Good',
    'Fixtures',
    'JTI',
    'Raw Material',
  ], [])

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError('')
    fetchAllCategories()
      .then(list => { 
        if (!isMounted) return
        const arr = Array.isArray(list) ? list : []
        setCategories(arr)
        setSelectedIndex(arr.length > 0 ? 0 : -1)
      })
      .catch(err => { if (isMounted) setError(err?.message || 'Failed to load') })
      .finally(() => { if (isMounted) setLoading(false) })
    return () => { isMounted = false }
  }, [])

  // Keyboard navigation for row selection
  useEffect(() => {
    const el = tableContainerRef.current
    if (!el) return
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => {
          if (categories.length === 0) return -1
          const next = Math.min((prev < 0 ? -1 : prev) + 1, categories.length - 1)
          return next
        })
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => {
          if (categories.length === 0) return -1
          const next = Math.max((prev < 0 ? 0 : prev) - 1, 0)
          return next
        })
      }
    }
    el.addEventListener('keydown', handleKeyDown)
    return () => el.removeEventListener('keydown', handleKeyDown)
  }, [categories.length])

  async function handleSave(e) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    try {
      setSaving(true)
      if (mode === 'edit' && editing) {
        const updated = await updateCategory(editing.id, { category_name: trimmed })
        setCategories(prev => prev.map(c => c.id === editing.id ? updated : c))
        const idx = categories.findIndex(c => c.id === editing.id)
        if (idx >= 0) setSelectedIndex(idx)
      } else {
        const created = await createCategory({ category_name: trimmed })
        setCategories(prev => [...prev, created])
        setSelectedIndex(categories.length)
      }
      setEditing(null)
      setName('')
      setMode('idle')
    } catch (err) {
      alert(err?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this category?')) return
    try {
      await deleteCategory(id)
      setCategories(prev => prev.filter(c => c.id !== id))
      setSelectedIndex(prev => {
        if (categories.length <= 1) return -1
        return Math.max(0, Math.min(prev, categories.length - 2))
      })
    } catch (err) {
      alert(err?.message || 'Failed to delete')
    }
  }

  const selectedCategory = selectedIndex >= 0 ? categories[selectedIndex] : null

  function startNew() {
    setMode('new')
    setEditing(null)
    setName('')
  }

  function startEditSelected() {
    if (!selectedCategory) return
    setMode('edit')
    setEditing(selectedCategory)
    setName(selectedCategory.category_name)
  }

  function resetForm() {
    setEditing(null)
    setName('')
    setMode('idle')
  }

  if (loading) return <div className="container py-3">Loading...</div>
  if (error) return <div className="container py-3 text-danger">{error}</div>

  return (
    <div className="container py-3">
      {/* Inline editor shown only when New/Edit is active */}
      {(mode === 'new' || mode === 'edit') && (
        <div className="card shadow-sm mb-3">
          <div className="card-header bg-white d-flex justify-content-between align-items-center">
            <h5 className="m-0">{mode === 'new' ? 'New Category' : 'Edit Category'}</h5>
          </div>
          <div className="card-body">
            <form className="row g-2" onSubmit={handleSave}>
              <div className="col-sm-6 col-md-4">
                <label className="form-label">Category Name</label>
                <input className="form-control" value={name} onChange={e => setName(e.target.value)} placeholder="Enter category" autoFocus />
              </div>
              <div className="col-12 d-flex align-items-end gap-2">
                <button className="btn btn-primary" type="submit" disabled={saving}>
                  <i className="bi bi-save me-1" /> Save
                </button>
                <button className="btn btn-secondary" type="button" onClick={resetForm} disabled={saving}>
                  <i className="bi bi-x-circle me-1" /> Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card shadow-sm" ref={tableContainerRef} tabIndex="0">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <h6 className="m-0">Category Master</h6>
          <div className="text-muted small">Use Up/Down arrows or click to select</div>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover m-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th style={{width:'60px'}}>#</th>
                  <th>Category Name</th>
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 && (
                  <tr><td colSpan="2" className="text-center py-4">No categories</td></tr>
                )}
                {categories.map((cat, idx) => (
                  <tr key={cat.id} className={selectedIndex === idx ? 'table-active' : ''} onClick={() => setSelectedIndex(idx)} style={{ cursor: 'pointer' }}>
                    <td>{idx + 1}</td>
                    <td>{cat.category_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card-footer bg-light d-flex gap-2 justify-content-start">
          <button className="btn btn-outline-secondary" title="New" onClick={startNew}>
            <i className="bi bi-plus-square me-1" /> New
          </button>
          <button className="btn btn-outline-warning" title="Edit" onClick={startEditSelected} disabled={!selectedCategory}>
            <i className="bi bi-pencil-square me-1" /> Edit
          </button>
          <button className="btn btn-outline-danger" title="Delete" onClick={() => selectedCategory && handleDelete(selectedCategory.id)} disabled={!selectedCategory}>
            <i className="bi bi-x-square me-1" /> Delete
          </button>
          <button className="btn btn-outline-secondary" title="View" disabled={!selectedCategory}>
            <i className="bi bi-eye me-1" /> View
          </button>
          <button className="btn btn-outline-primary" title="Print">
            <i className="bi bi-printer me-1" /> Print
          </button>
        </div>
      </div>
    </div>
  )
}

export default CategoryMasterPage


