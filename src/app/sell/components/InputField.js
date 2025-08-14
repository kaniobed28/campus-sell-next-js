const InputField = ({ label, id, name, value, onChange, type = "text", required = false }) => (
  <div className="mb-4">
    <label htmlFor={id} className="form-label mb-2 block">
      {label}
      {required && <span className="text-destructive ml-1">*</span>}
    </label>
    <input
      type={type}
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="input-base w-full px-4 py-2 rounded-lg focus-ring"
    />
  </div>
);

export default InputField;
  



<<<<<<< HEAD

=======
>>>>>>> 9729b63 (bug space added 2 time)
