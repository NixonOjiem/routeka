import { io, Socket } from "socket.io-client";

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();

  connect(roomId: string, guestId?: string) {
    const SOCKET_URL =
      process.env.REACT_APP_SOCKET_URL || "http://localhost:8000";

    this.socket = io(SOCKET_URL, {
      query: {
        roomId,
        guestId,
      },
    });

    this.socket.on("connect", () => {
      console.log("Connected to chat server");
      this.socket?.emit("join_room", roomId);
    });

    this.socket.on("new_message", (message: any) => {
      this.emit("message_received", message);
    });

    this.socket.on("user_joined", (user: any) => {
      this.emit("user_joined", user);
    });

    this.socket.on("user_left", (user: any) => {
      this.emit("user_left", user);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  sendMessage(message: string, type: string = "text") {
    if (this.socket) {
      this.socket.emit("send_message", { message, type });
    }
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }

  off(event: string, callback: Function) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => callback(data));
    }
  }
}

export const socketService = new SocketService();
