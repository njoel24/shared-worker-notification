// worker.js
import { CometD } from 'cometd';

declare const self: SharedWorkerGlobalScope;

const cometd = new CometD();
cometd.configure({
    url: 'https://example.com/cometd',
    logLevel: 'info',
    useWorkerScheduler: true
});

// Handle handshake
cometd.handshake((handshakeReply) => {
    if (handshakeReply.successful) {
        console.log('CometD handshake successful in the shared worker');
    } else {
        console.error('CometD handshake failed', handshakeReply);
    }
});

cometd.addListener("/call", (message) => {
  // Your message handling here.
  console.log(`message ${message}`)
});

// Set up the Shared Worker connection
self.onconnect = (event) => {
    const port = event.ports[0];

    port.onmessage = (messageEvent) => {
        const { type, data } = messageEvent.data;

        if (type === 'subscribe') {
            // Subscribe to a channel
            console.log(`tab has requested to be subscribed to comet channel ${JSON.stringify(data.channel)}`)
            cometd.subscribe(data.channel, (message) => {
              port.postMessage({ type: 'message', channel: data.channel, message });
            });
        } else if (type === 'publish') {
            // Publish a message to a channel
            console.log(`tab has requested to publish a message ${JSON.stringify(data.message)} to channel ${JSON.stringify(data.channel)}`)
            cometd.publish(data.channel, data.message);
        } else if (type === 'disconnect') {
            // Disconnect from CometD
            cometd.disconnect();
        }
    };

    // Notify the client that the worker is ready
    port.postMessage({ type: 'ready' });
};
