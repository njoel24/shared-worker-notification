import express from 'express';
const app = express();
const port = 3000;

// Serve static files (client, shared worker)
app.use(express.static("dist"));

// Polling endpoint: sends a notification after a delay
let notificationId = 0;

app.get("/poll", (req, res) => {
  // Simulate a notification message
  setTimeout(() => {
    notificationId++;
    res.json({
      title: "New Notification",
      body: `This is notification #${notificationId}`,
    });
  }, 10000); // Simulate a 3-second server delay
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
