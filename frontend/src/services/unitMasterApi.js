const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const UNIT_RESOURCE = `${API_BASE_URL}/unit-master`;

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

export async function fetchAllUnits() {
  const res = await fetch(UNIT_RESOURCE, { method: 'GET' });
  return handleResponse(res);
}

export async function createUnit(unit) {
  const res = await fetch(UNIT_RESOURCE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(unit),
  });
  return handleResponse(res);
}

export async function updateUnit(id, unit) {
  const res = await fetch(`${UNIT_RESOURCE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(unit),
  });
  return handleResponse(res);
}

export async function deleteUnit(id) {
  const res = await fetch(`${UNIT_RESOURCE}/${id}`, { method: 'DELETE' });
  return handleResponse(res);
}


