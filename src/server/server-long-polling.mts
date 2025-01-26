const express = require('express');
const app = express();
const port = 3000;

let messages: any[] = [];

// Simulate generating a new message (this could be any asynchronous event in a real-world scenario)
function generateNewMessage() {
    return `New message at ${Date.now()}`;
}

// Long-polling endpoint
app.get('/poll', (req, res) => {
    const pollInterval = setInterval(() => {
        if (messages.length > 0) {
            // Send the first message and clear the message queue
            const message = messages.shift();
            res.send(message);
            clearInterval(pollInterval);  // End the polling once the message is sent
        }
    }, 1000); // Check every second for new messages

    // If the client disconnects, stop checking for messages
    req.on('close', () => {
        clearInterval(pollInterval);
    });
});

// Endpoint to simulate sending a new message
app.get('/send', (req, res) => {
    const newMessage = generateNewMessage();
    messages.push(newMessage);
    res.send(`Message sent: ${newMessage}`);
});

// Serve a basic HTML client (or you could also serve this as a static file)
app.get('/', (req, res) => {
    res.send(`
        <html>
            <body>
                <h1>Long Polling Example</h1>
                <div id="messages"></div>
                <script>
                    function poll() {
                        fetch('/poll')
                            .then(response => response.text())
                            .then(data => {
                                const messageDiv = document.getElementById('messages');
                                messageDiv.innerHTML += "<p>" + data + "</p>";
                                poll();  // Re-poll after receiving a message
                            })
                            .catch(error => {
                                console.error('Polling error:', error);
                                setTimeout(poll, 1000);  // Retry after 1 second if an error occurs
                            });
                    }
                    poll();
                </script>
            </body>
        </html>
    `);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
