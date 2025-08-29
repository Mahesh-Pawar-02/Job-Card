import React, { useEffect, useMemo, useRef, useState } from "react";
// If your Autocomplete is in components/Autocomplete.jsx, update the import:
import Autocomplete from "../components/Autocomplete";
import html2pdf from "html2pdf.js";

const API = "http://localhost:5000/api";

// fields from your part table (exactly as you showed)
const PART_FIELDS = [
  "part_name",
  "part_no",
  "material",
  "weight",
  "furnace_capacity",
  "batch_qty",
  "total_part_weight",
  "drg",
  "broach_spline",
  "anti_carb_paste",
  "hard_temp",
  "rpm",
];

// (used to render right-side details)
const PROCESS_FIELDS = [
  "process_name",
  "loading",
  "pasting",
  "pattern_no",
  "shot_blasting",
  "punching",
  "temperature",
  "time",
  "case_depth",
  "checking_location",
  "cut_off_value",
  "core_hardness",
  "surface_hardness",
  "microstructure",
];

export default function PartPage() {
  const printRef = useRef();
  const [parts, setParts] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [viewPart, setViewPart] = useState(null);

  // modals & dialogs
  const [showForm, setShowForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  const [deleteInput, setDeleteInput] = useState("");

  // NEW state
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Derived: filtered + paginated parts
  const filteredParts = useMemo(() => {
    return parts.filter(p => {
      const term = searchTerm.toLowerCase();
      return (
        p.part_name.toLowerCase().includes(term) ||
        p.part_no.toLowerCase().includes(term) ||
        p.customer_name.toLowerCase().includes(term)
      );
    });
  }, [parts, searchTerm]);

  const paginatedParts = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredParts.slice(start, start + rowsPerPage);
  }, [filteredParts, page, rowsPerPage]);

  const totalPages = Math.ceil(filteredParts.length / rowsPerPage);

  // form state
  const [formData, setFormData] = useState({
    customer_id: "",
    process_id: "",
    part_name: "",
    part_no: "",
    material: "",
    weight: null,
    furnace_capacity: "",
    batch_qty: null,
    total_part_weight: null,
    drg: "",
    broach_spline: "",
    anti_carb_paste: "",
    hard_temp: null,
    rpm: null,
    image1: null, // 👈 add
    image2: null, // 👈 add
  });

  // for showing the chosen names in the Autocomplete inputs
  const [selectedCustomer, setSelectedCustomer] = useState(null); // { id, name }
  const [selectedProcess, setSelectedProcess] = useState(null);   // { id, name }

  // quick cache for details modal near selectors
  const [customerPreview, setCustomerPreview] = useState(null);
  const [processPreview, setProcessPreview] = useState(null);


  useEffect(() => {
    fetchParts();
  }, []);

  const handleDownloadPdf = () => {
    if (printRef.current) {
      const clone = printRef.current.cloneNode(true);

      // Inject safe CSS for html2pdf
      const style = document.createElement("style");
      style.textContent = `
      * {
        color: #000 !important;
      }
      .bg-blue-600 { background-color: #2563eb !important; color: white !important; }
      .bg-red-600 { background-color: #dc2626 !important; color: white !important; }
      .bg-green-600 { background-color: #16a34a !important; color: white !important; }
      .bg-yellow-500 { background-color: #eab308 !important; color: white !important; }
      .bg-gray-500 { background-color: #6b7280 !important; color: white !important; }
      .border { border: 1px solid #000 !important; }
    `;
      clone.appendChild(style);

      const opt = {
        margin: 0.5,
        filename: `part_${viewPart.part_no || "details"}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" }
      };

      html2pdf().set(opt).from(clone).save();
    }
  };


  const fetchParts = async () => {
    try {
      // list endpoint returns: part_id, part_name, part_no, customer_name
      const res = await fetch(`${API}/parts`);
      const data = await res.json();
      setParts(data);
    } catch (e) {
      console.error("Failed to fetch parts", e);
    }
  };

  const openView = async (part) => {
    try {
      const res = await fetch(`${API}/parts/${part.part_id}`);
      const data = await res.json();
      setViewPart(data);
      setShowViewModal(true);   // 👈 open modal
    } catch (e) {
      console.error("Failed to fetch part details", e);
    }
  };


  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    try {
      if (!formData.customer_id || !formData.process_id) {
        alert("Please select a Customer and a Process from suggestions.");
        return;
      }

      // Normalize numeric fields (convert "" → null)
      const numericFields = ["weight", "batch_qty", "total_part_weight", "hard_temp", "rpm"];
      const cleanData = { ...formData };
      numericFields.forEach((f) => {
        if (cleanData[f] === "" || cleanData[f] === undefined) {
          cleanData[f] = null;
        }
      });

      // Use FormData for text + files
      const fd = new FormData();
      Object.entries(cleanData).forEach(([key, value]) => {
        if (value !== null && value !== undefined && key !== "image1" && key !== "image2") {
          fd.append(key, value);
        }
      });

      // append only if new file selected
      if (formData.image1 instanceof File) {
        fd.append("image1", formData.image1);
      }
      if (formData.image2 instanceof File) {
        fd.append("image2", formData.image2);
      }


      for (let [key, val] of fd.entries()) {
        console.log(key, val);
      }

      if (viewPart) {
        await fetch(`${API}/parts/${viewPart.part_id}`, {
          method: "PUT",
          body: fd, // no headers -> browser sets multipart
        });
      } else {
        await fetch(`${API}/parts`, {
          method: "POST",
          body: fd,
        });
      }

      setShowForm(false);
      resetForm();
      fetchParts();
    } catch (e) {
      console.error("Failed to save part", e);
    }
  };


  const deleteSelected = async () => {
    try {
      await fetch(`${API}/parts/`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });
      setSelectedIds([]);
      setViewPart(null);
      setShowDeleteConfirm(false);
      setDeleteInput("");
      fetchParts();
    } catch (e) {
      console.error("Failed to delete parts", e);
    }
  };

  const resetForm = () => {
    setFormData({
      customer_id: "",
      process_id: "",
      part_name: "",
      part_no: "",
      material: "",
      weight: null,
      furnace_capacity: "",
      batch_qty: null,
      total_part_weight: null,
      drg: "",
      broach_spline: "",
      anti_carb_paste: "",
      hard_temp: null,
      rpm: null,
    });
    setSelectedCustomer(null);
    setSelectedProcess(null);
    setViewPart(null);
  };

  // when editing, preload names in the Autocomplete
  const startEditFromView = () => {
    if (!viewPart) return;
    setFormData((prev) => {
      const next = { ...prev };
      PART_FIELDS.forEach((f) => (next[f] = viewPart[f] ?? ""));
      next.customer_id = viewPart.customer_id || "";
      next.process_id = viewPart.process_id || "";
      next.image1 = null; // don’t preload DB filename into formData
      next.image2 = null; // user must re-select if replacing

      return next;
    });
    setSelectedCustomer(
      viewPart.customer_id
        ? { id: viewPart.customer_id, name: viewPart.customer_name }
        : null
    );
    setSelectedProcess(
      viewPart.process_id
        ? { id: viewPart.process_id, name: viewPart.process_name }
        : null
    );
    setShowViewModal(false)
    setShowForm(true);
  };

  const partDetails = useMemo(() => {
    if (!viewPart) return [];
    return PART_FIELDS.map((k) => [k, viewPart[k]]);
  }, [viewPart]);

  const processDetails = useMemo(() => {
    if (!viewPart) return [];
    return PROCESS_FIELDS.map((k) => [k, viewPart[k]]);
  }, [viewPart]);

  const showCustomerPreview = async () => {
    if (!selectedCustomer?.id) return;
    const res = await fetch(`${API}/customers/${selectedCustomer.id}`);
    const data = await res.json();
    setCustomerPreview(data);
  };

  const showProcessPreview = async () => {
    if (!selectedProcess?.id) return;
    const res = await fetch(`${API}/processes/${selectedProcess.id}`);
    const data = await res.json();
    setProcessPreview(data);
  };

  return (
    <div className="flex">

      {/* LEFT: list */}
      <div className="w-2/3 p-4">
        <span>
          Page {page} of {totalPages} &nbsp;|&nbsp;
          Showing {paginatedParts.length} of {filteredParts.length} results
        </span>

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

        <div className="flex justify-between items-center mb-3">
          {/* Search */}
          <input
            type="text"
            placeholder="Search by name, no, or customer..."
            className="border p-2 rounded w-1/2"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1); // reset to first page on search
            }}
          />

          {/* Rows per page */}
          <select
            className="border p-2 rounded"
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setPage(1);
            }}
          >
            {[5, 10, 20, 30].map(n => (
              <option key={n} value={n}>{n} per page</option>
            ))}
          </select>
        </div>


        <table className="w-full border">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2">
                <input
                  type="checkbox"
                  checked={paginatedParts.length > 0 && paginatedParts.every(p => selectedIds.includes(p.part_id))}
                  onChange={(e) =>
                    setSelectedIds(e.target.checked
                      ? [...new Set([...selectedIds, ...paginatedParts.map((p) => p.part_id)])]
                      : selectedIds.filter(id => !paginatedParts.some(p => p.part_id === id))
                    )
                  }

                />
              </th>
              <th className="p-2 text-left">Part Name</th>
              <th className="p-2 text-left">Part No</th>
              <th className="p-2 text-left">Customer</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedParts.map((p) => (
              <tr key={p.part_id} className="border-t">
                <td className="p-2">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(p.part_id)}
                    onChange={() => toggleSelect(p.part_id)}
                  />
                </td>
                <td className="p-2">{p.part_name}</td>
                <td className="p-2">{p.part_no}</td>
                <td className="p-2">{p.customer_name}</td>
                <td className="p-2">
                  <button
                    className="bg-gray-600 text-white px-2 py-1 rounded"
                    onClick={() => openView(p)}
                  >
                    👁 View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-between items-center mt-3">
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            ◀ Prev
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next ▶
          </button>
        </div>


      </div>


      {/* FORM MODAL */}
      {showForm && (
        <div className="fixed inset-0 flex items-start mt-10PA justify-center bg-black/50 overflow-y-auto">
          <div className="bg-white p-4 rounded w-2/3 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-2">
              {viewPart ? "Edit Part" : "Create Part"}
            </h3>

            {/* Customer + Process selectors with small view buttons */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Autocomplete
                      label="Customer"
                      // IMPORTANT: see patched Autocomplete below (supports process/customer)
                      fetchUrl={`${API}/customers/search`}
                      value={selectedCustomer}
                      onChange={(val) => {
                        setSelectedCustomer(val);
                        setFormData((f) => ({ ...f, customer_id: val?.id || "" }));
                      }}
                    />
                  </div>
                  <button
                    className="px-2 py-1 border rounded"
                    onClick={showCustomerPreview}
                    disabled={!selectedCustomer?.id}
                    title="View selected customer"
                  >
                    🔍
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Autocomplete
                      label="Process"
                      fetchUrl={`${API}/processes/search`}
                      value={selectedProcess}
                      onChange={(val) => {
                        setSelectedProcess(val);
                        setFormData((f) => ({ ...f, process_id: val?.id || "" }));
                      }}
                    />
                  </div>
                  <button
                    className="px-2 py-1 border rounded"
                    onClick={showProcessPreview}
                    disabled={!selectedProcess?.id}
                    title="View selected process"
                  >
                    🔍
                  </button>
                </div>
              </div>
            </div>

            {/* Part fields only */}
            <div className="grid grid-cols-2 gap-2">
              {PART_FIELDS.map((field) => {
                // Decide input type based on field
                const isDecimal = ["weight", "total_part_weight"].includes(field);
                const isInteger = ["batch_qty", "hard_temp", "rpm"].includes(field);

                return (
                  <div key={field}>
                    <label className="block text-sm mb-1">
                      {field.replace(/_/g, " ")}
                    </label>
                    <input
                      type={isDecimal || isInteger ? "number" : "text"}
                      step={isDecimal ? "0.01" : undefined} // allow decimals for decimal fields
                      className="border p-2 w-full"
                      value={formData[field] ?? ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          [field]:
                            e.target.value === ""
                              ? null
                              : isInteger
                                ? parseInt(e.target.value, 10)
                                : isDecimal
                                  ? parseFloat(e.target.value)
                                  : e.target.value,
                        })
                      }
                      placeholder={field.replace(/_/g, " ")}
                    />
                  </div>
                );
              })}
              <div className="col-span-2">
                <label className="block text-sm mb-1">Image 1</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setFormData({ ...formData, image1: e.target.files[0] || null })
                  }
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm mb-1">Image 2</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setFormData({ ...formData, image2: e.target.files[0] || null })
                  }
                />
              </div>
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

      {/* VIEW MODAL */}
      {showViewModal && viewPart && (
        <div className="fixed inset-0 flex items-start mt-15 justify-center bg-black/50 overflow-y-auto">
          <div className="bg-white p-6 rounded w-3/4 max-h-[90vh] overflow-y-auto">
            <div ref={printRef} className="space-y-8">
              {/* ---------- HEADER ---------- */}
              <div className="grid grid-cols-2 gap-6 items-start border border-gray-400 shadow-sm rounded p-4">
                {/* LEFT: key details */}
                <div className="space-y-2 text-sm">
                  <p><span className="font-semibold">Customer:</span> {viewPart.customer_name || "—"}</p>
                  <p><span className="font-semibold">Part Name:</span> {viewPart.part_name || "—"}</p>
                  <p><span className="font-semibold">Part No:</span> {viewPart.part_no || "—"}</p>
                  <p><span className="font-semibold">Material:</span> {viewPart.material || "—"}</p>
                  <p><span className="font-semibold">Weight:</span> {viewPart.weight || "—"}</p>
                </div>

                {/* RIGHT: image1 */}
                {viewPart.image1 && (
                  <div className="flex justify-end">
                    <img
                      src={`http://localhost:5000/uploads/parts/${viewPart.image1}`}
                      alt="Part Image 1"
                      className="w-56 h-56 object-cover border-2 border-gray-500 rounded"
                    />
                  </div>
                )}
              </div>

              {/* ---------- PROCESS DETAILS ---------- */}
              <div className="border border-gray-400 shadow-sm rounded">
                <div className="bg-gray-200 px-3 py-1 font-bold uppercase text-sm">Process Details</div>
                <div className="p-4 space-y-6 text-sm">
                  {/* 1. Basic */}
                  <div>
                    <h4 className="font-semibold mb-2">Basic</h4>
                    <div className="grid grid-cols-3 border border-gray-400 divide-x divide-y">
                      <div className="p-2"><b>Process:</b> {viewPart.process_name || "—"}</div>
                      <div className="p-2"><b>Loading:</b> {viewPart.loading || "—"}</div>
                      <div className="p-2"><b>Pasting:</b> {viewPart.pasting || "—"}</div>
                      <div className="p-2"><b>Pattern No:</b> {viewPart.pattern_no || "—"}</div>
                      <div className="p-2"><b>Shot Blasting:</b> {viewPart.shot_blasting || "—"}</div>
                      <div className="p-2"><b>Punching:</b> {viewPart.punching || "—"}</div>
                    </div>
                  </div>

                  {/* 2. Tempering */}
                  <div>
                    <h4 className="font-semibold mb-2">Tempering</h4>
                    <div className="grid grid-cols-2 border border-gray-400 divide-x divide-y">
                      <div className="p-2"><b>Temperature:</b> {viewPart.temperature || "—"}</div>
                      <div className="p-2"><b>Time:</b> {viewPart.time || "—"}</div>
                    </div>
                  </div>

                  {/* 3. Inspection */}
                  <div>
                    <h4 className="font-semibold mb-2">Inspection</h4>
                    <div className="grid grid-cols-3 border border-gray-400 divide-x divide-y">
                      <div className="p-2"><b>Case Depth:</b> {viewPart.case_depth || "—"}</div>
                      <div className="p-2"><b>Checking Location:</b> {viewPart.checking_location || "—"}</div>
                      <div className="p-2"><b>Cut Off Value:</b> {viewPart.cut_off_value || "—"}</div>
                      <div className="p-2"><b>Core Hardness:</b> {viewPart.core_hardness || "—"}</div>
                      <div className="p-2"><b>Surface Hardness:</b> {viewPart.surface_hardness || "—"}</div>
                      <div className="p-2"><b>Microstructure:</b> {viewPart.microstructure || "—"}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ---------- CHARGE PREP + IMAGE2 ---------- */}
              <div className="grid grid-cols-2 gap-6 items-start border border-gray-400 shadow-sm rounded p-4">
                <div className="space-y-2 text-sm">
                  <h3 className="font-semibold text-lg border-b pb-1">Charge Preparation</h3>
                  <p><b>Furnace Capacity:</b> {viewPart.furnace_capacity || "—"}</p>
                  <p><b>Batch Qty:</b> {viewPart.batch_qty || "—"}</p>
                  <p><b>Total Part Weight:</b> {viewPart.total_part_weight || "—"}</p>
                </div>
                {viewPart.image2 && (
                  <div className="flex justify-end">
                    <img
                      src={`http://localhost:5000/uploads/parts/${viewPart.image2}`}
                      alt="Part Image 2"
                      className="w-56 h-56 object-cover border-2 border-gray-500 rounded"
                    />
                  </div>
                )}
              </div>

              {/* ---------- REMARKS ---------- */}
              <div className="border border-gray-400 shadow-sm rounded p-4">
                <h3 className="font-semibold text-lg border-b pb-2 mb-2">Remarks</h3>
                <p className="min-h-[80px] p-3 text-gray-700 border border-gray-300 rounded bg-gray-50">
                  {viewPart.remarks || "—"}
                </p>
              </div>

              {/* ---------- SIGNATURES ---------- */}
              <div className="grid grid-cols-2 gap-8 border-t pt-6">
                <div>
                  <p className="font-medium">Prepared By:</p>
                  <div className="h-16 border-b-2 border-gray-500 my-2" />
                  <p className="text-gray-600">Name: __________</p>
                </div>
                <div>
                  <p className="font-medium">Approved By:</p>
                  <div className="h-16 border-b-2 border-gray-500 my-2" />
                  <p className="text-gray-600">Name: __________</p>
                </div>
              </div>
            </div>


            {/* Action Buttons */}
            <div className="mt-4 flex gap-2 justify-end">
              <button
                className="bg-yellow-500 text-white px-3 py-1 rounded"
                onClick={() => {
                  setShowViewModal(false); // close modal when editing
                  startEditFromView();
                }}
              >
                ✏ Edit
              </button>


              <button
                className="bg-green-600 text-white px-3 py-1 rounded"
                onClick={() => {
                  if (printRef.current) {
                    const printContents = printRef.current.innerHTML;
                    const printWindow = window.open("", "", "width=800,height=600");
                    printWindow.document.write(`
  <html>
    <head>
      <title>Print</title>
      <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
      <style>
      @import url('https://fonts.googleapis.com/css2?family=Ancizar+Sans:ital,wght@0,100..1000;1,100..1000&display=swap');
      *{
      font-family: 'Ancizar Sans', sans-serif;
      }
        body { font-family: sans-serif; padding: 20px; }
        img { max-width: 100%; height: auto; }
      </style>
    </head>
    <body>${printContents}</body>
  </html>
`);

                    printWindow.document.close();
                    // printWindow.print();
                  }
                }}
              >
                🖨 Print
              </button>

              {/* <button
                className="bg-green-600 text-white px-3 py-1 rounded"
                onClick={handleDownloadPdf}
              >
                📄 Export PDF
              </button> */}


              <button
                className="bg-red-600 text-white px-3 py-1 rounded"
                onClick={() => {
                  setSelectedIds([viewPart.part_id]);
                  setShowDeleteConfirm(true);
                  setShowViewModal(false); // close modal on delete
                }}
              >
                🗑 Delete
              </button>
              <button
                className="bg-gray-500 text-white px-3 py-1 rounded"
                onClick={() => setShowViewModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}



      {/* PREVIEW: Customer */}
      {customerPreview && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-white p-4 rounded w-1/3">
            <h3 className="text-lg font-bold mb-2">Customer</h3>
            <p><b>ID:</b> {customerPreview.customer_id}</p>
            <p><b>Name:</b> {customerPreview.customer_name}</p>
            <div className="flex justify-end mt-3">
              <button
                className="px-3 py-1 bg-gray-500 text-white rounded"
                onClick={() => setCustomerPreview(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PREVIEW: Process */}
      {processPreview && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 overflow-y-auto">
          <div className="bg-white p-4 rounded w-1/2 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-2">Process</h3>
            {Object.entries(processPreview).map(([k, v]) => (
              <p key={k}><b>{k.replace(/_/g, " ")}:</b> {String(v ?? "")}</p>
            ))}
            <div className="flex justify-end mt-3">
              <button
                className="px-3 py-1 bg-gray-500 text-white rounded"
                onClick={() => setProcessPreview(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-white p-4 rounded w-1/3">
            <h3 className="text-lg font-bold mb-2">Confirm Delete</h3>
            <p className="mb-2">
              Type <b>delete</b> to confirm deletion of {selectedIds.length} part(s).
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
