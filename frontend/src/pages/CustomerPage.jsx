import React, { useEffect, useState } from 'react';

export default function CustomerPage() {
  const [customers, setCustomers] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [editCustomer, setEditCustomer] = useState(null);
  const [formCustomerName, setFormCustomerName] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  function fetchCustomers() {
    fetch('http://localhost:5000/api/customers')
      .then((res) => res.json())
      .then(data => setCustomers(data[0]))
      .catch(console.error);
  }

  function toggleSelect(id) {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  }

  function toggleSelectAll() {
    if (selectedIds.size === customers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(customers.map((c) => c.customer_id)));
    }
  }

  function deleteSelected() {
    fetch('http://localhost:5000/api/customers', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: Array.from(selectedIds) }),
    })
      .then((res) => res.json())
      .then(() => {
        setSelectedIds(new Set());
        fetchCustomers();
      })
      .catch(console.error);
  }

  function startEdit(customer) {
    setEditCustomer(customer.customer_id);
    setFormCustomerName(customer.customer_name);
  }

  function cancelEdit() {
    setEditCustomer(null);
    setFormCustomerName('');
  }

  function saveEdit() {
    if (!formCustomerName.trim()) return alert('Customer name cannot be empty');
    fetch(`http://localhost:5000/api/customers/${editCustomer}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customer_name: formCustomerName }),
    })
      .then((res) => res.json())
      .then(() => {
        cancelEdit();
        fetchCustomers();
      })
      .catch(console.error);
  }

  function createCustomer() {
    if (!formCustomerName.trim()) return alert('Customer name cannot be empty');
    fetch('http://localhost:5000/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customer_name: formCustomerName }),
    })
      .then((res) => res.json())
      .then(() => {
        setFormCustomerName('');
        fetchCustomers();
      })
      .catch(console.error);
  }

  const allSelected = customers.length > 0 && selectedIds.size === customers.length;

  return (
    <div style={{ margin: '5rem 1rem' }}>
      <h2>Customers</h2>

      <div style={{ border: "1px solid gray", padding: "10px", marginBottom: "20px" }}>
        <h3>{editCustomer ? "Edit Customer" : "New Customer"}</h3>
        <input
          placeholder="Customer name"
          value={formCustomerName}
          onChange={(e) => setFormCustomerName(e.target.value)}
        />
        <br />
        {editCustomer ? (
          <>
            <button onClick={saveEdit}>Update Customer</button>
            <button onClick={cancelEdit}>Cancel Edit</button>
          </>
        ) : (
          <button onClick={createCustomer}>Add Customer</button>
        )}
      </div>

      <button onClick={deleteSelected} disabled={selectedIds.size === 0}>
        Delete Selected
      </button>

      <table border="1" cellPadding="4" style={{ marginTop: '1rem' }}>
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleSelectAll}
              />
            </th>
            <th>Customer Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.customer_id}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedIds.has(customer.customer_id)}
                  onChange={() => toggleSelect(customer.customer_id)}
                />
              </td>
              <td>{customer.customer_name}</td>
              <td>
                <button onClick={() => startEdit(customer)}>Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
