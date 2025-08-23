const ProfileFieldEditable = ({ label, name, value, onChange }) => (
    <div className="flex flex-col">
      <label className="font-medium text-foreground">{label}:</label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        className="px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
      />
    </div>
  );
  
  export default ProfileFieldEditable;

