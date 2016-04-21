var Promise = require('bluebird');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser').json();
var db = require('../db');
var models = require('../models');
var config = require('../config');

module.exports = function (app) {
  app.get('/', function (req, res) {
    res.render('home');
  });

  // sessions for client-facing data
  app.use('/data', session({
    secret: config.COOKIE_SECRET,
    name: 'sid',
    cookie: {
      maxAge: 365 * 24 * 60 * 60e3
    },
    resave: false,
    saveUninitialized: true,
    store: db.sessionStore
  }));
  app.use('/data', cookieParser(config.COOKIE_SECRET));

  app.get('/data', function (req, res) {
    Promise.all([
      models.Response.findAll({
        where: {
          SessionSid: req.sessionID
        },
        attributes: ['QuestionId', 'AnswerId', 'updatedAt'],
        order: 'updatedAt DESC'
      }),
      models.Question.findAll({
        where: {
          published: true
        },
        attributes: ['id', 'question', 'createdAt'],
        order: 'createdAt ASC',
        include: [models.Answer]
      })
    ]).then(function (dbResponses) {
      res.json({
        responses: dbResponses[0],
        questions: dbResponses[1],
        session: req.sessionID
      });
    });
  });

  app.post('/data', bodyParser, function (req, res) {
    if (req.session.id !== req.signedCookies.sid) {
      res.status(401).send({ error: 'Session ID not found' });
      return;
    }

    if (!req.body || !req.body.answerId) {
      res.status(400).send({ error: 'Answer ID not found' });
      return;
    }

    models.Answer.find({
      where: {
        id: req.body.answerId
      }
    }).then(function (answer) {
      return models.Response.upsert({
        AnswerId: answer.id,
        QuestionId: answer.QuestionId,
        SessionSid: req.session.id
      }).then(function () {
        return models.Response.find({
          where: {
            SessionSid: req.session.id,
            QuestionId: answer.QuestionId
          },
          attributes: ['QuestionId', 'AnswerId', 'updatedAt']
        });
      });
    })
    .then(function (response) {
      res.json(response);
    }).catch(function (error) {
      res.status(400).send({ error: error });
    });
  });
};
