"use client";
import React, { useState } from "react";

const AutoResponseManager = ({ autoResponses, onUpdate }) => {
  const [responses, setResponses] = useState(autoResponses || []);
  const [editingResponse, setEditingResponse] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [newResponse, setNewResponse] = useState({
    name: "",
    triggers: [],
    subject: "",
    content: "",
    isActive: true,
    delay: 0
  });

  const triggerOptions = [
    { value: "new_inquiry", label: "New inquiry received", description: "When a buyer first contacts you" },
    { value: "availability_question", label: "Availability question", description: "When someone asks if item is available" },
    { value: "price_question", label: "Price question", description: "When someone asks about pricing" },
    { value: "condition_question", label: "Condition question", description: "When someone asks about item condition" },
    { value: "meetup_question", label: "Meetup question", description: "When someone asks about meeting location" },
    { value: "payment_question", label: "Payment question", description: "When someone asks about payment methods" },
    { value: "follow_up", label: "Follow-up message", description: "For follow-up communications" }
  ];

  const handleCreateResponse = () => {
    setNewResponse({
      name: "",
      triggers: [],
      subject: "",
      content: "",
      isActive: true,
      delay: 0
    });
    setShowCreateForm(true);
    setEditingResponse(null);
  };

  const handleEditResponse = (response) => {
    setNewResponse({ ...response });
    setEditingResponse(response.id);
    setShowCreateForm(true);
  };

  const handleSaveResponse = async () => {
    try {
      setSaving(true);

      if (!newResponse.name.trim() || !newResponse.content.trim()) {
        alert("Please fill in all required fields");
        return;
      }

      let updatedResponses;
      if (editingResponse) {
        // Update existing response
        updatedResponses = responses.map(response =>
          response.id === editingResponse
            ? { ...newResponse, id: editingResponse, updatedAt: new Date() }
            : response
        );
      } else {
        // Create new response
        const newResponseWithId = {
          ...newResponse,
          id: Date.now().toString(),
          timesUsed: 0,
          lastUsed: null,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        updatedResponses = [...responses, newResponseWithId];
      }

      setResponses(updatedResponses);
      await onUpdate(updatedResponses);
      
      setShowCreateForm(false);
      setEditingResponse(null);
      setNewResponse({
        name: "",
        triggers: [],
        subject: "",
        content: "",
        isActive: true,
        delay: 0
      });

    } catch (error) {
      console.error("Error saving auto-response:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteResponse = async (responseId) => {
    if (!confirm("Are you sure you want to delete this auto-response?")) {
      return;
    }

    try {
      const updatedResponses = responses.filter(response => response.id !== responseId);
      setResponses(updatedResponses);
      await onUpdate(updatedResponses);
    } catch (error) {
      console.error("Error deleting auto-response:", error);
      alert("Failed to delete auto-response. Please try again.");
    }
  };

  const handleToggleActive = async (responseId) => {
    try {
      const updatedResponses = responses.map(response =>
        response.id === responseId
          ? { ...response, isActive: !response.isActive, updatedAt: new Date() }
          : response
      );
      setResponses(updatedResponses);
      await onUpdate(updatedResponses);
    } catch (error) {
      console.error("Error toggling auto-response:", error);
      alert("Failed to update auto-response. Please try again.");
    }
  };

  const handleTriggerChange = (trigger, checked) => {
    setNewResponse(prev => ({
      ...prev,
      triggers: checked
        ? [...prev.triggers, trigger]
        : prev.triggers.filter(t => t !== trigger)
    }));
  };

  const formatLastUsed = (date) => {
    if (!date) return "Never";
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Auto-Response Templates</h3>
        <button
          onClick={handleCreateResponse}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          + Create Auto-Response
        </button>
      </div>

      {/* Existing Auto-Responses */}
      <div className="space-y-4">
        {responses.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <div className="text-gray-400 text-4xl mb-4">🤖</div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">No auto-responses yet</h4>
            <p className="text-gray-600 mb-4">
              Create automated responses to common buyer questions to save time and improve response rates
            </p>
            <button
              onClick={handleCreateResponse}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Create Your First Auto-Response
            </button>
          </div>
        ) : (
          responses.map((response) => (
            <div key={response.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-lg font-medium text-gray-900">{response.name}</h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      response.isActive 
                        ? "bg-green-100 text-green-800" 
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {response.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><strong>Triggers:</strong> {response.triggers.map(trigger => 
                      triggerOptions.find(opt => opt.value === trigger)?.label || trigger
                    ).join(", ")}</p>
                    
                    {response.subject && (
                      <p><strong>Subject:</strong> {response.subject}</p>
                    )}
                    
                    <p><strong>Content:</strong> {response.content.substring(0, 100)}
                      {response.content.length > 100 && "..."}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-xs">
                      <span>Delay: {response.delay} minutes</span>
                      <span>Used: {response.timesUsed} times</span>
                      <span>Last used: {formatLastUsed(response.lastUsed)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleToggleActive(response.id)}
                    className={`px-3 py-1 text-xs rounded ${
                      response.isActive
                        ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                        : "bg-green-100 text-green-800 hover:bg-green-200"
                    }`}
                  >
                    {response.isActive ? "Deactivate" : "Activate"}
                  </button>
                  
                  <button
                    onClick={() => handleEditResponse(response)}
                    className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                  >
                    Edit
                  </button>
                  
                  <button
                    onClick={() => handleDeleteResponse(response.id)}
                    className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-foreground">
                {editingResponse ? "Edit Auto-Response" : "Create Auto-Response"}
              </h3>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Response Name *
                </label>
                <input
                  type="text"
                  value={newResponse.name}
                  onChange={(e) => setNewResponse(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Initial Interest Response"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Triggers (select all that apply)
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md p-3">
                  {triggerOptions.map((option) => (
                    <div key={option.value} className="flex items-start">
                      <input
                        type="checkbox"
                        id={option.value}
                        checked={newResponse.triggers.includes(option.value)}
                        onChange={(e) => handleTriggerChange(option.value, e.target.checked)}
                        className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="ml-2">
                        <label htmlFor={option.value} className="text-sm font-medium text-gray-700">
                          {option.label}
                        </label>
                        <p className="text-xs text-gray-500">{option.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject (optional)
                </label>
                <input
                  type="text"
                  value={newResponse.subject}
                  onChange={(e) => setNewResponse(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="e.g., Thanks for your interest!"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message Content *
                </label>
                <textarea
                  value={newResponse.content}
                  onChange={(e) => setNewResponse(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Hi! Thanks for your interest in my item. It's still available. Let me know if you have any questions!"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  You can use variables like {"{buyer_name}"} and {"{product_title}"} (coming soon)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delay (minutes)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="1440"
                    value={newResponse.delay}
                    onChange={(e) => setNewResponse(prev => ({ ...prev, delay: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">0 = immediate response</p>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={newResponse.isActive}
                    onChange={(e) => setNewResponse(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-700">
                    Active
                  </label>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowCreateForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveResponse}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                disabled={saving}
              >
                {saving ? "Saving..." : editingResponse ? "Update Response" : "Create Response"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-900 mb-2">💡 Auto-Response Tips</h4>
        <div className="text-sm text-yellow-800 space-y-1">
          <p>• Keep responses friendly and professional</p>
          <p>• Include relevant information like availability and meetup preferences</p>
          <p>• Use delays strategically - immediate responses can seem automated</p>
          <p>• Review and update your responses regularly based on common questions</p>
          <p>• Always follow up auto-responses with personal communication when needed</p>
        </div>
      </div>
    </div>
  );
};

export default AutoResponseManager;