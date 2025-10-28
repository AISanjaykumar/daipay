const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080/v1';
export async function api(path, init){
  const res = await fetch(`${BASE}${path}`, { headers: {'Content-Type':'application/json'}, ...init });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
