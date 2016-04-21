var Promise = require('bluebird');
var bcrypt = require('bcrypt');
var uid = require('uid-safe');
var config = require('../config');
var db = require('../db').db;
var models = require('../models');
var questions = require('./sample-questions.json');

var GUESTS = 20;

db.sync({ force: true }).then(function () {
  var sid;
  var i;

  var promises = [
    models.User.create({
      email: config.DEFAULT_EMAIL,
      password: bcrypt.hashSync(config.DEFAULT_PASSWORD, config.SALT_ROUNDS)
    })
  ];
  questions.forEach(function (question) {
    promises.push(
      models.Question.create(question, { include: [models.Answer] })
    );
  });
  for (i = 0; i < GUESTS; i++) {
    sid = uid.sync(32);
    promises.push(db.models.Session.create({
      sid: sid,
      data: '{}',
      expires: Date.now()
    }));
  }
  return Promise.all(promises);
}).then(function (dbResponses) {
  var promises = [];
  dbResponses.slice(1, 1 + questions.length).filter(function (question) {
    return question.published;
  }).forEach(function (question, index) {
    var responseCount = Math.floor(Math.random() * (GUESTS + 1));
    if (index === 0) {
      // Give the maximum number of responses for the first sample question
      responseCount = GUESTS;
    }
    if (responseCount === 0) {
      return;
    }
    dbResponses
      .slice(-1 * responseCount)
      .forEach(function (session) {
        promises.push(models.Response.create({
          AnswerId: question
            .Answers[Math.floor(Math.random() * question.Answers.length)]
            .id,
          QuestionId: question.id,
          SessionSid: session.sid
        }));
      });
  });
  return Promise.all(promises);
}).then(function () {
  console.log('Sample data loaded');
  process.exit();
});
