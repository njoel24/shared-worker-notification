const clients: any = [];
let eventSource: any = undefined;
function startWorker() {
  (self as unknown as SharedWorkerGlobalScope).onconnect = async (event: any) => {    
      console.log("Client connected to Shared Worker.");
      const port = event.ports[0];

      // add client to subscribers
      clients.push(port);
      port.postMessage({ type: 'status', channel: 'worker', message: `Ready` });
    
      // Handle messages from the client
      port.onmessage = (msgEvent: any) => {
        const {message: clientId, type, channel} = msgEvent.data;
        console.log("Message received from client:", clientId);
        if( type === 'subscribe') {
          handleSubscribe(port, clientId);
         
        } else if (type === 'unsubscribe') {
          handleUnsubscribe(port, clientId)
        }

      };

      port.start();
    };    
    
}

function handleSubscribe(port: any, clientId: any) {
  if(eventSource){
    return;
  }
  eventSource = new EventSource(`http://localhost:3000/events?clientId=${clientId}`);
  
  eventSource.onmessage = function (event: any) {
    const messageData = JSON.parse(event.data);
    port.postMessage({ type: 'notification', channel: 'server', message: `Message: ${messageData.message}, Time: ${messageData.time}` });
  };    
  
  let reconnectTimeout: any= null;
  
  eventSource.onerror = () => {
      console.log('Connection lost, waiting to see if it recovers...');
  
      // Wait for a few seconds before manually restarting
      if (!reconnectTimeout) {
          reconnectTimeout = setTimeout(() => {
              console.log('Still disconnected, manually reconnecting...');
              eventSource?.close();
              eventSource = new EventSource('/events');
              reconnectTimeout = null; // Reset the timeout
          }, 5000); // Adjust delay if needed
      }
  };
  
  eventSource.onopen = () => {
      console.log('Connected to server.');
      clearTimeout(reconnectTimeout); // Cancel manual reconnection if automatic recovery happens
      reconnectTimeout = null;
  };
  
}

function handleUnsubscribe(port: any, clientId: any) {
  const index = clients.indexOf(port);
  if (index !== -1) {
    clients.splice(index, 1);
  }

  // If this was the last tab, send a request before worker dies
  if (clients.length === 0) {
    sendBeforeUnloadRequest(clientId);
    closeEventSource();
  }
}

function sendBeforeUnloadRequest(clientId: any) {
  fetch(`http://localhost:3000/unsubscribe?clientId=${clientId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  }).catch((err) => console.error("Cleanup request failed:", err));
}

// Close EventSource properly
function closeEventSource() {
  if (eventSource) {
    eventSource.close();
    eventSource = null;
  }
}

startWorker();