// src/store/slices/chatSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { apiService, ChatMessage, ChatRoom } from "../../services/api";
import { socketService } from "../../services/socket";

interface ChatState {
  activeRoom: {
    id: string;
    name: string;
    member_count: number;
  } | null;
  messages: ChatMessage[];
  rooms: ChatRoom[];
  isLoading: boolean;
  error: string | null;
  senderName: string;
}

const initialState: ChatState = {
  activeRoom: null,
  messages: [],
  rooms: [],
  isLoading: false,
  error: null,
  senderName: "",
};

export const fetchChatRooms = createAsyncThunk(
  "chat/fetchRooms",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getChatRooms();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load chat rooms",
      );
    }
  },
);

export const joinChatRoom = createAsyncThunk(
  "chat/joinRoom",
  async (roomId: string, { rejectWithValue }) => {
    try {
      const response = await apiService.joinChatRoom(roomId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to join chat room",
      );
    }
  },
);

export const fetchChatMessages = createAsyncThunk(
  "chat/fetchMessages",
  async (roomId: string, { rejectWithValue }) => {
    try {
      const response = await apiService.getChatMessages(roomId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load messages",
      );
    }
  },
);

export const sendChatMessage = createAsyncThunk(
  "chat/sendMessage",
  async (
    {
      roomId,
      message,
      type = "text",
    }: { roomId: string; message: string; type?: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await apiService.sendMessage(roomId, message, type);
      socketService.sendMessage(message, type);
      return response.data.message;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to send message",
      );
    }
  },
);

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setActiveRoom: (state, action: PayloadAction<ChatState["activeRoom"]>) => {
      state.activeRoom = action.payload;
    },
    setSenderName: (state, action: PayloadAction<string>) => {
      state.senderName = action.payload;
    },
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.messages.push(action.payload);
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    clearError: (state) => {
      state.error = null;
    },
    userJoined: (state, action: PayloadAction<{ name: string }>) => {
      // Handle user joined notification if needed
    },
    userLeft: (state, action: PayloadAction<{ name: string }>) => {
      // Handle user left notification if needed
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch chat rooms
      .addCase(fetchChatRooms.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchChatRooms.fulfilled, (state, action) => {
        state.isLoading = false;
        state.rooms = action.payload.rooms;
      })
      .addCase(fetchChatRooms.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Join chat room
      .addCase(joinChatRoom.fulfilled, (state, action) => {
        state.activeRoom = action.payload.room;
      })
      // Fetch chat messages
      .addCase(fetchChatMessages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchChatMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages = action.payload.messages;
        state.senderName = action.payload.sender_name;
      })
      .addCase(fetchChatMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Send message
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        state.messages.push(action.payload);
      });
  },
});

export const {
  setActiveRoom,
  setSenderName,
  addMessage,
  clearMessages,
  clearError,
  userJoined,
  userLeft,
} = chatSlice.actions;

export default chatSlice.reducer;
