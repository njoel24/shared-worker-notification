
function startWorker() {
  (self as unknown as SharedWorkerGlobalScope).onconnect = async (event: any) => {    
      console.log("Client connected to Shared Worker.");
      const port = event.ports[0];

      port.postMessage({ type: 'status', channel: 'worker', message: `Ready` });
    
      // Handle messages from the client
      port.onmessage = (msgEvent: any) => {
        const {message: clientId, type, channel} = msgEvent.data;
        console.log("Message received from client:", clientId);
        if( type === 'subscribe') {
          let eventSource = new EventSource(`http://localhost:3000/events?clientId=${clientId}`);
          
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

      };


    
      // this event does not work
      port.onclose = () => {
        console.log("Client port closed.");
      };

      port.start();
    };    
    
}

startWorker();