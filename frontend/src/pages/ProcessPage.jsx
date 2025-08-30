import React, { useEffect, useState } from "react";

const API = "http://localhost:5000/api";

export default function ProcessPage() {
  const [processes, setProcesses] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedProcess, setSelectedProcess] = useState(null); // for right-side details (optional)
  const [editingProcess, setEditingProcess] = useState(null); // object when editing, null when creating
  const [showForm, setShowForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");

  // Minimal form state (we only need what's in DB: process_name, short_name)
  const [formData, setFormData] = useState({
    process_name: "",
    short_name: "",
  });

  // Fetch all processes on mount
  useEffect(() => {
    fetchProcesses();
  }, []);

  const fetchProcesses = async () => {
    try {
      const res = await fetch(`${API}/processes`);
      const data = await res.json();
      setProcesses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching processes:", err);
      setProcesses([]);
    }
  };

  // Open "create" modal
  const openCreate = () => {
    setEditingProcess(null);
    setFormData({ process_name: "", short_name: "" });
    setShowForm(true);
  };

  // Open edit: use already-fetched data to prefill
  const openEdit = (proc) => {
    setEditingProcess(proc);
    setFormData({
      process_name: proc.process_name || "",
      short_name: proc.short_name || "",
    });
    setShowForm(true);
  };

  // Toggle selection for bulk delete
  const toggleSelect = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  // Select all on page (simple: all processes)
  const toggleSelectAll = (checked) => {
    setSelectedIds(checked ? processes.map((p) => p.process_id) : []);
  };

  // Save (create or update)
  const handleSave = async () => {
    const payload = {
      process_name: String(formData.process_name || "").trim(),
      short_name: String(formData.short_name || "").trim() || null,
    };

    if (!payload.process_name) {
      alert("Process name is required");
      return;
    }

    try {
      if (editingProcess) {
        // Update
        const res = await fetch(`${API}/processes/${editingProcess.process_id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Update failed");

        // Update locally
        setProcesses((prev) =>
          prev.map((p) =>
            p.process_id === editingProcess.process_id ? { ...p, ...payload } : p
          )
        );

        // If right-side selected, update that too
        if (selectedProcess?.process_id === editingProcess.process_id) {
          setSelectedProcess((s) => (s ? { ...s, ...payload } : s));
        }
      } else {
        // Create
        const res = await fetch(`${API}/processes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Create failed");
        const body = await res.json();
        // body should contain process_id (insertId)
        const newId = body?.process_id ?? body?.insertId ?? null;

        const newProcess = {
          process_id: newId,
          process_name: payload.process_name,
          short_name: payload.short_name,
        };
        // prepend for visibility
        setProcesses((prev) => [newProcess, ...prev]);
      }

      setShowForm(false);
      setEditingProcess(null);
      setFormData({ process_name: "", short_name: "" });
    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to save. See console.");
    }
  };

  // Delete (single or multiple). We reuse selectedIds for deletion.
  const confirmDelete = (ids) => {
    // prepare selectedIds and open confirm modal
    setSelectedIds(Array.isArray(ids) ? ids : [ids]);
    setShowDeleteConfirm(true);
    setDeleteInput("");
  };

  const performDelete = async () => {
    if (deleteInput !== "delete") return;

    try {
      // Using DELETE with JSON body (backend should accept it - matches your earlier pattern)
      const res = await fetch(`${API}/processes`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });

      if (!res.ok) {
        // fallback: try POST to delete-multiple (in case backend expects that)
        try {
          const res2 = await fetch(`${API}/processes/delete-multiple`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids: selectedIds }),
          });
          if (!res2.ok) throw new Error("Delete failed");
        } catch (err2) {
          throw err2;
        }
      }

      // Remove locally
      setProcesses((prev) => prev.filter((p) => !selectedIds.includes(p.process_id)));
      setSelectedIds([]);
      setSelectedProcess((s) => (s && selectedIds.includes(s.process_id) ? null : s));
      setShowDeleteConfirm(false);
      setDeleteInput("");
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete. See console.");
    }
  };

  // UI helpers
  const isAllSelected = processes.length > 0 && selectedIds.length === processes.length;

  return (
    <div className="flex gap-6 p-4">
      {/* Left: list */}
      <div className="w-2/3">
        <div className="flex justify-between items-center mb-3">
          <div className="flex gap-2">
            <button
              className="bg-blue-600 text-white px-3 py-1 rounded"
              onClick={openCreate}
            >
              ➕ Create
            </button>

            <button
              className="bg-red-600 text-white px-3 py-1 rounded disabled:opacity-50"
              onClick={() => confirmDelete(selectedIds)}
              disabled={selectedIds.length === 0}
            >
              🗑 Delete Selected
            </button>
          </div>

          <div className="text-sm text-gray-600">
            {processes.length} process{processes.length !== 1 ? "es" : ""}
          </div>
        </div>

        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">
                <input
                  type="checkbox"
                  className="cursor-pointer"
                  checked={isAllSelected}
                  onChange={(e) => toggleSelectAll(e.target.checked)}
                />
              </th>
              <th className="border p-2 text-left">Process</th>
              <th className="border p-2 text-left">Short Name</th>
              <th className="border p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {processes?.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-500">No processes</td>
              </tr>
            ) : (
              processes.map((p) => (
                <tr key={p.process_id} className="border-b hover:bg-gray-50">
                  <td className="p-2">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(p.process_id)}
                      onChange={() => toggleSelect(p.process_id)}
                    />
                  </td>
                  <td
                    className="p-2 cursor-pointer"
                    onClick={() => setSelectedProcess(p)}
                  >
                    <div className="font-medium">{p.process_name || "—"}</div>
                    <div className="text-xs text-gray-500">ID: {p.process_id}</div>
                  </td>
                  <td className="p-2">{p.short_name || "—"}</td>
                  <td className="p-2">
                    <div className="flex gap-2">
                      <button
                        className="text-sm px-2 py-1 bg-yellow-400 rounded hover:bg-yellow-500"
                        onClick={() => openEdit(p)}
                      >
                        ✏
                      </button>
                      {/* <button
                        className="text-sm px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                        onClick={() => confirmDelete([p.process_id])}
                      >
                        🗑 Delete
                      </button> */}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal: create/edit */}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
            <h3 className="text-xl font-semibold mb-4">{editingProcess ? "Edit Process" : "Create Process"}</h3>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Process name</label>
                <input
                  className="w-full border rounded px-3 py-2"
                  placeholder="eg. Hardening"
                  value={formData.process_name}
                  onChange={(e) => setFormData({ ...formData, process_name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Short name</label>
                <input
                  className="w-full border rounded px-3 py-2"
                  placeholder="eg. HD"
                  value={formData.short_name}
                  onChange={(e) => setFormData({ ...formData, short_name: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                onClick={() => {
                  setShowForm(false);
                  setEditingProcess(null);
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                onClick={handleSave}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-3">Confirm delete</h3>
            <p className="mb-3">Type <b>delete</b> to confirm deletion of {selectedIds.length} process(es).</p>
            <input
              className="w-full border rounded px-3 py-2 mb-4"
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              placeholder='type "delete" to confirm'
            />
            <div className="flex justify-end gap-3">
              <button
                className="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteInput("");
                }}
              >
                Cancel
              </button>
              <button
                className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                disabled={deleteInput !== "delete"}
                onClick={performDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
