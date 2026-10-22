export const emptyProfile = { name: "", studentId: "", age: "", email: "", facebook: "", instagram: "", tiktok: "" };

export const cleanProfile = (f) => ({
  ...f,
  name: f.name.trim(),
  studentId: f.studentId.trim(),
});
