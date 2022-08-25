const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const morgan = require('morgan');
const { dbConnection } = require('../database/config');
const myLogger = require('../middlewares/logger');

class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT;

    this.paths = {
      users: '/api/users',
      auth: '/api/auth',
      categories: '/api/categories',
      products: '/api/products',
      search: '/api/search',
      uploads: '/api/uploads',
    };

    // log settings
    const morganFormat = process.env.NODE_ENV !== 'production' ? 'dev' : 'combined';

    this.app.use(
      morgan(morganFormat, {
        skip(req, res) {
          return res.statusCode < 400;
        },
        stream: process.stderr,
      }),
    );

    this.app.use(
      morgan(morganFormat, {
        skip(req, res) {
          return res.statusCode >= 400;
        },
        stream: process.stdout,
      }),
    );

    // conectar a mongoDb
    Server.conectarDB();

    // middlewares
    this.middlewares();

    // rutas
    this.routes();
  }

  static async conectarDB() {
    await dbConnection();
  }

  middlewares() {
    // cors
    this.app.use(cors());

    // lectura y parseo de json
    this.app.use(express.json());

    // directorio público
    this.app.use(express.static('public'));

    // uploads
    this.app.use(
      fileUpload({
        useTempFiles: true,
        tempFileDir: '/tmp/',
        createParentPath: true,
      }),
    );
  }

  routes() {
    this.app.use(this.paths.auth, require('../routes/auth'));
    this.app.use(this.paths.users, require('../routes/users'));
    this.app.use(this.paths.categories, require('../routes/categories'));
    this.app.use(this.paths.products, require('../routes/products'));
    this.app.use(this.paths.search, require('../routes/search'));
    this.app.use(this.paths.uploads, require('../routes/uploads'));
  }

  listen() {
    this.app.listen(this.port, () => {
      myLogger.info(`Example app listening at http/localhost:${this.port}`);
    });
  }
}

module.exports = Server;
