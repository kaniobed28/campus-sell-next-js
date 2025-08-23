"use client";
import React from "react";
import { INQUIRY_STATUS } from "@/types/store";

const InquiryStats = ({ inquiries }) => {
  if (!inquiries || inquiries.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Inquiry Statistics</h3>
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">📊</div>
          <p>No inquiry data available</p>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const totalInquiries = inquiries.length;
  const openInquiries = inquiries.filter(i => i.status === INQUIRY_STATUS.OPEN).length;
  const repliedInquiries = inquiries.filter(i => i.status === INQUIRY_STATUS.REPLIED).length;
  const completedInquiries = inquiries.filter(i => i.status === INQUIRY_STATUS.COMPLETED).length;
  const closedInquiries = inquiries.filter(i => i.status === INQUIRY_STATUS.CLOSED).length;

  // Calculate response metrics
  const totalMessages = inquiries.reduce((sum, inquiry) => sum + (inquiry.messages?.length || 0), 0);
  const averageMessagesPerInquiry = totalInquiries > 0 ? Math.round(totalMessages / totalInquiries) : 0;

  // Calculate unread messages
  const unreadMessages = inquiries.reduce((sum, inquiry) => {
    return sum + (inquiry.messages?.filter(msg => !msg.isRead && msg.senderType === "buyer").length || 0);
  }, 0);

  // Calculate priority distribution
  const urgentInquiries = inquiries.filter(i => i.priority === "urgent").length;
  const highInquiries = inquiries.filter(i => i.priority === "high").length;
  const normalInquiries = inquiries.filter(i => i.priority === "normal").length;
  const lowInquiries = inquiries.filter(i => i.priority === "low").length;

  // Calculate response rate
  const responseRate = totalInquiries > 0 ? Math.round(((repliedInquiries + completedInquiries) / totalInquiries) * 100) : 0;

  // Calculate completion rate
  const completionRate = totalInquiries > 0 ? Math.round((completedInquiries / totalInquiries) * 100) : 0;

  const stats = [
    {
      label: "Total Inquiries",
      value: totalInquiries,
      color: "blue",
      icon: "💬"
    },
    {
      label: "Open",
      value: openInquiries,
      color: "red",
      icon: "🔴",
      percentage: totalInquiries > 0 ? Math.round((openInquiries / totalInquiries) * 100) : 0
    },
    {
      label: "Replied",
      value: repliedInquiries,
      color: "blue",
      icon: "💙",
      percentage: totalInquiries > 0 ? Math.round((repliedInquiries / totalInquiries) * 100) : 0
    },
    {
      label: "Completed",
      value: completedInquiries,
      color: "green",
      icon: "✅",
      percentage: totalInquiries > 0 ? Math.round((completedInquiries / totalInquiries) * 100) : 0
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: "bg-blue-100 text-blue-800",
      red: "bg-red-100 text-red-800",
      green: "bg-green-100 text-green-800",
      yellow: "bg-yellow-100 text-yellow-800",
      purple: "bg-purple-100 text-purple-800",
      gray: "bg-gray-100 text-gray-800"
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Inquiry Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
              {stat.percentage !== undefined && (
                <div className="text-xs text-gray-500 mt-1">
                  {stat.percentage}% of total
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{responseRate}%</div>
            <div className="text-sm text-gray-600">Response Rate</div>
            <div className="text-xs text-gray-500 mt-1">
              Inquiries with replies
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{completionRate}%</div>
            <div className="text-sm text-gray-600">Completion Rate</div>
            <div className="text-xs text-gray-500 mt-1">
              Successfully resolved
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">{averageMessagesPerInquiry}</div>
            <div className="text-sm text-gray-600">Avg Messages</div>
            <div className="text-xs text-gray-500 mt-1">
              Per conversation
            </div>
          </div>
        </div>
      </div>

      {/* Priority Distribution */}
      {(urgentInquiries > 0 || highInquiries > 0 || normalInquiries > 0 || lowInquiries > 0) && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Priority Distribution</h3>
          <div className="space-y-3">
            {urgentInquiries > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-red-600 mr-2">🚨</span>
                  <span className="text-sm font-medium">Urgent</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-600 mr-2">{urgentInquiries}</span>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-600 h-2 rounded-full" 
                      style={{ width: `${(urgentInquiries / totalInquiries) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            
            {highInquiries > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-orange-600 mr-2">⚡</span>
                  <span className="text-sm font-medium">High</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-600 mr-2">{highInquiries}</span>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-orange-600 h-2 rounded-full" 
                      style={{ width: `${(highInquiries / totalInquiries) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            
            {normalInquiries > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-blue-600 mr-2">📝</span>
                  <span className="text-sm font-medium">Normal</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-600 mr-2">{normalInquiries}</span>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(normalInquiries / totalInquiries) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            
            {lowInquiries > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-gray-600 mr-2">📋</span>
                  <span className="text-sm font-medium">Low</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-600 mr-2">{lowInquiries}</span>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gray-600 h-2 rounded-full" 
                      style={{ width: `${(lowInquiries / totalInquiries) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Items */}
      {(unreadMessages > 0 || openInquiries > 0) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-900 mb-2">⚠️ Action Required</h4>
          <div className="text-sm text-yellow-800 space-y-1">
            {unreadMessages > 0 && (
              <p>• {unreadMessages} unread message{unreadMessages !== 1 ? 's' : ''} waiting for your response</p>
            )}
            {openInquiries > 0 && (
              <p>• {openInquiries} open inquir{openInquiries !== 1 ? 'ies' : 'y'} need{openInquiries === 1 ? 's' : ''} attention</p>
            )}
          </div>
        </div>
      )}

      {/* Performance Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">💡 Tips for Better Communication</h4>
        <div className="text-sm text-blue-800 space-y-1">
          {responseRate < 80 && (
            <p>• Try to respond to inquiries within 24 hours to improve buyer satisfaction</p>
          )}
          {completionRate < 60 && (
            <p>• Mark conversations as complete when resolved to track your success rate</p>
          )}
          {averageMessagesPerInquiry > 5 && (
            <p>• Consider adding more details to your product descriptions to reduce back-and-forth</p>
          )}
          <p>• Use quick reply templates to respond faster to common questions</p>
        </div>
      </div>
    </div>
  );
};

export default InquiryStats;