import Echo from "laravel-echo";
import Pusher from "pusher-js";

declare global {
  interface Window {
    Pusher: typeof Pusher;
  }
}

window.Pusher = Pusher;

export const echo = new Echo({
  broadcaster: "reverb", // Use 'reverb' if on Laravel Echo > 1.16, otherwise 'pusher'
  key: import.meta.env.VITE_REVERB_APP_KEY,
  wsHost: import.meta.env.VITE_REVERB_HOST,
  wsPort: Number(import.meta.env.VITE_REVERB_PORT),
  wssPort: Number(import.meta.env.VITE_REVERB_PORT), // Reverb needs wssPort even if non-secure
  forceTLS: import.meta.env.VITE_REVERB_SCHEME === "https",

  // CRITICAL SETTINGS FOR REVERB:
  encrypted: import.meta.env.VITE_REVERB_SCHEME === "https", // Should be false for localhost/http
  disableStats: true,
  cluster: "mt1", // Kept to satisfy Pusher-js validator
  enabledTransports: ["ws", "wss"], // Force WS to prevent HTTP polling fallbacks
});
