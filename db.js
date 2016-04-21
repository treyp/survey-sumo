var session = require('express-session');
var Sequelize = require('sequelize');
var SequelizeStore = require('connect-session-sequelize')(session.Store);
var config = require('./config');

exports.db = new Sequelize(
  config.DB_DATABASE,
  config.DB_USERNAME,
  config.DB_PASSWORD,
  {
    dialect: config.DB_DIALECT,
    host: config.DB_HOST,
    port: config.DB_PORT
  }
);

exports.sessionStore = new SequelizeStore({
  db: exports.db,
  checkExpirationInterval: 0
});
