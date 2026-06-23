export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;

  const result = await Notification.requestPermission();
  return result === "granted";
}

export function scheduleWaterReminder() {
  if (!("Notification" in window) || Notification.permission !== "granted") return;

  const key = "mornprep_last_water";
  const interval = 2 * 60 * 60 * 1000; // 2 hours

  function check() {
    const last = localStorage.getItem(key);
    if (!last) return;

    const elapsed = Date.now() - parseInt(last);
    if (elapsed >= interval) {
      new Notification("MoRNPrep - Water Reminder", {
        body: "It's been 2 hours! Time to hydrate 💧",
        icon: "/icons/icon-192.svg",
        tag: "water-reminder",
      });
    }
  }

  setInterval(check, 5 * 60 * 1000); // check every 5 minutes
  check();
}

export function updateLastWaterTime() {
  localStorage.setItem("mornprep_last_water", Date.now().toString());
}

export function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }
}
