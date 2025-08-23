// src/components/Spinner.js
const Spinner = ({ message }) => (
    <div className="text-center py-24">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      {message && <p className="mt-4">{message}</p>}
    </div>
  );
  
  export default Spinner;