const TextAreaField = ({ label, id, name, value, onChange, required = false }) => (
    <div className="mb-4">
      <label htmlFor={id} className="block text-gray-700 font-semibold mb-2">
        {label}
      </label>
      <textarea
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
      ></textarea>
    </div>
  );
  
  export default TextAreaField;
  