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
  UserCircleIcon,
  ClockIcon,
} from "@heroicons/react/outline";

const ChatPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();

  // 1. Identity Logic
  const { user, guestId: reduxGuestId } = useSelector(
    (state: RootState) => state.auth,
  );

  // Persistence for Guest ID if not in Redux
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

  // Auto-scroll logic
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
      // Avoid duplicate if we already added it via the Send button (optimistic/sync)
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
      // 1. Prepare the config with the Guest ID header
      const config = {
        headers: { "X-Guest-ID": currentUserId },
      };

      // 2. Pass config as the THIRD argument (after message and type)
      const response = await apiService.sendMessage(
        roomId!,
        textToSend,
        "text",
        config,
      );
      const sentMessage = response.data.message;

      // 3. Update local state
      setMessages((prev) => {
        // Check if the message already exists (to prevent duplicates from Echo)
        if (prev.some((m) => m.id === sentMessage.id)) return prev;

        return [...prev, { ...sentMessage, is_current_user: true }];
      });

      inputRef.current?.focus();
    } catch (error) {
      toast.error("Failed to send message");
      setNewMessage(textToSend); // Restore text so user doesn't lose it
    }
  };

  const isCurrentUserMessage = (msg: ChatMessage) => {
    return (
      msg.is_current_user || String(msg.sender_id) === String(currentUserId)
    );
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto p-2 md:p-4">
      {/* Header */}
      <div className="bg-white rounded-t-lg shadow-md p-4 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/rides")}
            className="mr-4 p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-semibold">
              {roomInfo?.name || "Chat Room"}
            </h1>
            <p className="text-xs text-gray-500">
              {senderName} • {roomInfo?.member_count || 0} members
            </p>
          </div>
        </div>
        <div className="hidden md:block text-sm text-gray-400">
          <ClockIcon className="h-4 w-4 inline mr-1" /> Real-time
        </div>
      </div>

      {/* Messages Window */}
      <div className="bg-white shadow-md h-125 flex flex-col border-t">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-400">
              No messages yet. Say hi!
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isMe = isCurrentUserMessage(msg);
              return (
                <div
                  key={msg.id || idx}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${isMe ? "bg-brand text-white rounded-br-none" : "bg-gray-100 text-gray-900 rounded-bl-none"}`}
                  >
                    <div className="flex items-baseline space-x-2 mb-1">
                      <span
                        className={`text-[10px] font-bold uppercase ${isMe ? "text-indigo-200" : "text-gray-500"}`}
                      >
                        {msg.sender_name} {isMe && "(You)"}
                      </span>
                    </div>
                    <p className="text-sm">{msg.message}</p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={sendMessage} className="border-t p-4 bg-gray-50">
          <div className="flex space-x-2">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand outline-none"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="bg-brand hover:bg-[#546269] disabled:bg-gray-300 text-white px-5 rounded-lg transition-colors"
            >
              <PaperAirplaneIcon className="h-5 w-5 rotate-90" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;
