const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const PARTY_RESOURCE = `${API_BASE_URL}/party-master`;

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

export async function fetchAllParties() {
  const res = await fetch(PARTY_RESOURCE, { method: 'GET' });
  return handleResponse(res);
}

export async function fetchPartyById(id) {
  if (id == null) throw new Error('id is required');
  const res = await fetch(`${PARTY_RESOURCE}/${id}`, { method: 'GET' });
  return handleResponse(res);
}

export async function createParty(party) {
  const res = await fetch(PARTY_RESOURCE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(party),
  });
  return handleResponse(res);
}

export async function updateParty(id, party) {
  if (id == null) throw new Error('id is required');
  const res = await fetch(`${PARTY_RESOURCE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(party),
  });
  return handleResponse(res);
}

export async function deleteParty(id) {
  if (id == null) throw new Error('id is required');
  const res = await fetch(`${PARTY_RESOURCE}/${id}`, { method: 'DELETE' });
  return handleResponse(res);
}


