require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` });
const Server = require('./models/server');

const server = new Server();

server.listen();

// testing
module.exports = { app: server.app };
