export default function Toggle({ checked, onChange, label, hint }) {
  return (
    <label className="tog">
      <span><b>{label}</b>{hint && <small>{hint}</small>}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <i />
    </label>
  );
}
