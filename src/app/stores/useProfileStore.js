import { create } from "zustand";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const useProfileStore = create((set) => ({
  authUser: null,
  userDetails: null,
  formData: { name: "", phone: "", university: "" },
  loading: true,
  editMode: false,

  setEditMode: (mode) => set({ editMode: mode }),

  fetchUser: async () => {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        set({ authUser: user });
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const data = userDoc.data();
          set({
            userDetails: data,
            formData: {
              name: data.name || "",
              phone: data.phone || "",
              university: data.university || "",
            },
            loading: false,
          });
        } else {
          console.log("User document not found. Creating a new one...");
          // Create a new document if it doesn't exist
          const defaultData = {
            name: user.displayName || "Anonymous",
            phone: "",
            university: "",
            email: user.email || "",
            createdAt: new Date(),
          };

          await setDoc(userRef, defaultData);
          set({
            userDetails: defaultData,
            formData: {
              name: defaultData.name,
              phone: defaultData.phone,
              university: defaultData.university,
            },
            loading: false,
          });
        }
      } else {
        set({ authUser: null, userDetails: null, loading: false });
      }
    });
  },

  updateProfile: async () => {
    const { authUser, formData } = useProfileStore.getState();
    if (!authUser) return;

    try {
      const userRef = doc(db, "users", authUser.uid);
      await updateDoc(userRef, formData);
      set({ userDetails: formData, editMode: false });
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    }
  },

  handleInputChange: (name, value) =>
    set((state) => ({
      formData: { ...state.formData, [name]: value },
    })),
}));

export default useProfileStore;

