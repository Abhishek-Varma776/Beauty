import axios from "axios";

export const BACKEND_URL = (import.meta.env.VITE_API_URL || "https://beauty-backend-8i3u.onrender.com/api").replace(/\/api\/?$/, "");

const API = axios.create({
  baseURL: `${BACKEND_URL}/api`,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("manis_auth_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default API;
