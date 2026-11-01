// Full-screen green / red water flash. tone: "green" | "red"
export function flash(tone, text) {
  window.dispatchEvent(new CustomEvent("esched-flash", { detail: { tone, text } }));
}
