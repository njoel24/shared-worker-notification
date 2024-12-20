if (window.SharedWorker) {
    // Connect to the Shared Worker
    const worker = new SharedWorker("shared-worker.js");
    worker.port.start();
  
    console.log("Connected to Shared Worker.");
  
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
          new Notification(title, {
            body: body,
            icon: "/icon.png", // Optional: add an icon
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
  