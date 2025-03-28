const QuantityModal = ({ isOpen, productName, quantity, setQuantity, onConfirm, onClose, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full transform transition-all scale-95 hover:scale-100">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Add to Cart</h3>
        <p className="text-gray-600 mb-6">How many &quot;{productName}&quot; would you like to add?</p>
        
        <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
          <button
            onClick={() => setQuantity(quantity > 1 ? quantity - 1 : 1)}
            className="w-12 h-12 bg-gray-200 hover:bg-gray-300 transition-colors flex items-center justify-center text-lg text-gray-600"
          >
            -
          </button>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            className="w-full p-3 text-xl text-center border-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="w-12 h-12 bg-gray-200 hover:bg-gray-300 transition-colors flex items-center justify-center text-lg text-gray-600"
          >
            +
          </button>
        </div>

        <div className="flex justify-between items-center mt-6">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition transform ${
              isLoading ? "opacity-75 cursor-not-allowed" : "hover:scale-105"
            }`}
          >
            {isLoading ? "Adding..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuantityModal;
