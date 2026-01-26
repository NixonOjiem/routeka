import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import rideRequestReducer from "./slices/rideRequestSlice";
export const store = configureStore({
  reducer: {
    auth: authReducer,
    rideRequest: rideRequestReducer,
  },
  devTools: import.meta.env.VITE_ENVIRONMENT !== "production",

  // storing non-JSON data (like File objects or Dates)
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: true,
    }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
