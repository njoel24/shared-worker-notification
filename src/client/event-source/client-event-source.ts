// main.js
export function startClientEventSource() {
    const worker = new SharedWorker('./client/event-source/shared-worker-event-source.js', {type: 'module'});
    worker.port.start();
    
    // Listen for messages from the worker
    worker.port.onmessage = async (event) => {
        const { type, channel, message } = event.data;
    
        if (type === 'status') {
            console.log(`Worker is ${message}`);
        } else if (type === 'notification') {
            console.log(`notification from ${channel}:`, message);
        }
    };
    
   setTimeout(() => {
      worker.port.postMessage({
        type: 'subscribe',
        channel: 'main-thread',
        message: 'client1',
      });
    })
    
    window.addEventListener("beforeunload", () => {
      worker.port.postMessage({type: "unsubscribe", channel: 'main-thread'}); // does not work
    });

    
    // Optional: Disconnect when done
    // worker.port.postMessage({ type: 'disconnect' });
    
  }
  