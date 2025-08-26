import React, { useEffect, useRef, useState } from 'react';
import { useReactToPrint } from "react-to-print";

export default function PartPage() {
  const [parts, setParts] = useState([]);
  const [selectedPart, setSelectedPart] = useState(null);
  const detailsRef = useRef();

  const [selectedIds, setSelectedIds] = useState(new Set());
  const [editPartId, setEditPartId] = useState(null);
  const [formData, setFormData] = useState({
    part_name: '',
    part_no: '',         // ✅ added
    material: '',
    drg: '',
    loading: '',
    broach_spline: '',
    anti_carb_paste: '',
    case_depth: '',
    s_f_hardness: '',
    wt_pc: null,
    total_weight: null,
    batch_qty: null,
    patn_no: '',
    hard_temp: null,
    rpm: null,
    shot_blasting: '',
    punching: '',
  });

  useEffect(() => {
    fetchParts();
  }, []);

  const handlePrint = useReactToPrint({
    contentRef: detailsRef,
    documentTitle: selectedPart?.part_name || "Part Details",
  });

  function fetchParts() {
    fetch('http://localhost:5000/api/parts')
      .then((res) => res.json())
      .then(data => setParts(data))
      .catch(console.error);
  }

  function toggleSelect(id) {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  }

  function toggleSelectAll() {
    if (selectedIds.size === parts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(parts.map((p) => p.part_id)));
    }
  }

  function deleteSelected() {
    const ids = Array.from(selectedIds);
    const confirmation = window.prompt(
      `Type "delete" to confirm deletion of parts with IDs: ${ids.join(", ")}`
    );
    if (confirmation !== "delete") {
      return; // cancel
    }
    fetch('http://localhost:5000/api/parts', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: Array.from(selectedIds) }),
    })
      .then((res) => res.json())
      .then(() => {
        setSelectedIds(new Set());
        fetchParts();
      })
      .catch(console.error);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function startEdit(part) {
    setEditPartId(part.part_id);
    try {
      const res = await fetch(`http://localhost:5000/api/parts/${part.part_id}`);
      const data = await res.json();
      setFormData({
        part_name: data.part_name || '',
        part_no: data.part_no || '',        // ✅ added
        material: data.material || '',
        drg: data.drg || '',
        loading: data.loading || '',
        broach_spline: data.broach_spline || '',
        anti_carb_paste: data.anti_carb_paste || '',
        case_depth: data.case_depth || '',
        s_f_hardness: data.s_f_hardness || '',
        wt_pc: data.wt_pc || null,
        total_weight: data.total_weight || null,
        batch_qty: data.batch_qty || null,
        patn_no: data.patn_no || '',
        hard_temp: data.hard_temp || null,
        rpm: data.rpm || null,
        shot_blasting: data.shot_blasting || '',
        punching: data.punching || '',
      });
    } catch (error) {
      alert('Failed to fetch part details');
    }
  }

  function cancelEdit() {
    setEditPartId(null);
    setFormData({
      part_name: '',
      part_no: '',       // ✅ reset here
      material: '',
      drg: '',
      loading: '',
      broach_spline: '',
      anti_carb_paste: '',
      case_depth: '',
      s_f_hardness: '',
      wt_pc: null,
      total_weight: null,
      batch_qty: null,
      patn_no: '',
      hard_temp: null,
      rpm: null,
      shot_blasting: '',
      punching: '',
    });
  }

  function saveEdit() {
    if (!formData.part_name.trim()) return alert('Part name cannot be empty');
    fetch(`http://localhost:5000/api/parts/${editPartId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then(() => {
        cancelEdit();
        fetchParts();
      })
      .catch(console.error);
  }

  function createPart() {
    if (!formData.part_name.trim()) return alert('Part name cannot be empty');
    fetch('http://localhost:5000/api/parts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then(() => {
        cancelEdit(); // ✅ reset form after create
        fetchParts();
      })
      .catch(console.error);
  }

  async function viewDetails(part) {
    try {
      const res = await fetch(`http://localhost:5000/api/parts/${part.part_id}`);
      const data = await res.json();
      setSelectedPart(data);
    } catch (error) {
      alert('Failed to fetch part details');
    }
  }

  const allSelected = parts.length > 0 && selectedIds.size === parts.length;

  return (
    <div style={{ margin: '4rem 1rem' }}>
      {/* Create or Edit part form */}
      <div style={{ border: '1px solid gray', padding: '10px', marginBottom: '20px' }}>
        <h3>{editPartId ? 'Edit Part' : 'New Part'}</h3>

        <label>
          Part Name (required): <br />
          <input name="part_name" value={formData.part_name} onChange={handleChange} required />
        </label>

        <label>
          Part No: <br />        {/* ✅ new field */}
          <input name="part_no" value={formData.part_no} onChange={handleChange} />
        </label>

        <label>
          Material: <br />
          <input name="material" value={formData.material} onChange={handleChange} />
        </label>

        <label>
          DRG: <br />
          <input name="drg" value={formData.drg} onChange={handleChange} />
        </label>

        <label>
          Loading: <br />
          <input name="loading" value={formData.loading} onChange={handleChange} />
        </label>

        <label>
          Broach/Spline: <br />
          <input name="broach_spline" value={formData.broach_spline} onChange={handleChange} />
        </label>

        <label>
          Anti Carb Paste: <br />
          <input name="anti_carb_paste" value={formData.anti_carb_paste} onChange={handleChange} />
        </label>

        <label>
          Case Depth: <br />
          <input name="case_depth" value={formData.case_depth} onChange={handleChange} />
        </label>

        <label>
          S/F Hardness: <br />
          <input name="s_f_hardness" value={formData.s_f_hardness} onChange={handleChange} />
        </label>

        <label>
          Weight per pc: <br />
          <input name="wt_pc" value={formData.wt_pc ? formData.wt_pc : ''} onChange={handleChange} type="number" step="any" />
        </label>

        <label>
          Total Weight: <br />
          <input name="total_weight" value={formData.total_weight ? formData.total_weight : ''} onChange={handleChange} type="number" step="any" />
        </label>

        <label>
          Batch Qty: <br />
          <input name="batch_qty" value={formData.batch_qty ? formData.batch_qty : ''} onChange={handleChange} type="number" />
        </label>

        <label>
          Patn No: <br />
          <input name="patn_no" value={formData.patn_no} onChange={handleChange} />
        </label>

        <label>
          Hard Temp: <br />
          <input name="hard_temp" value={formData.hard_temp ? formData.hard_temp : ''} onChange={handleChange} type="number" />
        </label>

        <label>
          RPM: <br />
          <input name="rpm" value={formData.rpm ? formData.rpm : ''} onChange={handleChange} type="number" />
        </label>

        <label>
          Shot Blasting: <br />
          <input name="shot_blasting" value={formData.shot_blasting} onChange={handleChange} />
        </label>

        <label>
          Punching: <br />
          <input name="punching" value={formData.punching} onChange={handleChange} />
        </label>

        <br />

        {editPartId ? (
          <>
            <button onClick={saveEdit}>Update Part</button>
            <button onClick={cancelEdit}>Cancel Edit</button>
          </>
        ) : (
          <button onClick={createPart}>Create Part</button>
        )}
      </div>


      <div style={{ display: 'flex', margin: '1rem' }}>
        <div style={{ flex: 1, marginRight: '20px' }}>
          {/* Delete selected */}
          <button onClick={deleteSelected} disabled={selectedIds.size === 0}>
            Delete Selected
          </button>
          {/* list of part */}
          <table border="1" cellPadding="4" style={{ marginTop: '1rem' }}>
            <thead>
              <tr>
                <th>
                  <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} />
                </th>
                <th>Part Name</th>
                <th>Part No</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {parts.map((part) => (
                <tr key={part.part_id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(part.part_id)}
                      onChange={() => toggleSelect(part.part_id)}
                    />
                  </td>
                  <td>{part.part_name}</td>
                  <td>{part.part_no}</td>
                  <td>
                    <button onClick={() => viewDetails(part)}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right side - part details */}
        <div style={{ flex: 1, border: '1px solid gray', padding: '10px' }}>
          {selectedPart ? (
            <>
              <h3>Part Details</h3>
              <div style={{ marginTop: '1rem' }}>
                <button onClick={() => startEdit(selectedPart)}>Edit</button>{' '}
                <button onClick={handlePrint}>Print</button>{' '}
                <button
                  onClick={() => {
                    // confirmation
                    const confirmation = window.prompt(`Type "delete" to confirm deletion of part with ID: ${selectedPart.part_id}`);
                    if (confirmation !== "delete") {
                      return; // cancel
                    }
                    fetch('http://localhost:5000/api/parts', {
                      method: 'DELETE',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ ids: [selectedPart.part_id] }),
                    })
                      .then(() => {
                        setSelectedPart(null);
                        fetchParts();
                      })
                      .catch(console.error);
                  }}
                >
                  Delete
                </button>
              </div>
              <div ref={detailsRef}>
                <p><b>Part Name:</b> {selectedPart.part_name}</p>
                <p><b>Part No:</b> {selectedPart.part_no || 'N/A'}</p>
                <p><b>Material:</b> {selectedPart.material || 'N/A'}</p>
                <p><b>DRG:</b> {selectedPart.drg || 'N/A'}</p>
                <p><b>Loading:</b> {selectedPart.loading || 'N/A'}</p>
                <p><b>Broach/Spline:</b> {selectedPart.broach_spline || 'N/A'}</p>
                <p><b>Anti Carb Paste:</b> {selectedPart.anti_carb_paste || 'N/A'}</p>
                <p><b>Case Depth:</b> {selectedPart.case_depth || 'N/A'}</p>
                <p><b>S/F Hardness:</b> {selectedPart.s_f_hardness || 'N/A'}</p>
                <p><b>Weight per pc:</b> {selectedPart.wt_pc || 'N/A'}</p>
                <p><b>Total Weight:</b> {selectedPart.total_weight || 'N/A'}</p>
                <p><b>Batch Qty:</b> {selectedPart.batch_qty || 'N/A'}</p>
                <p><b>Patn No:</b> {selectedPart.patn_no || 'N/A'}</p>
                <p><b>Hard Temp:</b> {selectedPart.hard_temp || 'N/A'}</p>
                <p><b>RPM:</b> {selectedPart.rpm || 'N/A'}</p>
                <p><b>Shot Blasting:</b> {selectedPart.shot_blasting || 'N/A'}</p>
                <p><b>Punching:</b> {selectedPart.punching || 'N/A'}</p>
              </div>
            </>
          ) : (
            <p>Select a part to see details</p>
          )}
        </div>
      </div>
    </div>
  );
}
