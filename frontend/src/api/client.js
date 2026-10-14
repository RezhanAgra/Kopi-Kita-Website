import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

// attach admin token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("kopikita_admin_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const formatRupiah = (n) =>
  `Rp ${Math.round(n || 0).toLocaleString("id-ID")}`;

export default api;
