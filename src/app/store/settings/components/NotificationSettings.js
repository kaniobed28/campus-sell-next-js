"use client";
import React, { useState } from "react";

const NotificationSettings = ({ notifications, onUpdate }) => {
  const [settings, setSettings] = useState(notifications || {
    emailNotifications: true,
    pushNotifications: true,
    inquiryNotifications: true,
    saleNotifications: true,
    marketingEmails: false,
    weeklyReports: true,
    dailyDigest: false,
    instantAlerts: false,
    quietHours: {
      enabled: false,
      start: "22:00",
      end: "08:00"
    }
  });

  const [saving, setSaving] = useState(false);

  const handleToggle = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleNestedToggle = (section, key) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: !prev[section][key]
      }
    }));
  };

  const handleNestedChange = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await onUpdate(settings);
    } catch (error) {
      console.error("Error saving notification settings:", error);
    } finally {
      setSaving(false);
    }
  };

  const notificationTypes = [
    {
      key: "inquiryNotifications",
      title: "New Inquiries",
      description: "Get notified when buyers send you messages",
      icon: "💬",
      important: true
    },
    {
      key: "saleNotifications",
      title: "Sales Updates",
      description: "Notifications about completed sales and transactions",
      icon: "💰",
      important: true
    },
    {
      key: "emailNotifications",
      title: "Email Notifications",
      description: "Receive notifications via email",
      icon: "📧",
      important: false
    },
    {
      key: "pushNotifications",
      title: "Push Notifications",
      description: "Browser and mobile push notifications",
      icon: "🔔",
      important: false
    },
    {
      key: "weeklyReports",
      title: "Weekly Reports",
      description: "Summary of your store performance each week",
      icon: "📊",
      important: false
    },
    {
      key: "dailyDigest",
      title: "Daily Digest",
      description: "Daily summary of store activity",
      icon: "📰",
      important: false
    },
    {
      key: "instantAlerts",
      title: "Instant Alerts",
      description: "Real-time notifications for urgent matters",
      icon: "⚡",
      important: false
    },
    {
      key: "marketingEmails",
      title: "Marketing Emails",
      description: "Tips, updates, and promotional content",
      icon: "📢",
      important: false
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* Notification Types */}
      <div className="space-y-4">
        {notificationTypes.map((type) => (
          <div key={type.key} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{type.icon}</span>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-medium text-gray-900">{type.title}</h4>
                    {type.important && (
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full">
                        Important
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{type.description}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings[type.key]}
                  onChange={() => handleToggle(type.key)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quiet Hours */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="text-md font-semibold text-gray-900 mb-4">🌙 Quiet Hours</h4>
        
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="quietHours"
              checked={settings.quietHours.enabled}
              onChange={() => handleNestedToggle('quietHours', 'enabled')}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="quietHours" className="ml-2 text-sm font-medium text-gray-700">
              Enable quiet hours (no notifications during these times)
            </label>
          </div>

          {settings.quietHours.enabled && (
            <div className="grid grid-cols-2 gap-4 ml-6">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Start time</label>
                <input
                  type="time"
                  value={settings.quietHours.start}
                  onChange={(e) => handleNestedChange('quietHours', 'start', e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">End time</label>
                <input
                  type="time"
                  value={settings.quietHours.end}
                  onChange={(e) => handleNestedChange('quietHours', 'end', e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notification Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="text-md font-semibold text-blue-900 mb-4">📋 Current Settings Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <p><strong>Active Notifications:</strong></p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              {notificationTypes
                .filter(type => settings[type.key])
                .map(type => (
                  <li key={type.key}>{type.title}</li>
                ))
              }
            </ul>
          </div>
          
          <div>
            <p><strong>Delivery Methods:</strong></p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              {settings.emailNotifications && <li>Email</li>}
              {settings.pushNotifications && <li>Push Notifications</li>}
              {!settings.emailNotifications && !settings.pushNotifications && <li>None selected</li>}
            </ul>
            
            {settings.quietHours.enabled && (
              <div className="mt-3">
                <p><strong>Quiet Hours:</strong></p>
                <p>{settings.quietHours.start} - {settings.quietHours.end}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notification Test */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-md font-semibold text-gray-900 mb-4">🧪 Test Notifications</h4>
        <p className="text-sm text-gray-600 mb-4">
          Send yourself a test notification to make sure everything is working correctly.
        </p>
        
        <div className="flex space-x-3">
          <button
            onClick={() => alert("Test email notification sent! (This is a demo)")}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
            disabled={!settings.emailNotifications}
          >
            Test Email
          </button>
          
          <button
            onClick={() => {
              if ('Notification' in window) {
                Notification.requestPermission().then(permission => {
                  if (permission === 'granted') {
                    new Notification('Test Notification', {
                      body: 'Your store notifications are working correctly!',
                      icon: '/favicon.ico'
                    });
                  }
                });
              } else {
                alert("Push notifications not supported in this browser");
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            disabled={!settings.pushNotifications}
          >
            Test Push
          </button>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">🔒 Privacy & Data</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p>• We only send notifications you've explicitly enabled</p>
          <p>• You can change these settings anytime</p>
          <p>• We never share your notification preferences with third parties</p>
          <p>• Unsubscribe links are included in all marketing emails</p>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;