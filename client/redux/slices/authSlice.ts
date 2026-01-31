import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { signin, signup, signout } from "@/services/api"; // ✅ use new api.ts directly

// Types
interface User {
  id?: number;
  name?: string;
  email?: string;
  phone?: string;
  email_verified_at?: any;
  // add other fields if your API returns them
}

interface AuthState {
  user: User | null;
  token: string | null;
  guestId: string;
  isLoading: boolean;
  isError: boolean;
  message: string;
}

// Guest ID helper
const getGuestId = (): string => {
  let guestId = localStorage.getItem("guest_id");
  if (!guestId) {
    guestId = "guest_" + Math.random().toString(36).substr(2, 9);
    localStorage.setItem("guest_id", guestId);
  }
  return guestId;
};

// Initial state - Added a safety check for "undefined" string
const savedUser = localStorage.getItem("user");
const user =
  savedUser && savedUser !== "undefined" ? JSON.parse(savedUser) : null;
const token = localStorage.getItem("token");

const initialState: AuthState = {
  user,
  token: token === "undefined" ? null : token, // Safety for token too
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
      return await signup(userData); // ✅ now using api.ts
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
      return await signin(credentials); // ✅ now using api.ts
    } catch (error: any) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const logout = createAsyncThunk("auth/logout", async () => {
  return await signout(); // ✅ now using api.ts
});

// Slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // ✅ keep reset for compatibility
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
        // Only save if the data actually exists
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
        // Only save if the data actually exists
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
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      });
  },
});

export const { reset, setGuestId, clearError } = authSlice.actions;
export default authSlice.reducer;
