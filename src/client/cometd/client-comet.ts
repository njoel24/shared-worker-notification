// main.js
export function startClientComet() {
  const worker = new SharedWorker('./client/shared-worker-comet.js', {type: 'module'});
  worker.port.start();
  
  // Listen for messages from the worker
  worker.port.onmessage = async (event) => {
      const { type, channel, message } = event.data;
  
      if (type === 'ready') {
          console.log('Worker is ready');
      } else if (type === 'message') {
          console.log(`Message from channel ${channel}:`, message);
          if (Notification.permission === "default") {
            await Notification.requestPermission();
          }
    
          if (Notification.permission === "granted") {
            navigator.serviceWorker.ready.then((registration) => {
              registration.showNotification('title', {
                tag: `tag ${Date.now()}`,
                requireInteraction: true,
              });
            });
          } else {
            console.warn("Notifications are blocked.");
          }
      }
  };
  
  // Subscribe to a channel
  worker.port.postMessage({ type: 'subscribe', data: { channel: '/call' } });
  
 setTimeout(() => {
    worker.port.postMessage({
      type: 'publish',
      data: { channel: '/call', message: { text: 'Hello from the main thread!' } },
    });
  })
  
  
  // Optional: Disconnect when done
  // worker.port.postMessage({ type: 'disconnect' });
  
}
