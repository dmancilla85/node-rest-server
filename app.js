require('dotenv').config();
const Server = require('./models/server');

const server = new Server();

server.listen();

// testing
module.exports = { app: server.app };
