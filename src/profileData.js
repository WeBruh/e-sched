export const emptyProfile = { name: "", studentId: "", photo: "" };

export const cleanProfile = (f) => ({
  name: (f.name || "").trim(),
  studentId: (f.studentId || "").trim(),
  photo: f.photo || "",
});
