export default function Radio({ name, checked, label, onChange }) {
  return (
    <label className="radio">
      <input type="radio" name={name} checked={checked} onChange={onChange} />
      <span className="dot" />
      <span>{label}</span>
    </label>
  );
}