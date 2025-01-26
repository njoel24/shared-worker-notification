// server.js
import * as cometd from "cometd-nodejs-server";
import express from "express";
const port = 3000;

// Create the CometD server instance.
const cometdServer = cometd.createCometDServer();

const channel = cometdServer.createServerChannel("/call");

// Add a listener to be notified when a message arrives on the channel.
channel.addListener("message", function(from, channel, message, callback) {
    // Your message handling here.
    console.log(`message ${JSON.stringify(message)} reached the server on channel ${JSON.stringify(channel)} . From is ${from} `)

    // Invoke the callback to signal that handling is complete.
    callback();
});

cometdServer.policy = {
    canHandshake: (session, message, callback) => {
        // Your handshake policy here.
        console.log('policy has been activated on the server')
        // Invoke the callback to signal the policy result. 
        callback();
    }
};

setInterval(() => {
    channel.publish(null, "hello from the server");
}, 10000)

const app = express();
app.use(express.static("dist"));
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
