import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import InwardLCChallanForm from '../components/InwardLCChallanForm'
import {
  fetchInwardLCList,
  createInwardLC,
  updateInwardLC,
  deleteInwardLC,
  fetchInwardLCById,
  deleteMultipleInwardLC
} from '../services/inwardLCChallanApi'
import {
  handleApiResponse,
  handleApiError,
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  showWarningToast,
  showLoadingToast,
  updateLoadingToast
} from '../utils/toastUtils'
import { FiRefreshCcw, FiSearch } from 'react-icons/fi'


// Icons for action buttons
const ViewIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
)

const DeleteIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </svg>
)

const PrintIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="6,9 6,2 18,2 18,9" />
    <path d="M6,18H4a2,2,0,0,1-2-2V11a2,2,0,0,1,2-2H20a2,2,0,0,1,2,2v5a2,2,0,0,1-2,2H18" />
    <polyline points="6,14,6,18,18,18,18,14" />
  </svg>
)


function InwardLCChallanPage() {
  const [inwards, setInwards] = useState([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingInward, setEditingInward] = useState(null)
  const [selectedInward, setSelectedInward] = useState(null)
  const [selectedRows, setSelectedRows] = useState([])

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('')


  // Load data function
  const loadData = useCallback(async (page = 1, limit = 10, search = '') => {
    try {
      setLoading(true)
      const response = await fetchInwardLCList(page, limit, search)

      if (response.success) {
        setInwards(response.data)
        setTotalPages(response.pagination.totalPages)
        setTotalItems(response.pagination.totalItems)
        setCurrentPage(response.pagination.currentPage)
        setItemsPerPage(response.pagination.itemsPerPage)
      } else {
        showErrorToast(response.error || 'Failed to load inwards')
      }
    } catch (error) {
      handleApiError(error, 'Failed to load inwards')
    } finally {
      setLoading(false)
    }
  }, [])


  // Load data on component mount
  useEffect(() => {
    loadData()
  }, [loadData])


  // Handle refresh - reset all filters and show default list
  const handleRefresh = () => {
    setSearchTerm('')
    setCurrentPage(1)
    loadData(1, itemsPerPage, '')
  }

  // Handle search
  const handleSearch = () => {
    setCurrentPage(1)
    loadData(1, itemsPerPage, searchTerm)
  }

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page)
    loadData(page, itemsPerPage, searchTerm)
  }

  // Handle items per page change
  const handleItemsPerPageChange = (newLimit) => {
    setItemsPerPage(newLimit)
    setCurrentPage(1)
    loadData(1, newLimit, searchTerm)
  }

  // Handle form submit (create/update)
  const handleSubmit = async (formData) => {
    const loadingToast = showLoadingToast(editingInward ? 'Updating inward...' : 'Creating inward...')

    try {
      let response
      if (editingInward) {
        response = await updateInwardLC(editingInward.id, formData)
        if (response.success) {
          updateLoadingToast(loadingToast, 'success', 'Inward updated successfully!')
          setShowForm(false)
          setEditingInward(null)
          loadData(currentPage, itemsPerPage, searchTerm)
        }
      } else {
        response = await createInwardLC(formData)
        if (response.success) {
          updateLoadingToast(loadingToast, 'success', 'Inward created successfully!')
          setShowForm(false)
          loadData(currentPage, itemsPerPage, searchTerm)
        }
      }

      if (!response.success) {
        updateLoadingToast(loadingToast, 'error', response.error || 'Operation failed')
      }
    } catch (error) {
      updateLoadingToast(loadingToast, 'error', 'Operation failed. Please try again.')
    }
  }

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this inward?')) return

    const loadingToast = showLoadingToast('Deleting inward...')

    try {
      const response = await deleteInwardLC(id)
      if (response.success) {
        updateLoadingToast(loadingToast, 'success', 'Inward deleted successfully!')
        if (selectedInward && selectedInward.id === id) {
          setSelectedInward(null)
        }
        loadData(currentPage, itemsPerPage, searchTerm)
      } else {
        updateLoadingToast(loadingToast, 'error', response.error || 'Failed to delete inward')
      }
    } catch (error) {
      updateLoadingToast(loadingToast, 'error', 'Failed to delete inward. Please try again.')
    }
  }

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) {
      showWarningToast('Please select inwards to delete')
      return
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedRows.length} selected inwards?`)) return

    const loadingToast = showLoadingToast(`Deleting ${selectedRows.length} inwards...`)

    try {
      const response = await deleteMultipleInwardLC(selectedRows)
      if (response.success) {
        updateLoadingToast(loadingToast, 'success', response.message || 'Inwards deleted successfully!')
        setSelectedRows([])
        if (selectedInward && selectedRows.includes(selectedInward.id)) {
          setSelectedInward(null)
        }
        loadData(currentPage, itemsPerPage, searchTerm)
      } else {
        updateLoadingToast(loadingToast, 'error', response.error || 'Failed to delete inwards')
      }
    } catch (error) {
      updateLoadingToast(loadingToast, 'error', 'Failed to delete inwards. Please try again.')
    }
  }

  // Handle view inward details
  const handleViewInward = async (id) => {
    try {
      const response = await fetchInwardLCById(id)
      if (response.success) {
        setSelectedInward(response.data)
      } else {
        showErrorToast(response.error || 'Failed to load inward details')
      }
    } catch (error) {
      handleApiError(error, 'Failed to load inward details')
    }
  }

  // Handle edit
  const handleEdit = (inward) => {
    setEditingInward(inward)
    setShowForm(true)
  }

  // Handle row selection
  const handleRowSelect = (id) => {
    setSelectedRows(prev =>
      prev.includes(id)
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id]
    )
  }

  // Handle select all
  const handleSelectAll = () => {
    if (selectedRows.length === inwards.length) {
      setSelectedRows([])
    } else {
      setSelectedRows(inwards.map(inward => inward.id))
    }
  }

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-GB')
  }


  return (
    <div className="inward-page">
      {/* Split layout from beginning */}
      <div className="main-content">

        {/* LEFT SIDE (Header + Search + Total + List) */}
        <div className="list-section">

          {/* Combined Header + Filters + Total Count */}
          <div className="combined-header-section">

            {/* Left side: Title + Add Button */}
            <div className="page-header">
              <h1>Inward LC Challan Management</h1>
              <div className="header-actions">
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    setShowForm(true)
                    setEditingInward(null)
                  }}
                >
                  + Add New Inward
                </button>
              </div>
            </div>

            {/* Middle: Search + Refresh + Bulk Delete */}
            <div className="search-filter-section">
              <div className="search-group">
                <input
                  type="text"
                  placeholder="Search by GRN number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button
                  className="btn-icon"
                  onClick={handleSearch}
                  title="Search"
                >
                  <FiSearch size={18} />
                </button>
                <button
                  className="btn-icon"
                  onClick={handleRefresh}
                  disabled={loading}
                  title="Refresh list"
                >
                  <FiRefreshCcw size={18} />
                </button>
              </div>

              {selectedRows.length > 0 && (
                <button
                  className="btn btn-danger btn-sm"
                  onClick={handleBulkDelete}
                >
                  Delete Selected ({selectedRows.length})
                </button>
              )}
            </div>

            {/* Right side: Total count */}
            <div className="total-count-section">
              <span className="total-count">Total Inwards: {totalItems}</span>
            </div>

          </div>

          {/* List Table */}
          <div className="table-container">
            {loading ? (
              <div className="loading">Loading inwards...</div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>
                      <input
                        type="checkbox"
                        checked={selectedRows.length === inwards.length && inwards.length > 0}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th style={{ width: '100px' }}>GRN No</th>
                    <th style={{ width: '120px' }}>GRN Date</th>
                    <th style={{ width: '100px' }}>Supplier</th>
                    <th style={{ width: '120px' }}>Challan No</th>
                    <th style={{ width: '120px' }}>Challan Date</th>
                    <th style={{ width: '140px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inwards.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="no-data">
                        No inwards found
                      </td>
                    </tr>
                  ) : (
                    inwards.map((inward) => (
                      <tr key={inward.id} className={selectedInward?.id === inward.id ? 'selected-row' : ''}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedRows.includes(inward.id)}
                            onChange={() => handleRowSelect(inward.id)}
                          />
                        </td>
                        <td>{inward.grn_no}</td>
                        <td>{formatDate(inward.grn_date)}</td>
                        <td>{inward.supplier_id}</td>
                        <td>{inward.challan_no}</td>
                        <td>{formatDate(inward.challan_date)}</td>
                        <td className="actions">
                          <button className="btn-icon btn-view" onClick={() => handleViewInward(inward.id)} title="View Details">
                            <ViewIcon />
                          </button>
                          <button className="btn-icon btn-edit" onClick={() => handleEdit(inward)} title="Edit">
                            <EditIcon />
                          </button>
                          <button className="btn-icon btn-delete" onClick={() => handleDelete(inward.id)} title="Delete">
                            <DeleteIcon />
                          </button>
                          <button className="btn-icon btn-print" onClick={() => window.print()} title="Print">
                            <PrintIcon />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          <div className="pagination">
            <div className="pagination-info">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} entries
            </div>
            <div className="pagination-controls">
              <select
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(parseInt(e.target.value))}
              >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="btn btn-secondary"
              >
                Previous
              </button>
              <span className="page-info">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="btn btn-secondary"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - Details */}
        <div className="details-section">
          {selectedInward ? (
            <div className="inward-details">
              <div className="details-header">
                <h3>Inward Details</h3>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setSelectedInward(null)}
                >
                  × Close
                </button>
              </div>
              <div className="details-content">
                <div className="detail-row"><label>GRN Number:</label><span>{selectedInward.grn_no}</span></div>
                <div className="detail-row"><label>GRN Date:</label><span>{formatDate(selectedInward.grn_date)}</span></div>
                <div className="detail-row"><label>Supplier ID:</label><span>{selectedInward.supplier_id}</span></div>
                <div className="detail-row"><label>Challan Number:</label><span>{selectedInward.challan_no}</span></div>
                <div className="detail-row"><label>Challan Date:</label><span>{formatDate(selectedInward.challan_date)}</span></div>
                <div className="detail-row"><label>Item ID:</label><span>{selectedInward.item_id}</span></div>
                <div className="detail-row"><label>Item Name:</label><span>{selectedInward.item_name}</span></div>
                <div className="detail-row"><label>Process ID:</label><span>{selectedInward.process_id}</span></div>
                <div className="detail-row"><label>Quantity:</label><span>{selectedInward.qty}</span></div>
                <div className="detail-row"><label>Created At:</label><span>{formatDate(selectedInward.created_at)}</span></div>
              </div>
              <div className="details-actions">
                <button className="btn btn-primary" onClick={() => handleEdit(selectedInward)}>Edit Inward</button>
                <button className="btn btn-danger" onClick={() => handleDelete(selectedInward.id)}>Delete Inward</button>
              </div>
            </div>
          ) : (
            <div className="no-selection">
              <div className="no-selection-content">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <p>Select an inward from the list to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FORM MODAL */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingInward ? 'Edit Inward' : 'Add New Inward'}</h2>
              <button
                className="close-btn"
                onClick={() => {
                  setShowForm(false)
                  setEditingInward(null)
                }}
              >
                ×
              </button>
            </div>
            <InwardLCChallanForm
              onSubmit={handleSubmit}
              initialData={editingInward}
              onCancel={() => {
                setShowForm(false)
                setEditingInward(null)
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default InwardLCChallanPage
