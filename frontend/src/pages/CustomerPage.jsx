import React, { useEffect, useState } from "react";

export default function CustomerPage() {
  const [customers, setCustomers] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [viewCustomer, setViewCustomer] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [formData, setFormData] = useState({ customer_name: "" });

  // 🔹 Fetch customers when page loads
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/customers");
      const data = await res.json();
      setCustomers(data);
    } catch (err) {
      console.error("Error fetching customers:", err);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const deleteSelected = async () => {
    try {
      await fetch("http://localhost:5000/api/customers/delete-multiple", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });
      setSelectedIds([]);
      setViewCustomer(null);
      setShowDeleteConfirm(false);
      setDeleteInput("");
      fetchCustomers();
    } catch (err) {
      console.error("Error deleting customers:", err);
    }
  };

  const handleSave = async () => {
    try {
      if (viewCustomer) {
        // Update existing
        await fetch(
          `http://localhost:5000/api/customers/${viewCustomer.customer_id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
          }
        );
      } else {
        // Create new
        await fetch("http://localhost:5000/api/customers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      }
      setShowForm(false);
      setFormData({ customer_name: "" });
      setViewCustomer(null);
      fetchCustomers();
    } catch (err) {
      console.error("Error saving customer:", err);
    }
  };

  return (
    <div className="flex">
      {/* 🔹 Left: Customer List */}
      <div className="w-2/3 p-4">
        <div className="flex justify-between mb-2">
          <button
            className="bg-blue-500 text-white px-3 py-1 rounded"
            onClick={() => {
              setViewCustomer(null);
              setFormData({ customer_name: "" });
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
                    customers.length > 0 &&
                    selectedIds.length === customers.length
                  }
                  onChange={(e) =>
                    setSelectedIds(
                      e.target.checked
                        ? customers.map((c) => c.customer_id)
                        : []
                    )
                  }
                />
              </th>
              <th className="p-2 text-left">Name</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.customer_id} className="border-t">
                <td className="p-2">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(c.customer_id)}
                    onChange={() => toggleSelect(c.customer_id)}
                  />
                </td>
                <td className="p-2">{c.customer_name}</td>
                <td className="p-2">
                  <button
                    className="bg-gray-500 text-white px-2 py-1 rounded"
                    onClick={() => setViewCustomer(c)}
                  >
                    👁 View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🔹 Right: Customer Details */}
      <div className="w-1/3 p-4 border-l">
        {viewCustomer ? (
          <div>
            <h2 className="text-lg font-bold mb-2">Customer Details</h2>
            <p>
              <b>ID:</b> {viewCustomer.customer_id}
            </p>
            <p>
              <b>Name:</b> {viewCustomer.customer_name}
            </p>
            <div className="mt-3 flex gap-2">
              <button
                className="bg-yellow-500 text-white px-3 py-1 rounded"
                onClick={() => {
                  setFormData({ customer_name: viewCustomer.customer_name });
                  setShowForm(true);
                }}
              >
                ✏ Edit
              </button>
              <button
                className="bg-red-600 text-white px-3 py-1 rounded"
                onClick={() => {
                  setSelectedIds([viewCustomer.customer_id]);
                  setShowDeleteConfirm(true);
                }}
              >
                🗑 Delete
              </button>
            </div>
          </div>
        ) : (
          <p>Select a customer to view details</p>
        )}
      </div>

      {/* 🔹 Modal for Create/Edit */}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-white p-4 rounded w-1/3">
            <h3 className="text-lg font-bold mb-2">
              {viewCustomer ? "Edit Customer" : "Create Customer"}
            </h3>
            <input
              type="text"
              className="border p-2 w-full"
              placeholder="Customer name"
              value={formData.customer_name}
              onChange={(e) =>
                setFormData({ ...formData, customer_name: e.target.value })
              }
            />
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
              {selectedIds.length} customer(s).
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
