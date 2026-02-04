import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { signin, signup, signout } from "@/services/api";

// Types
interface User {
  id?: number;
  name?: string;
  email?: string;
  phone?: string;
  email_verified_at?: any;
  user_name?: string;
}

interface AuthState {
  user: User | null;
  user_name?: string;
  token: string | null;
  guestId: string;
  isLoading: boolean;
  isError: boolean;
  message: string;
}

const getGuestId = (): string => {
  let guestId = localStorage.getItem("guest_id");
  if (!guestId) {
    guestId = "guest_" + Math.random().toString(36).substr(2, 9);
    localStorage.setItem("guest_id", guestId);
  }
  return guestId;
};

const savedUser = localStorage.getItem("user");
const user =
  savedUser && savedUser !== "undefined" ? JSON.parse(savedUser) : null;
const token = localStorage.getItem("token");

const initialState: AuthState = {
  user,
  token: token === "undefined" ? null : token,
  guestId: getGuestId(),
  isLoading: false,
  isError: false,
  message: "",
};

// Thunks
export const register = createAsyncThunk<any, any, { rejectValue: string }>(
  "auth/register",
  async (userData, thunkAPI) => {
    try {
      return await signup(userData);
    } catch (error: any) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const login = createAsyncThunk<any, any, { rejectValue: string }>(
  "auth/login",
  async (credentials, thunkAPI) => {
    try {
      return await signin(credentials);
    } catch (error: any) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const logout = createAsyncThunk("auth/logout", async (_, thunkAPI) => {
  try {
    return await signout();
  } catch (error: any) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

// Slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.message = "";
    },
    setGuestId: (state, action: PayloadAction<string>) => {
      state.guestId = action.payload;
      localStorage.setItem("guest_id", action.payload);
    },
    clearError: (state) => {
      state.isError = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.user && action.payload.token) {
          state.user = action.payload.user;
          state.token = action.payload.token;
          localStorage.setItem("user", JSON.stringify(action.payload.user));
          localStorage.setItem("token", action.payload.token);
        }
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      })
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.user && action.payload.token) {
          state.user = action.payload.user;
          state.token = action.payload.token;
          localStorage.setItem("user", JSON.stringify(action.payload.user));
          localStorage.setItem("token", action.payload.token);
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      })
      // Logout logic with loading states
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      })
      .addCase(logout.rejected, (state) => {
        state.isLoading = false;
        // Even if logout fails on backend, we usually clear local state
        state.user = null;
        state.token = null;
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      });
  },
});

export const { reset, setGuestId, clearError } = authSlice.actions;
export default authSlice.reducer;
