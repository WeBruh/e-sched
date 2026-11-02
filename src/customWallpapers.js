const DB_NAME = "esched-wallpapers";
const STORE_NAME = "wallpapers";
const DB_VERSION = 1;

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME, { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Could not open wallpaper storage."));
    request.onblocked = () => reject(new Error("Wallpaper storage is blocked by another open tab."));
  });
}

async function transact(mode, action) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, mode);
    const request = action(transaction.objectStore(STORE_NAME));
    let result;
    request.onsuccess = () => { result = request.result; };
    request.onerror = () => reject(request.error || new Error("Could not access saved wallpapers."));
    transaction.onabort = () => {
      db.close();
      reject(transaction.error || new Error("Wallpaper storage transaction failed."));
    };
    transaction.oncomplete = () => {
      db.close();
      resolve(result);
    };
  });
}

export function listCustomWallpapers() {
  return transact("readonly", (store) => store.getAll());
}

export function getCustomWallpaper(id) {
  return transact("readonly", (store) => store.get(id));
}

export function saveCustomWallpaper(wallpaper) {
  return transact("readwrite", (store) => store.add(wallpaper));
}

export function deleteCustomWallpaper(id) {
  return transact("readwrite", (store) => store.delete(id));
}
