import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { apiService, ChatMessage } from "../services/api";
import { socketService } from "../services/socket";
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
  const { user, guestId } = useSelector((state: RootState) => state.auth);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [roomInfo, setRoomInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [senderName, setSenderName] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Ref to track senderName for socket callbacks
  const senderNameRef = useRef("");
  useEffect(() => {
    senderNameRef.current = senderName;
  }, [senderName]);

  useEffect(() => {
    if (!roomId) {
      navigate("/rides");
      return;
    }

    loadChatRoom();

    // Setup socket connection
    socketService.connect(roomId, guestId);
    socketService.on("message_received", handleNewMessage);
    socketService.on("user_joined", handleUserJoined);
    socketService.on("user_left", handleUserLeft);
    return () => {
      socketService.disconnect();
      socketService.off("message_received", handleNewMessage);
      socketService.off("user_joined", handleUserJoined);
      socketService.off("user_left", handleUserLeft);
    };
  }, [roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatRoom = async () => {
    try {
      setIsLoading(true);

      // Join the room
      await apiService.joinChatRoom(roomId!);

      // Load messages
      const response = await apiService.getChatMessages(roomId!);
      setMessages(response.data.messages);
      setRoomInfo(response.data.room);
      setSenderName(response.data.sender_name);

      toast.success("Joined chat room!");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to join chat room");
      navigate("/rides");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewMessage = (message: ChatMessage) => {
    // Check if this message is from current user
    const isFromCurrentUser = message.sender_name === senderNameRef.current;

    // Add is_current_user flag to the message
    const messageWithFlag = {
      ...message,
      is_current_user: isFromCurrentUser,
    };

    setMessages((prev) => [...prev, messageWithFlag]);
  };

  const handleUserJoined = (userData: any) => {
    toast.info(`${userData.name} joined the chat`);
  };

  const handleUserLeft = (userData: any) => {
    toast.info(`${userData.name} left the chat`);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim()) return;

    try {
      const response = await apiService.sendMessage(roomId!, newMessage);

      const sentMessage = response.data.message;
      const messageWithFlag = {
        ...sentMessage,
        is_current_user: true,
      };
      setMessages((prev) => [...prev, messageWithFlag]);

      setNewMessage("");
      inputRef.current?.focus();
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }, 100);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Helper function to determine if message is from current user
  const isCurrentUserMessage = (message: ChatMessage) => {
    // First check if message has is_current_user flag
    if ("is_current_user" in message) {
      return message.is_current_user;
    }
    // Fallback to comparing sender_name
    return message.sender_name === senderName;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Chat Header */}
      <div className="bg-white rounded-t-lg shadow-md p-4 mb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate("/rides")}
              className="mr-4 p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {roomInfo?.name}
              </h1>
              <div className="flex items-center text-sm text-gray-500">
                <UserCircleIcon className="h-4 w-4 mr-1" />
                <span>{senderName}</span>
                <span className="mx-2">•</span>
                <span>{roomInfo?.member_count} members</span>
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-500">
            <ClockIcon className="h-4 w-4 inline mr-1" />
            Real-time chat
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="bg-white rounded-lg shadow-md h-[500px] flex flex-col">
        <div className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 h-full flex items-center justify-center">
              <div>
                <div className="text-4xl mb-4">👋</div>
                <p className="text-lg font-medium">No messages yet</p>
                <p className="text-sm">Be the first to say hello!</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => {
                const isCurrentUser = isCurrentUserMessage(message);

                return (
                  <div
                    key={message.id}
                    className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md rounded-lg p-3 ${
                        isCurrentUser
                          ? "bg-indigo-600 text-white rounded-br-none"
                          : "bg-gray-100 text-gray-900 rounded-bl-none"
                      }`}
                    >
                      <div className="flex items-center mb-1">
                        <span
                          className={`text-xs font-medium ${
                            isCurrentUser ? "text-indigo-200" : "text-gray-500"
                          }`}
                        >
                          {message.sender_name}
                          {message.is_guest && " (Guest)"}
                          {isCurrentUser && " (You)"}
                        </span>
                        <span
                          className={`text-xs ml-2 ${
                            isCurrentUser ? "text-indigo-300" : "text-gray-400"
                          }`}
                        >
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm">{message.message}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Message Input */}
        <form onSubmit={sendMessage} className="border-t p-4">
          <div className="flex space-x-2">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              autoFocus
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg flex items-center"
            >
              <PaperAirplaneIcon className="h-5 w-5 rotate-90" />
              <span className="ml-2">Send</span>
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Press Enter to send • Chat is saved for all room members
          </p>
        </form>
      </div>

      {/* Debug Info (Optional - remove in production) */}
      <div className="mt-2 text-xs text-gray-500">
        <p>
          Debug Info: Sender Name: "{senderName}" | Guest ID: {guestId}
        </p>
      </div>

      {/* Chat Info */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-medium text-gray-900 mb-2">Chat Rules</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Your messages appear on the right (blue)</li>
            <li>• Other users' messages appear on the left (gray)</li>
            <li>• Be respectful to other riders</li>
            <li>• Share pickup/dropoff details clearly</li>
          </ul>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-medium text-gray-900 mb-2">Your Status</h3>
          <div className="text-sm text-gray-600">
            <p>
              <strong>Display Name:</strong> {senderName}
              {!user && " (Guest)"}
            </p>
            <p className="mt-1">
              <strong>Messages from you will appear on the right</strong>
            </p>
            {!user && (
              <button
                onClick={() => navigate("/register")}
                className="mt-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
              >
                Register to keep your chat history →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
