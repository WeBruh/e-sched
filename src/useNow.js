import { useState, useEffect } from "react";

const timeNow = () => Date.now();

export default function useNow(interval = 1000) {
  const [now, setNow] = useState(timeNow);
  useEffect(() => {
    const id = setInterval(() => setNow(timeNow()), interval);
    return () => clearInterval(id);
  }, [interval]);
  return new Date(now);
}