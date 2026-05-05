export async function uploadImage(base64Data: string, filename: string) {
  const BASE = process.env.MOCK_BACKEND_URL ?? "http://localhost:4001";
  const res = await fetch(`${BASE}/uploads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename, data: base64Data }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upload error: ${res.status} ${text}`);
  }
  return res.json();
}
