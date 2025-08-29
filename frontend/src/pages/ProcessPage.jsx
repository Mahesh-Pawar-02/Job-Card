import React, { useEffect, useState } from "react";

export default function ProcessPage() {
  const [processes, setProcesses] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [viewProcess, setViewProcess] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [formData, setFormData] = useState({
    process_name: "",
    loading: "",
    pasting: "",
    pattern_no: "",
    shot_blasting: "",
    punching: "",
    temperature: "",
    time: "",
    case_depth: "",
    checking_location: "",
    cut_off_value: "",
    core_hardness: "",
    surface_hardness: "",
    microstructure: "",
  });
  const FIELD_TYPES = {
    process_name: "text",
    loading: "text",
    pasting: "select",       // Yes/No
    pattern_no: "number",
    shot_blasting: "select", // Yes/No
    punching: "select",      // Yes/No
    temperature: "number",
    time: "text",
    case_depth: "text",
    checking_location: "text",
    cut_off_value: "text",
    core_hardness: "text",
    surface_hardness: "text",
    microstructure: "text",
  };


  // 🔹 Fetch processes
  useEffect(() => {
    fetchProcesses();
  }, []);

  const fetchProcesses = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/processes");
      const data = await res.json();
      setProcesses(data);
    } catch (err) {
      console.error("Error fetching processes:", err);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const deleteSelected = async () => {
    try {
      await fetch("http://localhost:5000/api/processes/delete-multiple", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });
      setSelectedIds([]);
      setViewProcess(null);
      setShowDeleteConfirm(false);
      setDeleteInput("");
      fetchProcesses();
    } catch (err) {
      console.error("Error deleting processes:", err);
    }
  };

  const handleSave = async () => {
    const preparedData = {
      ...formData,
      pattern_no: formData.pattern_no ? Number(formData.pattern_no) : null,
      temperature: formData.temperature ? Number(formData.temperature) : null,
    };

    try {
      if (viewProcess) {
        // Update
        await fetch(
          `http://localhost:5000/api/processes/${viewProcess.process_id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(preparedData),
          }
        );
      } else {
        // Create
        await fetch("http://localhost:5000/api/processes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(preparedData),
        });
      }
      setShowForm(false);
      resetForm();
      fetchProcesses();
    } catch (err) {
      console.error("Error saving process:", err);
    }
  };

  const resetForm = () => {
    setFormData({
      process_name: "",
      loading: "",
      pasting: "",
      pattern_no: "",
      shot_blasting: "",
      punching: "",
      temperature: "",
      time: "",
      case_depth: "",
      checking_location: "",
      cut_off_value: "",
      core_hardness: "",
      surface_hardness: "",
      microstructure: "",
    });
    setViewProcess(null);
  };

  return (
    <div className="flex">
      {/* 🔹 Left: Process List */}
      <div className="w-2/3 p-4">
        <div className="flex justify-between mb-2">
          <button
            className="bg-blue-500 text-white px-3 py-1 rounded"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
          >
            ➕ Create
          </button>
          <button
            className="bg-red-500 text-white px-3 py-1 rounded disabled:opacity-50"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={selectedIds.length === 0}
          >
            🗑 Delete Selected
          </button>
        </div>

        <table className="w-full border">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2">
                <input
                  type="checkbox"
                  checked={
                    processes.length > 0 &&
                    selectedIds.length === processes.length
                  }
                  onChange={(e) =>
                    setSelectedIds(
                      e.target.checked
                        ? processes.map((p) => p.process_id)
                        : []
                    )
                  }
                />
              </th>
              <th className="p-2 text-left">Process</th>
              <th className="p-2 text-left">Temperature</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {processes.map((p) => (
              <tr key={p.process_id} className="border-t">
                <td className="p-2">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(p.process_id)}
                    onChange={() => toggleSelect(p.process_id)}
                  />
                </td>
                <td className="p-2">{p.process_name}</td>
                <td className="p-2">{p.temperature}</td>
                <td className="p-2">
                  <button
                    className="bg-gray-500 text-white px-2 py-1 rounded"
                    onClick={() => setViewProcess(p)}
                  >
                    👁 View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🔹 Right: Process Details */}
<div className="w-1/3 p-4 border-l">
  {viewProcess ? (
    <div>
      <h2 className="text-lg font-bold mb-2">Process Details</h2>
      {Object.entries(viewProcess).map(([key, value]) => {
        let displayValue = value;

        if (value === "Yes") {
          displayValue = <span className="text-green-600">✅ Yes</span>;
        } else if (value === "No") {
          displayValue = <span className="text-red-600">❌ No</span>;
        } else if (value === null || value === "") {
          displayValue = <span className="text-gray-400">—</span>;
        } else if (!isNaN(value) && value !== "") {
          displayValue = <span className="font-mono">{value}</span>;
        }

        return (
          <p key={key} className="mb-1">
            <b className="capitalize">{key.replace(/_/g, " ")}:</b> {displayValue}
          </p>
        );
      })}
      <div className="mt-3 flex gap-2">
        <button
          className="bg-yellow-500 text-white px-3 py-1 rounded"
          onClick={() => {
            setFormData({ ...viewProcess });
            setShowForm(true);
          }}
        >
          ✏ Edit
        </button>
        <button
          className="bg-red-600 text-white px-3 py-1 rounded"
          onClick={() => {
            setSelectedIds([viewProcess.process_id]);
            setShowDeleteConfirm(true);
          }}
        >
          🗑 Delete
        </button>
      </div>
    </div>
  ) : (
    <p>Select a process to view details</p>
  )}
</div>


      {/* 🔹 Modal for Create/Edit */}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 overflow-y-auto">
          <div className="bg-white p-4 rounded w-1/2 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-2">
              {viewProcess ? "Edit Process" : "Create Process"}
            </h3>

            <div className="grid grid-cols-2 gap-2">
              {Object.keys(formData).map((field) => {
                const type = FIELD_TYPES[field] || "text";

                return (
                  <div key={field}>
                    <label className="block text-sm mb-1">
                      {field.replace(/_/g, " ")}
                    </label>

                    {type === "select" ? (
                      <select
                        className="border p-2 w-full"
                        value={formData[field]}
                        onChange={(e) =>
                          setFormData({ ...formData, [field]: e.target.value })
                        }
                      >
                        <option value="">-- Select --</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    ) : (
                      <input
                        type={type}
                        className="border p-2 w-full"
                        placeholder={field.replace(/_/g, " ")}
                        value={formData[field]}
                        onChange={(e) =>
                          setFormData({ ...formData, [field]: e.target.value })
                        }
                      />
                    )}
                  </div>
                );
              })}

            </div>

            <div className="flex justify-end gap-2 mt-3">
              <button
                className="bg-gray-400 text-white px-3 py-1 rounded"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 text-white px-3 py-1 rounded"
                onClick={handleSave}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔹 Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-white p-4 rounded w-1/3">
            <h3 className="text-lg font-bold mb-2">Confirm Delete</h3>
            <p className="mb-2">
              Type <b>delete</b> to confirm deletion of{" "}
              {selectedIds.length} process(es).
            </p>
            <input
              type="text"
              className="border p-2 w-full"
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
            />
            <div className="flex justify-end gap-2 mt-3">
              <button
                className="bg-gray-400 text-white px-3 py-1 rounded"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteInput("");
                }}
              >
                Cancel
              </button>
              <button
                className="bg-red-600 text-white px-3 py-1 rounded disabled:opacity-50"
                disabled={deleteInput !== "delete"}
                onClick={deleteSelected}
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
