import { useEffect, useRef, useState } from "react";
import { useI18n } from "./i18n";
import { deleteCustomWallpaper, listCustomWallpapers, saveCustomWallpaper } from "./customWallpapers";
import { WALLPAPERS } from "./wallpapers";

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/bmp"]);
const VIDEO_TYPES = new Set(["video/mp4", "video/webm"]);

function WallpaperTile({ wallpaper, selected, onSelect, onDelete, preview, t }) {
  const type = wallpaper?.type;
  return (
    <div className={`wallpaper-tile ${selected ? "selected" : ""}`}>
      <button type="button" className="wallpaper-tile-select" aria-pressed={selected} onClick={onSelect}>
        <span className="wallpaper-preview">
          {wallpaper ? (
            type === "image" ? (
              <img src={preview || wallpaper.src} alt="" loading="lazy" />
            ) : type === "spider" ? (
              <span className="spider-wallpaper spider-wallpaper-preview" aria-hidden="true">
                <span className="spider-swing"><span className="spider-bob"><span className="spider-figure"><span className="spider-thread" /><span className="spider-art" /></span></span></span>
              </span>
            ) : (
              <video src={preview || wallpaper.src} autoPlay muted loop playsInline preload="metadata" />
            )
          ) : (
            <span className="wallpaper-none-preview">{t("No wallpaper")}</span>
          )}
        </span>
        <span className="wallpaper-tile-label">
          <span>{wallpaper ? (wallpaper.custom ? wallpaper.name : t(wallpaper.label.replace(" (live)", ""))) : t("No wallpaper")}</span>
          {selected && <span className="wallpaper-selected-mark">{t("Selected")}</span>}
        </span>
      </button>
      {onDelete && <button type="button" className="wallpaper-delete" onClick={onDelete}>{t("Remove")}</button>}
    </div>
  );
}

export default function WallpaperPicker({ settings, setSettings }) {
  const { t } = useI18n();
  const [custom, setCustom] = useState([]);
  const [previews, setPreviews] = useState({});
  const previewUrls = useRef({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const selected = settings.wallpaper ?? "spider";
  const select = (wallpaper) => setSettings({ ...settings, wallpaper });
  const videos = WALLPAPERS.filter((item) => item.type === "video" || item.type === "spider");
  const images = WALLPAPERS.filter((item) => item.type === "image");

  async function refreshCustom() {
    const saved = await listCustomWallpapers();
    const nextPreviews = Object.fromEntries(saved.map((item) => [item.id, URL.createObjectURL(item.blob)]));
    Object.values(previewUrls.current).forEach(URL.revokeObjectURL);
    previewUrls.current = nextPreviews;
    setPreviews(nextPreviews);
    setCustom(saved);
  }

  useEffect(() => {
    let active = true;
    listCustomWallpapers()
      .then((saved) => {
        if (!active) return;
        const nextPreviews = Object.fromEntries(saved.map((item) => [item.id, URL.createObjectURL(item.blob)]));
        previewUrls.current = nextPreviews;
        setPreviews(nextPreviews);
        setCustom(saved);
      })
      .catch((cause) => {
        if (active) setError(cause instanceof Error ? cause.message : t("Could not load your wallpapers."));
      });
    return () => {
      active = false;
      Object.values(previewUrls.current).forEach(URL.revokeObjectURL);
      previewUrls.current = {};
    };
  }, [t]);

  async function addWallpaper(event, type) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;
    setError("");
    const allowed = type === "image" ? IMAGE_TYPES : VIDEO_TYPES;
    if (!allowed.has(file.type)) {
      setError(type === "image" ? t("Choose a JPG, PNG, GIF, WebP, or BMP image.") : t("Choose an MP4 or WebM video."));
      return;
    }

    setBusy(true);
    try {
      const id = `custom-${crypto.randomUUID()}`;
      await saveCustomWallpaper({ id, name: file.name, type, blob: file });
      await refreshCustom();
      select(id);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t("Could not save this wallpaper."));
    } finally {
      setBusy(false);
    }
  }

  async function removeWallpaper(id) {
    setError("");
    try {
      await deleteCustomWallpaper(id);
      if (selected === id) select("none");
      await refreshCustom();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t("Could not remove this wallpaper."));
    }
  }

  function uploadControl(type) {
    return (
      <label className={`wallpaper-upload ${busy ? "disabled" : ""}`}>
        {t(type === "image" ? "Add your own still wallpaper" : "Add your own live wallpaper")}
        <input
          type="file"
          accept={type === "image" ? "image/jpeg,image/png,image/webp,image/gif,image/bmp" : "video/mp4,video/webm"}
          disabled={busy}
          onChange={(event) => addWallpaper(event, type)}
        />
      </label>
    );
  }

  const customImages = custom.filter((item) => item.type === "image");
  const customVideos = custom.filter((item) => item.type === "video");

  return (
    <div className="wallpaper-picker">
      <p className="note">{t("Wallpapers are centered and dimmed so text stays readable.")}</p>
      {error && <div className="msg" role="alert">{error}</div>}
      <div className="wallpaper-none-choice">
        <WallpaperTile
          selected={selected === "none"}
          onSelect={() => select("none")}
          t={t}
        />
      </div>
      <section className="wallpaper-group" aria-labelledby="wallpaper-live-heading">
        <h3 id="wallpaper-live-heading">{t("Live wallpapers")}</h3>
        <div className="wallpaper-grid">
          {videos.map((wallpaper) => (
            <WallpaperTile
              key={wallpaper.id}
              wallpaper={wallpaper}
              selected={selected === wallpaper.id}
              onSelect={() => select(wallpaper.id)}
              t={t}
            />
          ))}
          {customVideos.map((wallpaper) => (
            <WallpaperTile
              key={wallpaper.id}
              wallpaper={{ ...wallpaper, custom: true }}
              preview={previews[wallpaper.id]}
              selected={selected === wallpaper.id}
              onSelect={() => select(wallpaper.id)}
              onDelete={() => removeWallpaper(wallpaper.id)}
              t={t}
            />
          ))}
        </div>
        {uploadControl("video")}
      </section>
      <section className="wallpaper-group" aria-labelledby="wallpaper-still-heading">
        <h3 id="wallpaper-still-heading">{t("Still wallpapers")}</h3>
        <div className="wallpaper-grid">
          {images.map((wallpaper) => (
            <WallpaperTile
              key={wallpaper.id}
              wallpaper={wallpaper}
              selected={selected === wallpaper.id}
              onSelect={() => select(wallpaper.id)}
              t={t}
            />
          ))}
          {customImages.map((wallpaper) => (
            <WallpaperTile
              key={wallpaper.id}
              wallpaper={{ ...wallpaper, custom: true }}
              preview={previews[wallpaper.id]}
              selected={selected === wallpaper.id}
              onSelect={() => select(wallpaper.id)}
              onDelete={() => removeWallpaper(wallpaper.id)}
              t={t}
            />
          ))}
        </div>
        {uploadControl("image")}
      </section>
    </div>
  );
}
