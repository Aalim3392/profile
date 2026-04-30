import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL;

export const api = axios.create({
  baseURL:
  "https://hrms-backend-he8b.onrender.com"
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hrms-pro-token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
