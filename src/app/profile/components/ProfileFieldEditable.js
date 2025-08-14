const ProfileFieldEditable = ({ label, name, value, onChange }) => (
    <div className="flex flex-col">
      <label className="font-medium text-gray-700">{label}:</label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
    </div>
  );
  
  export default ProfileFieldEditable;
  


