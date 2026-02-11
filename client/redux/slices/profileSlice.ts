import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  apiService,
  UpdateProfilePayload,
  updateUserProfile,
} from "@/services/api";
// ❌ REMOVED: import { useDispatch } ...
import { setUser } from "./authSlice";

interface ProfileData {
  id?: number;
  name: string;
  email: string;
  user_name?: string;
  email_verified_at?: string;
  avatarUrl?: string;
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
  ProfileData,
  void,
  { rejectValue: string }
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
  ProfileData,
  UpdateProfilePayload,
  { rejectValue: any }
>(
  "profile/updateProfile",
  // ✅ FIX: Destructure 'dispatch' from the thunkAPI object here
  async (formData, { rejectWithValue, dispatch }) => {
    try {
      const response = await updateUserProfile(formData);

      // ✅ FIX: Use the thunk's dispatch, not the hook
      dispatch(setUser(response.user));

      return response.user;
    } catch (err: any) {
      if (err.response && err.response.status === 422) {
        return rejectWithValue(err.response.data.errors);
      }
      return rejectWithValue(err.response?.data?.message || "Update failed");
    }
  },
);

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
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        updateProfile.fulfilled,
        (state, action: PayloadAction<ProfileData>) => {
          state.loading = false;
          state.data = action.payload;
        },
      )
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearProfile } = profileSlice.actions;
export default profileSlice.reducer;
