import { useState, useEffect } from "react";

const timeNow = () => Date.now();

export default function useNow() {
  const [now, setNow] = useState(timeNow);
  useEffect(() => {
    const id = setInterval(() => setNow(timeNow()), 1000);
    return () => clearInterval(id);
  }, []);
  return new Date(now);
}