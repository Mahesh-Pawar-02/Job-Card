const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const RESOURCE = `${API_BASE_URL}/inward-lc-challan`;

async function handleResponse(response) {
  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const body = isJson ? await response.json() : await response.text();
  if (!response.ok) {
    const errorMessage = isJson && body && body.error ? body.error : response.statusText;
    throw new Error(errorMessage || 'Request failed');
  }
  return body;
}

export async function createInwardLC(payload) {
  const res = await fetch(RESOURCE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function fetchInwardLCList() {
  const res = await fetch(RESOURCE, { method: 'GET' });
  return handleResponse(res);
}

export async function fetchNextGrnNo() {
  const res = await fetch(`${RESOURCE}/next-grn`, { method: 'GET' });
  return handleResponse(res);
}

export async function updateInwardLC(id, payload) {
  const res = await fetch(`${RESOURCE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function deleteInwardLC(id) {
  const res = await fetch(`${RESOURCE}/${id}`, { method: 'DELETE' });
  return handleResponse(res);
}


