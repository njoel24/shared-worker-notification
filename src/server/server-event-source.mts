import express from 'express'
const app = express();
const PORT = 3000;

// Serve static files like HTML from the 'public' folder
app.use(express.static('dist'));

// Endpoint that sends SSE
app.get('/events', (req, res) => {
    // Set the proper headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders(); // Flush headers to establish SSE connection

    // Send events every 5 seconds
    const interval = setInterval(() => {
        res.write(`data: ${JSON.stringify({ message: 'Hello from server!', time: new Date().toLocaleTimeString() })}\n\n`);
    }, 5000);

    // Clear interval when the client disconnects
    req.on('close', () => {
        clearInterval(interval);
        res.end();
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
