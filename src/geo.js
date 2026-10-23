export function getPosition(t) {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error(t("Location isn't supported on this device.")));
    navigator.geolocation.getCurrentPosition(
      resolve,
      () => reject(new Error(t("Couldn't get your location. Allow location access and try again."))),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  });
}
