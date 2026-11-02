export const emptyProfile = { name: "", studentId: "", age: "", email: "", facebook: "", instagram: "", tiktok: "", photo: "" };

export const cleanProfile = (f) => ({ ...f, name: f.name.trim(), studentId: f.studentId.trim() });
