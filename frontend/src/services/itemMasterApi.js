const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const ITEM_RESOURCE = `${API_BASE_URL}/item-master`;

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

export async function fetchAllItems() {
  const res = await fetch(ITEM_RESOURCE, { method: 'GET' });
  return handleResponse(res);
}

export async function createItem(item) {
  const res = await fetch(ITEM_RESOURCE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  return handleResponse(res);
}

export async function updateItem(id, item) {
  const res = await fetch(`${ITEM_RESOURCE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  return handleResponse(res);
}

export async function deleteItem(id) {
  const res = await fetch(`${ITEM_RESOURCE}/${id}`, { method: 'DELETE' });
  return handleResponse(res);
}


