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
// User groups
export interface UserGroup {
  id: number;
  name: string;
  description: string | null;
  creator_id: number;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
  chat_room?: ChatRoom | null; // populated when approved
}

export interface UpdateProfilePayload {
  name?: string;
  email?: string;
  user_name?: string;
  password?: string;
}

export interface User {
  id?: number;
  name: string;
  email: string;
  user_name?: string;
  email_verified_at?: string;
  avatar?: string;
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
  category: string;
  guest_id: string | null;
  commute_time?: string;
  pickup?: { lat: number; lng: number };
  dropoff?: { lat: number; lng: number };
}

export interface RideGroup {
  group_id: string;
  chat_room_id: string | null;
  group_type: string;
  meetup_point?: {
    lat: number;
    lng: number;
    name: string;
  };
  pickup_grid?: {
    lat: number;
    lng: number;
    grid_cell: string;
    name: string;
  };
  dropoff_grid?: {
    lat: number;
    lng: number;
    grid_cell: string;
    name: string;
  };
  member_count: number;
  members: RideGroupMember[];
}

export interface ChatRoom {
  room_id: string;
  name: string;
  is_member: boolean;
  pickup_grid?: string;
  dropoff_grid?: string;
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
  login: string; // Changed from 'email' to 'login'
  password: string;
}) => {
  // The backend now expects 'login' and 'password'
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
  user_name: string;
  password: string;
}) => {
  const response = await api.post(`${API_URL}/auth/register`, data);
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

export const googleAuthentication = async (token: string) => {
  // We send the token in the body as expected by your Laravel controller
  const response = await api.post(`${API_URL}/auth/google-auth`, { token });

  if (response.data.token) {
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("user", JSON.stringify(response.data.user));
  }
  return response.data;
};

export const requestPasswordReset = async (email: string) => {
  const response = await axios.post(`${API_URL}/auth/forgot-password`, {
    email,
  });
  return response.data;
};

export const confirmPasswordReset = async (data: any) => {
  const response = await axios.post(`${API_URL}/auth/reset-password`, data);
  return response.data;
};

export const updateUserProfile = async (data: UpdateProfilePayload) => {
  const response = await api.patch(`${API_URL}/auth/profile-update`, data);
  //console.log("Profile update response:", response.data);
  return response.data; // Expected: { message: "Success", user: { ... } }
};

// Ride and Chat API calls
export const apiService = {
  // Ride endpoints
  getGroupedRides: (config?: any) =>
    api.get<{ groups: RideGroup[]; chat_rooms: ChatRoom[]; user: User | null }>(
      "/rides/v1/groups",
      config,
    ),

  getGriddedRides: (gridSize?: number) =>
    api.get("/rides/grids", { params: { grid_size: gridSize } }),

  getUserProfile: (config?: any) => api.get("/auth/profile", config),

  deleteRideRequest: (request_id: number, config?: any) =>
    api.delete("/rides/v1/delete-request", {
      params: { request_id },
      ...config,
    }),

  // Group management
  getUserGroups: (perPage = 100) =>
    api.get<{ groups: UserGroup[] }>("/groups/fetch-groups", {
      params: { per_page: perPage },
    }),

  requestGroup: (data: {
    name: string;
    description?: string;
    requester_email: string;
  }) => api.post("/groups/request", data),

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
