import Echo from "laravel-echo";
import Pusher from "pusher-js";

declare global {
  interface Window {
    Pusher: typeof Pusher;
  }
}

window.Pusher = Pusher;

export const echo = new Echo({
  broadcaster: "pusher", // Echo still uses Pusher protocol
  key: import.meta.env.VITE_REVERB_APP_KEY,
  wsHost: import.meta.env.VITE_REVERB_HOST || "127.0.0.1",
  wsPort: Number(import.meta.env.VITE_REVERB_PORT) || 8080,
  forceTLS: import.meta.env.VITE_REVERB_SCHEME === "https",
  disableStats: true,
});
