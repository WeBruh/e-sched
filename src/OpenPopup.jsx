import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import "./OpenPopup.css";
import { useI18n } from "./i18n";
import { JOKES, KINDS } from "./popupJokes";

const PICS = Object.values(import.meta.glob("./popups/*.{jpg,jpeg,png,webp}", {
  eager: true,
  query: "?url",
  import: "default",
}));

const MAX_PER_DAY = 3;
const WINDOW_MS = 24 * 60 * 60 * 1000;
const RESUME_AFTER_MS = 5 * 60 * 1000;
const STORAGE_KEY = "esched_popup";

let started = false;

function readState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return {
      start: Number(saved.start) || 0,
      count: Number(saved.count) || 0,
      last: Number.isInteger(saved.last) ? saved.last : -1,
      joke: Number.isInteger(saved.joke) ? saved.joke : -1,
    };
  } catch {
    return { start: 0, count: 0, last: -1, joke: -1 };
  }
}

function chooseDifferent(count, previous) {
  let index;
  do {
    index = Math.floor(Math.random() * count);
  } while (index === previous && count > 1);
  return index;
}

function choosePopup() {
  if (PICS.length === 0) return null;
  const state = readState();
  const newWindow = !state.start || Date.now() - state.start >= WINDOW_MS;
  if (!newWindow && state.count >= MAX_PER_DAY) return null;

  return {
    picture: chooseDifferent(PICS.length, state.last),
    joke: JOKES.length ? chooseDifferent(JOKES.length, state.joke) : -1,
  };
}

function recordPopup(picture, joke) {
  const state = readState();
  const now = Date.now();
  const newWindow = !state.start || now - state.start >= WINDOW_MS;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      start: newWindow ? now : state.start,
      count: (newWindow ? 0 : state.count) + 1,
      last: picture,
      joke,
    }));
  } catch {
    // The popup can still be shown when browser storage is unavailable.
  }
}

export default function OpenPopup({ ready }) {
  const { t, lang } = useI18n();
  const [popup, setPopup] = useState(null);

  useEffect(() => {
    if (!ready) return undefined;
    let hiddenAt = 0;
    let active = true;

    const attempt = () => {
      const selection = choosePopup();
      if (!selection) return;
      const image = new Image();
      image.onload = () => {
        if (!active) return;
        recordPopup(selection.picture, selection.joke);
        setPopup({
          src: PICS[selection.picture],
          joke: JOKES[selection.joke] || null,
          id: Date.now(),
        });
      };
      image.src = PICS[selection.picture];
    };

    if (!started) {
      started = true;
      attempt();
    }

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        hiddenAt = Date.now();
      } else if (hiddenAt && Date.now() - hiddenAt >= RESUME_AFTER_MS) {
        hiddenAt = 0;
        attempt();
      } else {
        hiddenAt = 0;
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      active = false;
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [ready]);

  useEffect(() => {
    if (!popup) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setPopup(null);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [popup]);

  if (!popup) return null;
  const close = () => setPopup(null);
  const joke = popup.joke;
  const kind = joke ? KINDS[joke.kind] || KINDS.school : null;
  const tagalog = lang === "tl";

  return createPortal(
    <div className="op-back" key={popup.id} role="dialog" aria-modal="true" aria-label={t("Close")} onClick={close}>
      <div className="op-card" onClick={(event) => event.stopPropagation()}>
        <button className="op-image-button" type="button" aria-label={t("Close")} onClick={close}>
          <img className="op-img" src={popup.src} alt="" />
        </button>
        {joke && (
          <div className="op-joke">
            <span className="op-tag" style={{ background: kind.color }}>
              {tagalog ? kind.tl : kind.en}
            </span>
            <p>{tagalog ? joke.tl : joke.en}</p>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
