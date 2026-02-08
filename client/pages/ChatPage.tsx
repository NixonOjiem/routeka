// src/pages/ChatPage.tsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { echo } from "@/services/echo";
import { apiService, ChatMessage } from "../services/api";
import { toast } from "react-toastify";
import {
  ArrowLeftIcon,
  PaperAirplaneIcon,
  ShieldCheckIcon,
  DotsVerticalIcon,
  MapIcon,
  LocationMarkerIcon,
  ClockIcon,
} from "@heroicons/react/outline";

const ChatPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();

  // 1. Identity Logic
  const { user, guestId: reduxGuestId } = useSelector(
    (state: RootState) => state.auth,
  );

  const [localGuestId] = useState(() => {
    const stored = localStorage.getItem("chat_guest_id");
    if (stored) return stored;
    const newId = Math.random().toString(36).substring(2, 15);
    localStorage.setItem("chat_guest_id", newId);
    return newId;
  });

  const currentUserId = user?.id || reduxGuestId || localGuestId;

  // 2. State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [roomInfo, setRoomInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [senderName, setSenderName] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 3. WebSocket Connection
  useEffect(() => {
    if (!roomId) {
      navigate("/rides");
      return;
    }

    loadChatRoom();

    const channel = echo.channel(`chat.${roomId}`);

    channel
      .listen(".message.sent", (event: ChatMessage) => {
        handleIncomingMessage(event);
      })
      .listen(".user.joined", (data: any) => toast.info(`${data.name} joined`))
      .listen(".user.left", (data: any) => toast.info(`${data.name} left`));

    return () => {
      channel.stopListening(".message.sent");
      echo.leave(`chat.${roomId}`);
    };
  }, [roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  };

  const loadChatRoom = async () => {
    try {
      setIsLoading(true);
      const config = { headers: { "X-Guest-ID": currentUserId } };
      await apiService.joinChatRoom(roomId!, config);
      const response = await apiService.getChatMessages(roomId!, config);

      setMessages(response.data.messages);
      setRoomInfo(response.data.room);
      setSenderName(response.data.sender_name);
    } catch (error: any) {
      toast.error("Failed to load chat");
      navigate("/rides");
    } finally {
      setIsLoading(false);
    }
  };

  const handleIncomingMessage = (incoming: ChatMessage) => {
    setMessages((prev) => {
      if (prev.find((m) => m.id === incoming.id)) return prev;
      const messageWithFlag = {
        ...incoming,
        is_current_user: String(incoming.sender_id) === String(currentUserId),
      };
      return [...prev, messageWithFlag];
    });
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const textToSend = newMessage;
    setNewMessage("");

    try {
      const config = { headers: { "X-Guest-ID": currentUserId } };
      // Optimistic UI update could go here
      const response = await apiService.sendMessage(
        roomId!,
        textToSend,
        "text",
        config,
      );
      const sentMessage = response.data.message;

      setMessages((prev) => {
        if (prev.some((m) => m.id === sentMessage.id)) return prev;
        return [...prev, { ...sentMessage, is_current_user: true }];
      });

      inputRef.current?.focus();
    } catch (error) {
      toast.error("Failed to send message");
      setNewMessage(textToSend);
    }
  };

  const isCurrentUserMessage = (msg: ChatMessage) => {
    return (
      msg.is_current_user || String(msg.sender_id) === String(currentUserId)
    );
  };

  // Helper to format time
  const formatTime = (dateString?: string) => {
    const date = dateString ? new Date(dateString) : new Date();
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (isLoading)
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-slate-50 space-y-4">
        <div className="relative">
          {/* Map pin loading animation */}
          <LocationMarkerIcon className="h-16 w-16 text-slate-300 animate-bounce" />
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-2 bg-slate-200 rounded-full animate-pulse"></div>
        </div>
        <p className="text-slate-500 font-medium animate-pulse tracking-wide text-sm">
          Locating secure channel...
        </p>
      </div>
    );

  return (
    // Outer Container: Handles the responsive layout (Full screen mobile, centered card desktop)
    <div className="relative w-full h-[100dvh] bg-slate-200 flex items-center justify-center overflow-hidden">
      {/* GLOBAL BACKGROUND - Map Theme */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
        {/* Using an SVG pattern that looks like a Topographic Map / Road network */}
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="map-pattern"
              x="0"
              y="0"
              width="100"
              height="100"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M100 0L0 100M-20 20L20 -20M80 120L120 80"
                stroke="#94a3b8"
                strokeWidth="1"
                opacity="0.2"
              />
              <path
                d="M0 50h100M50 0v100"
                stroke="#cbd5e1"
                strokeWidth="0.5"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="20"
                stroke="#cbd5e1"
                strokeWidth="0.5"
                fill="none"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#map-pattern)" />
        </svg>
      </div>

      {/* Main Chat Interface - Mobile: Full Width | Desktop: Mobile-sized Card */}
      <div className="relative z-10 w-full h-full md:h-[85vh] md:max-w-md lg:max-w-lg bg-slate-50 md:rounded-[2.5rem] md:shadow-2xl md:border md:border-white/50 flex flex-col overflow-hidden">
        {/* 1. Glass Header */}
        <div className="shrink-0 bg-white/80 backdrop-blur-md border-b border-slate-200/60 p-4 flex items-center justify-between shadow-sm z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/rides")}
              className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
            >
              <ArrowLeftIcon className="h-6 w-6" />
            </button>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-800 line-clamp-1">
                  {roomInfo?.name || "Ride Group"}
                </h1>
                {/* Status Indicator */}
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
              </div>

              <div className="flex items-center text-xs text-slate-500 font-medium">
                <ShieldCheckIcon className="h-3.5 w-3.5 mr-1 text-emerald-600" />
                <span>{roomInfo?.member_count || 1} on this trip</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors hidden sm:block">
              <MapIcon className="h-6 w-6" />
            </button>
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
              <DotsVerticalIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* 2. Messages Canvas */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-100/50 scroll-smooth">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-60">
              <div className="h-24 w-24 bg-slate-200 rounded-full flex items-center justify-center mb-2">
                <MapIcon className="h-10 w-10 text-slate-400" />
              </div>
              <div className="text-center px-10">
                <p className="font-semibold text-slate-600">
                  Route Established
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  Coordinate pickups and drop-offs here. Messages are encrypted.
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isMe = isCurrentUserMessage(msg);
              // Check if previous message was from same sender to group visually
              const isSequence =
                idx > 0 && messages[idx - 1].sender_id === msg.sender_id;

              return (
                <div
                  key={msg.id || idx}
                  className={`flex w-full ${isMe ? "justify-end" : "justify-start"} ${isSequence ? "mt-1" : "mt-4"}`}
                >
                  <div
                    className={`flex flex-col max-w-[80%] ${isMe ? "items-end" : "items-start"}`}
                  >
                    {/* Sender Name (Only show if not me and not a sequence) */}
                    {!isMe && !isSequence && (
                      <span className="ml-3 mb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {msg.sender_name}
                      </span>
                    )}

                    {/* Bubble */}
                    <div
                      className={`relative px-4 py-2.5 shadow-sm text-sm ${
                        isMe
                          ? "bg-slate-800 text-white rounded-2xl rounded-tr-sm"
                          : "bg-white text-slate-700 rounded-2xl rounded-tl-sm border border-slate-100"
                      }`}
                    >
                      <p className="leading-relaxed whitespace-pre-wrap">
                        {msg.message}
                      </p>

                      {/* Metadata inside bubble */}
                      <div
                        className={`text-[9px] mt-1 opacity-50 flex items-center ${isMe ? "justify-end" : "justify-start"}`}
                      >
                        <ClockIcon className="h-2.5 w-2.5 mr-1" />
                        {new Date().toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} className="h-2" />
        </div>

        {/* 3. Floating Input Dock */}
        <div className="shrink-0 p-3 bg-white/90 backdrop-blur-md border-t border-slate-200/60 z-20 pb-safe">
          <form
            onSubmit={sendMessage}
            className="flex items-end gap-2 max-w-full"
          >
            <div className="flex-1 bg-slate-100 border border-slate-200 rounded-[1.5rem] px-4 py-2 focus-within:ring-2 focus-within:ring-slate-400/50 focus-within:bg-white transition-all flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="w-full bg-transparent border-none outline-none text-sm text-slate-800 placeholder:text-slate-400 max-h-24 py-1"
              />
            </div>

            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="h-11 w-11 shrink-0 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center shadow-lg shadow-slate-300/50 transition-all active:scale-95"
            >
              <PaperAirplaneIcon className="h-5 w-5 -ml-0.5 rotate-90 transform" />
            </button>
          </form>
          <div className="text-center mt-2">
            <span className="text-[10px] text-slate-400 font-medium bg-slate-100 px-2 py-0.5 rounded-full">
              Secured by RideShare Guard™
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
