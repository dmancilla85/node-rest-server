const express = require('express');
const spdy = require('spdy');
const cors = require('cors');
const promMid = require('express-prometheus-middleware');
const healthcheck = require('express-healthcheck');
const fileUpload = require('express-fileupload');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const { dbConnection } = require('../database/config');
const { winstonLogger } = require('../helpers');
const swaggerDocument = require('../swagger.json');

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

    // loggers settings
    const morganFormat = process.env.NODE_ENV !== 'production' ? 'dev' : 'combined';
    const rfs = require('rotating-file-stream');
    const path = require('path');
    this.app.use(
      morgan(morganFormat, {
        stream: rfs.createStream('requests.log', {
          interval: '1d', // rotate daily
          path: path.join(__dirname, '../logs/'),
        }),
      }),
    );

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

    // swagger configuration
    this.app.use(
      '/api/docs',
      swaggerUi.serve,
      swaggerUi.setup(swaggerDocument),
    );

    // metrics configuration
    this.app.use(
      promMid({
        metricsPath: '/api/metrics',
        collectDefaultMetrics: true,
        requestDurationBuckets: [0.1, 0.5, 1, 1.5],
        requestLengthBuckets: [512, 1024, 5120, 10240, 51200, 102400],
        responseLengthBuckets: [512, 1024, 5120, 10240, 51200, 102400],
        prefix: 'node_rest_',
      }),
    );

    // healthchecks
    this.app.use('/api/health', healthcheck());

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
    const options = {
      key: fs.readFileSync('./server.key'),
      cert: fs.readFileSync('./server.crt'),
      spdy: {
        protocols: ['h2', 'http/1.1'],
      },
    };

    winstonLogger.info(`Current environment is ${process.env.NODE_ENV}`);
    winstonLogger.info(`Started logging with level: ${process.env.LOG_LEVEL}`);

    if (process.env.PROTOCOL === 'https') {
      spdy.createServer(options, this.app).listen(this.port, () => {
        winstonLogger.info(
          `Example app listening at https://localhost:${process.env.PORT}`,
        );
      });
    } else {
      this.app.listen(this.port, () => {
        winstonLogger.info(
          `Example app listening at http://localhost:${process.env.PORT}`,
        );

        winstonLogger.info(`Check the OpenApi especification at http://localhost:${process.env.PORT}/api/docs`);
      });
    }
  }
}

module.exports = Server;
