import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { rideRequestService } from "@/services/rideRequestService";

interface RideRequestState {
  loading: boolean;
  error: string | null;
  success: boolean;
  requests: any[];
}

const initialState: RideRequestState = {
  loading: false,
  error: null,
  success: false,
  requests: [],
};

export const submitRideRequest = createAsyncThunk(
  // "/rides/vl/request",
  "/rides/request",
  async (requestData: any, { rejectWithValue }) => {
    try {
      const response = await rideRequestService.submitRideRequest(requestData);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to submit ride request",
      );
    }
  },
);

export const fetchUserRideRequests = createAsyncThunk(
  "rideRequest/fetchUserRequests",
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await rideRequestService.getUserRideRequests(userId);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch ride requests",
      );
    }
  },
);

const rideRequestSlice = createSlice({
  name: "rideRequest",
  initialState,
  reducers: {
    clearRideRequestState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
    resetSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Submit Ride Request
      .addCase(submitRideRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(submitRideRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.requests.push(action.payload);
      })
      .addCase(submitRideRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.success = false;
      })
      // Fetch User Ride Requests
      .addCase(fetchUserRideRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserRideRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = action.payload;
      })
      .addCase(fetchUserRideRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearRideRequestState, resetSuccess } = rideRequestSlice.actions;
export default rideRequestSlice.reducer;
