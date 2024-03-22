const fs = require('fs');
const express = require('express');
const spdy = require('spdy');
const cors = require('cors');
const healthcheck = require('express-healthcheck');
const apiMetrics = require('prometheus-api-metrics');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');

const { dbConnection } = require('../configs/mongodb');
const { winstonLogger } = require('../utils');
const swaggerDocument = require('../../swagger.json');
const { errorHandler } = require('../middlewares/error-handler');

const serverStatus = () => ({
  state: 'up',
  dbState: mongoose.STATES[mongoose.connection.readyState],
});

const limiter = rateLimit({
  windowMs: process.env.WINDOW_MINUTES * 60 * 1000, // duration in X minutes
  max: process.env.WINDOW_MAX_REQUESTS, // Limit each IP to Z requests per `window` (per X minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT;
    this.paths = {
      users: '/api/users',
      auth: '/api/auth',
      categories: '/api/categories',
      products: '/api/products',
      roles: '/api/roles',
      search: '/api/search',
      uploadsToMongo: '/api/uploads/mongo',
      uploads: '/api/uploads',
      health: '/api/health',
      swagger: '/api/docs',
      metrics: '/api/metrics',
    };

    // loggers settings
    const morganFormat =
      process.env.NODE_ENV !== 'production' ? 'dev' : 'combined';
    const rfs = require('rotating-file-stream');
    const log_path = process.env.REQUESTS_LOGS_PATH;

    this.app.use(
      morgan(morganFormat, {
        stream: rfs.createStream('requests.log', {
          interval: '1d', // rotate daily
          path: `${log_path}/`,
        }),
      })
    );

    this.app.use(
      morgan(morganFormat, {
        skip(req, res) {
          return res.statusCode < 400;
        },
        stream: process.stderr,
      })
    );

    this.app.use(
      morgan(morganFormat, {
        skip(req, res) {
          return res.statusCode >= 400;
        },
        stream: process.stdout,
      })
    );

    // swagger configuration
    this.app.use(
      this.paths.swagger,
      swaggerUi.serve,
      swaggerUi.setup(swaggerDocument)
    );

    // metrics configuration
    this.app.use(
      apiMetrics({
        metricsPath: this.paths.metrics,
        collectDefaultMetrics: true,
        durationBuckets: [0.1, 0.5, 1, 1.5],
        requestSizeBuckets: [512, 1024, 5120, 10240, 51200, 102400],
        responseSizeBuckets: [512, 1024, 5120, 10240, 51200, 102400],
        metrics_prefix: 'node_rest_',
      })
    );

    // healthchecks
    this.app.use(
      this.paths.health,
      healthcheck({
        healthy: serverStatus,
      })
    );

    // conectar a mongoDb
    Server.conectarDB();

    // middlewares
    this.middlewares();

    // rutas
    this.routes();

    // error-handling middleware
    this.app.use(errorHandler);
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

    // Apply the rate limiting middleware to all requests
    this.app.use(limiter);
  }

  routes() {
    this.app.use(this.paths.auth, require('../routes/auth'));
    this.app.use(this.paths.users, require('../routes/users'));
    this.app.use(this.paths.categories, require('../routes/categories'));
    this.app.use(this.paths.roles, require('../routes/roles'));
    this.app.use(this.paths.products, require('../routes/products'));
    this.app.use(this.paths.search, require('../routes/search'));
    this.app.use(
      this.paths.uploadsToMongo,
      require('../routes/uploads-to-mongo')
    );
    this.app.use(this.paths.uploads, require('../routes/uploads'));
  }

  listen() {
    winstonLogger.info(`The server process started with PID: ${process.pid}`);
    winstonLogger.info(`Current environment is: ${process.env.NODE_ENV}`);
    winstonLogger.info(`Started logging with level: ${process.env.LOG_LEVEL}`);

    if (process.env.PROTOCOL === 'https') {
      const http2Options = {
        key: fs.readFileSync(process.env.HTTPS_KEY_FILE),
        cert: fs.readFileSync(process.env.HTTPS_CERT_FILE),
        spdy: {
          protocols: ['h2', 'http/1.1'],
        },
      };

      spdy.createServer(http2Options, this.app).listen(this.port, () => {
        winstonLogger.info(
          `NODE Microservice app listening at https://localhost:${process.env.PORT}`
        );

        winstonLogger.info(
          `To Log In with Google, open the following link: https://localhost:${process.env.PORT}`
        );
      });
    } else {
      this.app.listen(this.port, () => {
        winstonLogger.info(
          `NODE Microservice app listening at http://localhost:${process.env.PORT}`
        );

        winstonLogger.info(
          `Check the OpenApi especification at http://localhost:${process.env.PORT}/api/docs`
        );
      });
    }
  }
}

module.exports = Server;
