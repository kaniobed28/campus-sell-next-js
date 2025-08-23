"use client";
import React, { useState } from "react";
import { useAuth } from "../../stores/useAuth";
import Loading from "@/components/Loading";
import AutoResponseManager from "./components/AutoResponseManager";
import PolicySettings from "./components/PolicySettings";
import NotificationSettings from "./components/NotificationSettings";
import SettingsTabs from "./components/SettingsTabs";
import SettingsHelpSection from "./components/SettingsHelpSection";
import SettingsNotification from "./components/SettingsNotification";
import { useSettings } from "./hooks/useSettings";

const SettingsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("policies");
  const [notification, setNotification] = useState({ message: '', type: 'success' });
  
  const {
    settings,
    loading,
    error,
    loadSettings,
    updatePolicies,
    updateAutoResponses,
    updateNotifications
  } = useSettings(user);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  const clearNotification = () => {
    setNotification({ message: '', type: 'success' });
  };

  const handlePolicyUpdate = async (updatedPolicies) => {
    const result = await updatePolicies(updatedPolicies);
    if (result.success) {
      showNotification("Policies updated successfully!");
    } else {
      showNotification(result.error, 'error');
    }
  };

  const handleAutoResponseUpdate = async (updatedAutoResponses) => {
    const result = await updateAutoResponses(updatedAutoResponses);
    if (result.success) {
      showNotification("Auto-responses updated successfully!");
    } else {
      showNotification(result.error, 'error');
    }
  };

  const handleNotificationUpdate = async (updatedNotifications) => {
    const result = await updateNotifications(updatedNotifications);
    if (result.success) {
      showNotification("Notification settings updated successfully!");
    } else {
      showNotification(result.error, 'error');
    }
  };

  if (loading) {
    return <Loading message="Loading settings..." />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-destructive text-xl mb-4">⚠️ {error}</div>
        <button
          onClick={loadSettings}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SettingsNotification
        message={notification.message}
        type={notification.type}
        onClose={clearNotification}
      />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Store Settings</h1>
        <p className="text-muted-foreground">Manage your store policies, auto-responses, and preferences</p>
      </div>

      {/* Main Content */}
      <div className="bg-card rounded-lg shadow">
        <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "policies" && (
            <div role="tabpanel" id="policies-panel" aria-labelledby="policies-tab">
              <PolicySettings
                policies={settings.policies}
                onUpdate={handlePolicyUpdate}
              />
            </div>
          )}
          
          {activeTab === "autoresponses" && (
            <div role="tabpanel" id="autoresponses-panel" aria-labelledby="autoresponses-tab">
              <AutoResponseManager
                autoResponses={settings.autoResponses}
                onUpdate={handleAutoResponseUpdate}
              />
            </div>
          )}
          
          {activeTab === "notifications" && (
            <div role="tabpanel" id="notifications-panel" aria-labelledby="notifications-tab">
              <NotificationSettings
                notifications={settings.notifications}
                onUpdate={handleNotificationUpdate}
              />
            </div>
          )}
        </div>
      </div>

      <SettingsHelpSection />
    </div>
  );
};

export default SettingsPage;