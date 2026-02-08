import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  signin,
  signup,
  signout,
  googleAuthentication,
  requestPasswordReset,
  confirmPasswordReset,
} from "@/services/api";

// Types
interface User {
  id?: number;
  name?: string;
  email?: string;
  phone?: string;
  email_verified_at?: any;
  user_name?: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  user_name?: string;
  token: string | null;
  guestId: string;
  isLoading: boolean;
  isError: boolean;
  message: string;
  isSuccess: boolean;
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
  isSuccess: false,
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
// google login thunk
export const googleLogin = createAsyncThunk(
  "auth/googleLogin",
  async (token: string, thunkAPI) => {
    try {
      return await googleAuthentication(token);
    } catch (error: any) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
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

export const forgotPassword = createAsyncThunk<
  any,
  string,
  { rejectValue: string }
>("auth/forgotPassword", async (email, thunkAPI) => {
  try {
    return await requestPasswordReset(email);
  } catch (error: any) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

export const resetNewPassword = createAsyncThunk<
  any,
  any,
  { rejectValue: string }
>("auth/resetNewPassword", async (data, thunkAPI) => {
  try {
    return await confirmPasswordReset(data);
  } catch (error: any) {
    const message = error.response?.data?.message || error.message;
    // If validation errors exist (like password mismatch), return those
    if (error.response?.data?.password) {
      return thunkAPI.rejectWithValue(error.response.data.password[0]);
    }
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

      // Forgot Password Cases
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = "";
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = action.payload.message; // "We have e-mailed your password reset link."
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      })

      // Reset Password Cases
      .addCase(resetNewPassword.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = "";
      })
      .addCase(resetNewPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = action.payload.message; // "Your password has been reset."
      })
      .addCase(resetNewPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      })

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
      })
      // Google Login
      .addCase(googleLogin.pending, (state) => {
        state.isLoading = true; // or whatever your loading state is named
        state.isError = false;
        state.message = "";
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload.user;
        state.message = "Logged in via Google successfully";
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
        state.user = null;
      });
  },
});

export const { reset, setGuestId, clearError } = authSlice.actions;
export default authSlice.reducer;
