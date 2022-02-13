const express = require("express");
const cors = require("cors");
const { dbConnection } = require("../database/config");

class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT;

    this.paths = {
      users: "/api/users",
      auth: "/api/auth",
      categories: "/api/categories",
      products: "/api/products",
      search: "/api/search"
    };

    // conectar a mongoDb
    this.conectarDB();

    // middlewares
    this.middlewares();
    // rutas
    this.routes();
  }

  async conectarDB() {
    await dbConnection();
  }

  middlewares() {
    // cors
    this.app.use(cors());

    // lectura y parseo de json
    this.app.use(express.json());

    // directorio público
    this.app.use(express.static("public"));
  }

  routes() {
    this.app.use(this.paths.auth, require("../routes/auth"));
    this.app.use(this.paths.users, require("../routes/users"));
    this.app.use(this.paths.categories, require("../routes/categories"));
    this.app.use(this.paths.products, require("../routes/products"));
    this.app.use(this.paths.search, require("../routes/search"));
  }

  listen() {
    this.app.listen(this.port, () => {
      console.log(`Example app listening at http/localhost:${this.port}`);
    });
  }
}

module.exports = Server;
