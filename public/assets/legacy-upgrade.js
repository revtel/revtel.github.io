// Only update an existing Gatsby root registration. New visitors get no worker.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      const worker = registration.active || registration.waiting || registration.installing;
      if (registration.scope === `${location.origin}/` && worker &&
          new URL(worker.scriptURL).pathname === '/sw.js') {
        registration.update().catch(() => {}); // Offline visitors can retry on their next visit.
      }
    }
  }).catch(() => {});
}
