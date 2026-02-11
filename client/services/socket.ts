import Echo from "laravel-echo";
import Pusher from "pusher-js";

declare global {
  interface Window {
    Pusher: typeof Pusher;
  }
}
window.Pusher = Pusher;

class SocketService {
  private echo: Echo<any> | null = null;

  connect(roomId: string, guestId?: string) {
    if (this.echo) {
      this.disconnect();
    }

    this.echo = new Echo({
      broadcaster: "pusher", // Echo still uses Pusher protocol
      key: import.meta.env.VITE_REVERB_APP_KEY,
      wsHost: import.meta.env.VITE_REVERB_HOST || "127.0.0.1",
      wsPort: Number(import.meta.env.VITE_REVERB_PORT) || 8080,
      forceTLS: import.meta.env.VITE_REVERB_SCHEME === "https",
      disableStats: true,
      cluster: "mt1",
      auth: {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          "X-Guest-ID": guestId || "",
        },
      },
    });

    // Join presence channel
    this.echo
      .join(`chat.${roomId}`)
      .here((users: any[]) => {
        console.log("Users currently in room:", users);
      })
      .joining((user: any) => {
        this.emit("user_joined", user);
      })
      .leaving((user: any) => {
        this.emit("user_left", user);
      })
      .listen(".message.sent", (message: any) => {
        this.emit("message_received", message);
      });
  }

  disconnect() {
    if (this.echo) {
      this.echo.disconnect();
      this.echo = null;
    }
  }

  sendMessage(roomId: string, message: string, type: string = "text") {
    // With Laravel broadcasting, you usually POST to your API endpoint
    // Example: /chat/rooms/{roomId}/messages
    fetch(`/api/chat/rooms/${roomId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        "X-Guest-ID": localStorage.getItem("guest_id") || "",
      },
      body: JSON.stringify({ message, type }),
    }).catch((err) => console.error("Failed to send message:", err));
  }

  private listeners: Map<string, Function[]> = new Map();

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
      callbacks.forEach((cb) => cb(data));
    }
  }
}

export const socketService = new SocketService();
