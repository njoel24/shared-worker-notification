export function startClient() {
  if (window.SharedWorker) {
    // Connect to the Shared Worker
    const worker = new SharedWorker('./client/long-polling/shared-worker.js', {type: 'module'});
    worker.port.start();
  
    console.log("Connected to Shared Worker.");
  
    // Listen for messages from the shared worker
    worker.port.onmessage = async (event) => {
      if (event.data && event.data.type === "notification") {
        console.log("Notification received:", event.data);
      }
    };
  
    // Cleanup on tab close
    window.addEventListener("beforeunload", () => {
      worker.port.postMessage({ type: "disconnect" });
    });
  } else {
    console.error("Shared Workers are not supported in this browser.");
  }
}

