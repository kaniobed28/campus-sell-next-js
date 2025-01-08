"use client";
import React, { useEffect } from "react";
import useProfileStore from "../stores/useProfileStore";
import ProfileField from "./components/ProfileField";
import ProfileFieldEditable from "./components/ProfileFieldEditable";
import ProfileAvatar from "./components/ProfileAvatar";

const ProfilePage = () => {
  const {
    authUser,
    userDetails,
    formData,
    loading,
    editMode,
    setEditMode,
    fetchUser,
    updateProfile,
    handleInputChange,
  } = useProfileStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  if (loading) {
    return <p className="text-center text-gray-500 mt-10">Loading profile...</p>;
  }

  if (!authUser) {
    return (
      <p className="text-center text-red-500 mt-10">
        You are not logged in. Please log in to view your profile.
      </p>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto max-w-4xl p-6 bg-white rounded-lg shadow-lg">
        <ProfileAvatar src={authUser.photoURL || userDetails?.avatar} />
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          {editMode ? (
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          ) : (
            userDetails?.name || "No Name Provided"
          )}
        </h1>
        <div className="space-y-4">
          {editMode ? (
            <>
              <ProfileFieldEditable
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
              />
              <ProfileFieldEditable
                label="University"
                name="university"
                value={formData.university}
                onChange={handleInputChange}
              />
            </>
          ) : (
            <>
              <ProfileField label="Phone" value={userDetails?.phone || "N/A"} />
              <ProfileField label="University" value={userDetails?.university || "N/A"} />
            </>
          )}
        </div>
        <div className="mt-6 text-center">
          {editMode ? (
            <div className="flex justify-center gap-4">
              <button
                onClick={updateProfile}
                className="px-6 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition"
              >
                Save
              </button>
              <button
                onClick={() => setEditMode(false)}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditMode(true)}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
