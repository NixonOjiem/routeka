// profileSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { apiService } from "@/services/api";

interface ProfileData {
  id?: number;
  name: string;
  email: string;
  user_name?: string;
  email_verified_at?: string;
  avatarUrl?: string;
  // Add other fields from your API response here
}

interface ProfileState {
  data: ProfileData | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProfileState = {
  data: null,
  loading: false,
  error: null,
};

export const fetchUserProfile = createAsyncThunk<
  ProfileData, // Success type
  void, // Argument type (none in this case)
  { rejectValue: string } // Reject type
>("profile/fetchUserProfile", async (_, { rejectWithValue }) => {
  try {
    const response = await apiService.getUserProfile();
    return response.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Error fetching profile",
    );
  }
});

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearProfile: (state) => {
      state.data = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchUserProfile.fulfilled,
        (state, action: PayloadAction<ProfileData>) => {
          state.loading = false;
          state.data = action.payload;
        },
      )
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearProfile } = profileSlice.actions;
export default profileSlice.reducer;
