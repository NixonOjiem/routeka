// profileSlice.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiService } from "@/services/api";

export const fetchUserProfile = createAsyncThunk(
  "profile/fetchUserProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getUserProfile();
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Error fetching profile");
    }
  },
);

const profileSlice = createSlice({
  name: "profile",
  initialState: { data: null, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default profileSlice.reducer;
