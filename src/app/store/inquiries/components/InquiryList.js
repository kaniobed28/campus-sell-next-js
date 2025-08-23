"use client";
import React, { useState } from "react";
import { INQUIRY_STATUS } from "@/types/store";

const InquiryList = ({ 
  inquiries, 
  onInquirySelect, 
  selectedInquiryId,
  onStatusChange,
  onMarkComplete 
}) => {
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  if (!inquiries || inquiries.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="text-gray-400 text-4xl mb-4">💬</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No inquiries yet</h3>
        <p className="text-gray-600">
          When buyers are interested in your products, their messages will appear here
        </p>
      </div>
    );
  }

  // Filter inquiries
  const filteredInquiries = inquiries.filter(inquiry => {
    if (filter === "all") return true;
    return inquiry.status === filter;
  });

  // Sort inquiries
  const sortedInquiries = [...filteredInquiries].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.lastMessageAt) - new Date(a.lastMessageAt);
      case "oldest":
        return new Date(a.lastMessageAt) - new Date(b.lastMessageAt);
      case "priority":
        const priorityOrder = { urgent: 4, high: 3, normal: 2, low: 1 };
        return (priorityOrder[b.priority] || 2) - (priorityOrder[a.priority] || 2);
      default:
        return new Date(b.lastMessageAt) - new Date(a.lastMessageAt);
    }
  });

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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "text-red-600";
      case "high":
        return "text-orange-600";
      case "normal":
        return "text-blue-600";
      case "low":
        return "text-gray-600";
      default:
        return "text-gray-600";
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case "urgent":
        return "🚨";
      case "high":
        return "⚡";
      case "normal":
        return "📝";
      case "low":
        return "📋";
      default:
        return "📝";
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    const messageDate = new Date(date.seconds ? date.seconds * 1000 : date);
    const now = new Date();
    const diffTime = Math.abs(now - messageDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return messageDate.toLocaleDateString();
  };

  const getUnreadCount = (inquiry) => {
    return inquiry.messages?.filter(msg => !msg.isRead && msg.senderType === "buyer").length || 0;
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header with filters */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <h3 className="text-lg font-semibold text-gray-900">
            Inquiries ({sortedInquiries.length})
          </h3>
          
          <div className="flex space-x-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value={INQUIRY_STATUS.OPEN}>Open</option>
              <option value={INQUIRY_STATUS.REPLIED}>Replied</option>
              <option value={INQUIRY_STATUS.COMPLETED}>Completed</option>
              <option value={INQUIRY_STATUS.CLOSED}>Closed</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="priority">By Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inquiry list */}
      <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
        {sortedInquiries.map((inquiry) => {
          const unreadCount = getUnreadCount(inquiry);
          const isSelected = selectedInquiryId === inquiry.id;
          
          return (
            <div
              key={inquiry.id}
              onClick={() => onInquirySelect(inquiry)}
              className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                isSelected ? "bg-blue-50 border-r-4 border-blue-500" : ""
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={getPriorityColor(inquiry.priority)}>
                      {getPriorityIcon(inquiry.priority)}
                    </span>
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {inquiry.subject || "Product Inquiry"}
                    </h4>
                    {unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 truncate mb-2">
                    {inquiry.productTitle || "Unknown Product"}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(inquiry.status)}`}>
                      {inquiry.status}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(inquiry.lastMessageAt)}
                    </span>
                  </div>
                </div>
                
                <div className="ml-2 flex-shrink-0">
                  <div className="flex flex-col items-end space-y-1">
                    {inquiry.status === INQUIRY_STATUS.OPEN && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onStatusChange(inquiry.id, INQUIRY_STATUS.REPLIED);
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Mark Replied
                      </button>
                    )}
                    
                    {(inquiry.status === INQUIRY_STATUS.REPLIED || inquiry.status === INQUIRY_STATUS.OPEN) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onMarkComplete(inquiry.id);
                        }}
                        className="text-xs text-green-600 hover:text-green-800"
                      >
                        Complete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InquiryList;