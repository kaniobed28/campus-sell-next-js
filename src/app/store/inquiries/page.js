"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "../../stores/useAuth";
import Loading from "@/components/Loading";
import inquiryService from "./services/inquiryService";
import InquiryList from "./components/InquiryList";
import ConversationView from "./components/ConversationView";
import InquiryStats from "./components/InquiryStats";

const InquiriesPage = () => {
  const { user } = useAuth();
  const [inquiries, setInquiries] = useState([]);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState("list"); // "list", "conversation", "stats"

  useEffect(() => {
    if (user) {
      loadInquiries();
    }
  }, [user]);

  const loadInquiries = async () => {
    try {
      setLoading(true);
      setError(null);

      // For demo purposes, we'll use mock data
      // In production, this would call: await inquiryService.getSellerInquiries(user.uid);
      const mockInquiries = inquiryService.generateMockInquiries(user.uid, 8);
      setInquiries(mockInquiries);

    } catch (err) {
      console.error("Error loading inquiries:", err);
      setError("Failed to load inquiries. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInquirySelect = (inquiry) => {
    setSelectedInquiry(inquiry);
    setView("conversation");
  };

  const handleSendMessage = async (inquiryId, message) => {
    try {
      // In production: await inquiryService.sendMessage(inquiryId, user.uid, message, 'seller');
      
      // Mock implementation
      const updatedInquiries = inquiries.map(inquiry => {
        if (inquiry.id === inquiryId) {
          const newMessage = {
            id: `msg_${Date.now()}`,
            senderId: user.uid,
            senderType: 'seller',
            content: message,
            timestamp: new Date(),
            isRead: true
          };
          
          return {
            ...inquiry,
            messages: [...(inquiry.messages || []), newMessage],
            status: 'replied',
            lastMessageAt: new Date()
          };
        }
        return inquiry;
      });
      
      setInquiries(updatedInquiries);
      
      // Update selected inquiry
      const updatedSelectedInquiry = updatedInquiries.find(i => i.id === inquiryId);
      setSelectedInquiry(updatedSelectedInquiry);
      
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  };

  const handleStatusChange = async (inquiryId, newStatus) => {
    try {
      // In production: await inquiryService.updateInquiryStatus(inquiryId, newStatus, user.uid);
      
      // Mock implementation
      const updatedInquiries = inquiries.map(inquiry => 
        inquiry.id === inquiryId 
          ? { ...inquiry, status: newStatus, updatedAt: new Date() }
          : inquiry
      );
      
      setInquiries(updatedInquiries);
      
      if (selectedInquiry && selectedInquiry.id === inquiryId) {
        setSelectedInquiry({ ...selectedInquiry, status: newStatus });
      }
      
    } catch (error) {
      console.error("Error updating inquiry status:", error);
      alert("Failed to update inquiry status. Please try again.");
    }
  };

  const handleMarkComplete = async (inquiryId) => {
    await handleStatusChange(inquiryId, 'completed');
  };

  if (loading) {
    return <Loading message="Loading inquiries..." />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-destructive text-xl mb-4">⚠️ {error}</div>
        <button
          onClick={loadInquiries}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90"
        >
          Try Again
        </button>
      </div>
    );
  }

  const unreadCount = inquiries.reduce((sum, inquiry) => {
    return sum + (inquiry.messages?.filter(msg => !msg.isRead && msg.senderType === "buyer").length || 0);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Inquiries
            {unreadCount > 0 && (
              <span className="ml-2 bg-destructive text-destructive-foreground text-sm rounded-full px-2 py-1">
                {unreadCount} unread
              </span>
            )}
          </h2>
          <p className="text-muted-foreground">Manage messages from potential buyers</p>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setView("list")}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              view === "list" 
                ? "bg-primary text-primary-foreground" 
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            📋 List View
          </button>
          <button
            onClick={() => setView("stats")}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              view === "stats" 
                ? "bg-primary text-primary-foreground" 
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            📊 Statistics
          </button>
        </div>
      </div>

      {/* Content based on view */}
      {view === "stats" ? (
        <InquiryStats inquiries={inquiries} />
      ) : view === "conversation" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          <div className="lg:col-span-1">
            <InquiryList
              inquiries={inquiries}
              onInquirySelect={handleInquirySelect}
              selectedInquiryId={selectedInquiry?.id}
              onStatusChange={handleStatusChange}
              onMarkComplete={handleMarkComplete}
            />
          </div>
          <div className="lg:col-span-2">
            <ConversationView
              inquiry={selectedInquiry}
              currentUser={user}
              onSendMessage={handleSendMessage}
              onStatusChange={handleStatusChange}
              onMarkComplete={handleMarkComplete}
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-3">
            <InquiryList
              inquiries={inquiries}
              onInquirySelect={handleInquirySelect}
              selectedInquiryId={selectedInquiry?.id}
              onStatusChange={handleStatusChange}
              onMarkComplete={handleMarkComplete}
            />
          </div>
          <div className="xl:col-span-1">
            <InquiryStats inquiries={inquiries} />
          </div>
        </div>
      )}

      {/* Demo Notice */}
      <div className="bg-info/10 border border-info rounded-lg p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-6 h-6 bg-info rounded-full flex items-center justify-center">
              <span className="text-info-foreground font-bold text-xs">ℹ️</span>
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm text-info-foreground">
              <strong>Demo Mode:</strong> This is showing mock inquiry data for demonstration. 
              In production, this would display real buyer inquiries and allow actual messaging.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InquiriesPage;