import React, { useEffect, useMemo, useRef, useState } from "react";
import Autocomplete from "../components/Autocomplete";
import { toast } from "react-toastify";

const API = "http://localhost:5000/api";

const PART_SPEC = [
  // most imp, can not change once added
  { key: "name", label: "Part Name", type: "text", section: "basic" },
  { key: "no", label: "Part No", type: "text", section: "basic" },

  // other part fields
  { key: "material", label: "Material", type: "text", section: "specs" },
  { key: "weight", label: "Weight", type: "decimal", section: "specs" },
  { key: "furnace_capacity", label: "Furnace Capacity", type: "text", section: "specs" },
  { key: "batch_qty", label: "Batch Quantity", type: "int", section: "specs" },
  { key: "total_part_weight", label: "Total Part Weight", type: "decimal", section: "specs" },
  { key: "drg", label: "DRG", type: "select", options: ["Yes", "No", "N/A"], section: "specs" },
  { key: "broach_spline", label: "Broach Spline", type: "text", section: "specs" },
  { key: "anti_carb_paste", label: "Anti Carb Paste", type: "text", section: "specs" },
  { key: "hard_temp", label: "Hard Temp (°C)", type: "int", section: "specs" },
  { key: "rpm", label: "RPM", type: "int", section: "specs" },

  // process related
  { key: "loading_pattern", label: "Loading Pattern", type: "text", section: "process" },
  { key: "pasting", label: "Pasting", type: "text", section: "process" },
  { key: "pattern_no", label: "Pattern No", type: "int", section: "process" },
  { key: "shot_blasting", label: "Shot Blasting", type: "text", section: "process" },
  { key: "punching", label: "Punching", type: "text", section: "process" },
  { key: "tempering_temp", label: "Tempering Temp", type: "int", section: "process" },
  { key: "soaking_time", label: "Soaking Time", type: "text", section: "process" },

  // inspection
  { key: "case_depth", label: "Case Depth", type: "text", section: "inspection" },
  { key: "checking_location", label: "Checking Location", type: "text", section: "inspection" },
  { key: "cut_off_value", label: "Cut Off Value", type: "text", section: "inspection" },
  { key: "core_hardness", label: "Core Hardness", type: "text", section: "inspection" },
  { key: "surface_hardness", label: "Surface Hardness", type: "text", section: "inspection" },

  // microstructure handled separately → section वेगळं नाही
];



export default function PartPage() {
  const printRef = useRef();

  const [parts, setParts] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [editform, setEditForm] = useState(null)

  // modals & dialogs
  const [showForm, setShowForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [deleteInput, setDeleteInput] = useState("");

  // NEW state
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // form state
  const [formData, setFormData] = useState({
    customer: "",
    customer_id: "",
    process_id: "",
    // core part fields
    name: "",
    no: "",
    material: "",
    weight: null,
    furnace_capacity: "600kg",
    batch_qty: null,
    total_part_weight: null,
    drg: "",
    broach_spline: "",
    anti_carb_paste: "",
    hard_temp: null,
    rpm: null,
    // process details
    loading_pattern: "",
    pasting: "",
    pattern_no: null,
    shot_blasting: "",
    punching: "",
    tempering_temp: null,
    soaking_time: "",
    // inspection
    case_depth: "",
    checking_location: "",
    cut_off_value: "",
    core_hardness: "",
    surface_hardness: "",
    // microstructure as two fields for UX
    microstructure: [{ key: "", value: "" }],
    // files
    part_image: null,
    charge_image: null,
    drawing: null,
  });

  // for showing the chosen names in the Autocomplete inputs
  const [selectedCustomer, setSelectedCustomer] = useState(null); // { id, name }
  const [selectedProcess, setSelectedProcess] = useState(null);   // { id, name }

  // quick cache for details modal near selectors
  const [customerPreview, setCustomerPreview] = useState(null);
  const [processPreview, setProcessPreview] = useState(null);


  // Derived: filtered + paginated parts
  const filteredParts = useMemo(() => {
    return ((parts != null || parts != undefined) && parts.length > 0) && parts.filter(p => {
      const term = searchTerm.toLowerCase();
      return (
        p?.part_name?.toLowerCase().includes(term) ||
        p?.part_no?.toLowerCase().includes(term) ||
        p?.customer_name?.toLowerCase().includes(term)
      );
    });
  }, [parts, searchTerm]);

  const paginatedParts = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return ((parts != null || parts != undefined) && parts.length > 0) && filteredParts.slice(start, start + rowsPerPage);
  }, [filteredParts, page, rowsPerPage]);

  const totalPages = Math.ceil(filteredParts.length / rowsPerPage);

  useEffect(() => {
    fetchParts();
  }, []);

  useEffect(() => {
    console.log("Parts updated:", parts);
  }, [parts]);

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

  // add an empty microstructure row at the end
  const addMicrostructureRow = () => {
    setFormData((f) => ({
      ...f,
      microstructure: Array.isArray(f.microstructure)
        ? [...f.microstructure, { key: "", value: "" }]
        : [{ key: "", value: "" }],
    }));
  };

  // remove row by index
  const removeMicrostructureRow = (index) => {
    setFormData((f) => {
      const arr = Array.isArray(f.microstructure) ? [...f.microstructure] : [];
      if (index >= 0 && index < arr.length) arr.splice(index, 1);
      // ensure at least one empty row if you prefer:
      return { ...f, microstructure: arr.length ? arr : [{ key: "", value: "" }] };
    });
  };

  // update one field of a microstructure row
  const updateMicrostructureRow = (index, field, value) => {
    setFormData((f) => {
      const arr = Array.isArray(f.microstructure) ? [...f.microstructure] : [{ key: "", value: "" }];
      if (!arr[index]) arr[index] = { key: "", value: "" };
      arr[index] = { ...arr[index], [field]: value };
      return { ...f, microstructure: arr };
    });
  };


  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };
  useEffect(() => {
    console.log("Selected IDs:", selectedIds);
  }, [selectedIds]);

  const handleSave = async () => {
    console.log(selectedCustomer, selectedProcess);
    try {
      // Build base payload from form state but ensure customer/process IDs come from selectors
      const payloadBase = {
        ...formData,
        process_id: selectedCustomer != null ? selectedProcess.id : null,
        customer: selectedCustomer != null ? selectedCustomer.name : null,
      };

      // जर edit मोड असेल तर immutable fields काढून टाक
      if (editform) {
        delete payloadBase.customer_id;
      } else {
        payloadBase.customer_id = selectedCustomer != null ? selectedCustomer.id : null;
      }


      // Numeric normalization (convert "" or non-number -> null)
      const numericKeys = [
        "weight",
        "batch_qty",
        "total_part_weight",
        "hard_temp",
        "rpm",
        "pattern_no",
        "tempering_temp",
      ];
      numericKeys.forEach((k) => {
        const v = payloadBase[k];
        if (v === "" || v === undefined || v === null) payloadBase[k] = null;
        else {
          const n = Number(v);
          payloadBase[k] = Number.isFinite(n) ? n : null;
        }
      });

      // microstructure: convert array [{key,value}, ...] => object { key: value, ... }
      // Filter out rows with empty keys (trimmed)
      let microToSend = "";
      const msArr = Array.isArray(payloadBase.microstructure) ? payloadBase.microstructure : [];
      const msObj = {};
      for (const row of msArr) {
        if (!row) continue;
        const k = String(row.key ?? "").trim();
        // allow empty values, but require key
        if (k.length === 0) continue;
        // store value as-is (trimmed)
        msObj[k] = row.value === undefined ? "" : row.value;
      }
      if (Object.keys(msObj).length > 0) {
        microToSend = JSON.stringify(msObj);
      } else {
        // empty -> send empty string so backend normalizeJSON("") => null
        // This is intentional: sending "" clears microstructure in DB.
        microToSend = "";
      }

      // Build FormData
      const fd = new FormData();

      // Append all fields except files and the original microstructure array
      // We'll always append a microstructure field (microToSend) to avoid accidentally wiping/preserving wrongly.
      Object.entries(payloadBase).forEach(([k, v]) => {
        if (["part_image", "charge_image", "drawing", "microstructure"].includes(k)) return;
        // only append values that are not undefined (null is fine; backend does `x || null`)
        if (v !== undefined) {
          // For null -> we append empty string? no — append null would become "null" string; better to append empty string
          // but backend uses (value || null) so sending "" becomes null server-side. So we append empty string for null.
          if (v === null) return;
          else fd.append(k, String(v));
        }
      });

      // Always append microstructure field (string or empty string)
      // Backend normalizeJSON will convert "" to null, and a JSON string will be parsed by normalizeJSON.
      fd.append("microstructure", microToSend);

      // Files: append only if the field contains a File (new upload)
      if (formData.part_image instanceof File) fd.append("part_image", formData.part_image);
      if (formData.charge_image instanceof File) fd.append("charge_image", formData.charge_image);
      if (formData.drawing instanceof File) fd.append("drawing", formData.drawing);

      // Decide endpoint & method
      const url = editform ? `${API}/parts/${editform.id}` : `${API}/parts`;
      const method = editform ? "PUT" : "POST";

      console.log("Saving part to", url, "method", method, "with data", Object.fromEntries(fd));

      const res = await fetch(url, { method, body: fd });
      let result;
      try {
        result = await res.json();
      } catch {
        result = null;
      }

      if (!res.ok) {
        throw new Error(result?.error || `Server returned ${res.status}`);
      }
      toast.success(editform ? "Part updated successfully!" : "Part created successfully!");

      // success: close modal, reset, reload parts
      setEditForm(null)
      setShowForm(false);
      resetForm(); // your existing resetForm should reset microstructure to [{key:"",value:""}]
      fetchParts();
    } catch (e) {
      console.error("Save failed", e);
      toast.error(e.message || "Save failed. Please try again.");
    }
  };


  const deleteSelected = async () => {
    try {
      const res = await fetch(`${API}/parts/`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });

      const result = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(result?.error || "Failed to delete parts.");
      }

      toast.success(`Deleted ${selectedIds.length} part(s) successfully`);
      setSelectedIds([]);
      setShowDeleteConfirm(false);
      setDeleteInput("");
      fetchParts();
    } catch (e) {
      console.error("Delete failed", e);
      toast.error(e.message || "Failed to delete parts.");
    }
  };


  const resetForm = () => {
    setFormData({
      customer_id: "",
      process_id: "",
      // core part fields
      name: "",
      no: "",
      material: "",
      weight: null,
      furnace_capacity: "600kg",
      batch_qty: null,
      total_part_weight: null,
      drg: "",
      broach_spline: "",
      anti_carb_paste: "",
      hard_temp: null,
      rpm: null,
      // process details
      loading_pattern: "",
      pasting: "",
      pattern_no: null,
      shot_blasting: "",
      punching: "",
      tempering_temp: null,
      soaking_time: "",
      // inspection
      case_depth: "",
      checking_location: "",
      cut_off_value: "",
      core_hardness: "",
      surface_hardness: "",
      // microstructure as two fields for UX
      microstructure: [{ key: "", value: "" }],
      // files
      part_image: null,
      charge_image: null,
      drawing: null,
    });
    setSelectedCustomer(null);
    setSelectedProcess(null);
  };

  // when editing, preload names in the Autocomplete
  const startEditFromView = (p) => {
    setFormData({
      id: p.id,
      customer_id: p.customer_id || "",
      process_id: p.process_id || "",
      name: p.name || "",
      no: p.no || "",
      material: p.material || "",
      weight: p.weight ?? "",
      furnace_capacity: p.furnace_capacity ?? "600kg",
      batch_qty: p.batch_qty ?? "",
      total_part_weight: p.total_part_weight ?? "",
      drg: p.drg ?? "",
      broach_spline: p.broach_spline ?? "",
      anti_carb_paste: p.anti_carb_paste ?? "",
      hard_temp: p.hard_temp ?? "",
      rpm: p.rpm ?? "",
      loading_pattern: p.loading_pattern ?? "",
      pasting: p.pasting ?? "",
      pattern_no: p.pattern_no ?? "",
      shot_blasting: p.shot_blasting ?? "",
      punching: p.punching ?? "",
      tempering_temp: p.tempering_temp ?? "",
      soaking_time: p.soaking_time ?? "",
      case_depth: p.case_depth ?? "",
      checking_location: p.checking_location ?? "",
      cut_off_value: p.cut_off_value ?? "",
      core_hardness: p.core_hardness ?? "",
      surface_hardness: p.surface_hardness ?? "",
      microstructure: (() => {
        if (!p.microstructure) return [{ key: "", value: "" }];
        try {
          let parsed = p.microstructure;

          // जर string असेल तर parse कर
          if (typeof parsed === "string") {
            parsed = JSON.parse(parsed);
          }

          // जर array असेल (उदा. [{key,value}, ...])
          if (Array.isArray(parsed)) {
            return parsed;
          }

          // जर object असेल (उदा. { core: "xyz", case: "abc" })
          if (typeof parsed === "object" && parsed !== null) {
            return Object.entries(parsed).map(([k, v]) => ({
              key: k,
              value: v,
            }));
          }

          // fallback
          return [{ key: "", value: "" }];
        } catch {
          return [{ key: "", value: "" }];
        }
      })(),


      // DO NOT preload file names into file inputs
      part_image: null,
      charge_image: null,
      drawing: null,
      customer_name: p.customer_name || "",
      process_name: p.short_name || "",
    });

    setSelectedCustomer({ id: p.customer_id, name: p.customer_name });
    setSelectedProcess({ id: p.process_id, name: p.short_name });

    console.log("p:", p);

    setEditForm(p)
    setShowForm(true);
  };

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

      {/* list */}
      <div className="p-4 w-full">
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

        {/* TABLE of parts */}
        <div className="w-full overflow-x-auto">
          <table className="text-sm min-w-max border-separate border-spacing-2 border border-gray-400 dark:border-gray-500 ">
            <thead className="">
              <tr className="bg-gray-200">
                <th className="p-2 border border-gray-300 dark:border-gray-600">
                  <input
                    type="checkbox"
                    checked={paginatedParts.length > 0 && paginatedParts.every(p => selectedIds.includes(p.id))}
                    onChange={(e) =>
                      setSelectedIds(e.target.checked
                        ? [...new Set([...selectedIds, ...paginatedParts.map((p) => p.id)])]
                        : selectedIds.filter(id => !paginatedParts.some(p => p.id === id))
                      )
                    }
                  />
                </th>
                {/* 🔥 All columns from schema */}
                <th className="p-2 border border-gray-300 dark:border-gray-600">Customer</th>
                <th className="p-2 border border-gray-300 dark:border-gray-600">Part Name</th>
                <th className="p-2 border border-gray-300 dark:border-gray-600">Part No</th>
                <th className="p-2 border border-gray-300 dark:border-gray-600">Material</th>
                <th className="p-2 border border-gray-300 dark:border-gray-600">Weight</th>
                <th className="p-2 border border-gray-300 dark:border-gray-600">Batch Qty</th>
                <th className="p-2 border border-gray-300 dark:border-gray-600">Broach Spline</th>
                <th className="p-2 border border-gray-300 dark:border-gray-600">Anti Carb</th>
                <th className="p-2 border border-gray-300 dark:border-gray-600">Loading Pattern</th>
                <th className="p-2 border border-gray-300 dark:border-gray-600">Pattern No</th>
                <th className="p-2 border border-gray-300 dark:border-gray-600">Shot Blasting</th>
                <th className="p-2 border border-gray-300 dark:border-gray-600">Case Depth</th>
                <th className="p-2 border border-gray-300 dark:border-gray-600">Cut Off</th>
                <th className="p-2 border border-gray-300 dark:border-gray-600">Core Hardness</th>
                <th className="p-2 border border-gray-300 dark:border-gray-600">Surface Hardness</th>
                <th className="p-2 border border-gray-300 dark:border-gray-600">Process</th>
                <th className="p-2 border border-gray-300 dark:border-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="">

              {Array.isArray(paginatedParts) && paginatedParts.length > 0 ? (
                paginatedParts.map((p) => (

                  <tr key={p.id} className="">
                    <td className="p-2 border border-gray-300 dark:border-gray-700">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(p.id)}
                        onChange={() => toggleSelect(p.id)}
                      />
                    </td>

                    {/* 🔥 print each field */}
                    <td className="p-2 border border-gray-300 dark:border-gray-700">{p.customer_name}</td>
                    <td className="p-2 border border-gray-300 dark:border-gray-700">{p.name}</td>
                    <td className="p-2 border border-gray-300 dark:border-gray-700">{p.no}</td>
                    <td className="p-2 border border-gray-300 dark:border-gray-700">{p.material}</td>
                    <td className="p-2 border border-gray-300 dark:border-gray-700">{p.weight}</td>
                    <td className="p-2 border border-gray-300 dark:border-gray-700">{p.batch_qty}</td>
                    <td className="p-2 border border-gray-300 dark:border-gray-700">{p.broach_spline}</td>
                    <td className="p-2 border border-gray-300 dark:border-gray-700">{p.anti_carb_paste}</td>
                    <td className="p-2 border border-gray-300 dark:border-gray-700">{p.loading_pattern}</td>
                    <td className="p-2 border border-gray-300 dark:border-gray-700">{p.pattern_no}</td>
                    <td className="p-2 border border-gray-300 dark:border-gray-700">{p.shot_blasting}</td>
                    <td className="p-2 border border-gray-300 dark:border-gray-700">{p.case_depth}</td>
                    <td className="p-2 border border-gray-300 dark:border-gray-700">{p.cut_off_value}</td>
                    <td className="p-2 border border-gray-300 dark:border-gray-700">{p.core_hardness}</td>
                    <td className="p-2 border border-gray-300 dark:border-gray-700">{p.surface_hardness}</td>
                    <td className="p-2 border border-gray-300 dark:border-gray-700">{p.short_name}</td>


                    {/* Actions: Edit + Delete */}
                    <td className="p-2 space-x-2 border border-gray-300 dark:border-gray-700">
                      <button
                        className="bg-yellow-400 text-white px-2 py-1 rounded"
                        onClick={() => startEditFromView(p)}
                      >
                        ✏
                      </button>
                      {/* <button
                      className="bg-red-500 text-white px-2 py-1 rounded"
                      onClick={() => deleteSelected(p.part_id)}
                    >
                      🗑
                    </button> */}
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={13} className="p-4 text-center text-gray-500">No Parts</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* pagination controllers ◀ Prev Next ▶ */}
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
        <div className="fixed inset-0 flex items-start justify-center bg-black/50 overflow-y-auto p-4">
          <div className="bg-white p-6 rounded-lg w-2/3 max-h-[90vh] overflow-y-auto shadow-lg">
            <h3 className="text-xl font-bold mb-4 text-gray-800">
              {editform ? "Edit Part" : "Create Part"}
            </h3>

            {/* SECTION 1: Basic Info */}
            <div className="bg-gray-50 p-4 rounded-lg border mb-6">
              <h4 className="text-lg font-semibold mb-3 border-b pb-1">Basic Info</h4>
              <div className="grid grid-cols-2 gap-4">
                {/* Customer */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Customer</label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Autocomplete
                        label=""
                        fetchUrl={`${API}/customers/search`}
                        value={selectedCustomer}
                        onChange={(val) => {
                          setSelectedCustomer(val);
                          setFormData((f) => ({ ...f, customer_id: val?.id || "" }));
                        }}
                        disabled={!!editform}
                      />
                    </div>
                    <button
                      className="px-2 py-1 border rounded text-gray-600 hover:bg-gray-100"
                      onClick={showCustomerPreview}
                      disabled={!selectedCustomer?.id}
                      title="View selected customer"
                    >
                      🔍
                    </button>
                  </div>
                </div>

                {/* Part Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Part Name</label>
                  <input
                    type="text"
                    className="w-full border rounded px-2 py-1"
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={!!editform}
                  />
                </div>

                {/* Part No */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Part No</label>
                  <input
                    type="text"
                    className="w-full border rounded px-2 py-1"
                    value={formData.no || ""}
                    onChange={(e) => setFormData({ ...formData, no: e.target.value })}
                    disabled={!!editform}
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: Process Info */}
            <div className="bg-gray-50 p-4 rounded-lg border mb-6">
              <h4 className="text-lg font-semibold mb-3 border-b pb-1">Process Info</h4>
              <div className="grid grid-cols-2 gap-4">
                {/* Process */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Process</label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Autocomplete
                        label=""
                        fetchUrl={`${API}/processes/search`}
                        value={selectedProcess}
                        onChange={(val) => {
                          setSelectedProcess(val);
                          setFormData((f) => ({ ...f, process_id: val?.id || "" }));
                        }}
                      />
                    </div>
                    <button
                      className="px-2 py-1 border rounded text-gray-600 hover:bg-gray-100"
                      onClick={showProcessPreview}
                      disabled={!selectedProcess?.id}
                      title="View selected process"
                    >
                      🔍
                    </button>
                  </div>
                </div>

                {PART_SPEC.filter(f => f.section === "process").map((f) => (
                  <div key={f.key}>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">{f.label}</label>
                    <input
                      type={f.type === "int" || f.type === "decimal" ? "number" : "text"}
                      step={f.type === "decimal" ? "0.01" : undefined}
                      className="w-full border rounded px-2 py-1"
                      value={formData[f.key] ?? ""}
                      onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 3: Material & Specs */}
            <div className="bg-gray-50 p-4 rounded-lg border mb-6">
              <h4 className="text-lg font-semibold mb-3 border-b pb-1">Material & Specs</h4>
              <div className="grid grid-cols-2 gap-4">
                {PART_SPEC.filter(f => f.section === "specs").map((f) => (
                  <div key={f.key}>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">{f.label}</label>
                    {f.type === "select" ? (
                      <select
                        className="w-full border rounded px-2 py-1"
                        value={formData[f.key] || ""}
                        onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })}
                      >
                        <option value="">Select</option>
                        {f.options.map((o) => (
                          <option key={o} value={o}>{o}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={f.type === "int" || f.type === "decimal" ? "number" : "text"}
                        step={f.type === "decimal" ? "0.01" : undefined}
                        className="w-full border rounded px-2 py-1"
                        value={formData[f.key] ?? ""}
                        onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 4: Inspection */}
            <div className="bg-gray-50 p-4 rounded-lg border mb-6">
              <h4 className="text-lg font-semibold mb-3 border-b pb-1">Inspection Parameters</h4>
              <div className="grid grid-cols-2 gap-4">
                {PART_SPEC.filter(f => f.section === "inspection").map((f) => (
                  <div key={f.key}>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">{f.label}</label>
                    <input
                      type="text"
                      className="w-full border rounded px-2 py-1"
                      value={formData[f.key] ?? ""}
                      onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 5: Microstructure */}
            <div className="bg-gray-50 p-4 rounded-lg border mb-6">
              <h4 className="text-lg font-semibold mb-3 border-b pb-1">Microstructure</h4>
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Microstructure
                </label>
                {formData?.microstructure?.map((row, i) => (
                  <div key={i} className="flex gap-2 mb-2 items-center">
                    <input
                      className="flex-1 border rounded px-2 py-1"
                      placeholder="Key (e.g. case, core, bainite...)"
                      value={row.key}
                      onChange={(e) => updateMicrostructureRow(i, "key", e.target.value)}
                    />
                    <input
                      className="flex-1 border rounded px-2 py-1"
                      placeholder="Value"
                      value={row.value}
                      onChange={(e) => updateMicrostructureRow(i, "value", e.target.value)}
                    />
                    <button
                      type="button"
                      className="px-2 py-1 bg-red-500 text-white rounded"
                      onClick={() => removeMicrostructureRow(i)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="mt-2 px-3 py-1 bg-green-500 text-white rounded"
                  onClick={addMicrostructureRow}
                >
                  + Add Microstructure
                </button>
              </div>
            </div>

            {/* SECTION 6: File Uploads */}
            <div className="bg-gray-50 p-4 rounded-lg border mb-6">
              <h4 className="text-lg font-semibold mb-3 border-b pb-1">Attachments</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Part Image (optional)
                  </label>
                  {editform?.part_image && (
                    <img
                      src={`http://localhost:5000/uploads/parts/${editform.part_image}`}
                      alt="Preview"
                      className="w-24 h-24 object-cover border mb-2"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setFormData({ ...formData, part_image: e.target.files[0] || null })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Charge Image (optional)
                  </label>
                  {editform?.charge_image && (
                    <img
                      src={`http://localhost:5000/uploads/parts/${editform.charge_image}`}
                      alt="Preview"
                      className="w-24 h-24 object-cover border mb-2"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setFormData({ ...formData, charge_image: e.target.files[0] || null })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Drawing (pdf/image) (optional)
                  </label>
                  {editform?.drawing && (
                    <a
                      href={`http://localhost:5000/uploads/parts/${editform.drawing}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline block mb-2"
                    >
                      View existing file
                    </a>
                  )}
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) =>
                      setFormData({ ...formData, drawing: e.target.files[0] || null })
                    }
                  />
                </div>

              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={handleSave}
              >
                Save
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
