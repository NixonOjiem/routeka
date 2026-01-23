import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const signin = async (credentials) => {
  const response = await axios.post(`${API_URL}/auth/login`, credentials);

  // Save to localStorage if the token exists in the response
  if (response.data.token) {
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("user", JSON.stringify(response.data.user)); // Optional: save user info
  }

  return response.data;
};

export const signup = async (data) => {
  const response = await axios.post(`${API_URL}/auth/register`, data);

  // Save to localStorage after successful registration
  if (response.data.token) {
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("user", JSON.stringify(response.data.user));
  }

  return response.data;
};

export const signout = async () => {
  // Clear localStorage on logout
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  const response = await axios.post(`${API_URL}/auth/logout`, {});
  return response.data;
};

// axios interceptors
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);
