const SelectField = ({ label, id, name, value, onChange, options, required = false }) => (
  <div className="mb-4">
    <label htmlFor={id} className="form-label mb-2 block">
      {label}
      {required && <span className="text-destructive ml-1">*</span>}
    </label>
    <select
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="input-base w-full px-4 py-2 rounded-lg focus-ring"
    >
      <option value="" className="text-muted-foreground">
        Select {label.toLowerCase()}
      </option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </div>
);

export default SelectField;
  



<<<<<<< HEAD

=======
>>>>>>> 9729b63 (bug space added 2 time)
