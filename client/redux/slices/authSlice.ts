import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as authService from "@/services/authService";

const user = JSON.parse(localStorage.getItem("user"));
const token = localStorage.getItem("token");

const initialState = {
  user: user ? user : null,
  token: token ? token : null,
  isLoading: false,
  isError: false,
  message: "",
};

export const register = createAsyncThunk<
  any, // The type of the successful response (action.payload)
  any, // The type of the arguments passed to the thunk (credentials)
  { rejectValue: string } // This defines the type of action.payload in the REJECTED case
>("auth/register", async (userData, thunkAPI) => {
  try {
    return await authService.signup(userData);
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

// UPDATED: Now passes the whole credentials object
export const login = createAsyncThunk<
  any, // The type of the successful response (action.payload)
  any, // The type of the arguments passed to the thunk (credentials)
  { rejectValue: string } // This defines the type of action.payload in the REJECTED case
>("auth/login", async (credentials, thunkAPI) => {
  try {
    return await authService.signin(credentials);
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

export const logout = createAsyncThunk("auth/logout", async () => {
  return await authService.signout();
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(login.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
      });
  },
});

export const { reset } = authSlice.actions;
export default authSlice.reducer;
