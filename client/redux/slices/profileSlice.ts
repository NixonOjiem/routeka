// profileSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  apiService,
  UpdateProfilePayload,
  updateUserProfile,
} from "@/services/api";

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
  error: string | Record<string, any> | null;
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

export const updateProfile = createAsyncThunk<
  ProfileData, // Return type (The User object)
  UpdateProfilePayload, // Argument type (The form data)
  { rejectValue: any } // Reject type (Validation errors or message)
>("profile/updateProfile", async (formData, { rejectWithValue }) => {
  try {
    const response = await updateUserProfile(formData);
    // The Laravel controller returns: { message: '...', user: {...} }
    // We return ONLY the user object so Redux can save it
    return response.user;
  } catch (err: any) {
    // Handle 422 Validation Errors specifically
    if (err.response && err.response.status === 422) {
      return rejectWithValue(err.response.data.errors);
    }
    return rejectWithValue(err.response?.data?.message || "Update failed");
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
      })
      // --- ✅ Update Handlers ---
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        updateProfile.fulfilled,
        (state, action: PayloadAction<ProfileData>) => {
          state.loading = false;
          // ✅ IMMEDIATE UPDATE:
          // We replace the current local data with the fresh data from the server.
          // Since the server returned the full user object, this ensures UI sync.
          state.data = action.payload;
        },
      )
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload; // This might contain validation errors
      });
  },
});

export const { clearProfile } = profileSlice.actions;
export default profileSlice.reducer;
