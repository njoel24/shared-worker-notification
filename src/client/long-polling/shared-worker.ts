let clients: any = [];
let isPolling = false;
// Function to poll the server for notifications
async function pollServer() {

  try {
    console.log("Polling server for notifications...");
    const response = await fetch("/poll?clientId=client0");
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
  isPolling = false;
}

export function startSharedWorker() {
  (self as unknown as SharedWorkerGlobalScope).onconnect = (event: any) => {
    const port = event.ports[0];
    console.log("Client connected to Shared Worker.");
    clients.push(port);
  
    // Start polling if not already active
    if (!isPolling) {
      isPolling = true;
      pollServer();
    }
  
    // Handle messages from the client
    port.onmessage = (msgEvent: any) => {
      console.log("Message received from client:", msgEvent.data);
  
      if (msgEvent.data.type === "disconnect") {
        clients = clients.filter((p: any) => p !== port);
        console.log("Client disconnected.");
      }
    };
  
    // Clean up when a port closes
    port.onclose = () => {
      clients = clients.filter((p: any) => p !== port);
      console.log("Client port closed.");
    };
  };

}
startSharedWorker();
