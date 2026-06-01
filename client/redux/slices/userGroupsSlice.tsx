import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiService, UserGroup } from "@/services/api";

interface UserGroupsState {
  groups: UserGroup[];
  isLoading: boolean;
  error: string | null;
}

const initialState: UserGroupsState = {
  groups: [],
  isLoading: false,
  error: null,
};

export const fetchUserGroups = createAsyncThunk(
  "userGroups/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getUserGroups();
      // response.data.groups is now PaginatedGroups
      return response.data.groups.data; // this is UserGroup[]
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load your groups",
      );
    }
  },
);

export const createGroupRequest = createAsyncThunk(
  "userGroups/create",
  async (
    data: { name: string; description?: string; requester_email: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await apiService.requestGroup(data);
      return response.data; // contains group and message
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to submit group request",
      );
    }
  },
);

const userGroupsSlice = createSlice({
  name: "userGroups",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch groups
      .addCase(fetchUserGroups.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserGroups.fulfilled, (state, action) => {
        state.isLoading = false;
        state.groups = action.payload;
      })
      .addCase(fetchUserGroups.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create group request
      .addCase(createGroupRequest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createGroupRequest.fulfilled, (state) => {
        state.isLoading = false;
        // We'll refetch the list from the component after creation
      })
      .addCase(createGroupRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = userGroupsSlice.actions;
export default userGroupsSlice.reducer;
