import React, { useEffect, useState } from "react";
import Autocomplete from "../components/Autocomplete";

export default function InwardsPage() {
  const [inwards, setInwards] = useState([]);
  const [selectedInward, setSelectedInward] = useState(null);
  const [form, setForm] = useState({
    inward_date: "",
    customer: null,
    parts: [],
  });
  const [deleteSelection, setDeleteSelection] = useState([]);

  // Fetch all inwards
  const loadInwards = async () => {
    const res = await fetch("http://localhost:5000/api/inwards");
    const data = await res.json();
    setInwards(data);
  };

  useEffect(() => {
    loadInwards();
  }, []);

  // Add part row
  const addPart = () => {
    setForm((prev) => ({
      ...prev,
      parts: [...prev.parts, { id: null, name: "", qty: "" }],
    }));
  };

  // Handle part change
  const updatePart = (index, updated) => {
    setForm((prev) => {
      const newParts = [...prev.parts];
      newParts[index] = { ...newParts[index], ...updated };
      return { ...prev, parts: newParts };
    });
  };

  // Create / Update inward
  const saveInward = async () => {

    if (!form.inward_date) {
      alert("Please select a date before saving.");
      return;
    }
    if (!form.customer?.id) {
      alert("Please select a customer.");
      return;
    }
    if (form.parts.length === 0) {
      alert("Please add at least one part.");
      return;
    }

    const payload = {
      inward_date: form.inward_date,
      customer_id: form.customer?.id,
      parts: form.parts.map((p) => ({ part_id: p.id, qty: Number(p.qty) })),
    };

    if (selectedInward) {
      // Update
      await fetch(`http://localhost:5000/api/inwards/${selectedInward.inward_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      // Create
      await fetch("http://localhost:5000/api/inwards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    setForm({ inward_date: "", customer: null, parts: [] });
    setSelectedInward(null);
    loadInwards();
  };

  // Delete inwards
  const deleteInwards = async () => {
    await fetch("http://localhost:5000/api/inwards", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: deleteSelection }),
    });
    setDeleteSelection([]);
    loadInwards();
  };

  // Edit inward
  const editInward = (inward) => {
    setSelectedInward(inward);
    setForm({
      inward_date: inward.inward_date.split("T")[0],
      customer: { id: inward.customer_id, name: inward.customer_name },
      parts: inward.parts.map((p) => ({
        id: p.part_id,
        name: p.part_name,
        qty: p.qty,
      })),
    });
  };

  // cancel edit
  const cancelEdit = () => {
    setSelectedInward(null);
    setForm({ inward_date: "", customer: null, parts: [] });
  };

  return (
    <div style={{ margin: '5rem 1rem' }}>
      <h2>Inwards</h2>

      {/* Form */}
      <div style={{ border: "1px solid gray", padding: "10px", marginBottom: "20px" }}>
        <h3>{selectedInward ? "Edit Inward" : "New Inward"}</h3>
        <input
          type="date"
          value={form.inward_date}
          onChange={(e) => setForm({ ...form, inward_date: e.target.value })}
        />
        <Autocomplete
          label="Customer"
          fetchUrl="http://localhost:5000/api/customers/search/"
          value={form.customer}
          onChange={(val) => setForm({ ...form, customer: val })}
        />

        <h4>Parts</h4>
        {form.parts.map((part, idx) => (
          <div key={idx} style={{ display: "flex", gap: "10px" }}>
            <Autocomplete
              label="Part"
              fetchUrl="http://localhost:5000/api/parts/search/"
              value={part}
              onChange={(val) => updatePart(idx, val)}
            />
            <input
              type="number"
              placeholder="Qty"
              value={part.qty}
              onChange={(e) => updatePart(idx, { qty: e.target.value })}
            />
          </div>
        ))}
        <button onClick={addPart}>+ Add Part</button>
        <br />
        <button onClick={saveInward}>
          {selectedInward ? "Update Inward" : "Create Inward"}
        </button>
        {selectedInward && (
          <button onClick={cancelEdit} style={{ marginLeft: "10px" }}>
            Cancel Edit
          </button>
        )}
      </div>

      {/* List */}
      <h3>Inwards List</h3>
      <button onClick={deleteInwards} disabled={deleteSelection.length === 0}>
        Delete Selected
      </button>
      <table border="1" cellPadding="5">
        <thead>
          <tr>
            {/* "Select All" checkbox in header */}
            <th>
              <input
                type="checkbox"
                checked={
                  inwards.length > 0 &&
                  deleteSelection.length === inwards.map((i) => i.inward_id).length
                }
                onChange={(e) => {
                  if (e.target.checked) {
                    setDeleteSelection(inwards.map((i) => i.inward_id));
                  } else {
                    setDeleteSelection([]);
                  }
                }}
              />
            </th>
            <th>Date</th>
            <th>Customer</th>
            <th>Parts</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {inwards.map((inward) => (
            <tr key={inward.inward_id}>
              <td>
                <input
                  type="checkbox"
                  checked={deleteSelection.includes(inward.inward_id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setDeleteSelection((prev) => [...prev, inward.inward_id]);
                    } else {
                      setDeleteSelection((prev) =>
                        prev.filter((id) => id !== inward.inward_id)
                      );
                    }
                  }}
                />
              </td>
              <td>{new Date(inward.inward_date).toISOString().split("T")[0]}</td>
              <td>{inward.customer_name}</td>
              <td>
                {inward.parts.map((p) => `${p.part_name} (${p.qty})`).join(", ")}
              </td>
              <td>
                <button onClick={() => editInward(inward)}>Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}
