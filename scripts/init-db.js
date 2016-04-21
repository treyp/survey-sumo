var Promise = require('bluebird');
var bcrypt = require('bcrypt');
var config = require('../config');
var db = require('../db').db;
var models = require('../models');

db.sync({ force: true }).then(function () {
  var promises = [
    models.User.create({
      email: config.DEFAULT_EMAIL,
      password: bcrypt.hashSync(config.DEFAULT_PASSWORD, config.SALT_ROUNDS)
    })
  ];
  return Promise.all(promises);
}).then(function () {
  console.log('Database setup complete');
  process.exit();
});
