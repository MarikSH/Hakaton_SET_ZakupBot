const API = "http://localhost:8000"; // 🔹 Явный URL для локальной разработки

const fetchWithCheck = async (url, options = {}) => {
  try {
    const res = await fetch(`${API}${url}`, { 
      ...options, 
      headers: { "Content-Type": "application/json", ...options.headers } 
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    if (err.name === 'TypeError' || err.message.includes('fetch')) {
      throw new Error("❌ Не удалось подключиться к серверу. Убедитесь, что бэкенд запущен на порту 8000.");
    }
    throw err;
  }
};

export const createProcurement = (data) => fetchWithCheck("/api/v1/procurements/", { method: "POST", body: JSON.stringify(data) });
export const getProcurementReport = (id) => fetchWithCheck(`/api/v1/procurements/${id}/report`);
export const completeProcurement = (id) => fetchWithCheck(`/api/v1/procurements/${id}/complete`, { method: "PUT" });
export const getHistory = () => fetchWithCheck("/api/v1/procurements/history");
export const deleteProcurement = (id) => fetchWithCheck(`/api/v1/procurements/${id}`, { method: "DELETE" });