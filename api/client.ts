import { useAuthStore } from "@/store/useAuthStore";
import axios from "axios";

// Backend API base URL
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Cookie'leri otomatik gönder
});

// Request interceptor - token ekleme ve logging
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    // Token varsa ve "cookie" string'i değilse Bearer token olarak ekle
    if (token && token !== "cookie" && token !== null) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Token yoksa cookie kullanılacak (withCredentials: true sayesinde)

    // Network request logging
    console.log("🌐 [REQUEST]", {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      headers: config.headers,
      data: config.data,
    });

    return config;
  },
  (error) => {
    console.error("❌ [REQUEST ERROR]", error);
    return Promise.reject(error);
  }
);

// Response interceptor - error handling ve logging
apiClient.interceptors.response.use(
  (response) => {
    // Network response logging
    console.log("✅ [RESPONSE]", {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
      data: response.data,
    });
    return response;
  },
  (error) => {
    // Network error logging
    console.error("❌ [RESPONSE ERROR]", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      message: error.message,
      data: error.response?.data,
    });

    if (error.response?.status === 401) {
      // Token geçersiz, logout yap
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

// TypeScript Types
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  data: User & { token?: string };
  message: string;
}

export interface Flashcard {
  _id: string;
  word: string;
  meaning: string;
  example?: string;
  imageUrl?: string;
  audioUrl?: string;
  isFavorite?: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFlashcard {
  word: string;
  meaning: string;
  example?: string;
  imageUrl?: string;
  audioUrl?: string;
  isFavorite?: boolean;
}

export interface UpdateFlashcard {
  word?: string;
  meaning?: string;
  example?: string;
  imageUrl?: string;
  audioUrl?: string;
  isFavorite?: boolean;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  avatar?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface SuccessResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
}

export interface ErrorResponse {
  success: boolean;
  message: string;
}

export interface UploadResponse {
  success: boolean;
  data: {
    url: string;
    filename: string;
  };
  message: string;
}

export interface MultiUploadResponse {
  success: boolean;
  data: {
    images?: Array<{ url: string; filename: string }>;
    audios?: Array<{ url: string; filename: string }>;
  };
  message: string;
}

// Auth API endpoints
export const authApi = {
  register: (data: RegisterRequest) =>
    apiClient.post<AuthResponse>("/auth/register", data),
  login: (data: LoginRequest) =>
    apiClient.post<AuthResponse>("/auth/login", data),
  logout: () => apiClient.post<SuccessResponse>("/auth/logout"),
  me: () => apiClient.get<SuccessResponse<User>>("/auth/me"),
  getProfile: () => apiClient.get<SuccessResponse<User>>("/auth/profile"),
  updateProfile: (data: UpdateProfileRequest) =>
    apiClient.put<SuccessResponse<User>>("/auth/profile", data),
  deleteProfile: () => apiClient.delete<SuccessResponse>("/auth/profile"),
  changePassword: (data: ChangePasswordRequest) =>
    apiClient.put<SuccessResponse>("/auth/profile/password", data),
  forgotPassword: (data: ForgotPasswordRequest) =>
    apiClient.post<SuccessResponse<{ resetToken: string }>>(
      "/auth/forgot-password",
      data
    ),
  resetPassword: (data: ResetPasswordRequest) =>
    apiClient.post<SuccessResponse>("/auth/reset-password", data),
};

// Flashcard API endpoints
export const flashcardApi = {
  getAll: () => apiClient.get<SuccessResponse<Flashcard[]>>("/flashcards"),
  getById: (id: string) =>
    apiClient.get<SuccessResponse<Flashcard>>(`/flashcards/${id}`),
  create: (data: CreateFlashcard) =>
    apiClient.post<SuccessResponse<Flashcard>>("/flashcards", data),
  update: (id: string, data: UpdateFlashcard) =>
    apiClient.put<SuccessResponse<Flashcard>>(`/flashcards/${id}`, data),
  delete: (id: string) =>
    apiClient.delete<SuccessResponse>(`/flashcards/${id}`),
};

// Upload API endpoints
export const uploadApi = {
  uploadImage: (file: FormData) =>
    apiClient.post<UploadResponse>("/upload/image", file, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  uploadAudio: (file: FormData) =>
    apiClient.post<UploadResponse>("/upload/audio", file, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  uploadFiles: (files: FormData) =>
    apiClient.post<MultiUploadResponse>("/upload/files", files, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
};

// Legacy cardApi (for backward compatibility, redirects to flashcardApi)
export const cardApi = {
  getAll: () => flashcardApi.getAll(),
  getById: (id: string) => flashcardApi.getById(id),
  create: (card: CreateFlashcard) => flashcardApi.create(card),
  update: (id: string, card: UpdateFlashcard) => flashcardApi.update(id, card),
  delete: (id: string) => flashcardApi.delete(id),
};
