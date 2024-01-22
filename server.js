const express = require('express');
const cors = require('cors');
const os = require('os');
const { exec } = require('child_process');
const path = require('path');


const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    // Get system information
    const systemInfo = {
        platform: os.platform(),
        type: os.type(),
        release: os.release(),
        uptime: os.uptime(),
        totalMemory: formatBytes(os.totalmem()),
        freeMemory: formatBytes(os.freemem()),
        cpus: os.cpus(),
        networkInterfaces: os.networkInterfaces(),
        hostname: os.hostname(),
        availableParallelism: os.availableParallelism(),
        machine: os.machine(),
        userInfo: os.userInfo(),
    };

    // Generate an HTML page
    const htmlResponse = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>System Information</title>
    </head>
    <body>
      <h1>System Information</h1>
      <ul>
        <li><strong>Platform:</strong> ${systemInfo.platform}</li>
        <li><strong>Type:</strong> ${systemInfo.type}</li>
        <li><strong>Release:</strong> ${systemInfo.release}</li>
        <li><strong>Uptime:</strong> ${systemInfo.uptime} seconds</li>
        <li><strong>Total Memory:</strong> ${systemInfo.totalMemory}</li>
        <li><strong>Free Memory:</strong> ${systemInfo.freeMemory}</li>
        <li><strong>Hostname:</strong> ${systemInfo.hostname}</li>
        <li><strong>Available Parallelism:</strong> ${systemInfo.availableParallelism}</li>
        <li><strong>Machine:</strong> ${systemInfo.machine}</li>
        <li><strong>User Info:</strong> ${JSON.stringify(systemInfo.userInfo, null, 2)}</li>
      </ul>
      <h2>CPU Information</h2>
      <pre>${JSON.stringify(systemInfo.cpus, null, 2)}</pre>
      <h2>Network Interfaces</h2>
      <pre>${JSON.stringify(systemInfo.networkInterfaces, null, 2)}</pre>
    </body>
    </html>
  `;

    // Send the HTML response
    res.send(htmlResponse);
});

app.get('/cmd', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'cmd.html'));
});

app.post('/execute', (req, res) => {
  const { command } = req.body;

  if (!command) {
    return res.status(400).json({ error: 'Command is required.' });
  }

  exec(command, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ error: error.message, stderr });
    }
    res.json({ stdout, stderr });
  });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

// Function to format bytes into megabytes
function formatBytes(bytes) {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}
