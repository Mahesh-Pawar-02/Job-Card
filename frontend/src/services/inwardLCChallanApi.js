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

export async function fetchInwardLCList(page = 1, limit = 10, search = '') {
  const params = new URLSearchParams();
  if (page) params.append('page', page);
  if (limit) params.append('limit', limit);
  if (search) params.append('search', search);
  
  const res = await fetch(`${RESOURCE}?${params.toString()}`, { method: 'GET' });
  return handleResponse(res);
}

export async function fetchInwardLCById(id) {
  const res = await fetch(`${RESOURCE}/${id}`, { method: 'GET' });
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

export async function deleteMultipleInwardLC(ids) {
  const res = await fetch(`${RESOURCE}/bulk`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });
  return handleResponse(res);
}


