const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(server);

  io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('message', async (data) => {
      const { text, mode, model } = data;
      // Process the message using the AI model
      const response = await processMessage(text, mode, model);
      socket.emit('message', response);
    });

    socket.on('document_uploaded', (filename) => {
      console.log(`Document uploaded: ${filename}`);
      // You can add additional logic here, such as notifying the AI to use the new document
    });

    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });
  });

  server.listen(3000, (err) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:3000');
  });
});

async function processMessage(message, mode, model) {
  // Here, you would typically make an API call to your chat endpoint
  // For now, we'll just return a mock response
  return `AI (${model}) in ${mode} mode processed: ${message}`;
}