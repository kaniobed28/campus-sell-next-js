"use client";
import React, { useState } from "react";

const PolicySettings = ({ policies, onUpdate }) => {
  const [formData, setFormData] = useState(policies || {
    returnPolicy: {
      acceptsReturns: false,
      returnWindow: 7,
      returnConditions: "",
      returnShipping: "buyer_pays"
    },
    shippingPolicy: {
      shippingMethods: [],
      processingTime: "1-2 business days",
      shippingCost: 0,
      freeShippingThreshold: null
    },
    communicationPreferences: {
      autoRespond: false,
      responseTime: "24 hours",
      preferredContactMethod: "platform",
      businessHours: {
        enabled: false,
        start: "09:00",
        end: "18:00",
        timezone: "EST"
      }
    },
    generalPolicies: {
      paymentMethods: [],
      meetupLocations: [],
      additionalTerms: ""
    }
  });

  const [saving, setSaving] = useState(false);

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleNestedInputChange = (section, nestedSection, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [nestedSection]: {
          ...prev[section][nestedSection],
          [field]: value
        }
      }
    }));
  };

  const handleArrayChange = (section, field, value) => {
    const arrayValue = value.split(',').map(item => item.trim()).filter(item => item.length > 0);
    handleInputChange(section, field, arrayValue);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await onUpdate(formData);
    } catch (error) {
      console.error("Error saving policies:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Store Policies</h3>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* Return Policy */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="text-md font-semibold text-gray-900 mb-4">📦 Return Policy</h4>
        
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="acceptsReturns"
              checked={formData.returnPolicy.acceptsReturns}
              onChange={(e) => handleInputChange('returnPolicy', 'acceptsReturns', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="acceptsReturns" className="ml-2 text-sm font-medium text-gray-700">
              Accept returns
            </label>
          </div>

          {formData.returnPolicy.acceptsReturns && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Return window (days)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={formData.returnPolicy.returnWindow}
                  onChange={(e) => handleInputChange('returnPolicy', 'returnWindow', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Return conditions
                </label>
                <textarea
                  value={formData.returnPolicy.returnConditions}
                  onChange={(e) => handleInputChange('returnPolicy', 'returnConditions', e.target.value)}
                  placeholder="e.g., Items must be in original condition with tags attached"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Return shipping
                </label>
                <select
                  value={formData.returnPolicy.returnShipping}
                  onChange={(e) => handleInputChange('returnPolicy', 'returnShipping', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="buyer_pays">Buyer pays return shipping</option>
                  <option value="seller_pays">Seller pays return shipping</option>
                  <option value="free_returns">Free returns</option>
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Shipping Policy */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="text-md font-semibold text-gray-900 mb-4">🚚 Shipping & Delivery</h4>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Available methods (comma-separated)
            </label>
            <input
              type="text"
              value={formData.shippingPolicy.shippingMethods.join(', ')}
              onChange={(e) => handleArrayChange('shippingPolicy', 'shippingMethods', e.target.value)}
              placeholder="e.g., Campus pickup, Local delivery, Shipping"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Processing time
            </label>
            <input
              type="text"
              value={formData.shippingPolicy.processingTime}
              onChange={(e) => handleInputChange('shippingPolicy', 'processingTime', e.target.value)}
              placeholder="e.g., 1-2 business days"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shipping cost ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.shippingPolicy.shippingCost}
                onChange={(e) => handleInputChange('shippingPolicy', 'shippingCost', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Free shipping threshold ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.shippingPolicy.freeShippingThreshold || ""}
                onChange={(e) => handleInputChange('shippingPolicy', 'freeShippingThreshold', parseFloat(e.target.value) || null)}
                placeholder="Optional"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Communication Preferences */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="text-md font-semibold text-gray-900 mb-4">💬 Communication Preferences</h4>
        
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="autoRespond"
              checked={formData.communicationPreferences.autoRespond}
              onChange={(e) => handleInputChange('communicationPreferences', 'autoRespond', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="autoRespond" className="ml-2 text-sm font-medium text-gray-700">
              Enable auto-responses
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expected response time
            </label>
            <select
              value={formData.communicationPreferences.responseTime}
              onChange={(e) => handleInputChange('communicationPreferences', 'responseTime', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1 hour">Within 1 hour</option>
              <option value="4 hours">Within 4 hours</option>
              <option value="24 hours">Within 24 hours</option>
              <option value="48 hours">Within 48 hours</option>
              <option value="3-5 days">3-5 business days</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preferred contact method
            </label>
            <select
              value={formData.communicationPreferences.preferredContactMethod}
              onChange={(e) => handleInputChange('communicationPreferences', 'preferredContactMethod', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="platform">Platform messaging</option>
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              <option value="text">Text message</option>
            </select>
          </div>

          {/* Business Hours */}
          <div>
            <div className="flex items-center mb-3">
              <input
                type="checkbox"
                id="businessHours"
                checked={formData.communicationPreferences.businessHours.enabled}
                onChange={(e) => handleNestedInputChange('communicationPreferences', 'businessHours', 'enabled', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="businessHours" className="ml-2 text-sm font-medium text-gray-700">
                Set business hours
              </label>
            </div>

            {formData.communicationPreferences.businessHours.enabled && (
              <div className="grid grid-cols-2 gap-4 ml-6">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Start time</label>
                  <input
                    type="time"
                    value={formData.communicationPreferences.businessHours.start}
                    onChange={(e) => handleNestedInputChange('communicationPreferences', 'businessHours', 'start', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">End time</label>
                  <input
                    type="time"
                    value={formData.communicationPreferences.businessHours.end}
                    onChange={(e) => handleNestedInputChange('communicationPreferences', 'businessHours', 'end', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* General Policies */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="text-md font-semibold text-gray-900 mb-4">⚙️ General Policies</h4>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Accepted payment methods (comma-separated)
            </label>
            <input
              type="text"
              value={formData.generalPolicies.paymentMethods.join(', ')}
              onChange={(e) => handleArrayChange('generalPolicies', 'paymentMethods', e.target.value)}
              placeholder="e.g., Venmo, Cash, PayPal, Zelle"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preferred meetup locations (comma-separated)
            </label>
            <input
              type="text"
              value={formData.generalPolicies.meetupLocations.join(', ')}
              onChange={(e) => handleArrayChange('generalPolicies', 'meetupLocations', e.target.value)}
              placeholder="e.g., Student Union, Library, Campus Center"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional terms and conditions
            </label>
            <textarea
              value={formData.generalPolicies.additionalTerms}
              onChange={(e) => handleInputChange('generalPolicies', 'additionalTerms', e.target.value)}
              placeholder="Any additional terms, conditions, or important information for buyers"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Policy Preview */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="text-md font-semibold text-blue-900 mb-4">👁️ Policy Preview</h4>
        <div className="text-sm text-blue-800 space-y-2">
          <p><strong>Returns:</strong> {formData.returnPolicy.acceptsReturns ? `Accepted within ${formData.returnPolicy.returnWindow} days` : "Not accepted"}</p>
          <p><strong>Shipping:</strong> {formData.shippingPolicy.shippingMethods.length > 0 ? formData.shippingPolicy.shippingMethods.join(", ") : "Not specified"}</p>
          <p><strong>Response Time:</strong> {formData.communicationPreferences.responseTime}</p>
          <p><strong>Payment:</strong> {formData.generalPolicies.paymentMethods.length > 0 ? formData.generalPolicies.paymentMethods.join(", ") : "Not specified"}</p>
        </div>
      </div>
    </div>
  );
};

export default PolicySettings;