"use client";
import React, { useState, useRef, useEffect } from "react";
import { INQUIRY_STATUS } from "@/types/store";

const ConversationView = ({ 
  inquiry, 
  currentUser,
  onSendMessage,
  onStatusChange,
  onMarkComplete 
}) => {
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [inquiry?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (!inquiry) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="text-gray-400 text-4xl mb-4">💬</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Select an inquiry</h3>
        <p className="text-gray-600">
          Choose an inquiry from the list to view the conversation
        </p>
      </div>
    );
  }

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      await onSendMessage(inquiry.id, newMessage.trim());
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp.seconds ? timestamp.seconds * 1000 : timestamp);
    return date.toLocaleString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case INQUIRY_STATUS.OPEN:
        return "bg-red-100 text-red-800";
      case INQUIRY_STATUS.REPLIED:
        return "bg-blue-100 text-blue-800";
      case INQUIRY_STATUS.COMPLETED:
        return "bg-green-100 text-green-800";
      case INQUIRY_STATUS.CLOSED:
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const canReply = inquiry.status !== INQUIRY_STATUS.COMPLETED && inquiry.status !== INQUIRY_STATUS.CLOSED;

  return (
    <div className="bg-white rounded-lg shadow flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {inquiry.subject || "Product Inquiry"}
            </h3>
            <p className="text-sm text-gray-600">
              About: <span className="font-medium">{inquiry.productTitle}</span>
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(inquiry.status)}`}>
              {inquiry.status}
            </span>
            
            {inquiry.status !== INQUIRY_STATUS.COMPLETED && inquiry.status !== INQUIRY_STATUS.CLOSED && (
              <div className="flex space-x-1">
                {inquiry.status === INQUIRY_STATUS.OPEN && (
                  <button
                    onClick={() => onStatusChange(inquiry.id, INQUIRY_STATUS.REPLIED)}
                    className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                  >
                    Mark Replied
                  </button>
                )}
                
                <button
                  onClick={() => onMarkComplete(inquiry.id)}
                  className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                >
                  Complete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {inquiry.messages && inquiry.messages.length > 0 ? (
          inquiry.messages.map((message, index) => {
            const isFromSeller = message.senderType === "seller";
            const isSystemMessage = message.isSystemMessage;
            
            if (isSystemMessage) {
              return (
                <div key={index} className="text-center">
                  <div className="inline-block bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                    {message.content}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {formatMessageTime(message.timestamp)}
                  </div>
                </div>
              );
            }
            
            return (
              <div key={index} className={`flex ${isFromSeller ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  isFromSeller 
                    ? "bg-blue-600 text-white" 
                    : "bg-gray-100 text-gray-900"
                }`}>
                  <div className="text-sm">
                    {message.content}
                  </div>
                  <div className={`text-xs mt-1 ${
                    isFromSeller ? "text-blue-100" : "text-gray-500"
                  }`}>
                    {formatMessageTime(message.timestamp)}
                    {message.isAutoResponse && (
                      <span className="ml-2 italic">(Auto-response)</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center text-gray-500 py-8">
            <div className="text-4xl mb-2">💬</div>
            <p>No messages yet</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      {canReply && (
        <div className="p-4 border-t border-gray-200">
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <div className="flex-1">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your reply..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                disabled={sending}
              />
            </div>
            <div className="flex flex-col space-y-2">
              <button
                type="submit"
                disabled={!newMessage.trim() || sending}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? "Sending..." : "Send"}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  // Quick reply functionality
                  setNewMessage("Thank you for your interest! I'll get back to you soon.");
                }}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Quick Reply
              </button>
            </div>
          </form>
          
          {/* Quick reply templates */}
          <div className="mt-2 flex flex-wrap gap-2">
            {[
              "Thank you for your interest!",
              "The item is still available.",
              "I can meet on campus.",
              "Payment via Venmo or cash.",
              "Let me know if you have questions."
            ].map((template, index) => (
              <button
                key={index}
                onClick={() => setNewMessage(template)}
                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded hover:bg-gray-200"
              >
                {template}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Closed conversation notice */}
      {!canReply && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-center text-gray-600">
            <div className="text-sm">
              This conversation has been {inquiry.status === INQUIRY_STATUS.COMPLETED ? "completed" : "closed"}.
            </div>
            {inquiry.status === INQUIRY_STATUS.COMPLETED && (
              <button
                onClick={() => onStatusChange(inquiry.id, INQUIRY_STATUS.OPEN)}
                className="text-xs text-blue-600 hover:text-blue-800 mt-1"
              >
                Reopen conversation
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationView;