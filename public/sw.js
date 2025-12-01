// public/sw.js

self.addEventListener("push", function (event) {
  const data = event.data ? event.data.json() : {};

  const title = data.title || "Yeni sipariş";
  const options = {
    body: data.body || "",
    icon: "/notification-bell.png",
    data: data.url || "/", // tıklandığında açılacak URL
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  const urlToOpen = event.notification.data || "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === urlToOpen && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});
