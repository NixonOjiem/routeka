// src/store/slices/rideGroupsSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { apiService, RideGroup, ChatRoom } from "@/services/api";

interface RideGroupsState {
  groups: RideGroup[];
  chatRooms: ChatRoom[];
  isLoading: boolean;
  error: string | null;
  filters: {
    minMembers: number;
    hasChat: string;
    searchQuery: string;
  };
}

const initialState: RideGroupsState = {
  groups: [],
  chatRooms: [],
  isLoading: false,
  error: null,
  filters: {
    minMembers: 0,
    hasChat: "all",
    searchQuery: "",
  },
};

export const fetchRideGroups = createAsyncThunk(
  "rideGroups/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getGroupedRides();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load ride groups",
      );
    }
  },
);

export const fetchGriddedRides = createAsyncThunk(
  "rideGroups/fetchGridded",
  async (gridSize: number | undefined, { rejectWithValue }) => {
    try {
      const response = await apiService.getGriddedRides(gridSize);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load gridded rides",
      );
    }
  },
);

export const removeRideRequest = createAsyncThunk(
  "rideGroups/deleteRequest",
  async (request_id: number, { rejectWithValue }) => {
    try {
      const response = await apiService.deleteRideRequest(request_id);
      return response.data;
    } catch (error: any) {
      // Capture the error here
      return rejectWithValue(
        error.response?.data?.message || "Something went wrong",
      );
    }
  },
);

const rideGroupsSlice = createSlice({
  name: "rideGroups",
  initialState,
  reducers: {
    setFilters: (
      state,
      action: PayloadAction<Partial<RideGroupsState["filters"]>>,
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch groups
      .addCase(fetchRideGroups.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchRideGroups.fulfilled, (state, action) => {
        state.isLoading = false;
        state.groups = action.payload.groups;
        state.chatRooms = action.payload.chat_rooms;
      })
      .addCase(fetchRideGroups.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Delete Request
      .addCase(removeRideRequest.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(removeRideRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        state.groups = state.groups
          .map((group) => {
            const newMembers = group.members.filter(
              (m) => m.id !== action.meta.arg,
            );
            return {
              ...group,
              members: newMembers,
              member_count: newMembers.length, // Keep the count in sync
            };
          })
          .filter((group) => group.members.length > 0); // Remove group if now empty
      })
      .addCase(removeRideRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setFilters, clearFilters, clearError } = rideGroupsSlice.actions;
export default rideGroupsSlice.reducer;

// Selectors
export const selectFilteredGroups = (state: {
  rideGroups: RideGroupsState;
}) => {
  const { groups, filters } = state.rideGroups;
  let filtered = [...groups];

  if (filters.minMembers > 0) {
    filtered = filtered.filter(
      (group) => group.member_count >= filters.minMembers,
    );
  }

  if (filters.hasChat === "hasChat") {
    filtered = filtered.filter((group) => group.chat_room_id !== null);
  } else if (filters.hasChat === "noChat") {
    filtered = filtered.filter((group) => group.chat_room_id === null);
  }

  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    filtered = filtered.filter(
      (group) =>
        group.pickup_grid.name.toLowerCase().includes(query) ||
        group.dropoff_grid.name.toLowerCase().includes(query) ||
        group.members.some((member) =>
          member.user_name.toLowerCase().includes(query),
        ),
    );
  }

  return filtered;
};

export const selectGroupStats = (state: { rideGroups: RideGroupsState }) => {
  const { groups, chatRooms } = state.rideGroups;
  return {
    totalGroups: groups.length,
    totalRiders: groups.reduce((acc, group) => acc + group.member_count, 0),
    activeChats: chatRooms.length,
    avgGroupSize: Math.round(
      groups.reduce((acc, g) => acc + g.member_count, 0) / (groups.length || 1),
    ),
  };
};
