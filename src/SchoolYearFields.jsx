import { useT } from "./i18n";

export default function SchoolYearFields({ start, end, onChange }) {
  const t = useT();
  return (
    <>
      <label className="field">
        <span>{t("School year starts")} <em>*</em></span>
        <input type="date" style={{ colorScheme: "dark" }} value={start || ""} onChange={(e) => onChange({ start: e.target.value, end })} />
      </label>
      <label className="field">
        <span>{t("School year ends")} <em>*</em></span>
        <input type="date" style={{ colorScheme: "dark" }} value={end || ""} onChange={(e) => onChange({ start, end: e.target.value })} />
      </label>
    </>
  );
}
