import { useEffect, useState } from "react";

// A number box you can fully clear while typing. The saved value only changes
// when the text is a real number, and it snaps back to the saved value on blur.
export default function NumberField({ value, onCommit, min = 0 }) {
  const [text, setText] = useState(String(value));
  useEffect(() => { setText(String(value)); }, [value]);

  return (
    <input
      type="number"
      inputMode="numeric"
      value={text}
      onChange={(e) => {
        const t = e.target.value;
        setText(t);
        if (t !== "" && !Number.isNaN(Number(t))) onCommit(Math.max(min, Number(t)));
      }}
      onBlur={() => setText(String(value))}
    />
  );
}
