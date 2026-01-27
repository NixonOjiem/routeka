// // src/pages/ChatPage.tsx
// import React, { useState, useEffect, useRef } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { useSelector, useDispatch } from "react-redux";
// import { RootState, AppDispatch } from "@/redux/store";
// import {
//   fetchChatMessages,
//   sendChatMessage,
//   joinChatRoom,
//   addMessage,
// } from "@/redux/slices/chatSlice";
// import { socketService } from "../services/socket";
// import { toast } from "react-toastify";
// import {
//   ArrowLeftIcon,
//   PaperAirplaneIcon,
//   UserCircleIcon,
//   ClockIcon,
// } from "@heroicons/react/outline";

// const ChatPage: React.FC = () => {
//   const { roomId } = useParams<{ roomId: string }>();
//   const navigate = useNavigate();
//   const dispatch = useDispatch<AppDispatch>();

//   const { user, guestId } = useSelector((state: RootState) => state.auth);
//   const { activeRoom, messages, isLoading, senderName } = useSelector(
//     (state: RootState) => state.chat,
//   );

//   const [newMessage, setNewMessage] = useState("");
//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const inputRef = useRef<HTMLInputElement>(null);

//   useEffect(() => {
//     if (!roomId) {
//       navigate("/");
//       return;
//     }

//     loadChatRoom();

//     // Setup socket connection
//     socketService.connect(roomId, guestId);
//     socketService.on("message_received", handleNewMessage);

//     return () => {
//       socketService.disconnect();
//       socketService.off("message_received", handleNewMessage);
//     };
//   }, [roomId]);

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   const loadChatRoom = async () => {
//     try {
//       await dispatch(joinChatRoom(roomId!)).unwrap();
//       await dispatch(fetchChatMessages(roomId!)).unwrap();
//       toast.success("Joined chat room!");
//     } catch (error: any) {
//       toast.error(error || "Failed to join chat room");
//       navigate("/");
//     }
//   };

//   const handleNewMessage = (message: any) => {
//     dispatch(addMessage(message));
//   };

//   const sendMessage = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!newMessage.trim()) return;

//     try {
//       await dispatch(
//         sendChatMessage({
//           roomId: roomId!,
//           message: newMessage,
//         }),
//       ).unwrap();

//       setNewMessage("");
//       inputRef.current?.focus();
//     } catch (error) {
//       toast.error("Failed to send message");
//     }
//   };

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   const formatTime = (timestamp: string) => {
//     const date = new Date(timestamp);
//     return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
//   };

//   if (isLoading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-4xl mx-auto">
//       {/* Chat Header */}
//       <div className="bg-white rounded-t-lg shadow-md p-4 mb-2">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center">
//             <button
//               onClick={() => navigate("/")}
//               className="mr-4 p-2 hover:bg-gray-100 rounded-full"
//             >
//               <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
//             </button>
//             <div>
//               <h1 className="text-xl font-semibold text-gray-900">
//                 {activeRoom?.name}
//               </h1>
//               <div className="flex items-center text-sm text-gray-500">
//                 <UserCircleIcon className="h-4 w-4 mr-1" />
//                 <span>{senderName}</span>
//                 <span className="mx-2">•</span>
//                 <span>{activeRoom?.member_count} members</span>
//               </div>
//             </div>
//           </div>

//           <div className="text-sm text-gray-500">
//             <ClockIcon className="h-4 w-4 inline mr-1" />
//             Real-time chat
//           </div>
//         </div>
//       </div>

//       {/* Chat Messages */}
//       <div className="bg-white rounded-lg shadow-md h-[500px] flex flex-col">
//         <div className="flex-1 overflow-y-auto p-4">
//           {messages.length === 0 ? (
//             <div className="text-center text-gray-500 h-full flex items-center justify-center">
//               <div>
//                 <div className="text-4xl mb-4">👋</div>
//                 <p className="text-lg font-medium">No messages yet</p>
//                 <p className="text-sm">Be the first to say hello!</p>
//               </div>
//             </div>
//           ) : (
//             <div className="space-y-4">
//               {messages.map((message) => (
//                 <div
//                   key={message.id}
//                   className={`flex ${message.sender_name === senderName ? "justify-end" : "justify-start"}`}
//                 >
//                   <div
//                     className={`max-w-xs lg:max-w-md rounded-lg p-3 ${
//                       message.sender_name === senderName
//                         ? "bg-indigo-600 text-white rounded-br-none"
//                         : "bg-gray-100 text-gray-900 rounded-bl-none"
//                     }`}
//                   >
//                     <div className="flex items-center mb-1">
//                       <span
//                         className={`text-xs font-medium ${
//                           message.sender_name === senderName
//                             ? "text-indigo-200"
//                             : "text-gray-500"
//                         }`}
//                       >
//                         {message.sender_name}
//                         {message.is_guest && " (Guest)"}
//                       </span>
//                       <span
//                         className={`text-xs ml-2 ${
//                           message.sender_name === senderName
//                             ? "text-indigo-300"
//                             : "text-gray-400"
//                         }`}
//                       >
//                         {formatTime(message.timestamp)}
//                       </span>
//                     </div>
//                     <p className="text-sm">{message.message}</p>
//                   </div>
//                 </div>
//               ))}
//               <div ref={messagesEndRef} />
//             </div>
//           )}
//         </div>

//         {/* Message Input */}
//         <form onSubmit={sendMessage} className="border-t p-4">
//           <div className="flex space-x-2">
//             <input
//               ref={inputRef}
//               type="text"
//               value={newMessage}
//               onChange={(e) => setNewMessage(e.target.value)}
//               placeholder="Type your message..."
//               className="flex-1 border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
//               autoFocus
//             />
//             <button
//               type="submit"
//               disabled={!newMessage.trim()}
//               className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg flex items-center"
//             >
//               <PaperAirplaneIcon className="h-5 w-5 rotate-90" />
//               <span className="ml-2">Send</span>
//             </button>
//           </div>
//           <p className="text-xs text-gray-500 mt-2 text-center">
//             Press Enter to send • Chat is saved for all room members
//           </p>
//         </form>
//       </div>

//       {/* Chat Info */}
//       <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
//         <div className="bg-white p-4 rounded-lg shadow">
//           <h3 className="font-medium text-gray-900 mb-2">Chat Rules</h3>
//           <ul className="text-sm text-gray-600 space-y-1">
//             <li>• Be respectful to other riders</li>
//             <li>• Share pickup/dropoff details clearly</li>
//             <li>• Discuss timing and meeting points</li>
//             <li>• Coordinate ride sharing details</li>
//           </ul>
//         </div>

//         <div className="bg-white p-4 rounded-lg shadow">
//           <h3 className="font-medium text-gray-900 mb-2">Your Status</h3>
//           <div className="text-sm text-gray-600">
//             <p>
//               <strong>Name:</strong> {senderName}
//               {!user && " (Guest)"}
//             </p>
//             <p className="mt-1">
//               <strong>Guest ID:</strong> {guestId?.substring(0, 12)}...
//             </p>
//             {!user && (
//               <button
//                 onClick={() => navigate("/register")}
//                 className="mt-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
//               >
//                 Register to keep your chat history →
//               </button>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ChatPage;
