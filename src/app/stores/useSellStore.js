import { create } from "zustand";
import { storage, db } from "@/lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, addDoc } from "firebase/firestore";

const useSellStore = create((set) => ({
  formData: {
    title: "",
    description: "",
    price: "",
    category: "",
    subcategory: "",
    image: [], // Array for multiple files
  },
  subcategories: [],
  uploadProgress: 0,
  isSubmitting: false,
  categories: {
    Electronics: ["Mobile Phones", "Laptops", "Cameras", "Others"],
    Fashion: ["Clothing", "Shoes", "Accessories", "Others"],
    Home: ["Furniture", "Kitchen Appliances", "Decor", "Others"],
    Services: ["Education", "Repair", "Transportation", "Others"],
    Others: [],
  },

  setFormData: (name, value) =>
    set((state) => ({
      formData: { ...state.formData, [name]: value },
    })),
  setSubcategories: (category) =>
    set((state) => ({
      subcategories: state.categories[category] || [],
      formData: { ...state.formData, subcategory: "" },
    })),
  setImage: (images) =>
    set((state) => ({
      formData: { ...state.formData, image: images }, // Replace array
    })),
  setUploadProgress: (progress) => set({ uploadProgress: progress }),
  setIsSubmitting: (isSubmitting) => set({ isSubmitting }),
  resetForm: () =>
    set({
      formData: {
        title: "",
        description: "",
        price: "",
        category: "",
        subcategory: "",
        image: [],
      },
      uploadProgress: 0,
      isSubmitting: false,
    }),

  uploadImage: async (images) => {
    if (!images || images.length === 0) return [];

    const uploadPromises = images.map((image, index) => {
      const imageRef = ref(storage, `products/${Date.now()}_${index}_${image.name}`); // Unique name
      const uploadTask = uploadBytesResumable(imageRef, image);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            );
            set({ uploadProgress: progress }); // Note: This updates for each file
          },
          (error) => reject(error),
          async () => {
            const imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(imageUrl);
          }
        );
      });
    });

    const imageUrls = await Promise.all(uploadPromises);
    set({ uploadProgress: 0 });
    return imageUrls;
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