import React, { useEffect, useState } from "react";
import Autocomplete from "../components/Autocomplete";

const API = "http://localhost:5000/api";

export default function CustomerPage() {
  const [customers, setCustomers] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [contactPreview, setContactPreview] = useState(null);

  const [formData, setFormData] = useState({
    customer_name: "",
    address: "",
    vendor_code: "",
    phone_no: "",
    email_id: "",
    contact_person: "", // updated
    PAN_NO: "",
    GSTN: "",
    state_code: "",
    state_name: "",
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await fetch(`${API}/customers`);
      const data = await res.json();
      setCustomers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch customers:", err);
      setCustomers([]);
    }
  };

  const toggleSelect = (id) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const toggleSelectAll = (checked) => {
    setSelectedIds(checked ? customers.map((c) => c.customer_id) : []);
  };

  const openCreate = () => {
    setEditingCustomer(null);
    setFormData({
      customer_name: "",
      address: "",
      vendor_code: "",
      phone_no: "",
      email_id: "",
      contact_person_id: null,
      contact_person_name: "",
      contact_person_display: "",
      PAN_NO: "",
      GSTN: "",
      state_code: "",
      state_name: "",
    });
    setShowForm(true);
  };

  const openEdit = (cust) => {
    setEditingCustomer(cust);
    setFormData({
      customer_name: cust.customer_name || "",
      address: cust.address || "",
      vendor_code: cust.vendor_code || "",
      phone_no: cust.phone_no || "",
      email_id: cust.email_id || "",
      contact_person: cust.contact_person || "", // updated
      PAN_NO: cust.PAN_NO || "",
      GSTN: cust.GSTN || "",
      state_code: cust.state_code || "",
      state_name: cust.state_name || "",
    });
    setShowForm(true);
  };

  // show details for contact person (try local cache first)
  const openCustomerDetail = async (id) => {
    if (!id) return;
    const local = customers.find((c) => c.customer_id === id);
    if (local) {
      setContactPreview(local);
      return;
    }
    try {
      const res = await fetch(`${API}/customers/${id}`);
      if (!res.ok) throw new Error("Fetch failed");
      const data = await res.json();
      setContactPreview(data);
    } catch (err) {
      console.error("Error fetching contact person:", err);
      alert("Failed to fetch contact person details");
    }
  };

  const handleSave = async () => {
    const payload = {
      customer_name: (formData.customer_name || "").trim(),
      address: formData.address || null,
      vendor_code: formData.vendor_code || null,
      phone_no: formData.phone_no || null,
      email_id: formData.email_id || null,
      contact_person: formData.contact_person ? String(formData.contact_person).trim() : null, // updated
      PAN_NO: formData.PAN_NO || null,
      GSTN: formData.GSTN || null,
      state_code: formData.state_code || null,
      state_name: formData.state_name || null,
    };

    if (!payload.customer_name) {
      alert("Customer name is required");
      return;
    }

    try {
      if (editingCustomer) {
        const res = await fetch(`${API}/customers/${editingCustomer.customer_id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Update failed");
      } else {
        const res = await fetch(`${API}/customers`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Create failed");
      }

      setShowForm(false);
      setEditingCustomer(null);
      // re-fetch to get fresh contact_person_display and consistent rows
      await fetchCustomers();
    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to save customer. See console.");
    }
  };

  const confirmDelete = (ids) => {
    setSelectedIds(Array.isArray(ids) ? ids : [ids]);
    setShowDeleteConfirm(true);
    setDeleteInput("");
  };

  const performDelete = async () => {
    if (deleteInput !== "delete") return;
    try {
      // try standard delete with body (if backend supports)
      let ok = false;
      try {
        const res = await fetch(`${API}/customers`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: selectedIds }),
        });
        ok = res.ok;
      } catch (e) {
        ok = false;
      }
      if (!ok) {
        const res2 = await fetch(`${API}/customers/delete-multiple`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: selectedIds }),
        });
        if (!res2.ok) throw new Error("Delete failed");
      }
      setCustomers((prev) => prev.filter((c) => !selectedIds.includes(c.customer_id)));
      setSelectedIds([]);
      setShowDeleteConfirm(false);
      setDeleteInput("");
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete. See console.");
    }
  };

  const isAllSelected = customers.length > 0 && selectedIds.length === customers.length;

  return (
    <div className="flex p-4 gap-6">
      <div className="flex-1 overflow-auto">
        <div className="flex justify-between items-center mb-3">
          <div className="flex gap-2">
            <button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={openCreate}>➕ Create</button>
            <button
              className="bg-red-600 text-white px-3 py-1 rounded disabled:opacity-50"
              onClick={() => confirmDelete(selectedIds)}
              disabled={selectedIds.length === 0}
            >
              🗑 Delete Selected
            </button>
          </div>
          <div className="text-sm text-gray-600">{customers.length} customers</div>
        </div>

        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2"><input type="checkbox" checked={isAllSelected} onChange={(e) => toggleSelectAll(e.target.checked)} /></th>
              <th className="border p-2">ID</th>
              <th className="border p-2">Name</th>
              <th className="border p-2">Address</th>
              <th className="border p-2">Vendor Code</th>
              <th className="border p-2">Phone</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Contact Person</th>
              <th className="border p-2">PAN</th>
              <th className="border p-2">GSTN</th>
              <th className="border p-2">State Code</th>
              <th className="border p-2">State Name</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr><td colSpan={13} className="p-4 text-center text-gray-500">No customers</td></tr>
            ) : customers.map((c) => (
              <tr key={c.customer_id} className="hover:bg-gray-50">
                <td className="border p-2"><input type="checkbox" checked={selectedIds.includes(c.customer_id)} onChange={() => toggleSelect(c.customer_id)} /></td>
                <td className="border p-2">{c.customer_id}</td>
                <td className="border p-2">{c.customer_name || "—"}</td>
                <td className="border p-2">{c.address || "—"}</td>
                <td className="border p-2">{c.vendor_code || "—"}</td>
                <td className="border p-2">{c.phone_no || "—"}</td>
                <td className="border p-2">{c.email_id || "—"}</td>

                <td className="border p-2">{c.contact_person || "—"}</td>

                <td className="border p-2">{c.PAN_NO || "—"}</td>
                <td className="border p-2">{c.GSTN || "—"}</td>
                <td className="border p-2">{c.state_code || "—"}</td>
                <td className="border p-2">{c.state_name || "—"}</td>

                <td className="border p-2">
                  <div className="flex gap-2">
                    <button className="text-sm px-2 py-1 bg-yellow-400 rounded hover:bg-yellow-500" onClick={() => openEdit(c)}>✏</button>
                    {/* <button className="text-sm px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600" onClick={() => confirmDelete([c.customer_id])}>🗑 Delete</button> */}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-xl p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">{editingCustomer ? "Edit Customer" : "Create Customer"}</h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Customer name</label>
                <input className="w-full border rounded px-2 py-1" value={formData.customer_name} onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })} placeholder="Customer name" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Vendor code</label>
                <input className="w-full border rounded px-2 py-1" value={formData.vendor_code} onChange={(e) => setFormData({ ...formData, vendor_code: e.target.value })} placeholder="Vendor code" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input className="w-full border rounded px-2 py-1" value={formData.phone_no} onChange={(e) => setFormData({ ...formData, phone_no: e.target.value })} placeholder="Phone number" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input className="w-full border rounded px-2 py-1" value={formData.email_id} onChange={(e) => setFormData({ ...formData, email_id: e.target.value })} placeholder="Email" />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Address</label>
                <input className="w-full border rounded px-2 py-1" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Address" />
              </div>

              <div className="col-span-2">
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <Autocomplete
                      label="Contact Person"
                      fetchUrl={`${API}/customers/search`}
                      value={formData.contact_person ? { id: null, name: formData.contact_person } : null}
                      onChange={(val) => {
                        setFormData({
                          ...formData,
                          contact_person: val ? val.name : "",
                        });
                      }}
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Select from suggestions to send ID to backend, or type a new name to store as free-text.</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">PAN</label>
                <input className="w-full border rounded px-2 py-1" value={formData.PAN_NO} onChange={(e) => setFormData({ ...formData, PAN_NO: e.target.value })} placeholder="PAN" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">GSTN</label>
                <input className="w-full border rounded px-2 py-1" value={formData.GSTN} onChange={(e) => setFormData({ ...formData, GSTN: e.target.value })} placeholder="GSTN" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">State code</label>
                <input className="w-full border rounded px-2 py-1" value={formData.state_code} onChange={(e) => setFormData({ ...formData, state_code: e.target.value })} placeholder="State code" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">State name</label>
                <input className="w-full border rounded px-2 py-1" value={formData.state_name} onChange={(e) => setFormData({ ...formData, state_name: e.target.value })} placeholder="State name" />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400" onClick={() => { setShowForm(false); setEditingCustomer(null); }}>Cancel</button>
              <button className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700" onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-3">Confirm delete</h3>
            <p className="mb-3">Type <b>delete</b> to confirm deletion of {selectedIds.length} customer(s).</p>
            <input className="w-full border rounded px-3 py-2 mb-4" placeholder='type "delete" to confirm' value={deleteInput} onChange={(e) => setDeleteInput(e.target.value)} />
            <div className="flex justify-end gap-3">
              <button className="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400" onClick={() => { setShowDeleteConfirm(false); setDeleteInput(""); }}>Cancel</button>
              <button className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50" disabled={deleteInput !== "delete"} onClick={performDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
