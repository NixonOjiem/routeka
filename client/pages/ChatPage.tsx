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
  ClockIcon,
  ShieldCheckIcon,
  DotsVerticalIcon,
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
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages]);

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
      const response = await apiService.sendMessage(roomId!, textToSend, "text", config);
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
    return msg.is_current_user || String(msg.sender_id) === String(currentUserId);
  };

  if (isLoading)
    return (
      <div className="flex flex-col justify-center items-center h-[80vh] space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-slate-100 border-t-slate-600 rounded-full animate-spin"></div>
        </div>
        <p className="text-slate-400 font-medium animate-pulse">Syncing encrypted chat...</p>
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-120px)] flex flex-col bg-slate-50/50 rounded-3xl overflow-hidden border border-white shadow-2xl">
      {/* Refined Glass Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-100 p-4 flex items-center justify-between z-10">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/rides")}
            className="p-2.5 bg-slate-50 hover:bg-white hover:shadow-sm text-slate-600 rounded-xl transition-all"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-slate-800 tracking-tight">
                {roomInfo?.name || "Ride Group Chat"}
              </h1>
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest flex items-center">
              <ShieldCheckIcon className="h-3 w-3 mr-1 text-emerald-500" />
              {roomInfo?.member_count || 0} Members Active
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
           <div className="hidden md:flex flex-col items-end mr-2">
             <span className="text-[10px] font-bold text-slate-400 uppercase">Your Alias</span>
             <span className="text-xs font-bold text-slate-600">{senderName}</span>
           </div>
           <button className="p-2 text-slate-400 hover:text-slate-600">
             <DotsVerticalIcon className="h-5 w-5" />
           </button>
        </div>
      </div>

      {/* Messages Canvas */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-3 opacity-40">
            <div className="p-4 bg-white rounded-full shadow-inner text-4xl">💬</div>
            <p className="font-medium text-slate-500">The journey starts with "Hello"</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = isCurrentUserMessage(msg);
            return (
              <div
                key={msg.id || idx}
                className={`flex w-full animate-in fade-in slide-in-from-bottom-2 ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex flex-col space-y-1 ${isMe ? "items-end" : "items-start"} max-w-[75%]`}>
                  {!isMe && (
                    <span className="ml-2 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                      {msg.sender_name}
                    </span>
                  )}
                  <div
                    className={`relative px-4 py-3 shadow-sm ${
                      isMe
                        ? "bg-brand text-white rounded-2xl rounded-tr-none"
                        : "bg-white text-slate-700 rounded-2xl rounded-tl-none border border-slate-100"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{msg.message}</p>
                    <div className={`text-[9px] mt-1 opacity-50 flex items-center ${isMe ? "justify-end" : "justify-start"}`}>
                      <ClockIcon className="h-2.5 w-2.5 mr-1" />
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Floating Input Dock */}
      <div className="p-6 bg-transparent">
        <form 
          onSubmit={sendMessage} 
          className="bg-white p-2 rounded-2xl shadow-xl border border-slate-100 flex items-center space-x-2 focus-within:ring-2 focus-within:ring-slate-500/20 transition-all"
        >
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Share an update or say hi..."
            className="flex-1 outline-none bg-transparent border-none focus:ring-0 text-sm py-3 px-4 text-slate-700 placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="group flex items-center justify-center h-11 w-11 bg-brand hover:bg-slate-700 disabled:bg-slate-200 text-white rounded-xl transition-all shadow-lg shadow-slate-200 disabled:shadow-none"
          >
            <PaperAirplaneIcon className="h-5 w-5 rotate-45 group-hover:scale-110 transition-transform" />
          </button>
        </form>
        <p className="text-center text-[10px] text-slate-400 mt-3 font-medium uppercase tracking-widest">
          Messages are private to this ride group
        </p>
      </div>
    </div>
  );
};

export default ChatPage;