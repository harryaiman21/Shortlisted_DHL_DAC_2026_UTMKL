import axios from "axios";

// Create central axios instance
const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// REQUEST INTERCEPTOR (ADD TOKEN AUTOMATICALLY)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// RESPONSE INTERCEPTOR (HANDLE ERRORS GLOBALLY)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // token expired or invalid
      localStorage.removeItem("token");
      window.location.href = "/";
    }

    return Promise.reject(error);
  }
);

export default api;