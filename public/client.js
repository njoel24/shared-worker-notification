if (window.SharedWorker) {
    // Connect to the Shared Worker
    const worker = new SharedWorker("shared-worker.js");
    worker.port.start();
  
    console.log("Connected to Shared Worker.");

    setTimeout(() => {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("service-worker.js").then((registration) => {
          console.log("Service Worker registered with scope:", registration.scope);
        });
      }
    }, 3000)
  
    // Listen for messages from the shared worker
    worker.port.onmessage = async (event) => {
      if (event.data && event.data.type === "notification") {
        const { title, body } = event.data.payload;
        console.log("Notification received:", title, body);
  
        // Request permission if needed and show the notification
        if (Notification.permission === "default") {
          await Notification.requestPermission();
        }
  
        if (Notification.permission === "granted") {
          navigator.serviceWorker.ready.then((registration) => {
            registration.showNotification(title, {
              body: body,
              tag: `tag ${Date.now()}`,
              requireInteraction: true,
              actions: [
                { action: "open_tab", title: "Open Tab" }
              ],
            });
          });
        } else {
          console.warn("Notifications are blocked.");
        }
      }
    };
  
    // Cleanup on tab close
    window.addEventListener("beforeunload", () => {
      worker.port.postMessage({ type: "disconnect" });
    });
  } else {
    console.error("Shared Workers are not supported in this browser.");
  }
  