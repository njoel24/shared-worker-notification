let clients = [];
let isPolling = false;

// Function to poll the server for notifications
async function pollServer() {
  while (clients.length > 0) {
    try {
      console.log("Polling server for notifications...");
      const response = await fetch("/poll");
      const data = await response.json();
      console.log("Received notification:", data);

      // Send the notification to only the first connected client
      if (clients.length > 0) {
        clients[0].postMessage({ type: "notification", payload: data });
      }
    } catch (err) {
      console.error("Error polling server:", err);
    }

    // Wait before polling again
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  isPolling = false;
}

// Handle new connections
self.onconnect = (event) => {
  const port = event.ports[0];
  console.log("Client connected to Shared Worker.");
  clients.push(port);

  // Start polling if not already active
  if (!isPolling) {
    isPolling = true;
    pollServer();
  }

  // Handle messages from the client
  port.onmessage = (msgEvent) => {
    console.log("Message received from client:", msgEvent.data);

    if (msgEvent.data.type === "disconnect") {
      clients = clients.filter((p) => p !== port);
      console.log("Client disconnected.");
    }
  };

  // Clean up when a port closes
  port.onclose = () => {
    clients = clients.filter((p) => p !== port);
    console.log("Client port closed.");
  };
};
