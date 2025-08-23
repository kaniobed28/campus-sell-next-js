import { useState, useEffect } from 'react';

export const useSettings = (user) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [settings, setSettings] = useState({
    policies: null,
    autoResponses: [],
    notifications: null
  });

  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      // Mock settings data - in production this would load from database
      const mockSettings = {
        policies: {
          returnPolicy: {
            acceptsReturns: true,
            returnWindow: 7,
            returnConditions: "Items must be in original condition",
            returnShipping: "buyer_pays"
          },
          shippingPolicy: {
            shippingMethods: ["campus_pickup", "local_delivery"],
            processingTime: "1-2 business days",
            shippingCost: 0,
            freeShippingThreshold: null
          },
          communicationPreferences: {
            autoRespond: true,
            responseTime: "24 hours",
            preferredContactMethod: "platform",
            businessHours: {
              enabled: true,
              start: "09:00",
              end: "18:00",
              timezone: "EST"
            }
          },
          generalPolicies: {
            paymentMethods: ["venmo", "cash", "paypal"],
            meetupLocations: ["Student Union", "Library", "Campus Center"],
            additionalTerms: "Please message before purchasing. Campus pickup preferred."
          }
        },
        autoResponses: [
          {
            id: "1",
            name: "Initial Interest Response",
            triggers: ["new_inquiry"],
            subject: "Thanks for your interest!",
            content: "Hi! Thanks for your interest in my item. It's still available. Let me know if you have any questions!",
            isActive: true,
            delay: 0,
            timesUsed: 15,
            lastUsed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
          },
          {
            id: "2",
            name: "Availability Confirmation",
            triggers: ["availability_question"],
            subject: "Yes, it's still available!",
            content: "Yes, this item is still available! Would you like to arrange a time to meet on campus?",
            isActive: true,
            delay: 5,
            timesUsed: 8,
            lastUsed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
          }
        ],
        notifications: {
          emailNotifications: true,
          pushNotifications: true,
          inquiryNotifications: true,
          saleNotifications: true,
          marketingEmails: false,
          weeklyReports: true
        }
      };

      setSettings(mockSettings);
    } catch (err) {
      console.error("Error loading settings:", err);
      setError("Failed to load settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const updatePolicies = async (updatedPolicies) => {
    try {
      // In production: await policyService.updatePolicies(user.uid, updatedPolicies);
      setSettings(prev => ({
        ...prev,
        policies: updatedPolicies
      }));
      return { success: true };
    } catch (error) {
      console.error("Error updating policies:", error);
      return { success: false, error: "Failed to update policies. Please try again." };
    }
  };

  const updateAutoResponses = async (updatedAutoResponses) => {
    try {
      // In production: await autoResponseService.updateAutoResponses(user.uid, updatedAutoResponses);
      setSettings(prev => ({
        ...prev,
        autoResponses: updatedAutoResponses
      }));
      return { success: true };
    } catch (error) {
      console.error("Error updating auto-responses:", error);
      return { success: false, error: "Failed to update auto-responses. Please try again." };
    }
  };

  const updateNotifications = async (updatedNotifications) => {
    try {
      // In production: await notificationService.updateSettings(user.uid, updatedNotifications);
      setSettings(prev => ({
        ...prev,
        notifications: updatedNotifications
      }));
      return { success: true };
    } catch (error) {
      console.error("Error updating notifications:", error);
      return { success: false, error: "Failed to update notification settings. Please try again." };
    }
  };

  return {
    settings,
    loading,
    error,
    loadSettings,
    updatePolicies,
    updateAutoResponses,
    updateNotifications
  };
};