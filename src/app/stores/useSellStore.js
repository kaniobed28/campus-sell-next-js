import { create } from "zustand";
import { storage, db,auth } from "@/lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, addDoc } from "firebase/firestore";


const useSellStore = create((set) => ({
  formData: {
    title: "",
    description: "",
    price: "",
    category: "",
    subcategory: "",
    image: null,
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

  
addProductToFirestore: async () => {
  const { formData } = useSellStore.getState();
  const { title, description, price, category, subcategory, image } = formData;

  // Get the current authenticated user using Firebase Auth
  const currentUser = auth.currentUser;

  // Check if the user is authenticated
  if (!currentUser) {
    console.error("User is not authenticated.");
    return;
  }

  // Validate if all required fields are provided
  if (!title || !description || !price || !category || !subcategory || !image) {
    console.error("Please fill all required fields including an image.");
    return;
  }

  try {
    // Upload the image first
    const imageUrl = await useSellStore.getState().uploadImage(image);

    // Save product to Firestore
    await addDoc(collection(db, "products"), {
      title,
      description,
      price,
      category,
      subcategory,
      image: imageUrl, // Store the image URL
      userId: currentUser.uid, // Use currentUser's UID from Firebase Auth
      createdAt: new Date(), // Store the creation date
    });

    console.log("Product added successfully!");

    // Reset the form after submission
    useSellStore.getState().resetForm();
  } catch (error) {
    console.error("Error adding product to Firestore:", error);
  }
},

}));
export default useSellStore;
