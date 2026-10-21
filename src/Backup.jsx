export default function Backup({ subjects, classes, attendance, tasks, setSubjects, setClasses, setAttendance, setTasks }) {
  function handleExport() {
    JSON.stringify({ subjects, classes, attendance, tasks }, null, 2)
    const data = JSON.stringify({ subjects, classes, attendance }, null, 2);
    const url = URL.createObjectURL(new Blob([data], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `e-sched-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!Array.isArray(data.subjects) || !Array.isArray(data.classes) || typeof data.attendance !== "object") {
          throw new Error("bad file");
        }
        if (!confirm("This replaces all current data. Continue?")) return;
        setSubjects(data.subjects);
        setClasses(data.classes);
        setAttendance(data.attendance);
        setTasks(Array.isArray(data.tasks) ? data.tasks : []);
      } catch {
        alert("That file isn't a valid E-Sched backup.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  return (
    <div className="card">
      <strong>Backup</strong>
      <div>
        <button onClick={handleExport}>Export data</button>
        <label className="file-btn">
          Import data
          <input type="file" accept="application/json" onChange={handleImport} hidden />
        </label>
      </div>
    </div>
  );
}