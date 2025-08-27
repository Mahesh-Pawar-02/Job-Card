import React, { useEffect, useRef, useState } from 'react';
import { useReactToPrint } from "react-to-print";
import Autocomplete from "../components/Autocomplete";

export default function PartPage() {
  const [parts, setParts] = useState([]);
  const [selectedPart, setSelectedPart] = useState(null);
  const detailsRef = useRef();

  const [selectedIds, setSelectedIds] = useState(new Set());
  const [editPartId, setEditPartId] = useState(null);
  const [formData, setFormData] = useState({
    customer_id: null,
    customer_name: '',

    part_name: '',
    part_no: '',
    material: '',
    weight: null,
    process: '',
    loading: '',
    pasting: '',
    pattern_no: '',
    shot_blasting: '',
    punching: '',
    temperature: null,
    time: '',
    case_depth: '',
    checking_location: '',
    cut_off_value: '',
    core_hardness: '',
    surface_hardness: '',
    microstructure: '',
    furnace_capacity: '',
    batch_qty: null,
    total_part_weight: null,
    drg: '',
    broach_spline: '',
    anti_carb_paste: '',
    hard_temp: null,
    rpm: null,
    img_1: null,
    img_2: null,
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
      return;
    }

    fetch('http://localhost:5000/api/parts', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    })
      .then((res) => res.json())
      .then(() => {
        setSelectedIds(new Set());
        fetchParts();
      })
      .catch(console.error);
  }

  function handleChange(e) {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  }

  async function startEdit(part) {
    setEditPartId(part.part_id);
    try {
      const res = await fetch(`http://localhost:5000/api/parts/${part.part_id}`);
      const data = await res.json();
      setFormData({
        ...data,
        img_1: null, // reset files (files can’t be pre-filled)
        img_2: null,
      });
    } catch (error) {
      alert('Failed to fetch part details');
    }
  }

  function cancelEdit() {
    setEditPartId(null);
    setFormData({
      customer_id: null,
      customer_name: '',

      part_name: '',
      part_no: '',
      material: '',
      weight: null,
      process: '',
      loading: '',
      pasting: '',
      pattern_no: '',
      shot_blasting: '',
      punching: '',
      temperature: null,
      time: '',
      case_depth: '',
      checking_location: '',
      cut_off_value: '',
      core_hardness: '',
      surface_hardness: '',
      microstructure: '',
      furnace_capacity: '',
      batch_qty: null,
      total_part_weight: null,
      drg: '',
      broach_spline: '',
      anti_carb_paste: '',
      hard_temp: null,
      rpm: null,
      img_1: null,
      img_2: null,
    });
  }

  function saveEdit() {
  if (!formData.part_name.trim()) return alert('Part name cannot be empty');

  const form = new FormData();
  Object.keys(formData).forEach((key) => {
    if (formData[key] !== null && formData[key] !== "") {
      if ((key === "img_1" || key === "img_2") && formData[key] instanceof File) {
        form.append(key, formData[key]); // only send if new file chosen
      } else if (key !== "img_1" && key !== "img_2") {
        form.append(key, formData[key]);
      }
    }
  });

  fetch(`http://localhost:5000/api/parts/${editPartId}`, {
    method: 'PUT',
    body: form,
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

    const form = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null) {
        form.append(key, formData[key]);
      }
    });

    fetch('http://localhost:5000/api/parts', {
      method: 'POST',
      body: form,
    })
      .then((res) => res.json())
      .then(() => {
        cancelEdit();
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
      {/* Form */}
      <div style={{ border: '1px solid gray', padding: '10px', marginBottom: '20px' }}>
        <h3>{editPartId ? 'Edit Part' : 'New Part'}</h3>

        <Autocomplete
          label="Customer"
          fetchUrl="http://localhost:5000/api/customers/search"
          value={
            formData.customer_id
              ? { id: formData.customer_id, name: formData.customer_name }
              : null
          }
          onChange={(selected) => {
            setFormData((prev) => ({
              ...prev,
              customer_id: selected ? selected.id : null,
              customer_name: selected ? selected.name : "",
            }));
          }}
        />

        {/* Other fields */}
        {Object.keys(formData)
          .filter(k => !['customer_id','customer_name','img_1','img_2'].includes(k))
          .map((field) => (
          <label key={field}>
            {field}: <br />
            <input
              name={field}
              value={formData[field] ?? ''}
              onChange={handleChange}
              type={
                ['weight','temperature','batch_qty','total_part_weight','hard_temp','rpm'].includes(field)
                  ? 'number'
                  : 'text'
              }
              step={['weight','total_part_weight'].includes(field) ? 'any' : undefined}
            />
          </label>
        ))}

        {/* File Uploads */}
        <label>
          img_1: <br />
          <input type="file" name="img_1" onChange={handleChange} />
        </label>
        <label>
          img_2: <br />
          <input type="file" name="img_2" onChange={handleChange} />
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

      {/* List + details */}
      <div style={{ display: 'flex', margin: '1rem' }}>
        <div style={{ flex: 1, marginRight: '20px' }}>
          <button onClick={deleteSelected} disabled={selectedIds.size === 0}>
            Delete Selected
          </button>
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

        <div style={{ flex: 1, border: '1px solid gray', padding: '10px' }}>
          {selectedPart ? (
            <>
              <h3>Part Details</h3>
              <div style={{ marginTop: '1rem' }}>
                <button onClick={() => startEdit(selectedPart)}>Edit</button>{' '}
                <button onClick={handlePrint}>Print</button>{' '}
                <button
                  onClick={() => {
                    const confirmation = window.prompt(`Type "delete" to confirm deletion of part with ID: ${selectedPart.part_id}`);
                    if (confirmation !== "delete") return;
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
                <p><b>Customer:</b> {selectedPart.customer_name || 'N/A'}</p>
                {Object.entries(selectedPart).map(([k,v]) =>
                  !['part_id','customer_id','customer_name'].includes(k) ? (
                    <p key={k}>
                      <b>{k}:</b>{" "}
                      {k.startsWith("img_") && v
                        ? <img src={`http://localhost:5000/${v}`} alt={k} width="100" />
                        : v || 'N/A'}
                    </p>
                  ) : null
                )}
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
