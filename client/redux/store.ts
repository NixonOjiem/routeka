// src/store/store.ts
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import rideRequestReducer from "./slices/rideRequestSlice";
import rideGroupsReducer from "./slices/rideGroupsSlice"; // ✅ new slice
import chatReducer from "./slices/chatSlice"; // ✅ new slice
import profileSlice from "./slices/profileSlice";
export const store = configureStore({
  reducer: {
    auth: authReducer,
    rideRequest: rideRequestReducer,
    rideGroups: rideGroupsReducer, // ✅ integrated
    chat: chatReducer, // ✅ integrated
    profile: profileSlice,
  },
  devTools: import.meta.env.VITE_ENVIRONMENT !== "production",
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // ✅ keep strict checks but ignore known non-serializable fields
        ignoredActions: ["chat/addMessage"],
        ignoredActionPaths: ["meta.arg", "payload.timestamp"],
        ignoredPaths: ["chat.messages"],
      },
    }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
