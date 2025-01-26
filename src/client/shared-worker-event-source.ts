let clients: any = [];
export function startSharedWorkerEventSource() {
    const eventSource = new EventSource('/events');
    eventSource.onerror = function (error) {
        console.error('EventSource failed:', error);
        eventSource.close(); // Close the connection if there is an error
    };
    
    (self as unknown as SharedWorkerGlobalScope).onconnect = (event: any) => {     
        const port = event.ports[0];
        // this createas a new listener per connection?
        eventSource.onmessage = function (event) {
            const messageData = JSON.parse(event.data);
            port.postMessage({ type: 'message', message: `Message: ${messageData.message}, Time: ${messageData.time}` });
        };       

        console.log("Client connected to Shared Worker.");
        clients.push(port);
      
        // Handle messages from the client
        port.onmessage = (msgEvent: any) => {
          const message = msgEvent.data;
          console.log("Message received from client:", message);
      
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
  

startSharedWorkerEventSource();