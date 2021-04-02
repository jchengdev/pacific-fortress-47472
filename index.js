const http = require('http');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const errorHandler = require('./handlers/error');
const authRoutes = require('./routes/auth');
const messagesRoutes = require('./routes/messages');
const { loginRequired, ensureCorrectUser } = require('./middleware/auth');
const db = require('./models');

const app = express();
const PORT = process.env.PORT || 8081;

app.use(cors());
app.use(bodyParser.json());

app.use('/api/auth', authRoutes);
app.use(
  '/api/users/:id/messages',
  loginRequired,
  ensureCorrectUser,
  messagesRoutes
);

app.get('/api/messages', loginRequired, async function (req, res, next) {
  try {
    let messages = await db.Message.find()
      .sort({ createdAt: 'desc' })
      .populate('user', {
        username: true,
        profileImageUrl: true,
      });
    console.log(messages);
    return res.status(200).json(messages);
  } catch (err) {
    return next(err);
  }
});

//DEVELOPER NOTES PAGE
app.get('/about', function (req, res, next) {
  res.sendFile(path.join(__dirname + '/about.html'));
});
app.get('/', function (req, res, next) {
  res.sendFile(path.join(__dirname + '/help.html'));
});

// **useful error scenario handling
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// **useful error scenario handling
app.use(errorHandler);

const server = http.createServer(app);
server.listen(PORT, () => {
  console.log(`Server is starting on port ${PORT}`);
});

// quit on ctrl-c when running docker in terminal
process.on('SIGINT', function onSigint() {
  console.info('Got SIGINT. Graceful shutdown ', new Date().toISOString());
  shutdown();
});

// quit properly on docker stop
process.on('SIGTERM', function onSigterm() {
  console.info('Got SIGTERM. Graceful shutdown ', new Date().toISOString());
  shutdown();
});

// shut down server
function shutdown() {
  // NOTE: server.close is for express based apps
  // If using hapi, use `server.stop`
  server.close(function onServerClosed(err) {
    if (err) {
      console.error(err);
      process.exitCode = 1;
    }
    process.exit();
  });
}
