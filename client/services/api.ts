// src/services/api.ts
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "69420",
  },
});

// Add interceptors for auth and guest ID
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  //const guestId = localStorage.getItem("guest_id");
  const guestId = localStorage.getItem("chat_guest_id");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (guestId) {
    config.headers["X-Guest-ID"] = guestId;
  }

  return config;
});

// Response interceptor for token refresh if needed
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle token expiration
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// Types
export interface User {
  id: number;
  name: string;
  email: string;
}

export interface RideLocation {
  lat: number;
  lng: number;
  address: string;
}

export interface RideGroupMember {
  id: number;
  user_id: number;
  user_name: string;
  pickup: RideLocation;
  dropoff: RideLocation;
}

export interface RideGroup {
  group_id: string;
  chat_room_id: string | null;
  meetup_point: {
    lat: number;
    lng: number;
    name: string;
  };
  pickup_grid: string;
  dropoff_grid: string;
  member_count: number;
  members: RideGroupMember[];
}

export interface ChatRoom {
  room_id: string;
  name: string;
  is_member: boolean;
  pickup_grid: string;
  dropoff_grid: string;
  member_count: number;
  message_count: number;
  last_activity: string;
}

export interface ChatMessage {
  id: number;
  sender_name: string;
  message: string;
  type: string;
  is_guest: boolean;
  timestamp: string;
  sender_id: string | null;
  is_current_user: boolean;
}

// Auth API calls (keep your existing functions)
export const signin = async (credentials: {
  email: string;
  password: string;
}) => {
  const response = await api.post(`${API_URL}/auth/login`, credentials);
  if (response.data.token) {
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("user", JSON.stringify(response.data.user));
  }
  return response.data;
};

export const signup = async (data: {
  name: string;
  email: string;
  password: string;
}) => {
  const response = await api.post(`${API_URL}/auth/register`, data);
  if (response.data.token) {
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("user", JSON.stringify(response.data.user));
  }
  return response.data;
};

export const signout = async () => {
  try {
    const response = await api.post(`${API_URL}/auth/logout`, {});
    return response.data;
  } finally {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
};

// Ride and Chat API calls
export const apiService = {
  // Ride endpoints
  getGroupedRides: () =>
    api.get<{ groups: RideGroup[]; chat_rooms: ChatRoom[]; user: User | null }>(
      "/rides/groups",
    ),

  getGriddedRides: (gridSize?: number) =>
    api.get("/rides/grids", { params: { grid_size: gridSize } }),

  // Chat endpoints
  getChatRooms: () =>
    api.get<{ rooms: ChatRoom[]; guest_id: string }>("/chat/rooms"),

  getChatMessages: (roomId: string, config?: any) =>
    api.get<{ room: any; messages: ChatMessage[]; sender_name: string }>(
      `/chat/rooms/${roomId}/messages`,
      config,
    ),

  sendMessage: (
    roomId: string,
    message: string,
    type: string = "text",
    config?: any,
  ) =>
    api.post<{ success: boolean; message: ChatMessage; guest_id: string }>(
      `/chat/rooms/${roomId}/messages`,
      { message, type },
      config,
    ),

  joinChatRoom: (roomId: string, config?: any) =>
    api.get(`/chat/rooms/${roomId}/join`, config),
};

export default api;
