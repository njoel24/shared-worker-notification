import express from 'express';
const app = express();
const PORT = 3000;
app.use(express.json()); // Parses JSON body automatically
app.use(express.static('dist'));
let clients: any = [];

function removeClient(client: any, clientId: any) {
    return client.key !== clientId;
}

app.get('unsubscribe', (req, res) => {
    console.log('client disconnected')
    const {clientId} = req.query;
    clients = clients.filter((client:any) => removeClient(client, clientId));
    // console.log(filteredNumbers);
})

app.get('/poll', (req, res) => {
    console.log('get new client connected to notification channel');
    const { clientId } = req.query; 
    clients = clients.filter((client:any) => removeClient(client, clientId));
    clients.push({key: clientId, res});
    // Set the proper headers for SSE

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache');
     setTimeout(() => {
        clients.forEach((client: any) => {
            client.res.send(JSON.stringify({"data": "message from server"}));
        });
    }, 15000);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
