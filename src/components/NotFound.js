// src/components/NotFound.js
import Link from "next/link";

const NotFound = () => (
  <div className="text-center py-24 text-red-600">
    <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
    <Link href="/" className="text-blue-600 hover:underline">
      Return to Home
    </Link>
  </div>
);

export default NotFound;