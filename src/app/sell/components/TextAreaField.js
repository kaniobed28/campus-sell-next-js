const TextAreaField = ({ label, id, name, value, onChange, required = false }) => (
  <div className="mb-4">
    <label htmlFor={id} className="form-label mb-2 block">
      {label}
      {required && <span className="text-destructive ml-1">*</span>}
    </label>
    <textarea
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      rows={4}
      className="input-base w-full px-4 py-2 rounded-lg focus-ring resize-vertical min-h-[100px]"
      placeholder={`Enter ${label.toLowerCase()}...`}
    />
  </div>
);

export default TextAreaField;
  



