import { create } from "zustand";
import { storage, db } from "@/lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, addDoc } from "firebase/firestore";
import universities from "../data/universities"; // importing universities

const useSellStore = create((set) => ({
  formData: {
    title: "",
    description: "",
    price: "",
    category: "",
    subcategory: "",
    universities: [],  // stores selected universities
    image: null,
  },
  subcategories: [],
  universities: universities, // list of universities
  uploadProgress: 0,
  isSubmitting: false,
  categories: {
    Electronics: ["Mobile Phones", "Laptops", "Cameras", "Others"],
    Fashion: ["Clothing", "Shoes", "Accessories", "Others"],
    Home: ["Furniture", "Kitchen Appliances", "Decor", "Others"],
    Services: ["Education", "Repair", "Transportation", "Others"],
    Others: [],
  },

  // State handlers
  setFormData: (name, value) =>
    set((state) => ({
      formData: { ...state.formData, [name]: value },
    })),
  setSubcategories: (category) =>
    set((state) => ({
      subcategories: state.categories[category] || [],
      formData: { ...state.formData, subcategory: "" },
    })),
  setImage: (image) =>
    set((state) => ({
      formData: { ...state.formData, image },
    })),
  setUploadProgress: (progress) =>
    set({
      uploadProgress: progress,
    }),
  setIsSubmitting: (isSubmitting) =>
    set({
      isSubmitting,
    }),
  resetForm: () =>
    set({
      formData: {
        title: "",
        description: "",
        price: "",
        category: "",
        subcategory: "",
        universities: [], // Reset universities
        image: null,
      },
      uploadProgress: 0,
      isSubmitting: false,
    }),

  // Firebase operations
  uploadImage: async (image) => {
    return new Promise((resolve, reject) => {
      const imageRef = ref(storage, `products/${image.name}`);
      const uploadTask = uploadBytesResumable(imageRef, image);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          set({ uploadProgress: progress });
        },
        (error) => {
          console.error("Error uploading image:", error);
          reject(error);
        },
        async () => {
          const imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(imageUrl);
        }
      );
    });
  },

  addProductToFirestore: async (productData) => {
    try {
      await addDoc(collection(db, "products"), {
        ...productData,
        createdAt: new Date(),
      });
    } catch (error) {
      console.error("Error adding product to Firestore:", error);
      throw error;
    }
  },
}));

export default useSellStore;
