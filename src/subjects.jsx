import { useState } from "react";

const empty = { name: "", instructor: "", room: "" };

export default function Subjects({ subjects, setSubjects }) {
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSave() {
    if (!form.name.trim()) return;
    if (editingId) {
      setSubjects(subjects.map((s) => (s.id === editingId ? { ...s, ...form } : s)));
    } else {
      setSubjects([...subjects, { id: Date.now(), ...form }]);
    }
    setForm(empty);
    setEditingId(null);
  }

  function handleEdit(s) {
    setForm({ name: s.name, instructor: s.instructor, room: s.room });
    setEditingId(s.id);
  }

  function handleDelete(id) {
    if (confirm("Delete this subject?")) {
      setSubjects(subjects.filter((s) => s.id !== id));
    }
  }

  return (
    <div>
      <div className="card">
        <input name="name" placeholder="Subject (e.g. Math 101)" value={form.name} onChange={handleChange} />
        <input name="instructor" placeholder="Instructor" value={form.instructor} onChange={handleChange} />
        <input name="room" placeholder="Room" value={form.room} onChange={handleChange} />
        <button className="primary" onClick={handleSave}>
          {editingId ? "Update subject" : "Add subject"}
        </button>
      </div>

      {subjects.length === 0 && <p>No subjects yet.</p>}

      {subjects.map((s) => (
        <div className="card" key={s.id}>
          <strong>{s.name}</strong>
          <div>{s.instructor} {s.room && `• Room ${s.room}`}</div>
          <button onClick={() => handleEdit(s)}>Edit</button>
          <button onClick={() => handleDelete(s.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}