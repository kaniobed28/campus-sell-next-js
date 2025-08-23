import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

async function generateProducts() {
  const products = [];
  try {
    const querySnapshot = await getDocs(collection(db, "products"));
    querySnapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() });
    });
  } catch (error) {
    console.error("Error fetching products:", error);
  }
  return products;
}

export default generateProducts;
