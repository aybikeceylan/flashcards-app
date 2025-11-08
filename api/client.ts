import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";

// Backend API base URL - GÜN 2'de backend kurulduğunda güncellenecek
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - token ekleme
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token geçersiz, logout yap
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

// API endpoints - GÜN 2'de backend hazır olduğunda kullanılacak
export const cardApi = {
  getAll: () => apiClient.get("/cards"),
  getById: (id: string) => apiClient.get(`/cards/${id}`),
  create: (card: any) => apiClient.post("/cards", card),
  update: (id: string, card: any) => apiClient.patch(`/cards/${id}`, card),
  delete: (id: string) => apiClient.delete(`/cards/${id}`),
};

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post("/auth/login", { email, password }),
  register: (name: string, email: string, password: string) =>
    apiClient.post("/auth/register", { name, email, password }),
  me: () => apiClient.get("/auth/me"),
};
