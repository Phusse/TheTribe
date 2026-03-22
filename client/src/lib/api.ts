import axios from "axios";

// Environment variable should be defined in client/.env
// e.g. VITE_API_URL=http://localhost:3002/api
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3002/api";

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Request interceptor to attach access token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle token refresh
let isRefreshing = false;
let failedQueue: { resolve: (value?: unknown) => void; reject: (reason?: any) => void }[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response.data, // Unwrap standardize { success, message, data } wrapper if desired, but we return the whole data object here
  async (error) => {
    const originalRequest = error.config;

    // If 401 Unauthorized and we haven't already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = "Bearer " + token;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        isRefreshing = false;
        // Redirect to login or dispatch logout event
        window.dispatchEvent(new Event("auth:logout"));
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });

        // Save new tokens
        localStorage.setItem("accessToken", data.data.accessToken);
        localStorage.setItem("refreshToken", data.data.refreshToken);

        api.defaults.headers.common.Authorization = `Bearer ${data.data.accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;

        processQueue(null, data.data.accessToken);
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.dispatchEvent(new Event("auth:logout"));
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle maintenance mode globally — fire event so App.tsx shows the maintenance screen
    if (error.response?.status === 503) {
      window.dispatchEvent(new Event("app:maintenance"));
      return Promise.reject(new Error("The platform is currently under maintenance."));
    }

    // Extract standardized API error or network failure
    let errorMessage = "An unexpected error occurred";
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.code === 'ERR_NETWORK') {
      errorMessage = "Network Error: Please check your connection or verify the server is running.";
    } else if (error.message) {
      errorMessage = error.message;
    }

    return Promise.reject(new Error(errorMessage));
  }
);
