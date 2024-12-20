self.addEventListener("notificationclick", (event) => {
    console.log("Notification clicked:", event);
  
    // Handle notification actions
    if (event.action === "open_tab") {
      // Open a new tab when the action button is clicked
      event.waitUntil(
        self.clients.openWindow("http://localhost:3000") // Change to your app's URL
      );
    } else {
      // Handle general notification click (no specific action)
      event.waitUntil(
        self.clients.matchAll({ type: "window" }).then((clientList) => {
          for (const client of clientList) {
            if ("focus" in client) return client.focus();
          }
          return self.clients.openWindow("http://localhost:3000");
        })
      );
    }
  
    // Close the notification
    event.notification.close();
  });
  